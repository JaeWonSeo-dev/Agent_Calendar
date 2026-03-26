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
        setBirthDate(freshUser.birth_date ?? '');
        setPreferredEventColor(freshUser.preferred_event_color ?? '#4f46e5');
        setProfileImageUrl(absoluteAssetUrl(freshUser.profile_image_url));
        setImageFailed(false);
      } catch (error) {
        setDisplayName(localUser.display_name ?? '');
        setNickname(localUser.nickname ?? localUser.username ?? '');
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
        birth_date: birthDate || undefined,
        profile_image_url: uploadedPath,
        preferred_event_color: preferredEventColor,
      });
      saveUser(updated);
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
        onOpenCalendar={() => router.push('/workspace')}
        onOpenProfile={() => router.push('/profile')}
      />

      <PageContainer maxWidth={1040}>
        <div style={{ paddingTop: 36, paddingBottom: 40 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '320px minmax(0, 1fr)',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            <section
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,247,255,0.96))',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: 28,
                padding: 28,
                boxShadow: '0 24px 60px rgba(99, 102, 241, 0.08)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: '#4338ca', fontSize: 13, fontWeight: 700 }}>
                  PROFILE STUDIO
                </div>
                <h1 style={{ margin: '18px 0 10px', fontSize: 38, lineHeight: 1.1 }}>프로필 관리</h1>
              </div>

              <div style={{ marginTop: 28, padding: 22, borderRadius: 22, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.10))', border: '1px solid rgba(99,102,241,0.10)' }}>
                <div style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 16 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{profileTitle}</div>

                  <div style={{ width: 132, height: 132, borderRadius: 999, overflow: 'hidden', border: `4px solid ${preferredEventColor}`, background: 'linear-gradient(135deg, #ffffff, #eef2ff)', boxShadow: '0 16px 30px rgba(79,70,229,0.16)', flexShrink: 0 }}>
                    {previewImageUrl ? (
                      <img src={previewImageUrl} alt="profile" onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 38, color: '#4f46e5' }}>
                        {((nickname || displayName || '?').slice(0, 1) || '?').toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, background: '#fff', color: '#334155', border: '1px solid rgba(148,163,184,0.24)', minWidth: 170 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 999, background: preferredEventColor, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700 }}>일정 대표 색상</span>
                  </div>
                </div>
              </div>
            </section>

            <section
              style={{
                background: 'rgba(255,255,255,0.94)',
                borderRadius: 28,
                padding: 30,
                border: '1px solid rgba(148,163,184,0.18)',
                boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24 }}>프로필 디테일</h2>
                  <p style={{ margin: '8px 0 0', color: '#64748b' }}>레이아웃도 맞추고 보기 좋게 손봤다냥.</p>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 16, background: loadingProfile ? '#fff7ed' : '#ecfdf5', color: loadingProfile ? '#c2410c' : '#047857', fontWeight: 700, fontSize: 13 }}>
                  {loadingProfile ? '불러오는 중' : '편집 가능'}
                </div>
              </div>

              <form style={{ display: 'grid', gap: 18 }} onSubmit={(e) => e.preventDefault()}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="표시 이름">
                    <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>

                  <Field label="닉네임">
                    <input value={nickname} onChange={(e) => setNickname(e.target.value)} type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, alignItems: 'end' }}>
                  <Field label="생일">
                    <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff', fontSize: 15, boxSizing: 'border-box' }} />
                  </Field>

                  <Field label="일정 색상">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 16, border: '1px solid #dbe2ea', background: '#f8fbff' }}>
                      <input value={preferredEventColor} onChange={(e) => setPreferredEventColor(e.target.value)} type="color" style={{ width: 54, height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                      <div style={{ color: '#475569', fontWeight: 600 }}>{preferredEventColor}</div>
                    </div>
                  </Field>
                </div>

                <Field label="프로필 이미지 파일">
                  <div style={{ padding: 18, borderRadius: 18, border: '1px dashed #c7d2fe', background: 'linear-gradient(180deg, #f8faff, #f2f7ff)' }}>
                    <input type="file" accept="image/*" onChange={(e) => { setSelectedFile(e.target.files?.[0] ?? null); setImageFailed(false); }} style={{ width: '100%' }} />
                    <div style={{ marginTop: 10, color: '#64748b', fontSize: 14 }}>
                      PNG, JPG, WEBP 같은 이미지를 올리면 바로 미리보기로 반영된다냥.
                    </div>
                  </div>
                </Field>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                    저장하면 프로필 카드와 공유 사용자 아바타에도 반영된다냥.
                  </div>
                  <PrimaryButton onClick={handleSave} type="button" style={{ minWidth: 180, padding: '14px 20px', borderRadius: 16, background: 'linear-gradient(135deg, #111827, #312e81)', border: 'none', boxShadow: '0 16px 30px rgba(49,46,129,0.24)' }}>
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
