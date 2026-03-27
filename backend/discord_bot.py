from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib import error, parse, request
from zoneinfo import ZoneInfo

import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR / '.env.discord', override=True)

KST = ZoneInfo('Asia/Seoul')
SESSION_CACHE_PATH = BASE_DIR / 'data' / 'discord_sessions.json'
SESSION_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)


@dataclass
class BotConfig:
    token: str
    api_base_url: str
    calendar_user_id: str | None
    guild_id: int | None


class CalendarApi:
    def __init__(self, base_url: str, calendar_user_id: str | None = None) -> None:
        self.base_url = base_url.rstrip('/')
        self.calendar_user_id = calendar_user_id

    def _request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> Any:
        data = None
        headers: dict[str, str] = {}
        if payload is not None:
            data = json.dumps(payload).encode('utf-8')
            headers['Content-Type'] = 'application/json'

        req = request.Request(f'{self.base_url}{path}', data=data, headers=headers, method=method)
        try:
            with request.urlopen(req, timeout=30) as response:
                raw = response.read().decode('utf-8')
                return json.loads(raw) if raw else None
        except error.HTTPError as exc:
            detail = exc.read().decode('utf-8', errors='ignore')
            raise RuntimeError(detail or f'HTTP {exc.code}') from exc
        except error.URLError as exc:
            raise RuntimeError(f'API 연결 실패: {exc.reason}') from exc

    def ensure_calendar_user_id(self) -> str:
        if self.calendar_user_id:
            return self.calendar_user_id

        users = self._request('GET', '/api/users')
        if not users:
            raise RuntimeError('등록된 사용자가 없어 디스코드 봇을 연결할 수 없음. 웹에서 회원가입/온보딩을 먼저 끝내야 함.')

        self.calendar_user_id = str(users[0]['id'])
        return self.calendar_user_id

    def bootstrap_default_calendar(self) -> dict[str, Any]:
        return self._request('POST', '/api/calendars/bootstrap-default')

    def get_default_calendar(self) -> dict[str, Any]:
        return self._request('GET', '/api/calendars/default')

    def list_events(self, calendar_id: str) -> list[dict[str, Any]]:
        qs = parse.urlencode({'calendar_id': calendar_id})
        return self._request('GET', f'/api/events?{qs}')

    def create_chat_session(self, user_id: str, title: str) -> dict[str, Any]:
        return self._request('POST', '/api/chat/sessions', {'user_id': user_id, 'title': title})

    def ask_chatbot(self, session_id: str, message: str) -> dict[str, Any]:
        encoded_session = parse.quote(session_id)
        return self._request('POST', f'/api/chat/sessions/{encoded_session}/ask', {'message': message})

    def create_event(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request('POST', '/api/events', payload)

    def update_event(self, event_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        encoded_id = parse.quote(event_id)
        return self._request('PATCH', f'/api/events/{encoded_id}', payload)

    def delete_event(self, event_id: str) -> dict[str, Any]:
        encoded_id = parse.quote(event_id)
        return self._request('DELETE', f'/api/events/{encoded_id}')


class DiscordCalendarBot(commands.Bot):
    def __init__(self, config: BotConfig) -> None:
        intents = discord.Intents.default()
        super().__init__(command_prefix='!', intents=intents)
        self.config = config
        self.api = CalendarApi(config.api_base_url, config.calendar_user_id)
        self.session_cache = self._load_session_cache()

    def _load_session_cache(self) -> dict[str, str]:
        if not SESSION_CACHE_PATH.exists():
            return {}
        try:
            return json.loads(SESSION_CACHE_PATH.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            return {}

    def _save_session_cache(self) -> None:
        SESSION_CACHE_PATH.write_text(json.dumps(self.session_cache, ensure_ascii=False, indent=2), encoding='utf-8')

    async def setup_hook(self) -> None:
        if self.config.guild_id:
            guild = discord.Object(id=self.config.guild_id)
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)
        else:
            await self.tree.sync()

    async def on_ready(self) -> None:
        print(f'Discord bot ready as {self.user} ({self.user.id if self.user else "unknown"})')

    def get_or_create_session_id(self, discord_user: discord.abc.User) -> str:
        key = str(discord_user.id)
        existing = self.session_cache.get(key)
        if existing:
            return existing

        user_id = self.api.ensure_calendar_user_id()
        session = self.api.create_chat_session(user_id, f'Discord Chat - {discord_user.name}')
        session_id = str(session['id'])
        self.session_cache[key] = session_id
        self._save_session_cache()
        return session_id


bot_config = BotConfig(
    token=os.getenv('DISCORD_BOT_TOKEN', '').strip(),
    api_base_url=os.getenv('AGENT_CALENDAR_API_BASE_URL', 'http://127.0.0.1:8000').strip(),
    calendar_user_id=os.getenv('DISCORD_CALENDAR_USER_ID', '').strip() or None,
    guild_id=int(os.getenv('DISCORD_GUILD_ID', '0') or '0') or None,
)

if not bot_config.token:
    raise RuntimeError('DISCORD_BOT_TOKEN 이 설정되지 않음. backend/.env.discord 파일에 토큰을 넣어야 함.')

bot = DiscordCalendarBot(bot_config)


def parse_kst_datetime(text: str) -> datetime:
    normalized = ' '.join(text.strip().split())
    dt = datetime.strptime(normalized, '%Y-%m-%d %H:%M')
    return dt.replace(tzinfo=KST)


def format_event_line(event: dict[str, Any]) -> str:
    start = datetime.fromisoformat(str(event['start_at']).replace('Z', '+00:00')).astimezone(KST)
    end = datetime.fromisoformat(str(event['end_at']).replace('Z', '+00:00')).astimezone(KST)
    return f"`{event['id']}` | {start:%m-%d %H:%M} ~ {end:%m-%d %H:%M} | {event['title']}"


@bot.tree.command(name='calendar-ask', description='공유 캘린더 내용을 바탕으로 질문합니다.')
@app_commands.describe(question='예: 이번주 일정 뭐 있어?')
async def calendar_ask(interaction: discord.Interaction, question: str) -> None:
    await interaction.response.defer(thinking=True)
    try:
        session_id = bot.get_or_create_session_id(interaction.user)
        result = bot.api.ask_chatbot(session_id, question)
        await interaction.followup.send(result.get('assistant_message', '답변을 가져오지 못했어.'))
    except Exception as exc:
        await interaction.followup.send(f'질문 처리 실패: {exc}')


@bot.tree.command(name='calendar-events', description='공유 캘린더의 최근 일정을 조회합니다.')
@app_commands.describe(limit='보여줄 일정 개수 (기본 10)')
async def calendar_events(interaction: discord.Interaction, limit: app_commands.Range[int, 1, 20] = 10) -> None:
    await interaction.response.defer(thinking=True)
    try:
        calendar = bot.api.bootstrap_default_calendar()
        events = bot.api.list_events(str(calendar['id']))
        events = sorted(events, key=lambda item: item['start_at'])[:limit]
        if not events:
            await interaction.followup.send('공유 캘린더에 등록된 일정이 아직 없어.')
            return
        lines = [format_event_line(event) for event in events]
        await interaction.followup.send('공유 캘린더 일정:\n' + '\n'.join(lines))
    except Exception as exc:
        await interaction.followup.send(f'일정 조회 실패: {exc}')


@bot.tree.command(name='calendar-add', description='공유 캘린더에 일정을 추가합니다.')
@app_commands.describe(
    title='일정 제목',
    start='시작 시각 (예: 2026-03-28 14:00)',
    end='종료 시각 (예: 2026-03-28 15:00)',
    description='선택 설명',
)
async def calendar_add(
    interaction: discord.Interaction,
    title: str,
    start: str,
    end: str,
    description: str | None = None,
) -> None:
    await interaction.response.defer(thinking=True)
    try:
        calendar = bot.api.bootstrap_default_calendar()
        owner_user_id = bot.api.ensure_calendar_user_id()
        start_dt = parse_kst_datetime(start)
        end_dt = parse_kst_datetime(end)
        if end_dt <= start_dt:
            raise RuntimeError('종료 시각은 시작 시각보다 뒤여야 함.')

        created = bot.api.create_event({
            'calendar_id': str(calendar['id']),
            'owner_user_id': owner_user_id,
            'title': title,
            'description': description,
            'start_at': start_dt.astimezone(ZoneInfo('UTC')).isoformat(),
            'end_at': end_dt.astimezone(ZoneInfo('UTC')).isoformat(),
            'all_day': False,
            'status': 'scheduled',
        })
        await interaction.followup.send('일정 추가 완료:\n' + format_event_line(created))
    except ValueError:
        await interaction.followup.send('날짜 형식이 잘못됨. `YYYY-MM-DD HH:MM` 형식으로 입력해줘.')
    except Exception as exc:
        await interaction.followup.send(f'일정 추가 실패: {exc}')


@bot.tree.command(name='calendar-update', description='공유 캘린더의 기존 일정을 수정합니다.')
@app_commands.describe(
    event_id='수정할 이벤트 ID',
    title='새 제목',
    start='새 시작 시각 (예: 2026-03-28 14:00)',
    end='새 종료 시각 (예: 2026-03-28 15:00)',
    description='새 설명',
)
async def calendar_update(
    interaction: discord.Interaction,
    event_id: str,
    title: str | None = None,
    start: str | None = None,
    end: str | None = None,
    description: str | None = None,
) -> None:
    await interaction.response.defer(thinking=True)
    try:
        payload: dict[str, Any] = {}
        if title is not None:
            payload['title'] = title
        if description is not None:
            payload['description'] = description
        if start is not None:
            payload['start_at'] = parse_kst_datetime(start).astimezone(ZoneInfo('UTC')).isoformat()
        if end is not None:
            payload['end_at'] = parse_kst_datetime(end).astimezone(ZoneInfo('UTC')).isoformat()
        if not payload:
            raise RuntimeError('수정할 항목을 하나 이상 넣어야 함.')

        updated = bot.api.update_event(event_id, payload)
        await interaction.followup.send('일정 수정 완료:\n' + format_event_line(updated))
    except ValueError:
        await interaction.followup.send('날짜 형식이 잘못됨. `YYYY-MM-DD HH:MM` 형식으로 입력해줘.')
    except Exception as exc:
        await interaction.followup.send(f'일정 수정 실패: {exc}')


@bot.tree.command(name='calendar-delete', description='공유 캘린더 일정을 삭제합니다.')
@app_commands.describe(event_id='삭제할 이벤트 ID')
async def calendar_delete(interaction: discord.Interaction, event_id: str) -> None:
    await interaction.response.defer(thinking=True)
    try:
        bot.api.delete_event(event_id)
        await interaction.followup.send(f'일정 삭제 완료: `{event_id}`')
    except Exception as exc:
        await interaction.followup.send(f'일정 삭제 실패: {exc}')


if __name__ == '__main__':
    bot.run(bot_config.token)
