# Discord Bot Bridge

이 디스코드 봇은 Agent Calendar 백엔드 API에 직접 붙어서 아래 흐름으로 동작합니다.

- 디스코드 계정 ↔ 웹 사용자 계정 연결
- 디스코드 DM 또는 봇 멘션으로 일정 질문
- 자연어 일정 생성/수정/삭제 요청 해석
- 쓰기 작업은 `확인` / `취소`로 한 번 더 검증 후 실행

## 제공 기능

- `/calendar-link` : 현재 디스코드 계정을 웹 사용자와 연결
- `/calendar-ask` : 연결된 사용자 문맥으로 일정 질문/수정 요청 전달
- `/calendar-my-events` : 내 일정 목록 조회
- DM 또는 봇 멘션으로 자유 대화 가능
  - 예: `내일 일정 뭐 있어?`
  - 예: `내일 오후 3시에 치과 일정 추가해줘`
  - 예: `운동 일정 내일 오후 7시로 옮겨줘`
  - 예: `운동 일정 삭제해줘`

## 동작 방식

1. 사용자가 `/calendar-link app_user_id:<웹 사용자 UUID>` 로 본인 계정을 연결
2. 이후 DM 또는 멘션으로 메시지를 보냄
3. 백엔드가 메시지를 아래 중 하나로 분류
   - 일정 질문(조회)
   - 일정 생성
   - 일정 수정
   - 일정 삭제
4. 조회는 바로 챗봇 응답
5. 생성/수정/삭제는 미리보기 후 `확인` 입력 시 실제 실행

## 1) 설정

`backend/.env.discord.example` 를 복사해서 `backend/.env.discord` 를 만든 뒤 값을 채웁니다.

```powershell
Copy-Item .\backend\.env.discord.example .\backend\.env.discord
```

필수값:

- `DISCORD_BOT_TOKEN`

선택값:

- `AGENT_CALENDAR_API_BASE_URL` (기본 `http://127.0.0.1:8000`)
- `DISCORD_GUILD_ID` (개발 중 slash command sync 빠르게 하고 싶을 때)
- `DISCORD_ACTION_CONFIDENCE` (현재는 확장용 설정)

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

## 4) 연결 방법

웹 앱에서 자기 사용자 ID(UUID)를 확인한 뒤 디스코드에서:

```text
/calendar-link app_user_id:<웹 사용자 UUID>
```

연결이 완료되면 이후부터 그 디스코드 계정은 해당 사용자 일정으로 동작합니다.

## 5) 사용 예시

### 질문
- `/calendar-ask question:내일 일정 뭐 있어?`
- DM: `이번 주 내 일정 정리해줘`
- 멘션: `@봇 금요일 일정 알려줘`

### 일정 추가
- `/calendar-ask question:내일 오후 3시에 치과 일정 추가해줘`
- 봇이 해석 결과를 보여주면 `확인`

### 일정 수정
- `/calendar-ask question:운동 일정 내일 오후 7시로 옮겨줘`
- 봇이 대상/변경 내용을 보여주면 `확인`

### 일정 삭제
- `/calendar-ask question:운동 일정 삭제해줘`
- 봇이 삭제 대상을 요약하면 `확인`

## 6) 주의 사항

- 현재 수정/삭제는 **연결된 본인 일정 기준**으로 우선 탐색합니다.
- 같은 제목의 일정이 많으면 더 구체적인 제목이나 `event_id`를 주는 게 안전합니다.
- 상대 날짜 파싱은 현재 기본적으로 `오늘/내일/모레`, `오전/오후`, `N시`, `N시간` 정도를 우선 지원합니다.
- 절대 시간은 `YYYY-MM-DD HH:MM` 형식으로 넣으면 가장 안정적입니다.

## 날짜/시간 기준

모든 입력 시간은 기본적으로 한국 시간(Asia/Seoul) 기준으로 처리됩니다.
