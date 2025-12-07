from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

import os

# Setup SQLite Database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'trash_logs.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Table 1: Users (Auth & Roles) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True) # Google Email
    hashed_password = Column(String, nullable=True) # For non-Google
    full_name = Column(String, nullable=True)
    role = Column(String, default="user") # "admin" or "user"
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Table 2: ClassificationItems (The Queue) ---
class ClassificationItem(Base):
    """
    Stores all detections. 
    Status: 'pending_review' (for low confidence/unknown), 'auto_sorted' (high confidence), 'reviewed' (admin fixed)
    """
    __tablename__ = "classifications"
    id = Column(Integer, primary_key=True, index=True)
    
    # Link to Media
    media_id = Column(Integer, ForeignKey("media_files.id"))
    
    detected_label = Column(String) # AI's guess
    corrected_label = Column(String, nullable=True) # Admin's override
    confidence = Column(Float)
    
    status = Column(String, default="pending_review") 
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    media = relationship("MediaFile", back_populates="classifications")

# --- Table 3: MediaFiles (Ephemeral) ---
class MediaFile(Base):
    """
    Stores paths to images/videos. Designed to be wiped daily.
    """
    __tablename__ = "media_files"
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String) # Local path to image
    media_type = Column(String, default="image") # "image", "video"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    classifications = relationship("ClassificationItem", back_populates="media")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
