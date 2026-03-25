'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import ChatPanel from '../../components/workspace/ChatPanel';
import CalendarBoard from '../../components/workspace/CalendarBoard';
import EventForm from '../../components/workspace/EventForm';
import EventList from '../../components/workspace/EventList';
import GlobalMenuBar from '../../components/workspace/GlobalMenuBar';
import TopNavBar from '../../components/workspace/TopNavBar';
import UserProfileModal from '../../components/workspace/UserProfileModal';
import {
  absoluteAssetUrl,
  askChatbot,
  bootstrapDefaultCalendar,
  createChatSession,
  createEvent,
  deleteEvent,
  getDefaultCalendar,
  listChatMessages,
  listEvents,
  listUsers,
  updateEvent,
} from '../../lib/api';
import { loadChatSession, loadUser, saveChatSession } from '../../lib/local-store';

type EventItem = {
  id: string;
  title: string;
  owner_user_id: string;
  owner_name?: string;
  owner_color?: string;
  start_at: string;
  end_at: string;
  description?: string | null;
};

type ChatLine = {
  role: 'user' | 'assistant';
  content: string;
};

type UserSummary = {
  id: string;
  display_name: string;
  nickname?: string | null;
  preferred_event_color?: string | null;
  profile_image_url?: string | null;
  birth_date?: string | null;
};

function parseTimeTo24Hour(timeText: string, meridiem: 'AM' | 'PM') {
  const [rawHour, rawMinute] = timeText.split(':');
  let hour = Number(rawHour || '0');
  const minute = Number(rawMinute || '0');
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (meridiem === 'AM') {
    if (hour === 12) hour = 0;
  } else {
    if (hour < 12) hour += 12;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function WorkspacePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [calendarName, setCalendarName] = useState('Shared Calendar');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<Record<string, UserSummary>>({});
  const [chatInput, setChatInput] = useState('');
  const [chatLines, setChatLines] = useState<ChatLine[]>([]);
  const [status, setStatus] = useState('');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [startMeridiem, setStartMeridiem] = useState<'AM' | 'PM'>('AM');
  const [endMeridiem, setEndMeridiem] = useState<'AM' | 'PM'>('AM');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  const refreshUsers = async () => {
    const userList = await listUsers();
    const normalized = userList.map((user) => ({
      ...user,
      profile_image_url: absoluteAssetUrl(user.profile_image_url),
    }));
    const mapped = Object.fromEntries(normalized.map((user) => [user.id, user]));
    setUsers(mapped);
    return mapped as Record<string, UserSummary>;
  };

  const refreshEvents = async (targetCalendarId: string, currentUsers?: Record<string, UserSummary>) => {
    const sourceUsers = currentUsers || users;
    const eventList = await listEvents({ calendar_id: targetCalendarId });
    setEvents(
      eventList.map((event) => ({
        ...event,
        owner_name: sourceUsers[event.owner_user_id]?.nickname || sourceUsers[event.owner_user_id]?.display_name || event.owner_user_id,
        owner_color: sourceUsers[event.owner_user_id]?.preferred_event_color || '#6366f1',
      }))
    );
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
        const mapped = await refreshUsers();
        const calendar = await getDefaultCalendar();
        setCalendarId(calendar.id);
        setCalendarName(calendar.name);
        await refreshEvents(calendar.id, mapped);

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
        setStatus('');
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
    setStartDate('');
    setEndDate('');
    setStartTime('09:00');
    setEndTime('10:00');
    setStartMeridiem('AM');
    setEndMeridiem('AM');
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
    if (!calendarId || !userId || !title || !startDate || !endDate || !startTime || !endTime) {
      setStatus('일정 제목, 날짜, 시간을 입력해라냥.');
      return;
    }

    const start24 = parseTimeTo24Hour(startTime, startMeridiem);
    const end24 = parseTimeTo24Hour(endTime, endMeridiem);
    if (!start24 || !end24) {
      setStatus('시간 형식은 HH:MM 으로 적어라냥.');
      return;
    }

    try {
      setStatus(editingEventId ? '일정 수정 중...' : '일정 저장 중...');
      if (editingEventId) {
        await updateEvent(editingEventId, {
          title,
          description,
          start_at: new Date(`${startDate}T${start24}`).toISOString(),
          end_at: new Date(`${endDate}T${end24}`).toISOString(),
        });
      } else {
        await createEvent({
          calendar_id: calendarId,
          owner_user_id: userId,
          title,
          description,
          start_at: new Date(`${startDate}T${start24}`).toISOString(),
          end_at: new Date(`${endDate}T${end24}`).toISOString(),
          all_day: false,
          status: 'scheduled',
        });
      }
      resetForm();
      await refreshEvents(calendarId);
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '일정 저장 실패');
    }
  };

  const handleEdit = (event: EventItem) => {
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    const startHour24 = start.getHours();
    const endHour24 = end.getHours();
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description ?? '');
    setStartDate(event.start_at.slice(0, 10));
    setEndDate(event.end_at.slice(0, 10));
    setStartMeridiem(startHour24 >= 12 ? 'PM' : 'AM');
    setEndMeridiem(endHour24 >= 12 ? 'PM' : 'AM');
    setStartTime(`${String(((startHour24 + 11) % 12) + 1).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
    setEndTime(`${String(((endHour24 + 11) % 12) + 1).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
  };

  const handleDelete = async (eventId: string) => {
    if (!calendarId) return;
    try {
      await deleteEvent(eventId);
      await refreshEvents(calendarId);
      if (editingEventId === eventId) resetForm();
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '일정 삭제 실패');
    }
  };

  const handleSelectDate = (rangeText: string) => {
    if (selectedDate === rangeText) {
      setSelectedDate('');
      setStartDate('');
      setEndDate('');
      return;
    }
    setSelectedDate(rangeText);
    if (rangeText.includes(' ~ ')) {
      const [start, end] = rangeText.split(' ~ ');
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate(rangeText);
      setEndDate(rangeText);
    }
    if (!title) setTitle('새 일정');
  };

  return (
    <main style={{ minHeight: '100vh', fontFamily: 'Inter, Pretendard, sans-serif', background: 'linear-gradient(135deg, #f7f9ff 0%, #f3fbf7 100%)', color: '#111827' }}>
      <GlobalMenuBar title={calendarName} onOpenProfile={() => router.push('/profile')} />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
        <section style={{ width: '70%', borderRight: '1px solid #e5e7eb', padding: 24 }}>
          <TopNavBar users={Object.values(users)} onSelectUser={setSelectedUser} />
          {status ? <p style={{ marginTop: 12, color: '#374151' }}>{status}</p> : null}

          <CalendarBoard events={events} selectedDate={selectedDate} onSelectDate={handleSelectDate} />

          <EventForm
            title={title}
            description={description}
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            startMeridiem={startMeridiem}
            endMeridiem={endMeridiem}
            editing={Boolean(editingEventId)}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onStartMeridiemChange={setStartMeridiem}
            onEndMeridiemChange={setEndMeridiem}
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
      </div>

      <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </main>
  );
}
