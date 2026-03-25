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

type Props = {
  events: EventItem[];
  onEdit: (event: EventItem) => void;
  onDelete: (eventId: string) => void;
};

export default function EventList({ events, onEdit, onDelete }: Props) {
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
      <h2 style={{ marginTop: 0 }}>공유 캘린더 일정</h2>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {events.length === 0 ? <div>아직 등록된 일정이 없다냥.</div> : null}
        {events.map((event) => (
          <div key={event.id} style={{ padding: 16, borderRadius: 18, background: '#f8fafc', border: '1px solid #edf2f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                  {new Date(event.start_at).toLocaleDateString()} · {new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{event.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 999, background: '#fff', border: '1px solid #e5e7eb' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: event.owner_color || '#6366f1', display: 'inline-block' }} />
                <span style={{ fontWeight: 600 }}>{event.owner_name || '알 수 없음'}</span>
              </div>
            </div>
            {event.description ? <div style={{ color: '#475569', marginTop: 10, lineHeight: 1.6 }}>{event.description}</div> : null}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onEdit(event)} type="button" style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #c7d2fe', background: '#eef2ff' }}>수정</button>
              <button onClick={() => onDelete(event.id)} type="button" style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #fecaca', background: '#fff1f2' }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
