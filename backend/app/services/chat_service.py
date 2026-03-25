from typing import Any


class ChatService:
    def build_agent_style_context(self, messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return messages[-20:]
