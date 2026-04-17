import time
import random
import student_scores

def generate_dummy_users(num_users):
    dummy_data = {}
    for i in range(num_users):
        uid = f"user_{i}"
        skills = []
        for x in range(9):
            skills.append(random.randint(0, 1))
            
        avail = []
        for x in range(168):
            avail.append(random.randint(0, 1))
            
        proj_pref = []
        for x in range(5):
            proj_pref.append(random.randint(0, 1))
            
        user_pref = []
        for x in range(num_users):
            user_pref.append(random.randint(0, 1))
            
        roles = []
        for x in range(7):
            roles.append(random.randint(0, 1))
        dummy_data[uid] = {"skills_feature_vector": skills,"availability_feature_vector": avail,
            "project_pref_feature_vector": proj_pref,"user_pref_feature_vector": user_pref,
            "team_role_feature_vector": roles
        }
        
    return dummy_data

def run_benchmark():
    test_sizes = [10, 50, 100, 250, 500]
    
    print("Dataset Size | Execution Time (seconds)")
    print("---------------------------------------")
    for size in test_sizes:
        dummy_data = generate_dummy_users(size)
        student_scores.data = dummy_data
        users_list = []
        for key in dummy_data.keys():
            users_list.append(key)
            
        start_time = time.time()
        groups = student_scores.cluster_students(users_list)
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        print(f"{size:<12} | {elapsed_time:.4f}")
if __name__ == "__main__":
    run_benchmark()