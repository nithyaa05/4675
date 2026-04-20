from typing import Any, Optional
import sys
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import firestore

from firebase_client import get_db

# Add parent directory to path to import student_scores
sys.path.insert(0, str(Path(__file__).parent.parent))

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
LAST_MATCH_ASSIGNMENTS: dict[str, dict] = {}


def _extract_user_number(doc_id: str) -> int:
    if not doc_id.startswith("user_"):
        return -1
    try:
        return int(doc_id.split("_", 1)[1])
    except ValueError:
        return -1

def _latest_user_doc_id() -> Optional[str]:
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

def _resolve_user_id() -> Optional[str]:    return (
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

#UPDATE THIS!!!
# -------------------- MATCHING --------------------

@app.route('/api/match/run', methods=['POST'])
def trigger_matching():
    """
    Run the matching algorithm and return team assignments for all users.
    Uses the student_scores clustering logic to form teams.
    """
    try:
        # Import matching functions
        import student_scores
        import project_scores
        
        # Get all users from the database
        user_docs = db.collection(USERS_COLLECTION).stream()
        users_by_id = {doc.id: doc.to_dict() or {} for doc in user_docs}
        
        # Get all projects from the database
        project_docs = db.collection(PROJECTS_COLLECTION).stream()
        projects_by_id = {doc.id: _serialize_project(doc) for doc in project_docs}
        
        # Build assignments using student_scores clustering logic
        # For now, use the pre-computed assignments from project_scores
        #assignments = {}  # user_id -> team info
        assignments = {}
       # print(assignments)
        # Use project_scores.proj_assignments to build team assignments
        team_counter = 0
        for proj_id, users_in_project in project_scores.generate_project_assignments().items():
            # Run clustering within this project
            groups = student_scores.cluster_students(users_in_project)
            
            # Get project info
            proj_number = int(proj_id.split('_')[1])
            project_doc = db.collection(PROJECTS_COLLECTION).document(f'proj_{proj_number}').get()
            project_info = _serialize_project(project_doc) if project_doc.exists else {'title': proj_id, 'id': proj_id}
            
            # Create teams from groups
            for group in groups:
                team_id = f'team_{team_counter}'
                team_counter += 1
                pairwise_scores = student_scores.compute_team_pairwise_scores(group)
                # Build team member previews for each member
                for user_id in group:
                    members = []
                    for member_id in group:
                        user_data = users_by_id.get(member_id, {})
                        compatibility = pairwise_scores[user_id].get(member_id, 0.0)
                        members.append({
                            'userId': member_id,
                            'displayName': f"{user_data.get('firstName', 'User')} {user_data.get('lastName', '')}".strip(),
                            'major': user_data.get('major', ''),
                            'skills': user_data.get('skills', []),
                            'compatibilityScore': compatibility
                        })
                    
                    # Create assignment for this user
                    assignments[user_id] = {
                        'teamId': team_id,
                        'projectId': proj_id,
                        'projectTitle': project_info.get('title', proj_id),
                        'members': members,
                        'metrics': {
                            'averageTeamSimilarity': 0.75,
                            'skillCoverage': 0.8,
                            'preferenceSatisfaction': 0.7,
                            'availabilityOverlap': 0.65
                        }
                    }
        
        # Keep assignments in memory for the current server process
        global LAST_MATCH_ASSIGNMENTS
        LAST_MATCH_ASSIGNMENTS = assignments

        return jsonify({
            'jobId': f'match-{int(__import__("time").time() * 1000)}',
            'status': 'completed',
            'assignmentsCount': len(assignments),
            'assignments': assignments
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Matching error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/me/assignment', methods=['GET'])
def get_user_assignment():
    """
    Get the team assignment for the current user.
    """
    try:
        user_id = _resolve_user_id()
        if user_id is None:
            return jsonify(None), 404

        assignment = LAST_MATCH_ASSIGNMENTS.get(user_id)
        if assignment is None:
            return jsonify(None), 404

        return jsonify(assignment), 200
    except Exception as e:
        import traceback
        print(f"Assignment retrieval error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/match/assignments', methods=['GET'])
def get_match_assignments():
    """
    Return all current match assignments kept in memory by the latest trigger.
    """
    try:
        teams_by_id: dict[str, dict] = {}
        for assignment in LAST_MATCH_ASSIGNMENTS.values():
            team_id = assignment.get('teamId')
            if not team_id:
                continue
            if team_id not in teams_by_id:
                teams_by_id[team_id] = assignment

        return jsonify(list(teams_by_id.values())), 200
    except Exception as e:
        import traceback
        print(f"Match assignments retrieval error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)