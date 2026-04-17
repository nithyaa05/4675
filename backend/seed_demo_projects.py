from firebase_client import get_db

SEED_PROJECTS = [
    {
        "id": "proj_0",
        "title": "PeerMatch platform",
        "courseCode": "CS 4675",
        "description": "Cloud-based team formation with profiles, preferences, and scalable matching.",
        "requiredSkills": ["React", "Python", "Machine Learning"],
        "teamSizeMin": 3,
        "teamSizeMax": 5,
        "teamRoles": ["Designer (UI/UX)", "Programmer", "Data Analyst"],
    },
    {
        "id": "proj_1",
        "title": "Campus sustainability dashboard",
        "courseCode": "CS 4675",
        "description": "Visualize energy usage and student initiatives with public datasets.",
        "requiredSkills": ["React", "SQL", "Machine Learning"],
        "teamSizeMin": 4,
        "teamSizeMax": 4,
        "teamRoles": ["Data Analyst", "Data Engineer"],
    },
    {
        "id": "proj_2",
        "title": "Adaptive tutoring chatbot",
        "courseCode": "CS 4675",
        "description": "AI-powered personalized learning with spaced repetition and NLP.",
        "requiredSkills": ["Javascript", "Machine Learning", "React"],
        "teamSizeMin": 3,
        "teamSizeMax": 4,
        "teamRoles": ["Data Analyst", "Programmer", "Designer (UI/UX)"],
    },
    {
        "id": "proj_3",
        "title": "Smart city traffic optimization",
        "courseCode": "CS 4675",
        "description": "AI-driven solutions for real-time traffic management and optimization.",
        "requiredSkills": ["Python", "Machine Learning", "Data Analysis", "Node.js", "Javascript"],
        "teamSizeMin": 1,
        "teamSizeMax": 5,
        "teamRoles": ["Data Analyst", "Programmer", "Designer (UI/UX)", "Project Manager", "Testing/Debugging"],
    },
        {
        "id": "proj_4",
        "title": "C++-based AI for real-time strategy games",
        "courseCode": "CS 4675",
        "description": "C++-based AI for real-time strategy games, focusing on pathfinding, decision-making, and adaptive learning.",
        "requiredSkills": ["C++", "Node.js", "Data Analysis", "SQL", "Javascript"],
        "teamSizeMin": 1,
        "teamSizeMax": 5,
        "teamRoles": ["Architect/System Designer", "Programmer", "Designer (UI/UX)", "Project Manager", "Testing/Debugging"],
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
