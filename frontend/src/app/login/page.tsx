'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { login } from '../../lib/api';
import { saveUser } from '../../lib/local-store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setStatus('로그인 중...');
      const user = await login({ email, password });
      saveUser(user);
      setStatus('로그인 완료');
      router.push(user.onboarding_completed ? '/workspace' : '/onboarding');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 720, margin: '0 auto' }}>
      <h1>로그인</h1>
      <p>로그인 후 온보딩 여부를 확인하고 워크스페이스로 이동한다.</p>

      <form style={{ display: 'grid', gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
        <label>
          <div>이메일</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" style={{ width: '100%', padding: 8 }} />
        </label>

        <label>
          <div>비밀번호</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" style={{ width: '100%', padding: 8 }} />
        </label>

        <button disabled={loading} onClick={handleLogin} type="button" style={{ padding: 12 }}>
          {loading ? '처리 중...' : '로그인'}
        </button>
      </form>

      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}
    </main>
  );
}
