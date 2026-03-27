# Discord Bot Bridge

이 디스코드 봇은 Agent Calendar 백엔드 API에 직접 붙어서 아래 기능을 제공합니다.

- `/calendar-ask` : 공유 캘린더 문맥으로 질문/답변
- `/calendar-events` : 공유 캘린더 일정 조회
- `/calendar-add` : 일정 추가
- `/calendar-update` : 일정 수정
- `/calendar-delete` : 일정 삭제

## 1) 설정

`backend/.env.discord.example` 를 복사해서 `backend/.env.discord` 를 만든 뒤 값을 채웁니다.

```powershell
Copy-Item .\backend\.env.discord.example .\backend\.env.discord
```

필수값:

- `DISCORD_BOT_TOKEN`

선택값:

- `AGENT_CALENDAR_API_BASE_URL` (기본 `http://127.0.0.1:8000`)
- `DISCORD_CALENDAR_USER_ID` (지정 안 하면 첫 번째 등록 사용자를 사용)
- `DISCORD_GUILD_ID` (개발 중 slash command sync 빠르게 하고 싶을 때)

## 2) 의존성 설치

```powershell
.\backend\.venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt
```

## 3) 실행

백엔드가 먼저 떠 있어야 합니다.

```powershell
npm run backend
npm run discord-bot
```

또는

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 backend
powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 discord-bot
```

## 4) 디스코드에서 쓸 명령

- `/calendar-ask question:이번주 일정 뭐 있어?`
- `/calendar-events limit:10`
- `/calendar-add title:팀미팅 start:2026-03-28 14:00 end:2026-03-28 15:00`
- `/calendar-update event_id:<이벤트ID> title:새 제목`
- `/calendar-delete event_id:<이벤트ID>`

## 날짜 형식

모든 입력 시간은 `YYYY-MM-DD HH:MM` 형식이며, 한국 시간(Asia/Seoul) 기준으로 처리됩니다.
