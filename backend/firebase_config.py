import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify
from flask_cors import CORS


cred = credentials.Certificate("peer-match-25263-223e121fb5d7.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        return '', 200

users_collection = db.collection('demo_users')
docs = users_collection.stream()
count = len(list(docs))


@app.route('/api/users/me', methods=['POST'])
def save_user_profile():
    profile = request.get_json()
    #print(profile)

    users_collection = db.collection('demo_users')
    docs = users_collection.stream()
    count = len(list(docs))


    # Create a new document with auto-generated ID
    doc_ref = db.collection('demo_users').document('user_' + str(count))  # Generate a unique ID based on the count
    # doc_ref.set('user_id', "user_")  # Store the generated ID in the document
    doc_ref.set(profile)
    return jsonify({**profile, 'id': doc_ref.id}), 200

@app.route('/api/users/me', methods=['GET'])
def get_user_profile():
    doc = db.collection('demo_users').document('user_' + str(count)).get()  # Use the generated ID
    print('getting user profile ' + doc.reference.id)
    if doc.exists:
        return jsonify(doc.to_dict())
    return jsonify(None), 404

@app.route('/api/users', methods=['GET'])
def get_all_users():
    docs = db.collection('demo_users').stream()
    users = [{'userId': doc.id, **doc.to_dict()} for doc in docs]
    #print(users)
    return jsonify(users), 200

@app.route('/api/projects', methods=['GET'])
def get_all_projects():
    projects = [
        {
            'id': 'proj_1',
            'title': 'PeerMatch platform',
            'courseCode': 'CS 4675',
            'description': 'Cloud-based team formation with profiles, preferences, and scalable matching.',
            'requiredSkills': ['React', 'Python', 'Cloud (AWS/GCP)'],
            'teamSizeMin': 3,
            'teamSizeMax': 5,
            'teamRoles': ['Frontend', 'Backend', 'ML/Data'],
        },
        {
            'id': 'proj_2',
            'title': 'Campus sustainability dashboard',
            'courseCode': 'CS 4675',
            'description': 'Visualize energy usage and student initiatives with public datasets.',
            'requiredSkills': ['React', 'Databases', 'Research'],
            'teamSizeMin': 4,
            'teamSizeMax': 4,
            'teamRoles': ['Visualization', 'Data pipeline'],
        },
        {
            'id': 'proj_3',
            'title': 'Adaptive tutoring chatbot',
            'courseCode': 'CS 4675',
            'description': 'AI-powered personalized learning with spaced repetition and NLP.',
            'requiredSkills': ['NLP', 'Machine Learning', 'React'],
            'teamSizeMin': 3,
            'teamSizeMax': 4,
            'teamRoles': ['ML', 'Backend', 'UI'],
        },
    ]
    return jsonify(projects), 200
    
# @app.route('/api/users/me', methods=['GET'])
# def get_user_profile():
#     user_id = 'current-user-id'
#     doc = db.collection('test').document(user_id).get()
#     return jsonify(doc.to_dict() if doc.exists else None), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)