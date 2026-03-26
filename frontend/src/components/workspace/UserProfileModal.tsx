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
};

type Props = {
  user: UserSummary | null;
  onClose: () => void;
};

export default function UserProfileModal({ user, onClose }: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!user) return null;

  const imageSrc = imageFailed ? '' : absoluteAssetUrl(user.profile_image_url);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.38)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          maxWidth: '92vw',
          borderRadius: 24,
          background: '#fff',
          border: '1px solid #e5e7eb',
          padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>공유 사용자 프로필</h3>
          <button onClick={onClose} type="button" style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, overflow: 'hidden', border: `3px solid ${user.preferred_event_color || '#c7d2fe'}` }}>
            {imageSrc ? (
              <img src={imageSrc} alt={user.nickname || user.display_name} onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, background: '#f3f4f6' }}>
                {(user.nickname || user.display_name || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{user.nickname || user.display_name}</div>
            <div style={{ color: '#6b7280', marginTop: 4 }}>{user.display_name}</div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          <div><strong>생일:</strong> {user.birth_date || '미입력'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong>일정 색상:</strong>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: user.preferred_event_color || '#6366f1', display: 'inline-block' }} />
            <span>{user.preferred_event_color || '기본값'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
