type Props = {
  title: string;
  onOpenCalendar: () => void;
  onOpenProfile: () => void;
  active?: 'calendar' | 'profile';
};

export default function GlobalMenuBar({ title, onOpenCalendar, onOpenProfile, active = 'calendar' }: Props) {
  return (
    <header
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'rgba(255,255,255,0.96)',
        borderBottom: '1px solid #e5e7eb',
        backdropFilter: 'blur(14px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 12, height: 12, borderRadius: 999, background: 'linear-gradient(135deg, #6366f1, #10b981)' }} />
        <strong style={{ fontSize: 18 }}>{title}</strong>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button
          onClick={onOpenCalendar}
          type="button"
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: active === 'calendar' ? '1px solid #111827' : '1px solid #dbe2ea',
            background: active === 'calendar' ? '#111827' : '#fff',
            color: active === 'calendar' ? '#fff' : '#111827',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
        >
          캘린더
        </button>
        <button
          onClick={onOpenProfile}
          type="button"
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: active === 'profile' ? '1px solid #111827' : '1px solid #dbe2ea',
            background: active === 'profile' ? '#111827' : '#fff',
            color: active === 'profile' ? '#fff' : '#111827',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
        >
          프로필 관리
        </button>
      </nav>
    </header>
  );
}
