'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { askChatbot, bootstrapDefaultCalendar, createChatSession, createEvent, deleteEvent, getDefaultCalendar, listChatMessages, listEvents, updateEvent } from '../../lib/api';
import { loadChatSession, loadUser, saveChatSession } from '../../lib/local-store';

type EventItem = {
  id: string;
  title: string;
  owner_user_id: string;
  start_at: string;
  end_at: string;
  description?: string | null;
};

type ChatLine = {
  role: 'user' | 'assistant';
  content: string;
};

export default function WorkspacePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [calendarName, setCalendarName] = useState('Shared Calendar');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLines, setChatLines] = useState<ChatLine[]>([]);
  const [status, setStatus] = useState('');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const refreshEvents = async (targetCalendarId: string) => {
    const eventList = await listEvents({ calendar_id: targetCalendarId });
    setEvents(eventList);
  };

  const refreshMessages = async (sessionId: string) => {
    const messages = await listChatMessages(sessionId);
    setChatLines(
      messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content }))
    );
  };

  useEffect(() => {
    const user = loadUser<{ id: string; onboarding_completed?: boolean }>();
    if (!user?.id) {
      router.push('/login');
      return;
    }
    if (!user.onboarding_completed) {
      router.push('/onboarding');
      return;
    }
    setUserId(user.id);
  }, [router]);

  useEffect(() => {
    const init = async () => {
      if (!userId) return;
      try {
        setStatus('공유 캘린더 불러오는 중...');
        await bootstrapDefaultCalendar();
        const calendar = await getDefaultCalendar();
        setCalendarId(calendar.id);
        setCalendarName(calendar.name);
        await refreshEvents(calendar.id);

        const storedSession = loadChatSession<{ id: string }>();
        if (storedSession?.id) {
          setChatSessionId(storedSession.id);
          await refreshMessages(storedSession.id);
        } else {
          const newSession = await createChatSession({ user_id: userId, title: 'Shared Calendar Chat' });
          saveChatSession(newSession);
          setChatSessionId(newSession.id);
          await refreshMessages(newSession.id);
        }
        setStatus('준비 완료');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : '워크스페이스 로드 실패');
      }
    };

    init();
  }, [userId]);

  const visibleEvents = useMemo(() => events.slice().sort((a, b) => a.start_at.localeCompare(b.start_at)).slice(0, 30), [events]);

  const resetForm = () => {
    setEditingEventId(null);
    setTitle('');
    setDescription('');
    setStartAt('');
    setEndAt('');
  };

  const handleAsk = async () => {
    if (!chatSessionId || !chatInput.trim()) return;
    const message = chatInput.trim();
    setChatInput('');

    try {
      await askChatbot(chatSessionId, message);
      await refreshMessages(chatSessionId);
    } catch (error) {
      setChatLines((prev) => [...prev, { role: 'assistant', content: error instanceof Error ? error.message : '질문 처리 실패' }]);
    }
  };

  const handleCreateOrUpdateEvent = async () => {
    if (!calendarId || !userId || !title || !startAt || !endAt) {
      setStatus('일정 제목, 시작 시간, 종료 시간을 입력해라냥.');
      return;
    }

    try {
      setStatus(editingEventId ? '일정 수정 중...' : '일정 저장 중...');
      if (editingEventId) {
        await updateEvent(editingEventId, {
          title,
          description,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
        });
      } else {
        await createEvent({
          calendar_id: calendarId,
          owner_user_id: userId,
          title,
          description,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          all_day: false,
          status: 'scheduled',
        });
      }
      resetForm();
      await refreshEvents(calendarId);
      setStatus(editingEventId ? '일정 수정 완료' : '일정 저장 완료');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '일정 저장 실패');
    }
  };

  const handleEdit = (event: EventItem) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description ?? '');
    setStartAt(event.start_at.slice(0, 16));
    setEndAt(event.end_at.slice(0, 16));
  };

  const handleDelete = async (eventId: string) => {
    if (!calendarId) return;
    try {
      setStatus('일정 삭제 중...');
      await deleteEvent(eventId);
      await refreshEvents(calendarId);
      if (editingEventId === eventId) resetForm();
      setStatus('일정 삭제 완료');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '일정 삭제 실패');
    }
  };

  return (
    <main style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <section style={{ width: '70%', borderRight: '1px solid #ddd', padding: 24 }}>
        <h1>{calendarName}</h1>
        <p>모든 사용자가 같은 캘린더를 함께 쓰는 협업형 화면이다.</p>
        {status ? <p>{status}</p> : null}

        <div style={{ marginTop: 24, border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
          <h2>{editingEventId ? '일정 수정' : '일정 추가'}</h2>
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목" style={{ padding: 10 }} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명" style={{ padding: 10, minHeight: 80 }} />
            <input value={startAt} onChange={(e) => setStartAt(e.target.value)} type="datetime-local" style={{ padding: 10 }} />
            <input value={endAt} onChange={(e) => setEndAt(e.target.value)} type="datetime-local" style={{ padding: 10 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreateOrUpdateEvent} type="button" style={{ padding: '10px 14px', width: 160 }}>
                {editingEventId ? '일정 수정' : '일정 추가'}
              </button>
              {editingEventId ? <button onClick={resetForm} type="button" style={{ padding: '10px 14px' }}>취소</button> : null}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
          <h2>공유 캘린더 일정</h2>
          <ul style={{ paddingLeft: 20, marginTop: 16 }}>
            {visibleEvents.length === 0 ? <li>아직 등록된 일정이 없다냥.</li> : null}
            {visibleEvents.map((event) => (
              <li key={event.id} style={{ marginBottom: 12 }}>
                <div>
                  <strong>{new Date(event.start_at).toLocaleString()}</strong> - {event.title}
                  <span style={{ marginLeft: 8, color: '#666' }}>작성자 ID: {event.owner_user_id}</span>
                </div>
                {event.description ? <div style={{ color: '#555', marginTop: 4 }}>{event.description}</div> : null}
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={() => handleEdit(event)} type="button">수정</button>
                  <button onClick={() => handleDelete(event.id)} type="button">삭제</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside style={{ width: '30%', padding: 24, display: 'flex', flexDirection: 'column' }}>
        <h2>LLM Chatbot</h2>
        <p>사용자별 대화는 따로 보관되지만, 질문은 공유 캘린더를 기준으로 이어간다.</p>

        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 12, padding: 12, marginTop: 16, overflowY: 'auto' }}>
          {chatLines.length === 0 ? <p>예: 이번주 일정 뭐 있어?</p> : null}
          {chatLines.map((message, index) => (
            <div key={index} style={{ marginBottom: 12 }}>
              <strong>{message.role === 'user' ? 'USER' : 'AGENT'}</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} type="text" placeholder="공유 캘린더에 대해 물어보기" style={{ flex: 1, padding: 10 }} />
          <button onClick={handleAsk} type="button" style={{ padding: '10px 14px' }}>전송</button>
        </div>
      </aside>
    </main>
  );
}
