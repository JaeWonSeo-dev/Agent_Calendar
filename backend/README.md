# Backend

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

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
