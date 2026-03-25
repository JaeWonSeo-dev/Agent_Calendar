'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      setStatus('프로필 저장 완료');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '프로필 저장 실패');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <PageContainer maxWidth={720}>
        <div style={{ paddingTop: 70 }}>
          <div style={{ marginTop: 18, background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e5e7eb' }}>
            <h1 style={{ marginTop: 0 }}>프로필 관리</h1>
            <p style={{ color: '#6b7280' }}>프로필 사진, 닉네임, 생일, 일정 색상을 나중에도 바꿀 수 있다냥.</p>

            {profileImageUrl ? <img src={profileImageUrl} alt="profile" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 999, border: '1px solid #ddd', marginBottom: 16 }} /> : null}

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
