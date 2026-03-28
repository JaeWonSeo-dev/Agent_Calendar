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
        background: 'rgba(15, 23, 42, 0.42)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: '92vw',
          borderRadius: 30,
          background: 'linear-gradient(180deg, #ffffff, #f8fbff)',
          border: '1px solid rgba(226,232,240,0.92)',
          padding: 28,
          boxShadow: '0 28px 80px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(14,165,233,0.10)', color: '#0369a1', fontSize: 12, fontWeight: 800 }}>CAT PROFILE</div>
            <h3 style={{ margin: '12px 0 0', fontSize: 28, letterSpacing: '-0.03em' }}>공유 사용자 프로필</h3>
          </div>
          <button onClick={onClose} type="button" style={{ border: 'none', background: '#f8fafc', width: 40, height: 40, borderRadius: 999, fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
          <div style={{ width: 82, height: 82, borderRadius: 999, overflow: 'hidden', border: `4px solid ${user.preferred_event_color || '#c7d2fe'}`, boxShadow: '0 14px 28px rgba(99,102,241,0.12)' }}>
            {imageSrc ? (
              <img src={imageSrc} alt={user.nickname || user.display_name} onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 800, background: '#f3f4f6', fontSize: 24 }}>
                {(user.nickname || user.display_name || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{user.nickname || user.display_name}</div>
            <div style={{ color: '#64748b', marginTop: 4, fontSize: 15 }}>{user.display_name}</div>
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'grid', gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 18, background: '#f8fafc', border: '1px solid #eef2f7' }}><strong>생일:</strong> {user.birth_date || '미입력'}</div>
          <div style={{ padding: 16, borderRadius: 18, background: '#f8fafc', border: '1px solid #eef2f7' }}><strong>에이전트 이름:</strong> {user.agent_display_name || 'AGENT'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderRadius: 18, background: '#f8fafc', border: '1px solid #eef2f7' }}>
            <strong>일정 색상:</strong>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: user.preferred_event_color || '#6366f1', display: 'inline-block' }} />
            <span>{user.preferred_event_color || '기본값'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
