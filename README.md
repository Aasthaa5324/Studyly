# Studdy - Personalized Learning Platform

A full-stack web application that creates personalized study plans using machine learning.

## Features
- User registration
- Personalized study plan generation
- Resource recommendations based on subject and available time
- Responsive web interface

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL/SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Deployment**: Render (backend), Netlify (frontend)

## Local Development

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload