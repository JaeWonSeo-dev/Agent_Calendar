type Props = {
  title: string;
  onOpenProfile: () => void;
};

export default function GlobalMenuBar({ title, onOpenProfile }: Props) {
  return (
    <header
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'rgba(255,255,255,0.92)',
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

      <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #dbe2ea',
            background: '#fff',
            cursor: 'pointer',
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
            border: '1px solid #111827',
            background: '#111827',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          프로필 관리
        </button>
      </nav>
    </header>
  );
}
