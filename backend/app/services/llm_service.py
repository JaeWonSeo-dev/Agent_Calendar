from typing import Any


class LLMService:
    def answer_schedule_question(
        self,
        *,
        user_id: str,
        message: str,
        context: list[dict[str, Any]] | None = None,
        events: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        events = events or []
        lower = message.lower()

        if ("이번주" in message or "this week" in lower) and events:
            lines = [f"- {event['start_at'][:16]} | {event['title']}" for event in events[:10]]
            answer = "이번 주 기준으로 보이는 일정은 이렇다냥.\n" + "\n".join(lines)
        elif ("오늘" in message or "today" in lower) and events:
            lines = [f"- {event['start_at'][:16]} | {event['title']}" for event in events[:10]]
            answer = "오늘 기준으로 잡힌 일정은 대충 이렇다냥.\n" + "\n".join(lines)
        elif events:
            lines = [f"- {event['start_at'][:16]} | {event['title']}" for event in events[:5]]
            answer = "공유 캘린더에서 참고한 일정 몇 개를 먼저 보여주자면 이렇다냥.\n" + "\n".join(lines)
        elif "놓친" in message or "miss" in lower:
            answer = "반복 일정 누락 검사 시나리오는 아직 더 붙여야 한다냥. 우선은 일정 조회와 저장 흐름부터 연결 중이다냥."
        else:
            answer = "아직 일정이 없거나 조회 조건에 맞는 게 없다냥. 먼저 일정을 좀 추가해보라냥."

        return {
            "message": answer,
            "user_id": user_id,
            "question": message,
            "context_count": len(context or []),
            "event_count": len(events),
        }
