
import os
import cv2
import time
import requests
import numpy as np
import uvicorn
import hashlib
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from contextlib import asynccontextmanager
from typing import List, Dict
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Import Internal Modules
from ik_solver import IKSolver, pixel_to_mm
from database import init_db, get_db, User, ClassificationItem, MediaFile

# --- Lifecycle Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db() # Create tables
    
    # Create Default Admin if not exists
    db = next(get_db())
    admin = db.query(User).filter(User.email == "admin").first()
    if not admin:
        hashed = hashlib.sha256("admin123".encode()).hexdigest()
        new_admin = User(email="admin", hashed_password=hashed, role="admin", full_name="System Admin")
        db.add(new_admin)
        db.commit()
        print("--> Created Default Admin: admin/admin123")
    
    yield
    
    # DEBUG: Print all routes
    print("--- REGISTERED ROUTES ---")
    for route in app.routes:
        print(f"{route.path} [{route.methods}]")
    print("-------------------------")

# --- Configuration ---
app = FastAPI(title="NexCycle Core", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://nexcycle.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Media
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "media")

if not os.path.exists(MEDIA_DIR): os.makedirs(MEDIA_DIR)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# --- Helper Functions ---
def extract_frame_at_timestamp(video_path, timestamp_sec=0.0):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file")
    cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_sec * 1000)
    success, frame = cap.read()
    cap.release()
    if not success:
        # Retry logic or just fail
        return np.zeros((480, 640, 3), dtype=np.uint8)
    return frame

def query_huggingface_detection(image_bytes):
    # Mocking for Stability
    return [
        {"label": "plastic bottle", "score": 0.98, "box": {"xmin": 150, "ymin": 200, "xmax": 250, "ymax": 400}}
    ]

def map_label_to_bin(label: str) -> str:
    label = label.lower()
    if "plastic" in label: return "plastic"
    if "paper" in label or "cardboard" in label: return "paper"
    if "can" in label or "metal" in label: return "metal"
    return "unknown"

BIN_ANGLES = {
    "home": [90, 90, 90, 90, 90, 90],
    "plastic": [45, 90, 90, 90, 90, 90],
    "paper": [135, 90, 90, 90, 90, 90],
    "metal": [90, 45, 90, 90, 90, 90]
}
ik = IKSolver()

def generate_servo_sequence(detections: List[Dict]) -> List[Dict]:
    sequence = []
    sequence.append({"action": "home", "angles": BIN_ANGLES["home"]})
    for obj in detections:
        label = obj["label"]
        bin_type = map_label_to_bin(label)
        if bin_type == "unknown": continue
        
        # Mock IK
        sequence.append({"action": "move_to_bin", "angles": BIN_ANGLES.get(bin_type, BIN_ANGLES["home"]), "desc": f"Move to {bin_type}"})
        
    return sequence

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"status": "online", "mode": "Hardware Control"}

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(ClassificationItem).count()
    plastic = db.query(ClassificationItem).filter(ClassificationItem.detected_label.ilike("%plastic%")).count()
    paper = db.query(ClassificationItem).filter(ClassificationItem.detected_label.ilike("%paper%")).count()
    return {"total_items": total, "breakdown": {"plastic": plastic, "paper": paper}}

# --- Standard Auth Endpoints ---

class UserAuth(BaseModel):
    username: str # In Frontend this mimics 'username' but we map to email or new field
    password: str

@app.post("/auth/register")
def register(user_data: UserAuth, db: Session = Depends(get_db)):
    # Check if exists
    if db.query(User).filter(User.email == user_data.username).first():
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Simple Hash
    hashed = hashlib.sha256(user_data.password.encode()).hexdigest()
    new_user = User(email=user_data.username, hashed_password=hashed, full_name=user_data.username, role="user")
    db.add(new_user)
    db.commit()
    return {"status": "success", "user": {"email": new_user.email, "role": new_user.role}}

@app.post("/auth/login")
def login(user_data: UserAuth, db: Session = Depends(get_db)):
    hashed = hashlib.sha256(user_data.password.encode()).hexdigest()
    user = db.query(User).filter(User.email == user_data.username, User.hashed_password == hashed).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {
        "status": "success", 
        "user": {"email": user.email, "role": user.role, "name": user.full_name},
        "token": "mock_jwt_standard"
    }

