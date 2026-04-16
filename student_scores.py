import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import jaccard_score
import json
import project_scores

with open('new_user_feature_vectors.json') as file:
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



# Compute pairwise compatibility scores between each user in a project
def pairwise_compatibility_in_project(proj_id):
    pairwise_scores = {}
    users = project_scores.proj_assignments[proj_id]
    n = len(users)
    for i in range(0, n):
        userA_id = users[i]
        for j in range(i+1, n): 
            userB_id = users[j]
            # similarity_matrix[f'({userA_id}, {userB_id})'] = user_compatibility_score(userA_id, userB_id)
            pairwise_scores[f'({int(userA_id.split('_')[1])}, {int(userB_id.split('_')[1])})'] = user_compatibility_score(userA_id, userB_id)
    return pairwise_scores


# Compatibility Scores between
for i in range(0, project_scores.num_projs):
    proj_id = f'proj_{i}'
    pairwise_scores = pairwise_compatibility_in_project(proj_id)
    # print(proj_id)
    # print(pairwise_scores)


# Similarity Matrix
def construct_similarity_matrix(users):
    n = len(users)
    similarity_matrix = np.zeros((n,n))

    for i in range(0,n):
        for j in range(0,n):
            if i < j:
                score = user_compatibility_score(users[i], users[j])
                similarity_matrix[i][j] = score
                similarity_matrix[j][i] = score
            elif i == j:
                similarity_matrix[i][j] = 1.0
    return similarity_matrix



# Clustering Students into Groups within Project Assignments: Greedy Algorithm + Group Balancing
def cluster_students(users):
    similarity_matrix = construct_similarity_matrix(users)

    n = len(users)
    target_group_size = 3
    k = min(max(1, round(n / target_group_size)), n // 2) if n >= 4 else 1

    # Set of users remaining to assign into groups
    unassigned_users = set(range(n))
    groups = []

    # Average Similarity Score of a Group
    def avg_similarity(i, group):
        if not group: return 0
        return np.mean([similarity_matrix[i][j] for j in group])
    
    for _ in range(0, k-1):
        if len(unassigned_users) == 0:
            break
        
        # Choose seed user to build group around
        seed_user = max(unassigned_users, key=lambda i: sum(similarity_matrix[i][j] for j in unassigned_users))
        unassigned_users.remove(seed_user)

        # Adding most compatibile users into group with seed user
        group = [seed_user]
        while len(group) < target_group_size and len(group) < len(unassigned_users):
            most_compatible_user = max(unassigned_users, key=lambda j: avg_similarity(j,group))
            group.append(most_compatible_user)
            unassigned_users.remove(most_compatible_user)
        groups.append(group)

    # Last group gets remaining users
    if len(unassigned_users) != 0:
        groups.append(list(unassigned_users))

    # Add singletons to existing groups so that there are no single groups
    new_groups = []
    singletons = []
    for group in groups:
        if len(group) == 1:
            singletons.append(group[0])
        else:
            new_groups.append(group)
    for singleton in singletons:
            most_compatible_group = max(groups, key=lambda i: np.mean([similarity_matrix[singleton][j] for j in i]))
            most_compatible_group.append(singleton)
    return [[users[i] for i in group if group] for group in new_groups]


for proj_id, users in project_scores.proj_assignments.items():
    groups = cluster_students(users)

    print(f'\n{proj_id}:')
    for group_id, members in enumerate(groups):
        print(f'Group {group_id}: {members}' )

