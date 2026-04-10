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

users_collection = db.collection('test')
docs = users_collection.stream()
count = len(list(docs))


@app.route('/api/users/me', methods=['PUT'])
def save_user_profile():
    profile = request.get_json()
    print(profile)
    # Create a new document with auto-generated ID
    doc_ref = db.collection('test').document('user_' + str(count))  # Generate a unique ID based on the count
    # doc_ref.set('user_id', "user_")  # Store the generated ID in the document
    doc_ref.set(profile)
    return jsonify({**profile, 'id': doc_ref.id}), 200
    
# @app.route('/api/users/me', methods=['GET'])
# def get_user_profile():
#     user_id = 'current-user-id'
#     doc = db.collection('test').document(user_id).get()
#     return jsonify(doc.to_dict() if doc.exists else None), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)