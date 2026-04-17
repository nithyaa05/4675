import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore


def _service_account_path() -> Path:
    env_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if env_path:
        return Path(env_path).expanduser()
    return Path(__file__).resolve().parent / "firebase-service-account.json"


def get_db():
    service_account = _service_account_path()
    if not service_account.exists():
        raise RuntimeError(
            "Firebase service account key not found. "
            "Set GOOGLE_APPLICATION_CREDENTIALS to your downloaded JSON path."
        )

    if not firebase_admin._apps:
        cred = credentials.Certificate(str(service_account))
        firebase_admin.initialize_app(cred)

    return firestore.client()
