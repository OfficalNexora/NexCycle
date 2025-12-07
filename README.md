# AI Trash Sorting System – Architecture & Feature Bible

**Version:** 2.0  
**Status:** The Law

## 1. System Overview

The AI Trash Sorting System consists of a **backend server** and a **frontend dashboard**. Together they provide:
- **AI Classification:** Handling image inference and decision making.
- **Data Management:** Storing images, logs, and device metadata.
- **Control Panels:** Admin-only control panel and public dashboard.
- **Similarity Lookup:** Running a similarity-based system for uncertain AI outputs.
- **Robot Coordination:** Coordinating robot arm movements and data.
- **Accuracy Loop:** Ensuring 100% accuracy over time via "first-time human sorting → future auto-match".

**Design Principles:**
- Enterprise deployment ready.
- High reliability and multi-device scalability.
- Simple recovery (no retraining cycles).
- Clean separation between Admin and Basic users.

---

## 2. Frontend Architecture

### 2.1 Technology Stack
- **React** with Vite for fast development
- **Phosphor Icons** for consistent iconography
- **Spline** for 3D robot arm visualization
- **CSS** with glassmorphism design system

### 2.2 Authentication System

The frontend includes a client-side authentication system for demo purposes:

| Feature | Implementation |
|---------|---------------|
| Password Hashing | SHA-256 via Web Crypto API |
| Session Storage | sessionStorage (cleared on browser close) |
| User Persistence | localStorage (survives refresh) |
| Default Admin | `admin / admin123` |

> **⚠️ Security Note:** For production, replace with a real backend using JWT tokens and server-side password hashing with bcrypt.

### 2.3 User Roles

| Role | Dashboard | Live Feed | Chat | Admin Panel | Image Review | Calibration |
|------|-----------|-----------|------|-------------|--------------|-------------|
| Public (Not logged in) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Student | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.4 Key Components

```
frontend/src/
├── services/
│   └── authService.js      # Authentication logic
├── components/
│   ├── Admin/
│   │   ├── Login.jsx       # Login/Register modal
│   │   └── UnsureImageGrid.jsx
│   ├── Dashboard/
│   │   ├── StatCard.jsx
│   │   ├── LiveFeed.jsx
│   │   ├── RobotArm3D.jsx
│   │   └── ChatPanel.jsx
│   └── Modals/
│       ├── DetailModal.jsx
│       ├── GalleryModal.jsx
│       ├── InfoModal.jsx
│       └── MapModal.jsx
├── App.jsx                 # Main app with routing
└── index.css              # Design system
```

---

## 3. Core Modes

### 3.1 Classification Mode
1. **Input:** Device captures an image and sends it to the backend.
2. **Inference:** Backend AI generates a label prediction and confidence score.
3. **Decision:**
   - **Confidence ≥ Threshold:** Auto-accept.
   - **Confidence < Threshold:** Mark as "unsure", save image + metadata, and proceed to Similarity Logic (Section 7).

### 3.2 Robot Arm Coordination Mode
1. **Command:** Backend sends bin target and servo sequence (one at a time) to the robot arm.
2. **Logging:** Logs servo failures, retries, angles, timing, and jam detection.
3. **Feedback:** Robot arm reports success/fail; backend updates system stats.

### 3.3 Active Learning (Similarity-Based System)
**⚠️ NO TRAINING REQUIRED. NO MODEL UPDATES NEEDED.**
1. **Unsure Event:** AI is unsure about an image.
2. **Human Intervention:** Admin manually assigns the correct category.
3. **Linkage:** Backend links `Image ID` → `Category`.
4. **Future Matching:** Future unsure images are compared to "confirmed" images.
   - **Match Found:** Auto-return the admin-assigned classification.
   - **Result:** 100% accuracy for repeated objects.

---

## 4. User Types & Permissions

### 4.1 Basic User (Public)
- **Access:** No login required.
- **View Only:**
  - Success/Fail rates.
  - Today's total processed items.
  - Device online/offline status.
  - Most common trash type.
  - Last sync time.
