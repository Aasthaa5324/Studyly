import random

def recommend_resources(subject: str, hours_per_week: float) -> str:
    """Simple recommendation system - replace with actual ML model later"""
    
    resources = {
        "math": [
            "Khan Academy - Mathematics",
            "Professor Leonard YouTube Channel",
            "Paul's Online Math Notes",
            "Brilliant.org Math Courses"
        ],
        "science": [
            "CrashCourse Science Series",
            "MIT OpenCourseWare",
            "edX Science Courses",
            "Coursera Science Specializations"
        ],
        "programming": [
            "freeCodeCamp",
            "The Odin Project",
            "CS50 Harvard Course",
            "LeetCode for Practice"
        ],
        "language": [
            "Duolingo",
            "Babbel",
            "FluentU",
            "italki for Speaking Practice"
        ]
    }
    
    # Get resources based on subject
    subject_lower = subject.lower()
    selected_resources = []
    
    for key, value in resources.items():
        if key in subject_lower:
            selected_resources = value
            break
    
    # If no specific match, provide general resources
    if not selected_resources:
        selected_resources = [
            "Coursera",
            "edX",
            "Udemy",
            "YouTube Educational Channels"
        ]
    
    # Select resources based on available hours
    if hours_per_week < 5:
        num_resources = 2
    elif hours_per_week < 10:
        num_resources = 3
    else:
        num_resources = 4
    
    recommended = random.sample(selected_resources, min(num_resources, len(selected_resources)))
    return ", ".join(recommended)