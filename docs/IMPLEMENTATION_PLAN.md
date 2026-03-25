# Agent Calendar Implementation Plan

## Phase 1: Accounts and onboarding
- add user model fields for birthday, profile_image_url, preferred_event_color, onboarding_completed
- implement sign-up and login flow
- implement first-login onboarding API
- build onboarding UI for profile image, birthday, nickname, and color choice

## Phase 2: Calendar workspace
- create main workspace layout
- left 70%: calendar UI
- right 30%: embedded LLM chat panel
- load current user events by date range
- enable event create/update/delete from calendar UI

## Phase 3: Chat persistence and LLM grounding
- add chat_sessions table
- add chat_messages table
- bind each message to a user and optionally a calendar context
- support continuation of prior chat context like an agent chat room
- add tool functions for event queries and weekly summaries

## Phase 4: Recurrence and reminders
- add recurrence rule persistence
- expand event instances
- add reminder worker and delivery logic
- add explicit recurring-event missed checks

## Phase 5: Polish
- improve chat UX
- add shared calendar member management
- add event filters and ownership colors
- prepare external bot channel integration
