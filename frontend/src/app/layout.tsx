import { Hi_Melody, Nunito } from 'next/font/google';

const hiMelody = Hi_Melody({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cute',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${hiMelody.variable} ${nunito.variable}`}>
      <body
        style={{
          margin: 0,
          fontFamily: 'var(--font-cute), "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
