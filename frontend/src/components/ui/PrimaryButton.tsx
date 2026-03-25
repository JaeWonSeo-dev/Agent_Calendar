type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function PrimaryButton({ children, style, ...props }: Props) {
  return (
    <button
      {...props}
      style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #111',
        background: '#111',
        color: '#fff',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
