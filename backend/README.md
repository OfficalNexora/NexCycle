# Trash AI Backend

FastAPI backend for AI image classification.

## Local Development

1. Install Python 3.9+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run server:
   ```bash
   uvicorn main:app --reload
   ```
4. Server will be at `http://localhost:8000`

## Deploy to Railway

1. Push this folder to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" -> "Deploy from GitHub repo"
4. Select your repo
5. Railway will automatically detect the `Dockerfile` and build it!
6. Copy the generated URL (e.g., `https://web-production-1234.up.railway.app`)
7. Update `frontend/src/services/api.js` with this URL.
