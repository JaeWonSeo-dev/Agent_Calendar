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
  selectedDate: string;
  onSelectDate: (rangeText: string) => void;
};

export default function CalendarBoard({ events, selectedDate, onSelectDate }: Props) {
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start_at,
    end: event.end_at,
  }));

  return (
    <div
      style={{
        marginTop: 24,
        border: '1px solid #e5e7eb',
        borderRadius: 24,
        padding: 20,
        background: 'rgba(255,255,255,0.88)',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>공유 캘린더</h2>
          <p style={{ color: '#6b7280', marginBottom: 0 }}>하루짜리는 클릭, 연속 일정은 드래그해서 선택하면 된다냥.</p>
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 14,
            background: selectedDate ? '#eef2ff' : '#f3f4f6',
            color: selectedDate ? '#4338ca' : '#6b7280',
            fontWeight: 600,
          }}
        >
          {selectedDate || '날짜 선택 전'}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          selectable={true}
          selectMirror={true}
          unselectAuto={false}
          events={calendarEvents}
          dateClick={(info) => {
            document.querySelectorAll('.selected-calendar-cell').forEach((node) => node.classList.remove('selected-calendar-cell'));
            info.dayEl.classList.add('selected-calendar-cell');
            onSelectDate(info.dateStr);
          }}
          select={(info) => {
            document.querySelectorAll('.selected-calendar-cell').forEach((node) => node.classList.remove('selected-calendar-cell'));
            const cells = document.querySelectorAll(`[data-date]`);
            cells.forEach((cell) => {
              const date = cell.getAttribute('data-date');
              if (!date) return;
              if (date >= info.startStr && date < info.endStr) {
                cell.classList.add('selected-calendar-cell');
              }
            });
            const endDate = new Date(info.end);
            endDate.setDate(endDate.getDate() - 1);
            const endDateText = endDate.toISOString().slice(0, 10);
            onSelectDate(info.startStr === endDateText ? info.startStr : `${info.startStr} ~ ${endDateText}`);
          }}
        />
      </div>
      <style jsx global>{`
        .fc {
          --fc-border-color: #eef2f7;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #fbfdff;
          --fc-list-event-hover-bg-color: #f8fafc;
          --fc-today-bg-color: rgba(99, 102, 241, 0.08);
          font-size: 14px;
        }
        .fc .fc-toolbar-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
        }
        .fc .fc-button {
          background: #111827;
          border-color: #111827;
          border-radius: 12px;
          box-shadow: none;
        }
        .fc .fc-button:hover {
          background: #1f2937;
          border-color: #1f2937;
        }
        .fc .fc-daygrid-day-frame {
          transition: all 0.18s ease;
          border-radius: 12px;
          min-height: 92px;
        }
        .fc .fc-daygrid-day-frame:hover {
          background: rgba(99, 102, 241, 0.05);
        }
        .fc .selected-calendar-cell .fc-daygrid-day-frame,
        .fc td.selected-calendar-cell .fc-daygrid-day-frame {
          box-shadow: inset 0 0 0 2px #6366f1;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.14), rgba(16, 185, 129, 0.08));
        }
        .fc .fc-highlight {
          background: rgba(99, 102, 241, 0.14);
          border-radius: 12px;
        }
        .fc .fc-daygrid-event {
          border-radius: 10px;
          border: none;
          padding: 2px 6px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
      `}</style>
    </div>
  );
}
