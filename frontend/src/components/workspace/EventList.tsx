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
        marginTop: 28,
        border: '1px solid rgba(226,232,240,0.92)',
        borderRadius: 32,
        padding: 28,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,255,0.92))',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content', padding: '8px 12px', borderRadius: 999, background: 'rgba(14,165,233,0.10)', color: '#0369a1', fontSize: 13, fontWeight: 800, letterSpacing: '0.04em' }}>
          EVENT FEED
        </div>
        <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.08, letterSpacing: '-0.04em' }}>공유 캘린더 일정</h2>
      </div>
      <div style={{ display: 'grid', gap: 14 }}>
        {events.length === 0 ? <div style={{ color: '#64748b', fontSize: 16 }}>아직 등록된 일정이 없다냥.</div> : null}
        {events.map((event) => (
          <div key={event.id} style={{ padding: 20, borderRadius: 24, background: 'linear-gradient(180deg, #ffffff, #f8fbff)', border: '1px solid #edf2f7', boxShadow: '0 14px 28px rgba(148,163,184,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 700 }}>
                  {new Date(event.start_at).toLocaleDateString()} · {new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>{event.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 999, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 10px 22px rgba(148,163,184,0.08)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: event.owner_color || '#6366f1', display: 'inline-block' }} />
                <span style={{ fontWeight: 700 }}>{event.owner_name || '알 수 없음'}</span>
              </div>
            </div>
            {event.description ? <div style={{ color: '#475569', marginTop: 12, lineHeight: 1.8, fontSize: 15 }}>{event.description}</div> : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => onEdit(event)} type="button" style={{ padding: '10px 14px', borderRadius: 14, border: '1px solid #c7d2fe', background: '#eef2ff', fontWeight: 700, cursor: 'pointer' }}>수정</button>
              <button onClick={() => onDelete(event.id)} type="button" style={{ padding: '10px 14px', borderRadius: 14, border: '1px solid #fecaca', background: '#fff1f2', fontWeight: 700, cursor: 'pointer' }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
