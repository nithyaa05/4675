import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("../peer-match-25263-223e121fb5d7.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

