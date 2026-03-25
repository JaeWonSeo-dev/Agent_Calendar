const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type UserRead = {
  id: string;
  email?: string | null;
  username: string;
  display_name: string;
  nickname?: string | null;
  birth_date?: string | null;
  timezone: string;
  profile_image_url?: string | null;
  preferred_event_color?: string | null;
  onboarding_completed: boolean;
};

export type ChatSessionRead = {
  id: string;
  user_id: string;
  title?: string | null;
  is_active: boolean;
  last_message_at: string;
};

export type ChatMessageRead = {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  calendar_id?: string | null;
  created_at: string;
};

export type EventRead = {
  id: string;
  calendar_id: string;
  owner_user_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  status: string;
};

export async function signup(payload: { email: string; username: string; password: string }) {
  return request<UserRead>('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<UserRead>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function completeOnboarding(userId: string, payload: {
  display_name: string;
  nickname: string;
  birth_date: string;
  profile_image_url?: string;
  preferred_event_color: string;
}) {
  return request<UserRead>(`/api/users/${userId}/onboarding`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getDefaultCalendar() {
  return request<{ id: string; name: string; type: string; is_default: boolean }>('/api/calendars/default');
}

export async function bootstrapDefaultCalendar() {
  return request<{ id: string; name: string; type: string; is_default: boolean }>('/api/calendars/bootstrap-default', {
    method: 'POST',
  });
}

export async function listEvents(params?: { calendar_id?: string; owner_user_id?: string }) {
  const search = new URLSearchParams();
  if (params?.calendar_id) search.set('calendar_id', params.calendar_id);
  if (params?.owner_user_id) search.set('owner_user_id', params.owner_user_id);
  const qs = search.toString();
  return request<EventRead[]>(`/api/events${qs ? `?${qs}` : ''}`);
}

export async function createEvent(payload: {
  calendar_id: string;
  owner_user_id: string;
  title: string;
  description?: string;
  location?: string;
  category?: string;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  status?: string;
}) {
  return request<EventRead>('/api/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(eventId: string, payload: Partial<Omit<EventRead, 'id' | 'calendar_id' | 'owner_user_id'>>) {
  return request<EventRead>(`/api/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteEvent(eventId: string) {
  return request<{ message: string }>(`/api/events/${eventId}`, {
    method: 'DELETE',
  });
}

export async function createChatSession(payload: { user_id: string; title?: string }) {
  return request<ChatSessionRead>('/api/chat/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listChatMessages(sessionId: string) {
  return request<ChatMessageRead[]>(`/api/chat/sessions/${sessionId}/messages`);
}

export async function askChatbot(sessionId: string, message: string) {
  return request<{ session_id: string; user_message: string; assistant_message: string; context_count: number; event_count: number }>(`/api/chat/sessions/${sessionId}/ask`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
