'use client';

import { useEffect, useState } from 'react';

import GlobalMenuBar from '../../components/workspace/GlobalMenuBar';
import PageContainer from '../../components/ui/PageContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FONT_THEME_OPTIONS, FontTheme, applyFontTheme, getStoredFontTheme } from '../../lib/theme';

export default function ThemesPage() {
  const [selected, setSelected] = useState<FontTheme>('cute-1');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const theme = getStoredFontTheme();
    setSelected(theme);
    applyFontTheme(theme);
  }, []);

  const handleSelect = (theme: FontTheme) => {
    setSelected(theme);
    applyFontTheme(theme);
    setSaved(false);
  };

  const handleSave = () => {
    applyFontTheme(selected);
    setSaved(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7f9ff 0%, #f3fbf7 100%)', color: '#111827' }}>
      <GlobalMenuBar
        title="Shared Calendar"
        active="themes"
        onOpenCalendar={() => window.location.href = '/workspace'}
        onOpenProfile={() => window.location.href = '/profile'}
        onOpenThemes={() => window.location.href = '/themes'}
      />

      <PageContainer maxWidth={1040}>
        <div style={{ paddingTop: 36, paddingBottom: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 24 }}>
            <section style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,247,255,0.96))', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 28, padding: 28, boxShadow: '0 24px 60px rgba(99,102,241,0.08)' }}>
              <div style={{ display: 'inline-flex', padding: '8px 12px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>THEME STUDIO</div>
              <h1 style={{ margin: '18px 0 10px', fontSize: 38, lineHeight: 1.1 }}>테마관리</h1>
              <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>글자체를 3가지 귀여운 스타일 중에서 골라서 전체 앱에 적용할 수 있다냥.</p>
            </section>

            <section style={{ background: 'rgba(255,255,255,0.94)', borderRadius: 28, padding: 30, border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 24px 60px rgba(15,23,42,0.08)' }}>
              <h2 style={{ marginTop: 0, fontSize: 24 }}>폰트 선택</h2>
              <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
                {FONT_THEME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    style={{
                      textAlign: 'left',
                      padding: 20,
                      borderRadius: 20,
                      border: selected === option.id ? '2px solid #4f46e5' : '1px solid #dbe2ea',
                      background: selected === option.id ? '#eef2ff' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{option.name}</div>
                    <div style={{ marginTop: 10, fontSize: 28, lineHeight: 1.4 }}>{option.preview}</div>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 16 }}>
                <div style={{ color: saved ? '#047857' : '#64748b', fontWeight: 700 }}>{saved ? '저장 완료! 전체 앱에 적용된다냥.' : '선택한 폰트를 바로 미리볼 수 있다냥.'}</div>
                <PrimaryButton type="button" onClick={handleSave} style={{ minWidth: 180, padding: '14px 20px', borderRadius: 16, background: 'linear-gradient(135deg, #111827, #312e81)', border: 'none', boxShadow: '0 16px 30px rgba(49,46,129,0.24)' }}>
                  폰트 저장
                </PrimaryButton>
              </div>
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
