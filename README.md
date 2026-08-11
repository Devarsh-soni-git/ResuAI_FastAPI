# ResuAI

AI-powered resume vs. job-description analyzer with ATS scoring, skill-gap detection,
and betterment suggestions — with full user accounts and analysis history.

## Stack
- **Frontend:** Angular 17 (standalone components, RxJS, HttpClient, functional guards/interceptors)
- **Backend:** FastAPI (async, JWT auth, Pydantic validation)
- **Database:** PostgreSQL (via SQLAlchemy)
- **AI:** Google Gemini API (gemini-1.5-flash)

## Features
- Register / Log in (JWT-based auth)
- Forgot password / reset password flow
- Public landing page
- Resume + job description upload → ATS score, matched/missing skills, betterment suggestions
- User profile: total analyses, average ATS score, full analysis history

## Project structure
```
resuai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router wiring
│   │   ├── database.py          # SQLAlchemy engine/session (PostgreSQL)
│   │   ├── models.py            # User, PasswordResetToken, Analysis
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── security.py          # password hashing + JWT create/verify
│   │   ├── deps.py               # get_db, get_current_user
│   │   ├── pdf_utils.py         # extracts text from uploaded PDF
│   │   ├── gemini_service.py    # builds prompt, calls Gemini, parses JSON
│   │   └── routers/
│   │       ├── auth.py          # register, login, forgot/reset password, me
│   │       └── analysis.py      # analyze, history, stats
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/app/
        ├── landing/              # public marketing page
        ├── auth/
        │   ├── register/
        │   ├── login/
        │   ├── forgot-password/
        │   └── reset-password/
        ├── analyze/              # upload + ATS results (protected)
        ├── profile/              # stats + history (protected)
        ├── services/             # AuthService, ResumeService
        ├── guards/                # authGuard
        ├── interceptors/          # attaches JWT to every request
        ├── app.routes.ts
        └── app.component.*
```

## Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env:
#   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/resuai
#   GEMINI_API_KEY=<your Gemini API key from Google AI Studio>
#   JWT_SECRET_KEY=<any long random string>

# make sure a "resuai" database exists in Postgres first:
#   createdb resuai

uvicorn app.main:app --reload
# API runs at http://localhost:8000  (Swagger docs at /docs)
```

## Frontend setup
```bash
cd frontend
npm install
npm start
# App runs at http://localhost:4200
```

## How it works
1. User registers / logs in → backend issues a JWT, stored in the browser and attached to
   every request by an Angular HTTP interceptor.
2. On the Analyze page, the user uploads a PDF resume and pastes a job description.
3. FastAPI extracts text from the PDF, sends it + the job description to Gemini with a
   prompt that forces a strict JSON response (ats_score, matched_skills, missing_skills, suggestions).
4. The result is validated with Pydantic, saved to PostgreSQL under that user, and returned
   to Angular for display.
5. The Profile page pulls `/stats` (total analyses, average score) and `/history` (per-analysis
   list) — both scoped to the logged-in user only.

## Note on "forgot password"
This is a minimal build with no email server wired up. `/auth/forgot-password` generates a
reset token and returns it directly in the API response (instead of emailing it), and the
frontend carries that token straight to the reset page automatically. In a production app,
you'd send that token by email instead — everything else in the flow (expiry, one-time use)
already works correctly.

## Resume/interview talking points
- JWT auth implemented from scratch (password hashing with bcrypt, token creation/verification with python-jose).
- Angular functional route guard blocks unauthenticated access to `/analyze` and `/profile`; a functional HTTP interceptor attaches the bearer token to every outgoing request.
- Gemini's output is constrained to a strict JSON schema and validated server-side with Pydantic, so a malformed AI response never breaks the frontend.
- All analysis data is scoped per-user at the database query level (not just hidden in the UI).
