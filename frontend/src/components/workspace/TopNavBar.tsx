import { absoluteAssetUrl } from '../../lib/api';

type UserSummary = {
  id: string;
  display_name: string;
  nickname?: string | null;
  preferred_event_color?: string | null;
  profile_image_url?: string | null;
  birth_date?: string | null;
};

type Props = {
  users: UserSummary[];
  onSelectUser: (user: UserSummary) => void;
};

export default function TopNavBar({ users, onSelectUser }: Props) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.75)',
        border: '1px solid #e5e7eb',
        borderRadius: 24,
        padding: 20,
        backdropFilter: 'blur(10px)',
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: 8 }}>같이 사용 중인 고양이들</h1>
      <p style={{ margin: 0, color: '#6b7280' }}>같이 쓰는 캘린더와 챗봇 패널을 한 화면에서 관리한다냥.</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            type="button"
            title={user.nickname || user.display_name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                overflow: 'hidden',
                border: `2px solid ${user.preferred_event_color || '#c7d2fe'}`,
                background: '#fff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
              }}
            >
              {user.profile_image_url ? (
                <img src={absoluteAssetUrl(user.profile_image_url)} alt={user.nickname || user.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#374151' }}>
                  {(user.nickname || user.display_name || '?').slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#475569' }}>{user.nickname || user.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
