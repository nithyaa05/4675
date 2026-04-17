from firebase_client import get_db

SEED_PROJECTS = [
    {
        "id": "proj_1",
        "title": "PeerMatch platform",
        "courseCode": "CS 4675",
        "description": "Cloud-based team formation with profiles, preferences, and scalable matching.",
        "requiredSkills": ["React", "Python", "Cloud (AWS/GCP)"],
        "teamSizeMin": 3,
        "teamSizeMax": 5,
        "teamRoles": ["Frontend", "Backend", "ML/Data"],
    },
    {
        "id": "proj_2",
        "title": "Campus sustainability dashboard",
        "courseCode": "CS 4675",
        "description": "Visualize energy usage and student initiatives with public datasets.",
        "requiredSkills": ["React", "Databases", "Research"],
        "teamSizeMin": 4,
        "teamSizeMax": 4,
        "teamRoles": ["Visualization", "Data pipeline"],
    },
    {
        "id": "proj_3",
        "title": "Adaptive tutoring chatbot",
        "courseCode": "CS 4675",
        "description": "AI-powered personalized learning with spaced repetition and NLP.",
        "requiredSkills": ["NLP", "Machine Learning", "React"],
        "teamSizeMin": 3,
        "teamSizeMax": 4,
        "teamRoles": ["ML", "Backend", "UI"],
    },
]


def main():
    db = get_db()
    projects = db.collection("demo_projects")
    for project in SEED_PROJECTS:
        projects.document(project["id"]).set(project, merge=True)
    print(f"Seeded {len(SEED_PROJECTS)} projects into demo_projects.")


if __name__ == "__main__":
    main()
