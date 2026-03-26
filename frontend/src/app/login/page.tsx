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
      window.location.href = user.onboarding_completed ? '/workspace' : '/onboarding';
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(16,185,129,0.16), transparent 24%), linear-gradient(135deg, #f8fbff 0%, #eef2ff 50%, #f4fff8 100%)' }}>
      <PageContainer maxWidth={1080}>
        <div style={{ paddingTop: 48, paddingBottom: 40 }}>
          <Link href="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 700 }}>← 홈으로</Link>

          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: 24, alignItems: 'stretch' }}>
            <section style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,247,255,0.96))', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 28, padding: 28, boxShadow: '0 24px 60px rgba(99,102,241,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>WELCOME BACK</div>
                <h1 style={{ margin: '18px 0 10px', fontSize: 40, lineHeight: 1.05 }}>로그인</h1>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>공유 캘린더와 LLM 챗봇 공간으로 다시 들어온다냥.</p>
              </div>

              <div style={{ marginTop: 30, padding: 20, borderRadius: 22, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.10))', border: '1px solid rgba(99,102,241,0.12)' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>한 화면에서 바로</div>
                <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: '#475569', lineHeight: 1.8 }}>
                  <li>공유 캘린더 일정 확인</li>
                  <li>프로필 관리</li>
                  <li>LLM 일정 챗봇 대화</li>
                </ul>
              </div>
            </section>

            <section style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 28, padding: 32, boxShadow: '0 24px 60px rgba(15,23,42,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24 }}>계정으로 들어가기</h2>
                  <p style={{ margin: '8px 0 0', color: '#64748b' }}>이메일이나 아이디로 로그인할 수 있다냥.</p>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 16, background: '#eef2ff', color: '#4338ca', fontWeight: 700, fontSize: 13 }}>LOGIN</div>
              </div>

              <form style={{ display: 'grid', gap: 18 }} onSubmit={(e) => e.preventDefault()}>
                <Field label="이메일 또는 아이디">
                  <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} type="text" placeholder="email@example.com 또는 username" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                </Field>

                <Field label="비밀번호">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                </Field>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 14 }}>아직 계정이 없으면 <Link href="/signup" style={{ color: '#4338ca', fontWeight: 700, textDecoration: 'none' }}>회원가입</Link> 하라냥.</div>
                  <PrimaryButton disabled={loading} onClick={handleLogin} type="button" style={{ minWidth: 180, padding: '14px 20px', borderRadius: 16, background: 'linear-gradient(135deg, #111827, #312e81)', border: 'none', boxShadow: '0 16px 30px rgba(49,46,129,0.24)' }}>
                    {loading ? '처리 중...' : '로그인'}
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
