import unittest
import numpy as np
import student_scores
import project_scores

class TestPeerMatchLogic(unittest.TestCase):

    def test_user_diversity_weighting(self):
        """Test that identical users get a lower score than diverse users."""
        score_same = student_scores.user_compatibility_score('user_0', 'user_0')
        self.assertLess(score_same, 1.0, "Identical skills should have a lower compatibility score to promote diversity.")

    def test_matrix_construction(self):
        """Test if similarity matrix is square, symmetric, and has 1.0 on diagonal."""
        users = ['user_0', 'user_1', 'user_2']
        matrix = student_scores.construct_similarity_matrix(users)
        self.assertEqual(matrix.shape, (3, 3))
        self.assertEqual(matrix[0][1], matrix[1][0], "Matrix must be symmetric.")
        self.assertEqual(matrix[0][0], 1.0, "Diagonal should be 1.0.")

    def test_clustering_prevents_singletons(self):
        """Verify the greedy algorithm merges single users into groups."""
        users = ['user_0', 'user_1', 'user_2', 'user_3'] 
        groups = student_scores.cluster_students(users)
        for group in groups:
            self.assertGreaterEqual(len(group), 2, "No group should have only 1 member.")

    def test_group_completeness(self):
        """Ensure every student is assigned to a group and nobody is lost."""
        users = []
        for i in range(10):
            users.append(f'user_{i}')
        groups = student_scores.cluster_students(users)
        
        flattened = []
        for group in groups:
            for user in group:
                flattened.append(user)

        self.assertEqual(len(flattened), 10)
        self.assertEqual(set(flattened), set(users))

if __name__ == '__main__':
    unittest.main()