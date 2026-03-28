const USER_KEY = 'agent-calendar-user';
const CHAT_SESSION_KEY = 'agent-calendar-chat-session';

export function saveUser(user: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('agent-calendar-user-updated', { detail: user }));
}

export function loadUser<T>() {
  if (typeof window === 'undefined') return null as T | null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function saveChatSession(session: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
}

export function loadChatSession<T>() {
  if (typeof window === 'undefined') return null as T | null;
  const raw = localStorage.getItem(CHAT_SESSION_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function clearSessionState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CHAT_SESSION_KEY);
}
