'use client';

import { useState } from 'react';

import { absoluteAssetUrl } from '../../lib/api';

type UserSummary = {
  id: string;
  display_name: string;
  nickname?: string | null;
  preferred_event_color?: string | null;
  profile_image_url?: string | null;
  birth_date?: string | null;
  agent_display_name?: string | null;
};

type Props = {
  users: UserSummary[];
  onSelectUser: (user: UserSummary) => void;
};

function UserAvatarButton({ user, onSelectUser }: { user: UserSummary; onSelectUser: (user: UserSummary) => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? '' : absoluteAssetUrl(user.profile_image_url);

  return (
    <button
      onClick={() => onSelectUser(user)}
      type="button"
      title={user.nickname || user.display_name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.78)',
        border: '1px solid rgba(226,232,240,0.92)',
        cursor: 'pointer',
        padding: '14px 16px',
        borderRadius: 22,
        minWidth: 92,
        boxShadow: '0 16px 28px rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          overflow: 'hidden',
          border: `3px solid ${user.preferred_event_color || '#c7d2fe'}`,
          background: '#fff',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        }}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={user.nickname || user.display_name} onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#374151', fontSize: 22 }}>
            {(user.nickname || user.display_name || '?').slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gap: 2, justifyItems: 'center' }}>
        <span style={{ fontSize: 14, color: '#334155', fontWeight: 700 }}>{user.nickname || user.display_name}</span>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{user.agent_display_name || 'AGENT'}</span>
      </div>
    </button>
  );
}

export default function TopNavBar({ users, onSelectUser }: Props) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,250,255,0.92))',
        border: '1px solid rgba(226,232,240,0.92)',
        borderRadius: 32,
        padding: 28,
        backdropFilter: 'blur(18px)',
        boxShadow: '0 24px 60px rgba(99,102,241,0.08)',
      }}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content', padding: '8px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: '#047857', fontSize: 13, fontWeight: 800, letterSpacing: '0.04em' }}>
          SHARED CREW
        </div>
        <h1 style={{ margin: 0, fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.04em' }}>같이 사용 중인 고양이들</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 16, lineHeight: 1.75 }}>
          함께 쓰는 캘린더와 챗봇을 한 화면에서 관리하는 공동 작업 공간이다냥.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, flexWrap: 'wrap', marginTop: 22 }}>
        {users.map((user) => (
          <UserAvatarButton key={user.id} user={user} onSelectUser={onSelectUser} />
        ))}
      </div>
    </div>
  );
}