- **Restrictions:** Cannot modify data, change configs, or view admin images.

### 4.2 Student User (Login Required)
- **Capabilities:**
  - Same as Basic User.
  - Personalized dashboard experience.
  - Session persistence.
- **Restrictions:** Cannot access admin features.

### 4.3 Admin User (Login Required)
- **Capabilities:**
  - Review "unsure" images and assign categories.
  - View full logs (robot, AI, network).
  - Perform system calibration and device management.
  - View raw camera feeds.
  - Override classifications and reassign mistakes.
  - View system health and export data.
  - Manage fallback modes.
- **Audit:** All actions are logged.

---

## 5. Backend Core Features

### 5.1 AI Classification Engine
- **Input:** Images.
- **Output:** Type, confidence, bounding box (optional).
- **Logic:** Saves log, runs similarity match if unsure, returns final result to device.

### 5.2 Image & Metadata Storage
- **Stores:** Raw image, thumbnail, confidence score, final category, timestamp, device ID, similarity group ID.

### 5.3 Success/Fail Rate Tracking
- **Success:** Correct classification + successful robot drop.
- **Fail:** Low confidence, wrong drop, jam, camera error, or admin correction.
- **Update Rate:** Real-time.

### 5.4 Robot Arm Event Logging
- **Metrics:** Commands, servo angles, timing, load levels, jams, calibration profiles, position mismatches.

### 5.5 Device Manager
- **Tracks:** Location, model, IP/Network, timestamps, hardware stats (CPU/RAM/Temp), Camera FPS, Firmware, Calibration profile, Error counts.

### 5.6 System Health Dashboard
- **Basic:** Success/Fail %, Processed count, Common types, Device status.
- **Admin:** All Basic + Hardware stats, Inference speed, Network quality, Queue size, Storage, Robot stress/activity.

### 5.7 Calibration Suite (Admin Only)
- **Tools:** Servo zeroing, Camera exposure, Lighting, Angle mapping, Position testing, "Golden Spot" finder.
- **Profiles:** Save/Load per device.

### 5.8 Audit Trail
- **Logs:** Timestamp, Action, Device, Image, Old/New values, Admin username.

---

## 6. Model Versioning
- **Purpose:** Rollback capability and tracking.
- **Tracks:** Version number, previous stable versions, changelogs.
- **Note:** No retraining happens in the active loop; this is for manual model updates.

---

## 7. Notification & Alert System
- **Triggers:** Low confidence spikes, Device offline (>5m), Camera disconnect, Network instability, Robot errors (>3), Storage full, High CPU temp, Conflict in similarity groups.
- **Channels:** Admin dashboard, Email/SMS (optional).

---

## 8. The "100% Accuracy Over Time" System (The Magic Sauce)

1. **Step 1 (Unsure):** AI returns low confidence -> Image saved as "needs human sorting".
2. **Step 2 (Admin Sort):** Admin assigns category (e.g., Plastic). Backend maps `image_id` & `similarity_hash` to `Category`.
3. **Step 3 (Similarity Match):** Next "unsure" image -> Compute hash -> Search DB -> If match, return Admin's category.
4. **Step 4 (Conflict):** If similar images get different labels -> Warn Admin -> Require manual override.

---

## 9. Extra Features (Enterprise Grade)

### 9.1 Heatmap & Analytics
- Common items, peak hours, fail rates per device, robot issues, environmental patterns.

### 9.2 Error Replay
- Replay failures with: Image, AI result, Robot logs, Timestamps to identify exact failure points.

### 9.3 Offline Queue Mode
- Device loses internet -> AI continues, Robot moves, Logs/Images stored locally -> Syncs on reconnection.

### 9.4 API Layer
- **Endpoints:**
  - `POST /classify`
  - `GET /stats`
  - `GET /device`
  - `POST /review`
  - `POST /similarity_check`
  - `GET /heatmap`

---

## 10. Getting Started

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Default Credentials
- **Admin:** `admin / admin123`
- **Students:** Create account via Register tab
