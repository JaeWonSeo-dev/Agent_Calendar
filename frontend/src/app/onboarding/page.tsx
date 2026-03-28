'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import GlobalMenuBar from '../../components/workspace/GlobalMenuBar';
import Field from '../../components/ui/Field';
import PageContainer from '../../components/ui/PageContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import StatusMessage from '../../components/ui/StatusMessage';
import { absoluteAssetUrl, completeOnboarding, uploadProfileImage } from '../../lib/api';
import { loadUser, saveUser } from '../../lib/local-store';

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [agentDisplayName, setAgentDisplayName] = useState('AGENT');
  const [preferredEventColor, setPreferredEventColor] = useState('#4f46e5');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = loadUser<{ id: string; username?: string; display_name?: string; profile_image_url?: string; agent_display_name?: string }>();
    if (!user?.id) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
    setDisplayName(user.display_name ?? user.username ?? '');
    setNickname(user.username ?? '');
    setAgentDisplayName(user.agent_display_name ?? 'AGENT');
    if (user.profile_image_url) setPreviewUrl(absoluteAssetUrl(user.profile_image_url));
  }, [router]);

  const filePreview = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return previewUrl;
  }, [selectedFile, previewUrl]);

  const handleSubmit = async () => {
    if (!userId) return;
    try {
      setStatus('프로필 설정 저장 중...');
      let uploadedProfileImageUrl: string | undefined = undefined;
      if (selectedFile) {
        const userAfterUpload = await uploadProfileImage(userId, selectedFile);
        uploadedProfileImageUrl = userAfterUpload.profile_image_url ?? undefined;
      }

      const updatedUser = await completeOnboarding(userId, {
        display_name: displayName,
        nickname,
        birth_date: birthDate || undefined,
        agent_display_name: agentDisplayName.trim() || 'AGENT',
        profile_image_url: uploadedProfileImageUrl,
        preferred_event_color: preferredEventColor,
      });
      saveUser(updatedUser);
      setStatus('프로필 설정 완료. 워크스페이스로 이동한다냥.');
      router.push('/workspace');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '프로필 설정 저장 실패');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <GlobalMenuBar
        title="Shared Calendar"
        active="profile"
        onOpenCalendar={() => window.location.href = '/workspace'}
        onOpenProfile={() => window.location.href = '/profile'}
        onOpenThemes={() => window.location.href = '/themes'}
      />

      <PageContainer maxWidth={760}>
        <div style={{ paddingTop: 40 }}>
          <div style={{ marginTop: 18, background: '#fff', borderRadius: 24, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)' }}>
            <h1 style={{ marginTop: 0 }}>프로필 설정</h1>
            <p style={{ color: '#6b7280' }}>처음 한 번만 기본 프로필을 잡아두면 된다냥. 생일도 여기서 바로 입력할 수 있다냥.</p>

            <form style={{ display: 'grid', gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
              <Field label="프로필 이미지 파일">
                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} style={{ width: '100%', padding: 10 }} />
              </Field>

              {filePreview ? (
                <div>
                  <img src={filePreview} alt="profile preview" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 999, border: '1px solid #ddd' }} />
                </div>
              ) : null}

              <Field label="표시 이름">
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} type="text" placeholder="표시 이름" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="닉네임">
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} type="text" placeholder="닉네임 입력" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="생일">
                <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="LLM 챗봇 이름">
                <input value={agentDisplayName} onChange={(e) => setAgentDisplayName(e.target.value)} type="text" placeholder="예: 모찌, 루루, 캘냥이" style={{ width: '100%', padding: 10 }} />
              </Field>

              <Field label="일정 색상">
                <input value={preferredEventColor} onChange={(e) => setPreferredEventColor(e.target.value)} type="color" style={{ width: 80, height: 40 }} />
              </Field>

              <PrimaryButton onClick={handleSubmit} type="button">프로필 설정 완료</PrimaryButton>
            </form>

            <StatusMessage message={status} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
