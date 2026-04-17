import json
from pathlib import Path
import sys

#gets all user and project data from firebase
sys.path.append(str(Path(__file__).resolve().parents[1]))
from firebase_client import get_db

db = get_db()

data = []

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

num_users = len(data)

data = []

project_ref = db.collection("demo_projects")
docs = project_ref.stream()
for d in docs:
    project_dict = d.to_dict()
    full_data = {"proj_id": d.id, **project_dict}
    data.append(full_data)

# print(data[0])
with open('firebase_pulled_projects.json', 'w') as file:
    json.dump(data, file, indent=4)

num_projects = len(data)
