import numpy as np
import pandas as pd
import json
from get_data import num_users
from get_data import num_projects

with open('firebase_pulled_users.json') as file:
    data = json.load(file)
# print(data[0])

#change index to see different users
# test_user_1 = data['users'][1]
# print(test_user_1)

def create_feature_vector(user_num):

    user_info = data[user_num]
    #print(user_info)
    #print(user_info)

# skills encoding
    # ordered list: [python, java, react, nodejs, sql, javascript, c++, machine_learning, data_analysis]
    set_skill_list = ["python", "java", "react", "node.js", "sql", "javascript", "c++", "machine learning", "data analysis"]
    # num_skills = len(set_skill_list)

    user_defined_skills = user_info['skills']
    skills_feature_vector = [0,0,0,0,0,0,0,0,0]

    for skill in user_defined_skills:
        skill = skill.lower()
        index = set_skill_list.index(skill)
        skills_feature_vector[index] = 1 

    # print(skills_feature_vector)

    # availability encoding
    user_defined_availability = user_info['weeklyAvailability']

    # # feature vector:[sunday 9am, sunday 1am, sunday 2am... saturday 8pm, saturday 9pm] - 0 if not available, 1 if available
    sun_availability  = [int(x) for x in user_defined_availability['sun']]
    mon_availability  = [int(x) for x in user_defined_availability['mon']]
    tue_availability  = [int(x) for x in user_defined_availability['tue']]
    wed_availability  = [int(x) for x in user_defined_availability['wed']]
    thu_availability  = [int(x) for x in user_defined_availability['thu']]
    fri_availability  = [int(x) for x in user_defined_availability['fri']]
    sat_availability  = [int(x) for x in user_defined_availability['sat']]

    availability_feature_vector = sun_availability + mon_availability + tue_availability + wed_availability + thu_availability + fri_availability + sat_availability
    # print(availability_feature_vector)


    # # project pref encoding
    project_pref_feature_vector = [0]*num_projects
    user_defined_project_prefs = user_info['preferredProjectIds']

    for user in user_defined_project_prefs:
        index = int(user.split("_")[1])
        project_pref_feature_vector[index] = 1


    # # user pref encoding
    #     # ordered list: [user0, user1, user2, user3... user49, user50]
    user_pref_feature_vector = [0]*num_users
    user_defined_user_prefs = user_info['preferredPeerIds']

    for user in user_defined_user_prefs:
        index = int(user.split("_")[1])
        user_pref_feature_vector[index] = 1

    # #print(user_pref_feature_vector)
    # # role encoding
    #     # ordered list: [Designer, Data Engineer, Data Analyst, Project Manager, Testing, Programmer, Architect]
    set_role_list = ["Designer (UI/UX)", "Data Engineer", "Data Analyst", "Project Manager", "Testing/Debugging", "Programmer", "Architect/System Designer"]

    user_defined_roles = user_info['teamRoles']
    teamRoles_feature_vector = [0,0,0,0,0,0,0]

    for role in user_defined_roles:
        index = set_role_list.index(role)
        teamRoles_feature_vector[index] = 1


    # # print(user_info['user_id'])
    # # print("Skills feature vector", skills_feature_vector)
    # # print("Availability feature vector", availability_feature_vector)
    # # print("Project Preference feature vector", project_pref_feature_vector)
    # # print("User preference feature vector", user_pref_feature_vector)
    # # print("Team role feature vector", teamRoles_feature_vector)

    feature_vector_dictionary = {"skills_feature_vector": skills_feature_vector, 
                                 "availability_feature_vector": availability_feature_vector,
                                 "project_pref_feature_vector": project_pref_feature_vector,
                                 "user_pref_feature_vector": user_pref_feature_vector,
                                 "team_role_feature_vector": teamRoles_feature_vector}
    # #print(feature_vector_dictionary)
    with open('new_user_feature_vector.json', 'r') as file:
        data_list = json.load(file)
    #data_list = {}
    data_list[user_info['user_id']] = feature_vector_dictionary
    with open('new_user_feature_vector.json', 'w') as file:
        json.dump(data_list, file, indent=4)

for i in range(len(data)):
    create_feature_vector(i)
    # user = data['users'][i]
    # print(user)
