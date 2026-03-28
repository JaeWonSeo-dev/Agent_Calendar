'use client';

import { useMemo, useState } from 'react';

type EventItem = {
  id: string;
  title: string;
  owner_user_id: string;
  owner_color?: string;
  start_at: string;
  end_at: string;
};

type Props = {
  events: EventItem[];
  selectedDate: string;
  onSelectDate: (rangeText: string) => void;
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function toDateOnlyText(value: string) {
  return value.slice(0, 10);
}

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA <= endB && endA >= startB;
}

function clampDate(dateText: string, minText: string, maxText: string) {
  if (dateText < minText) return minText;
  if (dateText > maxText) return maxText;
  return dateText;
}

function formatMonthTitle(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function parseSelectedRange(selectedDate: string) {
  if (!selectedDate) return null;

  if (selectedDate.includes(' ~ ')) {
    const [start, end] = selectedDate.split(' ~ ');
    if (start && end) {
      return start <= end ? { start, end } : { start: end, end: start };
    }
  }

  return { start: selectedDate, end: selectedDate };
}

export default function CalendarBoard({ events, selectedDate, onSelectDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragCurrent, setDragCurrent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const gridStart = startOfWeek(firstOfMonth);

    return Array.from({ length: 5 }, (_, weekIndex) =>
      Array.from({ length: 7 }, (_, dayIndex) => addDays(gridStart, weekIndex * 7 + dayIndex))
    );
  }, [currentMonth]);

  const selectedStart = isDragging && dragStart && dragCurrent ? (dragStart <= dragCurrent ? dragStart : dragCurrent) : null;
  const selectedEnd = isDragging && dragStart && dragCurrent ? (dragStart >= dragCurrent ? dragStart : dragCurrent) : null;
  const committedSelection = parseSelectedRange(selectedDate);

  const selectionText = selectedStart && selectedEnd
    ? selectedStart === selectedEnd
      ? selectedStart
      : `${selectedStart} ~ ${selectedEnd}`
    : selectedDate;

  const weekSegments = useMemo(() => {
    return weeks.map((weekDates) => {
      const weekStart = formatDateOnly(weekDates[0]);
      const weekEnd = formatDateOnly(weekDates[6]);
      const eventRows: Array<Array<{ id: string; title: string; color: string; startCol: number; endCol: number }>> = [];

      const relevantEvents = events
        .filter((event) => rangesOverlap(toDateOnlyText(event.start_at), toDateOnlyText(event.end_at), weekStart, weekEnd))
        .sort((a, b) => a.start_at.localeCompare(b.start_at) || a.title.localeCompare(b.title));

      const segments = relevantEvents.flatMap((event) => {
        const eventStart = clampDate(toDateOnlyText(event.start_at), weekStart, weekEnd);
        const eventEnd = clampDate(toDateOnlyText(event.end_at), weekStart, weekEnd);
        const startCol = weekDates.findIndex((date) => formatDateOnly(date) === eventStart) + 1;
        const endCol = weekDates.findIndex((date) => formatDateOnly(date) === eventEnd) + 1;
        if (!startCol || !endCol) return [];

        return [{
          id: event.id,
          title: event.title,
          color: event.owner_color || '#6366f1',
          startCol,
          endCol,
        }];
      });

      segments.forEach((segment) => {
        let placed = false;
        for (const row of eventRows) {
          const overlaps = row.some((item) => !(segment.endCol < item.startCol || segment.startCol > item.endCol));
          if (!overlaps) {
            row.push(segment);
            placed = true;
            break;
          }
        }
        if (!placed) {
          eventRows.push([segment]);
        }
      });

      return eventRows.slice(0, 3);
    });
  }, [weeks, events]);

  const commitSelection = (startText: string, endText: string) => {
    const normalizedStart = startText <= endText ? startText : endText;
    const normalizedEnd = startText <= endText ? endText : startText;
    onSelectDate(normalizedStart === normalizedEnd ? normalizedStart : `${normalizedStart} ~ ${normalizedEnd}`);
  };

  return (
    <div
      style={{
        marginTop: 28,
        border: '1px solid rgba(226,232,240,0.92)',
        borderRadius: 32,
        padding: 28,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,255,0.92))',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.08)',
        zoom: 0.8,
      }}
      onMouseLeave={() => {
        if (isDragging && dragStart && dragCurrent) {
          commitSelection(dragStart, dragCurrent);
          setIsDragging(false);
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content', padding: '8px 12px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: '#4338ca', fontSize: 13, fontWeight: 800, letterSpacing: '0.04em' }}>
            SHARED CALENDAR
          </div>
          <h2 style={{ margin: 0, fontSize: 58, lineHeight: 0.98, letterSpacing: '-0.04em' }}>공유 캘린더</h2>
        </div>

        <div style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              style={{ padding: '10px 12px', borderRadius: 14, border: '1px solid #dbe2ea', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
            >
              ←
            </button>
            <div style={{ minWidth: 220, textAlign: 'center', fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em' }}>{formatMonthTitle(currentMonth)}</div>
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              style={{ padding: '10px 12px', borderRadius: 14, border: '1px solid #dbe2ea', background: '#fff', cursor: 'pointer', fontWeight: 800 }}
            >
              →
            </button>
          </div>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 18,
              background: selectionText ? 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(16,185,129,0.10))' : '#f8fafc',
              color: selectionText ? '#312e81' : '#64748b',
              fontWeight: 800,
              fontSize: 15,
              boxShadow: selectionText ? '0 12px 24px rgba(99,102,241,0.10)' : 'none',
            }}
          >
            {selectionText || '날짜 선택 전'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, borderRadius: 26, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
          {DAY_NAMES.map((dayName, index) => (
            <div key={dayName} style={{ padding: '18px 10px', textAlign: 'center', fontSize: 26, fontWeight: 900, color: index === 0 ? '#dc2626' : index === 6 ? '#2563eb' : '#334155' }}>
              {dayName}
            </div>
          ))}
        </div>

        {weeks.map((weekDates, weekIndex) => (
          <div key={weekIndex} style={{ position: 'relative', minHeight: 168, borderBottom: weekIndex < weeks.length - 1 ? '1px solid #eef2f7' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
              {weekDates.map((date, dayIndex) => {
                const dateText = formatDateOnly(date);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isSelected = selectedStart && selectedEnd
                  ? dateText >= selectedStart && dateText <= selectedEnd
                  : committedSelection
                    ? dateText >= committedSelection.start && dateText <= committedSelection.end
                    : false;
                return (
                  <button
                    key={dateText}
                    type="button"
                    onMouseDown={() => {
                      setIsDragging(true);
                      setDragStart(dateText);
                      setDragCurrent(dateText);
                    }}
                    onMouseEnter={() => {
                      if (isDragging) setDragCurrent(dateText);
                    }}
                    onMouseUp={() => {
                      if (dragStart) {
                        commitSelection(dragStart, dateText);
                      } else {
                        onSelectDate(dateText);
                      }
                      setIsDragging(false);
                    }}
                    style={{
                      minHeight: 168,
                      border: 'none',
                      borderRight: dayIndex < 6 ? '1px solid #f1f5f9' : 'none',
                      background: isSelected ? 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(16,185,129,0.08))' : 'transparent',
                      padding: 0,
                      textAlign: 'left',
                      verticalAlign: 'top',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'block',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 30, fontWeight: 900, lineHeight: 1, color: isCurrentMonth ? (dayIndex === 0 ? '#dc2626' : dayIndex === 6 ? '#2563eb' : '#1e293b') : '#cbd5e1' }}>
                      {date.getDate()}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ position: 'absolute', inset: '58px 6px 8px 6px', pointerEvents: 'none', display: 'grid', gridTemplateRows: 'repeat(3, 32px)', rowGap: 8 }}>
              {weekSegments[weekIndex].map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', columnGap: 4 }}>
                  {row.map((segment) => (
                    <div
                      key={segment.id}
                      style={{
                        gridColumn: `${segment.startCol} / ${segment.endCol + 1}`,
                        height: 30,
                        borderRadius: 10,
                        background: segment.color,
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 800,
                        padding: '6px 10px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 10px 18px rgba(15,23,42,0.12)',
                      }}
                      title={segment.title}
                    >
                      {segment.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
