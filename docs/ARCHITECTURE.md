# Agent Calendar Architecture

## 1. High-Level Architecture

The system is split into two main interfaces:
- Web: calendar management UI for event CRUD and calendar browsing
- Bot: natural-language interface for schedule queries, summaries, reminders, and recurring-event checks

Core backend services:
- API server
- relational database
- reminder / scheduler worker
- LLM orchestration layer

## 2. Proposed Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- FullCalendar

### Backend
- FastAPI
- SQLAlchemy or SQLModel
- PostgreSQL
- Redis
- APScheduler / Celery for scheduled jobs

### Bot layer
- Discord bot first (recommended)
- later extensible to Telegram

### LLM layer
- tool-calling based LLM integration
- LLM never directly edits storage without validated tool input

## 3. Request Flow

### Web flow
1. user authenticates
2. user loads calendar data by date range
3. user creates/edits/deletes event
4. backend validates ownership/permission
5. backend writes to PostgreSQL
6. reminder jobs are created or updated

### Chatbot question flow
1. user sends a natural-language question from the embedded web chat or external bot channel
2. channel identity is mapped to the application user
3. chat session and recent messages are loaded
4. LLM classifies intent
5. backend tools fetch structured event data
6. LLM summarizes grounded data
7. user message and assistant answer are stored in chat history
8. chatbot returns answer

### Reminder flow
1. scheduled worker checks upcoming reminders and recurrence due windows
2. due reminders are expanded and queued
3. bot or notification channel sends reminder text

## 4. Boundaries

### Structured system responsibility
- event storage
- recurrence expansion
- permissions
- reminder scheduling
- user identity mapping

### LLM responsibility
- interpret user questions
- choose query tools
- summarize results
- explain missing recurring-event checks
- present uncertainty carefully

## 5. Initial Project Structure

```text
Agent_Calendar/
  docs/
    PRD.md
    ARCHITECTURE.md
    DB_SCHEMA.md
    API_SPEC.md
  frontend/
  backend/
  bot/
```

## 6. Design Principles

- write actions must be deterministic and validated
- read/query actions can be LLM-assisted
- explicit recurring rules are primary truth
- inferred habits are optional secondary intelligence
- multi-user ownership must be visible in both UI and data model
nd validated
- read/query actions can be LLM-assisted
- explicit recurring rules are primary truth
- inferred habits are optional secondary intelligence
- multi-user ownership must be visible in both UI and data model
