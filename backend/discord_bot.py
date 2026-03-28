from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import error, parse, request

import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR / '.env.discord', override=True)

SESSION_CACHE_PATH = BASE_DIR / 'data' / 'discord_sessions.json'
PENDING_ACTIONS_PATH = BASE_DIR / 'data' / 'discord_pending_actions.json'
SESSION_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)


@dataclass
class BotConfig:
    token: str
    api_base_url: str
    guild_id: int | None
    action_confidence_threshold: float


class CalendarApi:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip('/')

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

    def get_user_by_discord(self, discord_user_id: str) -> dict[str, Any] | None:
        encoded = parse.quote(discord_user_id)
        try:
            return self._request('GET', f'/api/users/discord/{encoded}')
        except RuntimeError as exc:
            if '404' in str(exc) or 'Linked user not found' in str(exc):
                return None
            raise

    def link_discord_user(self, user_id: str, discord_user_id: str, discord_username: str | None) -> dict[str, Any]:
        encoded = parse.quote(user_id)
        return self._request(
            'POST',
            f'/api/users/{encoded}/link-discord',
            {'discord_user_id': discord_user_id, 'discord_username': discord_username},
        )

    def create_chat_session(self, user_id: str, title: str) -> dict[str, Any]:
        return self._request('POST', '/api/chat/sessions', {'user_id': user_id, 'title': title})

    def ask_chatbot(self, session_id: str, message: str) -> dict[str, Any]:
        encoded_session = parse.quote(session_id)
        return self._request('POST', f'/api/chat/sessions/{encoded_session}/ask', {'message': message})

    def list_events(self, *, owner_user_id: str | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {}
        if owner_user_id:
            query['owner_user_id'] = owner_user_id
        qs = f"?{parse.urlencode(query)}" if query else ''
        return self._request('GET', f'/api/events{qs}')

    def execute_discord_agent_action(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        encoded = parse.quote(user_id)
        return self._request('POST', f'/api/chat/discord-agent/{encoded}/execute', payload)

    def preview_discord_agent_action(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        encoded = parse.quote(user_id)
        return self._request('POST', f'/api/chat/discord-agent/{encoded}/preview', payload)


class DiscordCalendarBot(commands.Bot):
    def __init__(self, config: BotConfig) -> None:
        intents = discord.Intents.default()
        intents.message_content = True
        intents.messages = True
        intents.guilds = True
        intents.dm_messages = True
        super().__init__(command_prefix='!', intents=intents)
        self.config = config
        self.api = CalendarApi(config.api_base_url)
        self.session_cache = self._load_json(SESSION_CACHE_PATH)
        self.pending_actions = self._load_json(PENDING_ACTIONS_PATH)

    def _load_json(self, path: Path) -> dict[str, Any]:
        if not path.exists():
            return {}
        try:
            return json.loads(path.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            return {}

    def _save_json(self, path: Path, data: dict[str, Any]) -> None:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

    def _get_linked_user(self, discord_user: discord.abc.User) -> dict[str, Any] | None:
        return self.api.get_user_by_discord(str(discord_user.id))

    def _get_or_create_session_id(self, discord_user: discord.abc.User, app_user_id: str) -> str:
        key = str(discord_user.id)
        existing = self.session_cache.get(key)
        if existing:
            return existing
        session = self.api.create_chat_session(app_user_id, f'Discord Chat - {discord_user.name}')
        session_id = str(session['id'])
        self.session_cache[key] = session_id
        self._save_json(SESSION_CACHE_PATH, self.session_cache)
        return session_id

    async def setup_hook(self) -> None:
        if self.config.guild_id:
            guild = discord.Object(id=self.config.guild_id)
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)
        else:
            await self.tree.sync()

    async def on_ready(self) -> None:
        print(f'Discord bot ready as {self.user} ({self.user.id if self.user else "unknown"})')

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot:
            return

        is_dm = isinstance(message.channel, discord.DMChannel)
        is_mentioned = self.user in message.mentions if self.user else False
        if not is_dm and not is_mentioned:
            return

        content = message.content.strip()
        if self.user and is_mentioned:
            content = content.replace(f'<@{self.user.id}>', '').replace(f'<@!{self.user.id}>', '').strip()
        if not content:
            return

        async with message.channel.typing():
            reply = await self.handle_calendar_message(message.author, content)
        await message.reply(reply, mention_author=False)

    async def handle_calendar_message(self, discord_user: discord.abc.User, content: str) -> str:
        linked_user = self._get_linked_user(discord_user)
        if not linked_user:
            return (
                '아직 이 디스코드 계정이 웹 사용자와 연결되지 않았어.\n'
                '먼저 디스코드에서 `/calendar-link app_user_id:<웹 사용자 ID>` 를 실행해줘.'
            )

        key = str(discord_user.id)
        normalized = content.strip().lower()
        if normalized in {'확인', '네', 'yes', '맞아'}:
            pending = self.pending_actions.get(key)
            if not pending:
                return '확인할 대기 작업이 없어.'
            result = self.api.execute_discord_agent_action(str(linked_user['id']), pending)
            self.pending_actions.pop(key, None)
            self._save_json(PENDING_ACTIONS_PATH, self.pending_actions)
            return result.get('message', '작업을 실행했어.')

        if normalized in {'취소', '아니', 'no'}:
            if self.pending_actions.pop(key, None) is not None:
                self._save_json(PENDING_ACTIONS_PATH, self.pending_actions)
                return '대기 중이던 작업을 취소했어.'
            return '취소할 대기 작업이 없어.'

        preview = self.api.preview_discord_agent_action(str(linked_user['id']), {'message': content})
        if preview.get('requires_confirmation'):
            self.pending_actions[key] = preview.get('action_payload', {})
            self._save_json(PENDING_ACTIONS_PATH, self.pending_actions)
            return preview.get('message', '확인이 필요해.')

        if preview.get('intent') == 'ask':
            session_id = self._get_or_create_session_id(discord_user, str(linked_user['id']))
            result = self.api.ask_chatbot(session_id, content)
            return result.get('assistant_message', '답변을 가져오지 못했어.')

        return preview.get('message', '처리를 완료했어.')


bot_config = BotConfig(
    token=os.getenv('DISCORD_BOT_TOKEN', '').strip(),
    api_base_url=os.getenv('AGENT_CALENDAR_API_BASE_URL', 'http://127.0.0.1:8000').strip(),
    guild_id=int(os.getenv('DISCORD_GUILD_ID', '0') or '0') or None,
    action_confidence_threshold=float(os.getenv('DISCORD_ACTION_CONFIDENCE', '0.62') or '0.62'),
)

if not bot_config.token:
    raise RuntimeError('DISCORD_BOT_TOKEN 이 설정되지 않음. backend/.env.discord 파일에 토큰을 넣어야 함.')

bot = DiscordCalendarBot(bot_config)


@bot.tree.command(name='calendar-link', description='현재 디스코드 계정을 웹 사용자와 연결합니다.')
@app_commands.describe(app_user_id='웹 앱의 사용자 ID(UUID)')
async def calendar_link(interaction: discord.Interaction, app_user_id: str) -> None:
    await interaction.response.defer(thinking=True, ephemeral=True)
    try:
        linked = bot.api.link_discord_user(app_user_id, str(interaction.user.id), interaction.user.name)
        await interaction.followup.send(
            f"연결 완료: {linked.get('nickname') or linked.get('display_name')} ({linked.get('id')})",
            ephemeral=True,
        )
    except Exception as exc:
        await interaction.followup.send(f'디스코드 계정 연결 실패: {exc}', ephemeral=True)


@bot.tree.command(name='calendar-ask', description='연결된 사용자 문맥으로 일정 질문/수정 요청을 보냅니다.')
@app_commands.describe(question='예: 내일 일정 뭐 있어? / 내일 오후 3시에 치과 일정 추가해줘')
async def calendar_ask(interaction: discord.Interaction, question: str) -> None:
    await interaction.response.defer(thinking=True)
    try:
        reply = await bot.handle_calendar_message(interaction.user, question)
        await interaction.followup.send(reply)
    except Exception as exc:
        await interaction.followup.send(f'질문 처리 실패: {exc}')


@bot.tree.command(name='calendar-my-events', description='내 일정 목록을 조회합니다.')
@app_commands.describe(limit='보여줄 일정 개수')
async def calendar_my_events(interaction: discord.Interaction, limit: app_commands.Range[int, 1, 20] = 10) -> None:
    await interaction.response.defer(thinking=True)
    try:
        linked_user = bot._get_linked_user(interaction.user)
        if not linked_user:
            await interaction.followup.send('먼저 `/calendar-link` 로 계정을 연결해줘.')
            return
        events = bot.api.list_events(owner_user_id=str(linked_user['id']))
        events = sorted(events, key=lambda item: item['start_at'])[:limit]
        if not events:
            await interaction.followup.send('등록된 내 일정이 아직 없어.')
            return
        lines = [f"- `{event['id']}` | {event['start_at'][:16]} ~ {event['end_at'][:16]} | {event['title']}" for event in events]
        await interaction.followup.send('내 일정 목록:\n' + '\n'.join(lines))
    except Exception as exc:
        await interaction.followup.send(f'일정 조회 실패: {exc}')


if __name__ == '__main__':
    bot.run(bot_config.token)