@app.post("/auth/google")
async def google_login(token: str, db: Session = Depends(get_db)):
    email = None
    name = None
    debug_errors = []
    
    # 1. Try verifying as ID Token (Standard Flow)
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), "214162255464-qbbjog56qsq2rchqvm27ppl63hf02eue.apps.googleusercontent.com")
        email = idinfo['email']
        name = idinfo.get('name', 'Unknown')
    except ValueError as e:
        debug_errors.append(f"ID Token invalid: {str(e)}")
        # 2. Fallback: Try verifying as Access Token (Implicit Flow via useGoogleLogin)
        try:
            resp = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={"Authorization": f"Bearer {token}"})
            if resp.status_code == 200:
                user_info = resp.json()
                email = user_info.get("email")
                name = user_info.get("name", "Unknown")
            else:
                debug_errors.append(f"UserInfo API error ({resp.status_code}): {resp.text}")
        except Exception as e2:
            debug_errors.append(f"UserInfo connection failed: {str(e2)}")

    # 3. Handle Mock Token (Dev Mode)
    if not email and token == "mock_token":
        email = "test@gmail.com"
        name = "Test User"

    if not email:
        error_msg = "; ".join(debug_errors)
        print(f"Auth Failed: {error_msg}")
        raise HTTPException(status_code=401, detail=f"Google Auth Failed: {error_msg}")

    # DB Logic
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, full_name=name, role="user")
        db.add(user)
    else:
        # Sync name from Google to fix "Email as Name" issues
        if name and name != "Unknown":
            user.full_name = name
            
    db.commit()
    db.refresh(user)
            
    return {"status": "success", "user": {"email": user.email, "name": user.full_name, "role": user.role}, "token": "mock_jwt"}

@app.post("/process-video")
async def process_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = f"capture_{int(time.time())}_{file.filename}"
    file_path = os.path.join(MEDIA_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
            
        media_entry = MediaFile(file_path=file_path, media_type="image")
        db.add(media_entry)
        db.commit()
        db.refresh(media_entry)
        
        detections = query_huggingface_detection(b"") # Mocked
        
        for obj in detections:
            label = obj["label"]
            conf = obj["score"]
            status = "pending_review"
            bin_type = map_label_to_bin(label)
            if bin_type != "unknown" and conf > 0.85:
                status = "auto_sorted"
            
            new_item = ClassificationItem(media_id=media_entry.id, detected_label=label, confidence=conf, status=status)
            db.add(new_item)
        db.commit()
        
        servo_queue = generate_servo_sequence(detections)
        return {"status": "success", "servo_queue": servo_queue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Admin API ---

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    print(f"DEBUG: get_users found {len(users)} users")
    for u in users:
        print(f" - ID: {u.id}, Email: {u.email}")
    return users

class UserRoleUpdate(BaseModel):
    role: str

@app.put("/admin/users/{user_id}")
def update_user_role(user_id: int, update: UserRoleUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    user.role = update.role
    db.commit()
    return {"status": "success", "user": user}

@app.get("/admin/reviews")
def get_pending_reviews(db: Session = Depends(get_db)):
    items = db.query(ClassificationItem).all()
    # Need to return image path too. Simple approach:
    res = []
    for i in items:
        # Lazy load check
        path = i.media.file_path if i.media else ""
        res.append({
            "id": i.id, 
            "detected_label": i.detected_label, 
            "confidence": i.confidence, 
            "status": i.status,
            "image_path": path
        })
    return res

class ReviewUpdate(BaseModel):
    corrected_label: str

@app.put("/admin/reviews/{item_id}")
def review_item(item_id: int, update: ReviewUpdate, db: Session = Depends(get_db)):
    item = db.query(ClassificationItem).filter(ClassificationItem.id == item_id).first()
    if not item: raise HTTPException(status_code=404, detail="Item not found")
    item.corrected_label = update.corrected_label
    item.status = "reviewed"
    db.commit()
    return {"status": "success"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
