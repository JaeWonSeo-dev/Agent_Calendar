'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import GlobalMenuBar from '../../components/workspace/GlobalMenuBar';
import Field from '../../components/ui/Field';
import PageContainer from '../../components/ui/PageContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusMessage from '../../components/ui/StatusMessage';
import { absoluteAssetUrl, getUser, updateProfile, uploadProfileImage } from '../../lib/api';
import { loadUser, saveUser } from '../../lib/local-store';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [agentDisplayName, setAgentDisplayName] = useState('AGENT');
  const [birthDate, setBirthDate] = useState('');
  const [preferredEventColor, setPreferredEventColor] = useState('#4f46e5');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const localUser = loadUser<any>();
      if (!localUser?.id) {
        router.push('/login');
        return;
      }

      setUserId(localUser.id);
      setLoadingProfile(true);
      setStatus('');

      try {
        const freshUser = await getUser(localUser.id);
        saveUser(freshUser);
        setDisplayName(freshUser.display_name ?? '');
        setNickname(freshUser.nickname ?? freshUser.username ?? '');
        setAgentDisplayName(freshUser.agent_display_name ?? 'AGENT');
        setBirthDate(freshUser.birth_date ?? '');
        setPreferredEventColor(freshUser.preferred_event_color ?? '#4f46e5');
        setProfileImageUrl(absoluteAssetUrl(freshUser.profile_image_url));
        setImageFailed(false);
      } catch (error) {
        setDisplayName(localUser.display_name ?? '');
        setNickname(localUser.nickname ?? localUser.username ?? '');
        setAgentDisplayName(localUser.agent_display_name ?? 'AGENT');
        setBirthDate(localUser.birth_date ?? '');
        setPreferredEventColor(localUser.preferred_event_color ?? '#4f46e5');
        setProfileImageUrl(absoluteAssetUrl(localUser.profile_image_url));
        setStatus(error instanceof Error ? error.message : '프로필 정보를 불러오지 못했다냥.');
      } finally {
        setLoadingProfile(false);
      }
    };

    init();
  }, [router]);

  const previewImageUrl = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return imageFailed ? '' : profileImageUrl;
  }, [selectedFile, profileImageUrl, imageFailed]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      setStatus('프로필 저장 중...');
      let uploadedPath: string | undefined;
      if (selectedFile) {
        const uploadResult = await uploadProfileImage(userId, selectedFile);
        uploadedPath = uploadResult.profile_image_url ?? undefined;
      }
      const updated = await updateProfile(userId, {
        display_name: displayName,
        nickname,
        agent_display_name: agentDisplayName.trim() || 'AGENT',
        birth_date: birthDate || undefined,
        profile_image_url: uploadedPath,
        preferred_event_color: preferredEventColor,
      });
      saveUser(updated);
      setDisplayName(updated.display_name ?? '');
      setNickname(updated.nickname ?? updated.username ?? '');
      setAgentDisplayName(updated.agent_display_name ?? 'AGENT');
      setProfileImageUrl(absoluteAssetUrl(updated.profile_image_url));
      setSelectedFile(null);
      setImageFailed(false);
      setStatus('프로필 저장 완료');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '프로필 저장 실패');
    }
  };

  const profileTitle = nickname || displayName || '프로필 이름';

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 28%), radial-gradient(circle at top right, rgba(16,185,129,0.18), transparent 24%), linear-gradient(135deg, #f7f9ff 0%, #f4fbff 45%, #f7fff9 100%)' }}>
      <GlobalMenuBar
        title="Shared Calendar"
        active="profile"
        onOpenCalendar={() => window.location.href = '/workspace'}
        onOpenProfile={() => window.location.href = '/profile'}
        onOpenThemes={() => window.location.href = '/themes'}
      />

      <PageContainer maxWidth={1160}>
        <div style={{ paddingTop: 40, paddingBottom: 44 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: 24, alignItems: 'stretch' }}>
            <section style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,247,255,0.96))', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 32, padding: 30, boxShadow: '0 24px 60px rgba(99, 102, 241, 0.08)', display: 'flex', flexDirection: 'column' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>
                  PROFILE STUDIO
                </div>
                <h1 style={{ margin: '18px 0 10px', fontSize: 42, lineHeight: 1.02, letterSpacing: '-0.04em' }}>프로필 관리</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>사용자 이름도, 에이전트 이름도 여기서 같이 다듬는다냥.</p>
              </div>

              <div style={{ marginTop: 28, padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.10))', border: '1px solid rgba(99,102,241,0.10)' }}>
                <div style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 16 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>{profileTitle}</div>

                  <div style={{ width: 136, height: 136, borderRadius: 999, overflow: 'hidden', border: `4px solid ${preferredEventColor}`, background: 'linear-gradient(135deg, #ffffff, #eef2ff)', boxShadow: '0 16px 30px rgba(79,70,229,0.16)', flexShrink: 0 }}>
                    {previewImageUrl ? (
                      <img src={previewImageUrl} alt="profile" onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 38, color: '#4f46e5' }}>
                        {((nickname || displayName || '?').slice(0, 1) || '?').toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: 10, width: '100%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, background: '#fff', color: '#334155', border: '1px solid rgba(148,163,184,0.24)', minWidth: 170 }}>
                      <span style={{ width: 14, height: 14, borderRadius: 999, background: preferredEventColor, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontWeight: 700 }}>일정 대표 색상</span>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.84)', border: '1px solid rgba(255,255,255,0.88)' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>AGENT NAME</div>
                      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: '#111827' }}>{agentDisplayName || 'AGENT'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ background: 'rgba(255,255,255,0.94)', borderRadius: 32, padding: 32, border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 26 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}>프로필 디테일</h2>
                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>화면에서 보이는 이름과 어시스턴트의 호칭까지 같이 세팅한다냥.</p>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 16, background: loadingProfile ? '#fff7ed' : '#ecfdf5', color: loadingProfile ? '#c2410c' : '#047857', fontWeight: 700, fontSize: 13 }}>
                  {loadingProfile ? '불러오는 중' : '편집 가능'}
                </div>
              </div>

              <form style={{ display: 'grid', gap: 18 }} onSubmit={(e) => e.preventDefault()}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="표시 이름">
                    <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} type="text" style={{ width: '100%', padding: '16px 18px', borderRadius: 18, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>

                  <Field label="닉네임">
                    <input value={nickname} onChange={(e) => setNickname(e.target.value)} type="text" style={{ width: '100%', padding: '16px 18px', borderRadius: 18, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>
                </div>

                <Field label="LLM 챗봇 이름">
                  <input value={agentDisplayName} onChange={(e) => setAgentDisplayName(e.target.value)} type="text" placeholder="예: 모찌, 루루, 캘냥이" style={{ width: '100%', padding: '16px 18px', borderRadius: 18, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, alignItems: 'end' }}>
                  <Field label="생일">
                    <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" style={{ width: '100%', padding: '16px 18px', borderRadius: 18, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>

                  <Field label="일정 색상">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 18, border: '1px solid #dbe2ea', background: '#f8fbff' }}>
                      <input value={preferredEventColor} onChange={(e) => setPreferredEventColor(e.target.value)} type="color" style={{ width: 54, height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                      <div style={{ color: '#475569', fontWeight: 700 }}>{preferredEventColor}</div>
                    </div>
                  </Field>
                </div>

                <Field label="프로필 이미지 파일">
                  <div style={{ padding: 18, borderRadius: 20, border: '1px dashed #c7d2fe', background: 'linear-gradient(180deg, #f8faff, #f2f7ff)' }}>
                    <input type="file" accept="image/*" onChange={(e) => { setSelectedFile(e.target.files?.[0] ?? null); setImageFailed(false); }} style={{ width: '100%' }} />
                    <div style={{ marginTop: 10, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                      PNG, JPG, WEBP 같은 이미지를 올리면 바로 미리보기로 반영된다냥.
                    </div>
                  </div>
                </Field>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>
                    저장하면 프로필 카드, 공유 사용자 아바타, 그리고 챗봇 이름까지 한 번에 반영된다냥.
                  </div>
                  <PrimaryButton onClick={handleSave} type="button" style={{ minWidth: 190, padding: '15px 22px', borderRadius: 18, background: 'linear-gradient(135deg, #111827, #312e81)', border: 'none', boxShadow: '0 16px 30px rgba(49,46,129,0.24)' }}>
                    프로필 저장
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
