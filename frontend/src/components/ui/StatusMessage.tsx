type Props = {
  message: string;
};

export default function StatusMessage({ message }: Props) {
  if (!message) return null;

  return (
    <p style={{ marginTop: 16, color: message.includes('Failed to fetch') ? '#b91c1c' : '#374151' }}>
      {message.includes('Failed to fetch')
        ? '백엔드 서버에 연결하지 못했다냥. backend가 실행 중인지, http://localhost:8000/health 가 열리는지 확인해봐라냥.'
        : message}
    </p>
  );
}
