import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json

with open('new_user_feature_vector.json') as user_file:
    user_data = json.load(user_file)

with open('new_project_feature_vector.json') as project_file:
    project_data = json.load(project_file)

num_users = len(user_data)
num_projs = len(project_data)

# Project Compatibility Scores
def project_compatibility_score(project_id, user_id):
    user_profile = user_data[user_id]
    project_profile = project_data[project_id]

    # Project profile
    project_vector = [0,0,0,0,0]
    project_index = int(project_id.split('_')[1]) # unique index
    project_vector[project_index] = 1

    # Skills: Cosine Similarity
    skill_score = cosine_similarity([user_profile['skills_feature_vector']], [project_profile['skills_feature_vector']])[0][0]

    # Project Preference: Normalized Dot Product
    project_preference_score = np.dot(user_profile['project_pref_feature_vector'], project_vector) / user_profile['project_pref_feature_vector'].count(1)
    if project_preference_score == 0.0:
        project_preference_score = 0.5 # neutral score (edge case)
    
    # Final with weights
    skill_weight = 0.65
    project_weight = 0.35
    return (skill_weight * skill_score) + (project_weight * project_preference_score)



# Assign students to a project based on highest compatibility score
assignments = { 
    # 'user_j': {'project': int, 'score': float} 
}

for i in range(0,num_users):
    user_id = f'user_{i}'
    final_score = 0.0
    final_proj = ''
    for j in range(0,5):
        proj_id = f'proj_{j}'
        score = project_compatibility_score(proj_id, user_id)
        if score > final_score:
            final_score = score
            final_proj = j
    assignments[user_id] = {'project': final_proj, 'score': final_score}
# print(assignments)

# List of users for each project
proj_assignments = {f'proj_{i}': [] for i in range(0,num_projs)}

for user_id, data in assignments.items():
    proj_id = f'proj_{data['project']}'
    proj_assignments[proj_id].append(user_id)
# print(proj_assignments)


