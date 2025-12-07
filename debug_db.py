
import sys
import os

# Add current directory to path so we can import backend modules
sys.path.append(os.getcwd())

# Ensure we are using the EXACT same database file setup as main.py
# main.py uses: DATABASE_URL = "sqlite:///./trash_logs.db"
# in backend/database.py

from backend.database import SessionLocal, User, ClassificationItem, MediaFile

def inspect():
    db = SessionLocal()
    print(f"Checking DB at: {os.path.abspath('trash_logs.db')}")
    
    print("--- USERS ---")
    users = db.query(User).all()
    if not users:
        print("NO USERS FOUND.")
    for u in users:
        print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Name: {u.full_name}")

    db.close()

if __name__ == "__main__":
    inspect()
