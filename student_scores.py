import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import jaccard_score
import json
import project_scores

with open('user_feature_vectors.json') as file:
    data = json.load(file)

# Compatibility Scores between Users
def user_compatibility_score(userA_id, userB_id):
    userA_profile = data[userA_id]
    userB_profile = data[userB_id]

    userA_index = int(userA_id.split('_')[1]) # unique index 
    userB_index = int(userB_id.split('_')[1]) # unique index

    # Skills: Complement of Cosine Similarity (want less overlap for diverse teams)
    # Does cosine similarity take into account matching skill levels?
    skill_score = 1 - cosine_similarity([userA_profile['skills_feature_vector']], [userB_profile['skills_feature_vector']])[0][0]

    # Avaibility: Jaccard Similarity
    avail_score = jaccard_score(userA_profile['availability_feature_vector'], userB_profile['availability_feature_vector'], average='binary')

    # Project Preference: Jaccard Similarity
    project_score = jaccard_score(userA_profile['project_pref_feature_vector'], userB_profile['project_pref_feature_vector'], average='binary')

    # Partner Preference: Direct Preference Check: mutual = 1.0, one-sided = 0.5, neither = 0.0
    partner_score = (userA_profile['user_pref_feature_vector'][userB_index] + userB_profile['user_pref_feature_vector'][userA_index]) / 2.0 
    
    # Team Roles: Complement of Jaccard Similarity (want less overlap for diverse teams)
    role_score = 1 - jaccard_score(userA_profile['team_role_feature_vector'],  userB_profile['team_role_feature_vector'], average='binary')

    # Final with weights
    skill_weight = 0.25
    avail_weight = 0.25
    project_weight = 0.15
    partner_weight = 0.15
    role_weight = 0.20

    final_score = (skill_weight * skill_score) + (project_weight * project_score) + (avail_weight * avail_score) + (partner_weight * partner_score) + (role_weight * role_score)
    final_score = float(final_score)
    return final_score if final_score > 0 else 0.0

# proj_assignments = {
#  'proj_0': ['user_3', 'user_8', 'user_12', 'user_17', 'user_20', 'user_23'], 
#  'proj_1': ['user_0', 'user_1', 'user_9', 'user_10'], 
#  'proj_2': ['user_2', 'user_4', 'user_6', 'user_16', 'user_21'], 
#  'proj_3': ['user_5', 'user_7', 'user_11', 'user_13', 'user_15', 'user_19', 'user_24'], 
#  'proj_4': ['user_14', 'user_18', 'user_22']
# }

similarity_matrix = {}

# Compute pairwise compatibility scores between each user in a project
def pairwise_compatibility_in_project(proj_id):
    users = project_scores.proj_assignments[proj_id]
    n = len(users)
    for i in range(0, n):
        userA_id = users[i]
        for j in range(i+1, n): 
            userB_id = users[j]
            # similarity_matrix[f'({userA_id}, {userB_id})'] = user_compatibility_score(userA_id, userB_id)
            similarity_matrix[f'({int(userA_id.split('_')[1])}, {int(userB_id.split('_')[1])})'] = user_compatibility_score(userA_id, userB_id)

# Similarity Matrix
for i in range(0,5):
    proj_id = f'proj_{i}'
    pairwise_compatibility_in_project(proj_id)
    print(proj_id)
    print(similarity_matrix)


