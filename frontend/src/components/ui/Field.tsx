type Props = {
  label: string;
  children: React.ReactNode;
};

export default function Field({ label, children }: Props) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <div>{label}</div>
      {children}
    </label>
  );
}
