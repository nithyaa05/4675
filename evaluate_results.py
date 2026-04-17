import numpy as np
from sklearn.metrics import jaccard_score
import student_scores

def calculate_metrics(assigned_groups, user_data, project_data):
    report = {}

    for proj_id, teams in assigned_groups.items():
        proj_report = []
        project_info = project_data.get(proj_id, {})
        required_skills = set(project_info.get('requiredSkills', []))
        
        for team in teams:
            team_skills = set()
            for uid in team:
                user_info = user_data.get(uid, {})
                user_skills = user_info.get('skills', [])
                team_skills.update(user_skills)
            
            if len(required_skills) > 0:
                intersection_count = len(team_skills.intersection(required_skills))
                skill_cov = intersection_count / len(required_skills)
            else:
                skill_cov = 1.0

            wanted_it = 0
            for uid in team:
                user_info = user_data.get(uid, {})
                preferred_projects = user_info.get('preferredProjectIds', [])
                if proj_id in preferred_projects:
                    wanted_it += 1
            
            if len(team) > 0:
                pref_sat = wanted_it / len(team)
            else:
                pref_sat = 0.0

            overlaps = []
            team_similarities = []
            
            for i in range(len(team)):
                for j in range(i + 1, len(team)):
                    user_i = team[i]
                    user_j = team[j]
                    
                    u1_avail = user_data[user_i]['availability_feature_vector']
                    u2_avail = user_data[user_j]['availability_feature_vector']
                    
                    overlap_score = jaccard_score(u1_avail, u2_avail)
                    overlaps.append(overlap_score)
                    
                    sim_score = student_scores.user_compatibility_score(user_i, user_j)
                    team_similarities.append(sim_score)
            
            if len(overlaps) > 0:
                avg_overlap = np.mean(overlaps)
            else:
                avg_overlap = 0.0
                
            if len(team_similarities) > 0:
                avg_similarity = np.mean(team_similarities)
            else:
                avg_similarity = 0.0

            proj_report.append({
                "team": team,"skill_coverage": skill_cov,"pref_satisfaction": pref_sat,
                "avail_overlap": avg_overlap, "avg_team_similarity": avg_similarity
            })
        
        report[proj_id] = proj_report
    
    return report

if __name__ == "__main__":
    import project_scores
    import student_scores
    import json
    import pprint

    print("Running PeerMatch Pipeline...")

    for i in range(0, project_scores.num_users):
        user_id = f'user_{i}'
        final_score = 0.0
        final_proj = ''
        
        for j in range(0, project_scores.num_projs):
            proj_id = f'proj_{j}'
            score = project_scores.project_compatibility_score(proj_id, user_id)
            
            if score > final_score:
                final_score = score
                final_proj = j
                
        project_scores.assignments[user_id] = {'project': final_proj, 'score': final_score}

    for user_id, data in project_scores.assignments.items():
        proj_id = f'proj_{data["project"]}'
        project_scores.proj_assignments[proj_id].append(user_id)

    all_teams = {}
    for proj_id, users in project_scores.proj_assignments.items():
        if len(users) > 0:
            all_teams[proj_id] = student_scores.cluster_students(users)

    raw_users = {}
    try:
        with open('backend/feature_engineering/firebase_pulled_users.json') as f:
            loaded_data = json.load(f)
            for u in loaded_data:
                u_id = u['user_id']
                raw_users[u_id] = u
    except FileNotFoundError:
        print("Could not find firebase_pulled_users.json")

    eval_user_data = {}
    for uid in project_scores.user_data.keys():
        eval_user_data[uid] = project_scores.user_data[uid]
        
        user_info = raw_users.get(uid, {})
        eval_user_data[uid]['skills'] = user_info.get('skills', [])
        eval_user_data[uid]['preferredProjectIds'] = user_info.get('preferredProjectIds', [])
        
    results = calculate_metrics(all_teams, eval_user_data, project_scores.project_data)
    
    print("\nPEERMATCH EVALUATION METRICS")
    pprint.pprint(results, indent=2, sort_dicts=False)