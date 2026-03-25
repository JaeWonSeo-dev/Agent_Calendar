# Agent Calendar PRD

## 1. Product Overview

Agent Calendar is a web + bot calendar service where all users collaborate inside one shared calendar environment, similar in spirit to a collaborative spreadsheet. Everyone sees the same calendar timeline, but each event still preserves per-user ownership through profile, color, and metadata. Schedule creation and editing happen on the web UI, while natural-language querying, reminders, summaries, and missed recurring-event detection happen through an LLM-powered chatbot.

## 2. Product Goal

Build a calendar system where:
- all users create, edit, and manage events inside the same shared calendar UI
- users can see one another's schedule entries in one collaborative timeline
- event ownership is preserved per user through color, profile, and metadata
- users complete a first-login profile setup before entering the main workspace
- the chatbot answers schedule questions in natural language
- the system detects missing recurring events and reminds users proactively
- chat history is stored per user like an agent chat room

## 3. Non-Goals for MVP

The first version will not include:
- native mobile app
- free-form bot schedule writes without confirmation
- external calendar sync (Google Calendar / Outlook)
- advanced autonomous AI rescheduling
- voice interface

## 4. Target Users

### Primary users
- individuals managing routines together in a shared environment
- small teams or groups that want a common calendar board
- users who prefer asking a bot schedule questions instead of manually searching the calendar

### User traits
- want a visual calendar UI for direct editing
- want conversational access to schedule information
- want to see other users' schedule entries in the same shared space
- need repeated-event tracking and reminders

## 5. Core User Scenarios

### Scenario A: Sign-up and first profile setup
A user signs up and the account is stored in the database. On first login, the user completes onboarding with:
- profile image selection
- birthday input
- nickname input
- preferred event color selection

After this step, the user profile is initialized.

### Scenario B: Shared calendar workspace
The user enters the main workspace.
- left 70%: shared calendar UI
- right 30%: LLM chatbot panel

The user can create, edit, and browse events in the same shared calendar all other users are using.

### Scenario C: Shared visibility between users
All users work in the same shared calendar timeline. Everyone can see one another's schedule entries, and events on the same date with the same title remain distinguishable by owner, color, tag, or avatar.

### Scenario D: Ask the chatbot about schedules
A user asks:
- "What is on my schedule this week?"
- "What important events do I have tomorrow?"
- "What is on the shared calendar this Friday?"
- "Who added events on this date?"

The chatbot checks the user identity, queries structured event data, and replies with a readable summary.

### Scenario E: Chat history persistence like an agent chat room
Each user has persistent chatbot conversation history so follow-up questions can continue in context, similar to an agent chat room.

### Scenario F: Missed recurring schedule detection
A user asks:
- "Did I miss any recurring tasks this month?"
- "Is there something I usually do every week but forgot to add?"

The system first checks explicit recurring rules, then can optionally analyze past event patterns to suggest likely omissions.

## 6. Functional Requirements

### 6.1 User accounts and onboarding
- sign-up and login
- store user account in database
- first-login onboarding flow
- profile image selection
- nickname input
- birthday input
- preferred event color selection
- profile initialization status tracking

### 6.2 Shared calendar workspace
- monthly, weekly, and daily calendar views
- create / read / update / delete events
- all-day and timed events
- recurrence rule support
- reminder configuration
- one shared calendar used by all users
- per-user visual distinction for event ownership
- split layout with calendar area (70%) and chatbot panel (30%)

### 6.3 Multi-user collaboration
- each user has a unique identifier
- all users join the same shared calendar by default
- events store an owner user ID
- same-day same-title events from different users remain separate records
- users can see one another's event entries in the same calendar timeline
- permissions support at least owner, editor, viewer roles

### 6.4 Bot / LLM support
- answer natural-language schedule questions
- summarize schedules over a given period
- find open time windows
- check recurring events due in a time range
- detect likely missed recurring events
- produce reminder summaries and digest messages
- maintain per-user chat sessions and chat history
- support follow-up questions based on prior conversation context

### 6.5 Reminder support
- event-level reminders
- daily summary reminders
- upcoming-event reminders
- missed recurring-event alerts

## 7. Safety and Reliability Requirements

- chatbot schedule answers must be grounded in structured calendar data
- free-form event creation through chatbot must require confirmation before saving
- timezones must be stored and respected per user
- responses must clearly separate confirmed events from inferred likely-missing events
- access control must prevent unauthorized editing even in a shared calendar

## 8. MVP Scope

### Included in MVP
- user accounts
- first-login onboarding profile setup
- one shared calendar with membership
- event CRUD from web UI
- recurring event rules
- reminder configuration
- split calendar + chatbot workspace UI
- chatbot schedule Q&A
- per-user chat history persistence
- weekly summary
- missed explicit recurring-event detection

### Excluded from MVP
- automatic habit inference from long-term event history
- third-party calendar integration
- AI-generated schedule creation without user confirmation
- advanced analytics dashboard

## 9. Success Metrics

- users can create and manage schedules without confusion
- users can clearly distinguish who created each event in the shared calendar
- chatbot answers weekly schedule queries accurately
- missed recurring-event checks return useful results
- reminder delivery is timely and consistent

## 10. Open Questions

- Which bot channel should ship first: embedded web chat only, Discord, or Telegram?
- Should all users have edit access by default, or should roles be configurable at signup/invite time?
- Should inferred missed events be shown automatically or only when asked?
- How much schedule history should the chatbot analyze by default?
