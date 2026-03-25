'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { completeOnboarding } from '../../lib/api';
import { loadUser, saveUser } from '../../lib/local-store';

export default function OnboardingPage() {
  const router = useRouter();
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [preferredEventColor, setPreferredEventColor] = useState('#4f46e5');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = loadUser<{ id: string; username?: string; display_name?: string }>();
    if (!user?.id) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
    setDisplayName(user.display_name ?? user.username ?? '');
    setNickname(user.username ?? '');
  }, [router]);

  const handleSubmit = async () => {
    if (!userId) return;
    try {
      setStatus('온보딩 저장 중...');
      const updatedUser = await completeOnboarding(userId, {
        display_name: displayName,
        nickname,
        birth_date: birthDate,
        profile_image_url: profileImageUrl,
        preferred_event_color: preferredEventColor,
      });
      saveUser(updatedUser);
      setStatus('프로필 설정 완료. 워크스페이스로 이동한다냥.');
      router.push('/workspace');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '온보딩 저장 실패');
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 720, margin: '0 auto' }}>
      <h1>First Login Setup</h1>
      <p>최초 로그인 사용자의 프로필 설정 화면이다.</p>

      <form style={{ display: 'grid', gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
        <label>
          <div>프로필 이미지 URL</div>
          <input value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} type="text" placeholder="https://..." style={{ width: '100%', padding: 8 }} />
        </label>

        <label>
          <div>표시 이름</div>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} type="text" placeholder="표시 이름" style={{ width: '100%', padding: 8 }} />
        </label>

        <label>
          <div>닉네임</div>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} type="text" placeholder="닉네임 입력" style={{ width: '100%', padding: 8 }} />
        </label>

        <label>
          <div>생일</div>
          <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" style={{ width: '100%', padding: 8 }} />
        </label>

        <label>
          <div>일정 색상</div>
          <input value={preferredEventColor} onChange={(e) => setPreferredEventColor(e.target.value)} type="color" style={{ width: 80, height: 40 }} />
        </label>

        <button onClick={handleSubmit} type="button" style={{ padding: 12 }}>프로필 설정 완료</button>
      </form>

      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}
    </main>
  );
}
