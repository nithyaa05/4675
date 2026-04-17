from typing import Any

from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import firestore

from firebase_client import get_db

db = get_db()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        return '', 200

USERS_COLLECTION = "demo_users"
PROJECTS_COLLECTION = "demo_projects"
PROJECT_PROFILE_COLLECTION = "demo_project_profiles"
PREFERENCES_COLLECTION = "demo_project_preferences"

def _extract_user_number(doc_id: str) -> int:
    if not doc_id.startswith("user_"):
        return -1
    try:
        return int(doc_id.split("_", 1)[1])
    except ValueError:
        return -1

def _latest_user_doc_id() -> str | None:
    docs = db.collection(USERS_COLLECTION).stream()
    candidate_ids = [doc.id for doc in docs]
    if not candidate_ids:
        return None
    return max(candidate_ids, key=_extract_user_number)

def _next_user_doc_id() -> str:
    latest = _latest_user_doc_id()
    if latest is None:
        return "user_0"
    return f"user_{_extract_user_number(latest) + 1}"

def _resolve_user_id() -> str | None:
    return (
        request.args.get("userId")
        or request.headers.get("X-User-Id")
        or _latest_user_doc_id()
    )

def _serialize_project(doc: Any) -> dict[str, Any]:
    payload = doc.to_dict() or {}
    return {
        "id": payload.get("id", doc.id),
        "title": payload.get("title", ""),
        "courseCode": payload.get("courseCode", ""),
        "description": payload.get("description", ""),
        "requiredSkills": payload.get("requiredSkills", []),
        "teamSizeMin": payload.get("teamSizeMin", 1),
        "teamSizeMax": payload.get("teamSizeMax", 1),
        "teamRoles": payload.get("teamRoles", []),
    }


@app.route('/api/users/me', methods=['POST'])
def save_user_profile():
    profile = request.get_json() or {}
    #print(profile)
    doc_ref = db.collection(USERS_COLLECTION).document(_next_user_doc_id())
    #print(f"Next user id': {_next_user_doc_id()}")
    # Remove any existing id fields to avoid storing stale IDs in the document
    clean_profile = {k: v for k, v in profile.items() if k not in ('id', 'userId', 'user_id')}
    clean_profile['user_id'] = doc_ref.id
    doc_ref.set(clean_profile)
    #print("doc id", doc_ref.id)
    return jsonify({**clean_profile, 'id': doc_ref.id}), 200

@app.route('/api/users/me', methods=['GET'])
def get_user_profile():
    user_id = _resolve_user_id()
    if user_id is None:
        return jsonify(None), 404
    doc = db.collection(USERS_COLLECTION).document(user_id).get()
    if doc.exists:
        return jsonify({"id": doc.id, **(doc.to_dict() or {})})
    return jsonify(None), 404

@app.route('/api/users', methods=['GET'])
def get_all_users():
    docs = db.collection(USERS_COLLECTION).stream()
    users = [{'userId': doc.id, **doc.to_dict()} for doc in docs]
    return jsonify(users), 200

@app.route('/api/projects', methods=['GET'])
def get_all_projects():
    docs = db.collection(PROJECTS_COLLECTION).stream()
    projects = [_serialize_project(doc) for doc in docs]
    return jsonify(projects), 200

@app.route('/api/project-profile', methods=['GET'])
def get_project_profile():
    user_id = _resolve_user_id()
    if user_id is None:
        return jsonify(None), 404
    doc = db.collection(PROJECT_PROFILE_COLLECTION).document(user_id).get()
    if not doc.exists:
        return jsonify(None), 404
    return jsonify({"id": doc.id, **(doc.to_dict() or {})}), 200

@app.route('/api/project-profile', methods=['POST'])
def save_project_profile():
    user_id = _resolve_user_id()
    if user_id is None:
        return jsonify({"message": "No user available for project profile write"}), 400
    project_profile = request.get_json() or {}
    db.collection(PROJECT_PROFILE_COLLECTION).document(user_id).set(project_profile)
    return jsonify({"id": user_id, **project_profile}), 200

@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    user_id = _resolve_user_id()
    if user_id is None:
        return jsonify([]), 200
    doc = db.collection(PREFERENCES_COLLECTION).document(user_id).get()
    if not doc.exists:
        return jsonify([]), 200
    data = doc.to_dict() or {}
    preferences = data.get("preferences", [])
    if not isinstance(preferences, list):
        return jsonify([]), 200
    return jsonify(preferences), 200

@app.route('/api/preferences', methods=['POST'])
def save_preferences():
    user_id = _resolve_user_id()
    if user_id is None:
        return jsonify({"message": "No user available for preferences write"}), 400
    prefs = request.get_json()
    if not isinstance(prefs, list):
        return jsonify({"message": "Preferences payload must be a list"}), 400
    db.collection(PREFERENCES_COLLECTION).document(user_id).set({"preferences": prefs})
    return jsonify(prefs), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)