# Agent Calendar API Spec Draft

## Auth
- session or token-based authentication for web
- bot identity maps external user IDs to application user IDs

## User APIs

### POST /api/users/signup
Create a user account.

### POST /api/users/login
Log in and return the user profile.

### GET /api/users/:userId
Get user profile.

### PATCH /api/users/:userId/onboarding
Complete first-login onboarding.

## Calendar APIs

### GET /api/calendars/default
Get the single shared default calendar.

### POST /api/calendars/bootstrap-default
Bootstrap the default shared calendar if it does not exist.

### POST /api/calendars/:calendarId/members
Add member to the shared calendar.

## Event APIs

### GET /api/events?start=...&end=...&calendarId=...
Return events in a date range.

### POST /api/events
Create an event.

### GET /api/events/:eventId
Get event detail.

### PATCH /api/events/:eventId
Update an event.

### DELETE /api/events/:eventId
Delete an event.

## Recurrence APIs

### POST /api/events/:eventId/recurrence
Attach or update recurrence rule.

### GET /api/events/:eventId/instances
List expanded event instances.

## Reminder APIs

### POST /api/events/:eventId/reminders
Create reminder rule.

### GET /api/reminders/upcoming
Get current user's upcoming reminders.

## Chat / LLM APIs

### GET /api/chat/sessions
List a user's persistent chat sessions.

### POST /api/chat/sessions
Create a chat session.

### GET /api/chat/sessions/:sessionId/messages
List messages for a chat session.

### POST /api/chat/messages
Create a chat message manually.

### POST /api/chat/sessions/:sessionId/ask
Ask the chatbot a question and persist both the user message and assistant answer.

## Suggested tool functions for LLM
- get_default_calendar()
- list_events(user_id, start_at, end_at, calendar_scope)
- list_shared_calendar_events(start_at, end_at)
- list_recurring_events(user_id, start_at, end_at)
- find_free_slots(user_id, start_at, end_at)
- get_upcoming_reminders(user_id)
- check_missing_recurring_events(user_id, start_at, end_at)
- summarize_events(event_list)
