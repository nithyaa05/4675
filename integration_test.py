import unittest
import project_scores
import student_scores
from evaluate_results import calculate_metrics
import json

class TestPeerMatchIntegration(unittest.TestCase):
    def setUp(self):
        self.raw_user_dict = {}
        try:
            with open('backend/feature_engineering/firebase_pulled_users.json') as f:
                raw_users = json.load(f)
                for u in raw_users:
                    user_id = u['user_id']
                    self.raw_user_dict[user_id] = u
        except FileNotFoundError:
            pass

        self.raw_projects = {
            "proj_0": {"requiredSkills": ["React", "Python", "Cloud (AWS/GCP)"]},"proj_1": {"requiredSkills": ["React", "Databases", "Research"]},"proj_2": {"requiredSkills": ["NLP", "Machine Learning", "React"]},
            "proj_3": {"requiredSkills": ["SQL", "Java"]},"proj_4": {"requiredSkills": ["C++", "Java"]}
        }

    def test_full_pipeline_flow(self):
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

        project_scores.proj_assignments = {}
        for i in range(0, project_scores.num_projs):
            proj_key = f'proj_{i}'
            project_scores.proj_assignments[proj_key] = []

        for user_id, data in project_scores.assignments.items():
            proj_id = f'proj_{data["project"]}'
            project_scores.proj_assignments[proj_id].append(user_id)

        test_proj = None
        for pid, users in project_scores.proj_assignments.items():
            if len(users) > 0:
                test_proj = pid
                break
        
        if test_proj is None:
            self.skipTest("no users assigned to proj, skipping clustering test.")

        assigned_users = project_scores.proj_assignments[test_proj]
        teams = student_scores.cluster_students(assigned_users)
        
        self.assertTrue(len(teams) > 0)
        
        eval_user_data = {}
        for uid in assigned_users:
            eval_user_data[uid] = student_scores.data[uid]
            
            user_info = self.raw_user_dict.get(uid, {})
            
            user_skills = user_info.get('skills', [])
            eval_user_data[uid]['skills'] = user_skills
            
            user_prefs = user_info.get('preferredProjectIds', [])
            eval_user_data[uid]['preferredProjectIds'] = user_prefs

        results = calculate_metrics({test_proj: teams}, eval_user_data, self.raw_projects)
        self.assertIn(test_proj, results)
        self.assertIn("skill_coverage", results[test_proj][0])
        self.assertIn("pref_satisfaction", results[test_proj][0])

if __name__ == "__main__":
    unittest.main()