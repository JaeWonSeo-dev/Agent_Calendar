'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import GlobalMenuBar from '../../components/workspace/GlobalMenuBar';
import Field from '../../components/ui/Field';
import PageContainer from '../../components/ui/PageContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusMessage from '../../components/ui/StatusMessage';
import { absoluteAssetUrl, updateProfile, uploadProfileImage } from '../../lib/api';
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

  useEffect(() => {
    const user = loadUser<any>();
    if (!user?.id) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
    setDisplayName(user.display_name ?? '');
    setNickname(user.nickname ?? user.username ?? '');
    setBirthDate(user.birth_date ?? '');
    setPreferredEventColor(user.preferred_event_color ?? '#4f46e5');
    setProfileImageUrl(absoluteAssetUrl(user.profile_image_url));
  }, [router]);

  const previewImageUrl = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return profileImageUrl;
  }, [selectedFile, profileImageUrl]);

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
      setStatus('프로필 저장 완료');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '프로필 저장 실패');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7f9ff 0%, #f3fbf7 100%)' }}>
      <GlobalMenuBar title="Shared Calendar" onOpenProfile={() => router.push('/profile')} />

      <PageContainer maxWidth={820}>
        <div style={{ paddingTop: 40 }}>
          <div style={{ marginTop: 18, background: '#fff', borderRadius: 24, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)' }}>
            <h1 style={{ marginTop: 0 }}>프로필 관리</h1>
            <p style={{ color: '#6b7280' }}>프로필 사진, 닉네임, 생일, 일정 색상을 여기서 바꿀 수 있다냥.</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 20, marginBottom: 20 }}>
              <div style={{ width: 104, height: 104, borderRadius: 999, overflow: 'hidden', border: `3px solid ${preferredEventColor}`, background: '#f3f4f6' }}>
                {previewImageUrl ? (
                  <img src={previewImageUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#64748b' }}>
                    {((nickname || displayName || '?').slice(0, 1) || '?').toUpperCase()}
                  </div>
                )}
              </div>
              <div style={{ color: '#6b7280', lineHeight: 1.7 }}>
                <div>현재 프로필 이미지가 있으면 왼쪽에 보인다냥.</div>
                <div>새 파일을 선택하면 바로 미리보기로 바뀐다냥.</div>
              </div>
            </div>

            <form style={{ display: 'grid', gap: 16, marginTop: 8 }} onSubmit={(e) => e.preventDefault()}>
              <Field label="프로필 이미지 파일">
                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="표시 이름">
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} type="text" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="닉네임">
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} type="text" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="생일">
                <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="일정 색상">
                <input value={preferredEventColor} onChange={(e) => setPreferredEventColor(e.target.value)} type="color" style={{ width: 80, height: 40 }} />
              </Field>

              <PrimaryButton onClick={handleSave} type="button">프로필 저장</PrimaryButton>
            </form>

            <StatusMessage message={status} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
