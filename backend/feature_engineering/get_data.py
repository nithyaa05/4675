import json
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))
from firebase_client import get_db

db = get_db()

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
