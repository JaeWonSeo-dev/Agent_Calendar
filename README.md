# Agent Calendar

Agent Calendar is a web + bot calendar system.

## Product direction
- schedule management and editing happen on the web
- users ask the bot natural-language questions about schedules
- multiple users can share calendar spaces while retaining event ownership
- recurring events and reminders are first-class features

## Docs
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/DB_SCHEMA.md
- docs/API_SPEC.md

## LLM setup
- Chatbot calls are wired through the backend `LLMService`.
- Set `GEMINI_API_KEY` in `backend/.env` to enable a real model.
- Default model: `gemini-2.5-flash`
- Without a key, chatbot responses fall back to the local rule-based responder.
