# Agent Calendar DB Schema Draft

## 1. users
- id (uuid, pk)
- email (unique, nullable for external-only auth if needed)
- username
- display_name
- nickname
- birth_date
- timezone
- color
- profile_image_url
- preferred_event_color
- onboarding_completed
- password_hash
- created_at
- updated_at

## 2. calendars
- id (uuid, pk)
- name
- type (shared)
- owner_user_id (fk -> users.id, nullable for system bootstrap if desired)
- is_default (bool)
- created_at
- updated_at

## 3. calendar_members
- id (uuid, pk)
- calendar_id (fk -> calendars.id)
- user_id (fk -> users.id)
- role (owner | editor | viewer)
- created_at
- updated_at

## 4. events
- id (uuid, pk)
- calendar_id (fk -> calendars.id)
- owner_user_id (fk -> users.id)
- title
- description
- location
- category
- start_at
- end_at
- all_day (bool)
- status (scheduled | completed | cancelled | skipped)
- created_at
- updated_at

## 5. recurrence_rules
- id (uuid, pk)
- event_id (fk -> events.id)
- freq (daily | weekly | monthly | yearly)
- interval
- by_day
- by_month_day
- until_at
- count
- created_at
- updated_at

## 6. event_instances
- id (uuid, pk)
- event_id (fk -> events.id)
- occurrence_start_at
- occurrence_end_at
- status (scheduled | completed | cancelled | skipped)
- override_title (nullable)
- override_description (nullable)
- created_at
- updated_at

## 7. reminders
- id (uuid, pk)
- event_id (fk -> events.id)
- offset_minutes_before (nullable)
- remind_at (nullable)
- delivery_channel (bot | email | web)
- status (pending | sent | failed | cancelled)
- created_at
- updated_at

## 8. bot_identities
- id (uuid, pk)
- user_id (fk -> users.id)
- provider (discord | telegram | web)
- provider_user_id
- created_at
- updated_at

## 9. chat_sessions
- id (uuid, pk)
- user_id (fk -> users.id)
- title
- is_active
- last_message_at
- created_at
- updated_at

## 10. chat_messages
- id (uuid, pk)
- session_id (fk -> chat_sessions.id)
- user_id (fk -> users.id)
- role (user | assistant | system)
- content
- calendar_id (fk -> calendars.id, nullable)
- created_at
- updated_at

## 11. event_insights (future / optional)
- id (uuid, pk)
- user_id (fk -> users.id)
- insight_type (habit | likely_missing | summary)
- content_json
- confidence
- created_at

## Notes
- the MVP uses one default shared calendar for all users
- ownership is defined per event via owner_user_id
- shared access is defined by calendar membership
- same-day same-title events from different users are naturally separated because event rows differ by ID and owner_user_id
- inferred missed events should not overwrite actual events
