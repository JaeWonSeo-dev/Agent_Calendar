export const FONT_THEME_STORAGE_KEY = 'agent-calendar-font-theme';

export type FontTheme = 'cute-1' | 'cute-2' | 'cute-3';

export const FONT_THEME_OPTIONS: { id: FontTheme; name: string; preview: string }[] = [
  { id: 'cute-1', name: '큐티 손글씨 1', preview: '안녕, 같이 쓰는 캘린더다냥' },
  { id: 'cute-2', name: '큐티 손글씨 2', preview: '오늘 일정 뭐 있는지 알려줄게!' },
  { id: 'cute-3', name: '큐티 손글씨 3', preview: '프로필이랑 테마를 귀엽게 꾸며보자' },
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
