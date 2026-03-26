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
      window.location.href = '/onboarding';
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(99,102,241,0.16), transparent 24%), linear-gradient(135deg, #f2fff7 0%, #eef8ff 52%, #f6f3ff 100%)' }}>
      <PageContainer maxWidth={1080}>
        <div style={{ paddingTop: 48, paddingBottom: 40 }}>
          <Link href="/" style={{ color: '#059669', textDecoration: 'none', fontWeight: 700 }}>← 홈으로</Link>

          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: 24, alignItems: 'stretch' }}>
            <section style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(243,252,248,0.96))', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 28, padding: 28, boxShadow: '0 24px 60px rgba(16,185,129,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: '#047857', fontSize: 13, fontWeight: 700 }}>NEW ACCOUNT</div>
                <h1 style={{ margin: '18px 0 10px', fontSize: 40, lineHeight: 1.05 }}>회원가입</h1>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>같이 쓰는 캘린더와 챗봇 공간에 들어갈 새 계정을 만든다냥.</p>
              </div>

              <div style={{ marginTop: 30, padding: 20, borderRadius: 22, background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.10))', border: '1px solid rgba(16,185,129,0.12)' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>가입 후 바로</div>
                <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: '#475569', lineHeight: 1.8 }}>
                  <li>프로필 사진 업로드</li>
                  <li>닉네임과 생일 설정</li>
                  <li>공유 캘린더 사용 시작</li>
                </ul>
              </div>
            </section>

            <section style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 28, padding: 32, boxShadow: '0 24px 60px rgba(15,23,42,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24 }}>새 계정 만들기</h2>
                  <p style={{ margin: '8px 0 0', color: '#64748b' }}>기본 계정을 만들고 바로 온보딩으로 넘어간다냥.</p>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 16, background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: 13 }}>SIGN UP</div>
              </div>

              <form style={{ display: 'grid', gap: 18 }} onSubmit={(e) => e.preventDefault()}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="이메일">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>

                  <Field label="아이디">
                    <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="username" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>
                </div>

                <Field label="비밀번호">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                </Field>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 14 }}>이미 계정이 있으면 <Link href="/login" style={{ color: '#047857', fontWeight: 700, textDecoration: 'none' }}>로그인</Link> 하면 된다냥.</div>
                  <PrimaryButton disabled={loading} onClick={handleSignup} type="button" style={{ minWidth: 180, padding: '14px 20px', borderRadius: 16, background: 'linear-gradient(135deg, #047857, #312e81)', border: 'none', boxShadow: '0 16px 30px rgba(4,120,87,0.24)' }}>
                    {loading ? '처리 중...' : '회원가입'}
                  </PrimaryButton>
                </div>
              </form>

              <StatusMessage message={status} />
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
