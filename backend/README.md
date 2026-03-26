# Backend

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app
```

## Environment

Create `backend/.env` and set values like this:

```env
DATABASE_URL=sqlite:///./agent_calendar.db
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

- If `GEMINI_API_KEY` is set, the chat route will call the configured Gemini model.
- If the key is empty or the request fails, the backend falls back to the local rule-based response.

## Current status
- FastAPI app scaffolded
- config module added
- DB session module added
- calendar and event route placeholders added
- SQLModel entities started for users, calendars, and events

## Next steps
- add full relational models
- wire database persistence into routes
- add Alembic migrations
- add auth and bot identity mapping
