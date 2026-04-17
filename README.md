# 4675

## Local setup

### 1) Firebase service account key (required)

1. Open Firebase Console for your class project.
2. Go to **Project settings -> Service accounts**.
3. Generate and download a new private key JSON for your own account.
4. Save it locally (do not commit it), then set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/your-service-account.json"
```

The backend now reads this env var. If missing, it falls back to `backend/firebase-service-account.json`.

### 2) Backend (Flask + Firestore)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python firebase_config.py
```

Backend runs at `http://localhost:5000` with API routes under `/api`.

Optional: seed project documents in Firestore:

```bash
cd backend
source .venv/bin/activate
python seed_demo_projects.py
```

### 3) Frontend (Vite + React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

The frontend calls `VITE_API_BASE_URL` (default: `http://localhost:5000/api`).