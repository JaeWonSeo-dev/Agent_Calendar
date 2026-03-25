type EventItem = {
  id: string;
  title: string;
  owner_user_id: string;
  start_at: string;
  end_at: string;
  description?: string | null;
};

type Props = {
  events: EventItem[];
  onEdit: (event: EventItem) => void;
  onDelete: (eventId: string) => void;
};

export default function EventList({ events, onEdit, onDelete }: Props) {
  return (
    <div style={{ marginTop: 24, border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
      <h2>공유 캘린더 일정</h2>
      <ul style={{ paddingLeft: 20, marginTop: 16 }}>
        {events.length === 0 ? <li>아직 등록된 일정이 없다냥.</li> : null}
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: 12 }}>
            <div>
              <strong>{new Date(event.start_at).toLocaleString()}</strong> - {event.title}
              <span style={{ marginLeft: 8, color: '#666' }}>작성자 ID: {event.owner_user_id}</span>
            </div>
            {event.description ? <div style={{ color: '#555', marginTop: 4 }}>{event.description}</div> : null}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={() => onEdit(event)} type="button">수정</button>
              <button onClick={() => onDelete(event.id)} type="button">삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
