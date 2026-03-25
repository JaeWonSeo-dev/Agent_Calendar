'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

type EventItem = {
  id: string;
  title: string;
  owner_user_id: string;
  start_at: string;
  end_at: string;
};

type Props = {
  events: EventItem[];
  onSelectDate: (isoDate: string) => void;
};

export default function CalendarBoard({ events, onSelectDate }: Props) {
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start_at,
    end: event.end_at,
  }));

  return (
    <div style={{ marginTop: 24, border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' }}>
      <h2>공유 캘린더</h2>
      <p style={{ color: '#666' }}>날짜를 클릭하면 일정 입력 시간값을 빠르게 채울 수 있다냥.</p>
      <div style={{ marginTop: 16 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={calendarEvents}
          dateClick={(info) => onSelectDate(info.dateStr)}
        />
      </div>
    </div>
  );
}
