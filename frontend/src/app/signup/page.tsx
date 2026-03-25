'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { signup } from '../../lib/api';
import { saveUser } from '../../lib/local-store';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setStatus('회원가입 중...');
      const user = await signup({ email, username, password });
      saveUser(user);
      setStatus('회원가입 완료. 온보딩으로 이동한다냥.');
      router.push('/onboarding');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 720, margin: '0 auto' }}>
      <h1>회원가입</h1>
      <p>가입 후 기본 공유 캘린더에 참여하는 흐름이다.</p>

      <form style={{ display: 'grid', gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
        <label>
          <div>이메일</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" style={{ width: '100%', padding: 8 }} />
        </label>

        <label>
          <div>아이디</div>
          <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="username" style={{ width: '100%', padding: 8 }} />
        </label>

        <label>
          <div>비밀번호</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" style={{ width: '100%', padding: 8 }} />
        </label>

        <button disabled={loading} onClick={handleSignup} type="button" style={{ padding: 12 }}>
          {loading ? '처리 중...' : '회원가입'}
        </button>
      </form>

      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}
    </main>
  );
}
