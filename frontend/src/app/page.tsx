'use client';

import Link from 'next/link';

import PageContainer from '../components/ui/PageContainer';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7ff 0%, #eefaf4 100%)',
        color: '#111827',
      }}
    >
      <PageContainer maxWidth={1100}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 24,
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 999,
                background: '#ffffffaa',
                border: '1px solid #dbe3ff',
                fontSize: 14,
                marginBottom: 18,
              }}
            >
              Shared Calendar + LLM Chatbot
            </div>
            <h1 style={{ fontSize: 52, lineHeight: 1.1, margin: 0 }}>
              같이 쓰는 캘린더를
              <br />
              더 똑똑하게 관리하자냥
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.7, color: '#4b5563', marginTop: 20 }}>
              모든 사용자가 같은 캘린더를 공유하고, 오른쪽 챗봇 패널에서
              자연어로 일정 질문까지 할 수 있는 협업형 캘린더 서비스다냥.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <PrimaryButton>회원가입</PrimaryButton>
              </Link>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #c7d2fe',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  로그인
                </button>
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 28 }}>
              {[
                ['공유 캘린더', '모든 사용자가 같은 타임라인에서 일정을 본다냥.'],
                ['온보딩 프로필', '닉네임, 색상, 생일, 프로필 설정을 먼저 한다냥.'],
                ['LLM 질문', '이번주 일정, 오늘 일정, 놓친 일정 같은 걸 물어볼 수 있다냥.'],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  style={{
                    background: '#ffffffcc',
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <strong>{title}</strong>
                  <p style={{ marginBottom: 0, color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <strong>Shared Calendar Preview</strong>
              <span style={{ color: '#6b7280', fontSize: 14 }}>March</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {Array.from({ length: 35 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  style={{
                    minHeight: 72,
                    borderRadius: 14,
                    background: day % 5 === 0 ? '#eef2ff' : '#f9fafb',
                    padding: 8,
                    border: '1px solid #eef2f7',
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{day <= 31 ? day : ''}</div>
                  {day === 5 ? <div style={{ marginTop: 8, color: '#4338ca' }}>팀 미팅</div> : null}
                  {day === 12 ? <div style={{ marginTop: 8, color: '#059669' }}>치과 예약</div> : null}
                  {day === 19 ? <div style={{ marginTop: 8, color: '#dc2626' }}>운동</div> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
