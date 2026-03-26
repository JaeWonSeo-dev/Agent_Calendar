'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'agent-calendar-font-theme';

export default function ThemeInitializer() {
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) || 'cute-1';
    document.documentElement.setAttribute('data-font-theme', saved);
  }, []);

  return null;
}
