import unittest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from firebase_config import app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_get_all_users(self):
        """Verify the users endpoint returns a 200 OK and a list of users."""
        response = self.client.get('/api/users')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIsInstance(data, list)
        if len(data) > 0:
            self.assertIn('userId', data[0])

    def test_get_all_projects(self):
        """Verify the projects endpoint returns a 200 OK and a list of projects."""
        response = self.client.get('/api/projects')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        if len(data) > 0:
            self.assertIn('title', data[0])

    def test_save_user_profile_no_data(self):
        """Verify the user profile POST endpoint handles empty data safely."""
        response = self.client.post('/api/users/me', json={})
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIn('id', data)

if __name__ == '__main__':
    unittest.main()