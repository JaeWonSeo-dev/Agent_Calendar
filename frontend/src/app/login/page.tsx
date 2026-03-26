'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Field from '../../components/ui/Field';
import PageContainer from '../../components/ui/PageContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusMessage from '../../components/ui/StatusMessage';
import { login } from '../../lib/api';
import { saveUser } from '../../lib/local-store';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setStatus('로그인 중...');
      const user = await login({ identifier, password });
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <PageContainer maxWidth={520}>
        <div style={{ paddingTop: 80 }}>
          <Link href="/" style={{ color: '#6366f1', textDecoration: 'none' }}>← 홈으로</Link>
          <div style={{ marginTop: 18, background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e5e7eb' }}>
            <h1 style={{ marginTop: 0 }}>로그인</h1>
            <p style={{ color: '#6b7280' }}>이미 계정이 있으면 여기서 들어오면 된다냥.</p>

            <form style={{ display: 'grid', gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
              <Field label="이메일 또는 아이디">
                <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} type="text" placeholder="email@example.com 또는 username" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="비밀번호">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" style={{ width: '100%', padding: 10 }} />
              </Field>

              <PrimaryButton disabled={loading} onClick={handleLogin} type="button">
                {loading ? '처리 중...' : '로그인'}
              </PrimaryButton>
            </form>

            <div style={{ marginTop: 18, color: '#6b7280' }}>
              아직 계정이 없으면 <Link href="/signup">회원가입</Link> 하라냥.
            </div>
            <StatusMessage message={status} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
