import firebase_admin
from firebase_admin import credentials, firestore
import json

cred = credentials.Certificate("../peer-match-25263-223e121fb5d7.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

data = []
current_users = []

users_ref = db.collection("demo_users")
docs = users_ref.stream()
for d in docs:
    #print(d.id)
    user_dict = d.to_dict()
    full_data = {"user_id": d.id, **user_dict}
    data.append(full_data)

# print(data[0])
with open('firebase_pulled_users.json', 'w') as file:
    json.dump(data, file, indent=4)
