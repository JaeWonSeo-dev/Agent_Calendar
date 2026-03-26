import './globals.css';

import ThemeInitializer from '../components/theme/ThemeInitializer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-font-theme="cute-1">
      <body>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
