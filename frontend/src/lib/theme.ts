export const FONT_THEME_STORAGE_KEY = 'agent-calendar-font-theme';

export type FontTheme = 'cute-1' | 'cute-2' | 'cute-3';

export const FONT_THEME_OPTIONS: { id: FontTheme; name: string; preview: string; description: string }[] = [
  { id: 'cute-1', name: '큐티 손글씨', preview: '안녕, 같이 쓰는 캘린더다냥', description: '부드러운 손글씨 느낌의 기본 테마' },
  { id: 'cute-2', name: '도톰 귀염체', preview: '오늘 일정 뭐 있는지 알려줄게!', description: '조금 더 두껍고 또렷한 귀여운 글씨체' },
  { id: 'cute-3', name: '발랄 큐트체', preview: '프로필이랑 테마를 귀엽게 꾸며보자', description: '발랄하고 통통 튀는 귀여운 글씨체' },
];

export function applyFontTheme(theme: FontTheme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-font-theme', theme);
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(FONT_THEME_STORAGE_KEY, theme);
  }
}

export function getStoredFontTheme(): FontTheme {
  if (typeof window === 'undefined') return 'cute-1';
  const value = window.localStorage.getItem(FONT_THEME_STORAGE_KEY);
  if (value === 'cute-2' || value === 'cute-3' || value === 'cute-1') return value;
  return 'cute-1';
}
