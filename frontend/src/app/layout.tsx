export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Hi+Melody&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: '"Hi Melody", "Nunito", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
