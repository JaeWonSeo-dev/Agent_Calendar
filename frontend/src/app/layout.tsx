import { Gaegu, Nunito } from 'next/font/google';

const gaegu = Gaegu({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cute',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-ui',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${gaegu.variable} ${nunito.variable}`}>
      <body
        style={{
          margin: 0,
          fontFamily: 'var(--font-cute), var(--font-ui), "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
