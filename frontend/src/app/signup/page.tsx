'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Field from '../../components/ui/Field';
import PageContainer from '../../components/ui/PageContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusMessage from '../../components/ui/StatusMessage';
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eefaf4 0%, #eff6ff 100%)' }}>
      <PageContainer maxWidth={560}>
        <div style={{ paddingTop: 80 }}>
          <Link href="/" style={{ color: '#059669', textDecoration: 'none' }}>← 홈으로</Link>
          <div style={{ marginTop: 18, background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e5e7eb' }}>
            <h1 style={{ marginTop: 0 }}>회원가입</h1>
            <p style={{ color: '#6b7280' }}>먼저 계정을 만들고, 그다음 온보딩으로 넘어가면 된다냥.</p>

            <form style={{ display: 'grid', gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
              <Field label="이메일">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="아이디">
                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="username" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="비밀번호">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" style={{ width: '100%', padding: 10 }} />
              </Field>

              <PrimaryButton disabled={loading} onClick={handleSignup} type="button">
                {loading ? '처리 중...' : '회원가입'}
              </PrimaryButton>
            </form>

            <div style={{ marginTop: 18, color: '#6b7280' }}>
              이미 계정이 있으면 <Link href="/login">로그인</Link> 하면 된다냥.
            </div>
            <StatusMessage message={status} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
