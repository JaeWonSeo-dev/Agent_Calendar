'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import ChatPanel from '../../components/workspace/ChatPanel';
import CalendarBoard from '../../components/workspace/CalendarBoard';
import EventForm from '../../components/workspace/EventForm';
import EventList from '../../components/workspace/EventList';
import {
  askChatbot,
  bootstrapDefaultCalendar,
  createChatSession,
  createEvent,
  deleteEvent,
  getDefaultCalendar,
  listChatMessages,
  listEvents,
  updateEvent,
} from '../../lib/api';
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

  const handleSelectDate = (isoDate: string) => {
    const start = `${isoDate}T09:00`;
    const end = `${isoDate}T10:00`;
    setStartAt(start);
    setEndAt(end);
    if (!title) {
      setTitle('새 일정');
    }
    setStatus(`${isoDate} 날짜를 선택해서 입력칸에 반영해뒀다냥.`);
  };

  return (
    <main style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <section style={{ width: '70%', borderRight: '1px solid #ddd', padding: 24 }}>
        <h1>{calendarName}</h1>
        <p>모든 사용자가 같은 캘린더를 함께 쓰는 협업형 화면이다.</p>
        {status ? <p>{status}</p> : null}

        <CalendarBoard events={events} onSelectDate={handleSelectDate} />

        <EventForm
          title={title}
          description={description}
          startAt={startAt}
          endAt={endAt}
          editing={Boolean(editingEventId)}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onStartAtChange={setStartAt}
          onEndAtChange={setEndAt}
          onSubmit={handleCreateOrUpdateEvent}
          onCancel={resetForm}
        />

        <EventList events={visibleEvents} onEdit={handleEdit} onDelete={handleDelete} />
      </section>

      <ChatPanel
        chatLines={chatLines}
        chatInput={chatInput}
        onChatInputChange={setChatInput}
        onSend={handleAsk}
      />
    </main>
  );
}
