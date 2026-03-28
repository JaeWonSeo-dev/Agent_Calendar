type Props = {
  title: string;
  onOpenCalendar: () => void;
  onOpenProfile: () => void;
  onOpenThemes: () => void;
  active?: 'calendar' | 'profile' | 'themes';
};

export default function GlobalMenuBar({ title, onOpenCalendar, onOpenProfile, onOpenThemes, active = 'calendar' }: Props) {
  const buttonStyle = (key: 'calendar' | 'profile' | 'themes') => ({
    padding: '12px 16px',
    borderRadius: 16,
    border: active === key ? '1px solid transparent' : '1px solid rgba(226,232,240,0.96)',
    background: active === key ? 'linear-gradient(135deg, #111827, #312e81)' : 'rgba(255,255,255,0.84)',
    color: active === key ? '#fff' : '#0f172a',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit',
    fontWeight: 800,
    boxShadow: active === key ? '0 14px 28px rgba(49,46,129,0.24)' : '0 10px 20px rgba(148,163,184,0.10)',
  });

  return (
    <header
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 28px',
        background: 'rgba(255,255,255,0.72)',
        borderBottom: '1px solid rgba(226,232,240,0.92)',
        backdropFilter: 'blur(18px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: 'linear-gradient(135deg, #6366f1, #10b981)', boxShadow: '0 8px 20px rgba(99,102,241,0.20)' }} />
        <div style={{ display: 'grid', gap: 2 }}>
          <strong style={{ fontSize: 19, letterSpacing: '-0.03em' }}>{title}</strong>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>shared calendar workspace</span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onOpenCalendar} type="button" style={buttonStyle('calendar')}>캘린더</button>
        <button onClick={onOpenProfile} type="button" style={buttonStyle('profile')}>프로필 관리</button>
        <button onClick={onOpenThemes} type="button" style={buttonStyle('themes')}>테마관리</button>
      </nav>
    </header>
  );
}
