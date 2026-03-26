import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  maxWidth?: number;
};

export default function PageContainer({ children, maxWidth = 960 }: Props) {
  return (
    <main
      style={{
        padding: 24,
        maxWidth,
        margin: '0 auto',
      }}
    >
      {children}
    </main>
  );
}
