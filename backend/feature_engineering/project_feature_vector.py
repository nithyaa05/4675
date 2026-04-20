import numpy as np
import pandas as pd
import json
from backend.feature_engineering.get_data import get_data
from pathlib import Path

num_users, num_projects = get_data()

BASE_DIR = Path(__file__).resolve().parent
print(BASE_DIR)
PROJECT_JSON = BASE_DIR / "new_project_feature_vector.json"
FIREBASE_PROJECT_JSON = BASE_DIR / "firebase_pulled_projects.json"

with open(FIREBASE_PROJECT_JSON) as file:
    data = json.load(file)

def create_feature_vector(project_num):

    proj_info = data[project_num]

# skills encoding
    # ordered list: [python, java, react, nodejs, sql, javascript, c++, machine_learning, data_analysis]
    set_skill_list = ["python", "java", "react", "node.js", "sql", "javascript", "c++", "machine learning", "data analysis"]
    # num_skills = len(set_skill_list)

    user_defined_skills = proj_info['requiredSkills']
    skills_feature_vector = [0,0,0,0,0,0,0,0,0]

    for skill in user_defined_skills:
        skill = skill.lower()
        index = set_skill_list.index(skill)
        skills_feature_vector[index] = 1 

    # #print(user_pref_feature_vector)
    # # role encoding
    #     # ordered list: [Designer, Data Engineer, Data Analyst, Project Manager, Testing, Programmer, Architect]
    set_role_list = ["Designer (UI/UX)", "Data Engineer", "Data Analyst", "Project Manager", "Testing/Debugging", "Programmer", "Architect/System Designer"]

    user_defined_roles = proj_info['teamRoles']
    teamRoles_feature_vector = [0,0,0,0,0,0,0]

    for role in user_defined_roles:
        index = set_role_list.index(role)
        teamRoles_feature_vector[index] = 1


    feature_vector_dictionary = {"skills_feature_vector": skills_feature_vector, 
                                 "team_role_feature_vector": teamRoles_feature_vector}
    # #print(feature_vector_dictionary)
    with open(PROJECT_JSON, 'r') as file:
        data_list = json.load(file)
    #data_list = {}
    data_list[proj_info['proj_id']] = feature_vector_dictionary
    with open(PROJECT_JSON, 'w') as file:
        json.dump(data_list, file, indent=4)

def create_project_feature_vectors():
    for i in range(len(data)):
        create_feature_vector(i)

