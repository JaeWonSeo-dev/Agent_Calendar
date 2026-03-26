import json
from datetime import datetime
from typing import Any
from urllib import error, request

from app.core.config import settings


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
        context = context or []

        llm_answer = self._answer_with_openai(message=message, context=context, events=events)
        provider = 'openai'

        if not llm_answer:
            llm_answer = self._answer_with_gemini(message=message, context=context, events=events)
            provider = 'gemini'

        if llm_answer:
            return {
                'message': llm_answer,
                'user_id': user_id,
                'question': message,
                'context_count': len(context),
                'event_count': len(events),
                'provider': provider,
            }

        lower = message.lower()

        if ('이번주' in message or 'this week' in lower) and events:
            lines = [f"- {event['start_at'][:16]} | {event['title']}" for event in events[:10]]
            answer = '이번 주 기준으로 보이는 일정은 이렇다냥.\n' + '\n'.join(lines)
        elif ('오늘' in message or 'today' in lower) and events:
            lines = [f"- {event['start_at'][:16]} | {event['title']}" for event in events[:10]]
            answer = '오늘 기준으로 잡힌 일정은 대충 이렇다냥.\n' + '\n'.join(lines)
        elif events:
            lines = [f"- {event['start_at'][:16]} | {event['title']}" for event in events[:5]]
            answer = '공유 캘린더에서 참고한 일정 몇 개를 먼저 보여주자면 이렇다냥.\n' + '\n'.join(lines)
        elif '놓친' in message or 'miss' in lower:
            answer = '반복 일정 누락 검사 시나리오는 아직 더 붙여야 한다냥. 우선은 일정 조회와 저장 흐름부터 연결 중이다냥.'
        else:
            answer = '아직 일정이 없거나 조회 조건에 맞는 게 없다냥. 먼저 일정을 좀 추가해보라냥.'

        return {
            'message': answer,
            'user_id': user_id,
            'question': message,
            'context_count': len(context),
            'event_count': len(events),
            'provider': 'fallback',
        }

    def _answer_with_openai(self, *, message: str, context: list[dict[str, Any]], events: list[dict[str, Any]]) -> str | None:
        if not settings.openai_api_key:
            return None

        prompt = self._build_prompt(message=message, context=context, events=events)
        payload = {
            'model': settings.openai_model,
            'messages': [
                {
                    'role': 'system',
                    'content': (
                        'You are a helpful Korean calendar assistant inside a shared calendar app. '
                        'Answer primarily in Korean. Be concise, practical, and refer to the provided event context when relevant.'
                    ),
                },
                {
                    'role': 'user',
                    'content': prompt,
                },
            ],
            'temperature': 0.5,
        }

        req = request.Request(
            f"{settings.openai_base_url.rstrip('/')}/chat/completions",
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {settings.openai_api_key}',
            },
            method='POST',
        )

        try:
            with request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode('utf-8'))
                return data['choices'][0]['message']['content'].strip()
        except (error.HTTPError, error.URLError, KeyError, IndexError, TimeoutError, json.JSONDecodeError):
            return None

    def _answer_with_gemini(self, *, message: str, context: list[dict[str, Any]], events: list[dict[str, Any]]) -> str | None:
        if not settings.gemini_api_key:
            return None

        prompt = self._build_prompt(message=message, context=context, events=events)
        payload = {
            'contents': [
                {
                    'parts': [
                        {
                            'text': (
                                'You are a helpful Korean calendar assistant inside a shared calendar app. '
                                'Answer primarily in Korean, briefly and clearly.\n\n' + prompt
                            )
                        }
                    ]
                }
            ],
            'generationConfig': {
                'temperature': 0.5,
            },
        }

        req = request.Request(
            f"{settings.gemini_base_url.rstrip('/')}/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}",
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
            },
            method='POST',
        )

        try:
            with request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode('utf-8'))
                return data['candidates'][0]['content']['parts'][0]['text'].strip()
        except (error.HTTPError, error.URLError, KeyError, IndexError, TimeoutError, json.JSONDecodeError):
            return None

    def _build_prompt(self, *, message: str, context: list[dict[str, Any]], events: list[dict[str, Any]]) -> str:
        recent_context = context[-12:]
        context_lines = [f"- {item.get('role', 'user')}: {item.get('content', '')}" for item in recent_context]
        event_lines = []
        for event in events[:20]:
            start_at = event.get('start_at') or ''
            end_at = event.get('end_at') or ''
            title = event.get('title') or '제목 없음'
            owner = event.get('owner_user_id') or 'unknown'
            event_lines.append(f"- {title} | start={start_at} | end={end_at} | owner={owner}")

        now_text = datetime.utcnow().isoformat()
        return (
            f"현재 UTC 시각: {now_text}\n\n"
            f"사용자 질문:\n{message}\n\n"
            f"최근 대화 문맥:\n{chr(10).join(context_lines) if context_lines else '- 없음'}\n\n"
            f"캘린더 이벤트 문맥:\n{chr(10).join(event_lines) if event_lines else '- 없음'}\n\n"
            '위 정보를 바탕으로 사용자의 질문에 답해줘. 일정이 없으면 없다고 말하고, '
            '일정 요약이 필요하면 날짜/시간을 보기 좋게 정리해줘.'
        )
