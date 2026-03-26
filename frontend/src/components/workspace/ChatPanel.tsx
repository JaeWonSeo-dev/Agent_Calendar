type ChatLine = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  chatLines: ChatLine[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
};

export default function ChatPanel({ chatLines, chatInput, onChatInputChange, onSend }: Props) {
  return (
    <aside
      style={{
        width: '30%',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #fcfcff 0%, #f8fafc 100%)',
        minHeight: 'calc(100vh - 73px)',
        maxHeight: 'calc(100vh - 73px)',
        position: 'sticky',
        top: 73,
        overflow: 'hidden',
      }}
    >
      <h2 style={{ marginTop: 0 }}>LLM Chatbot</h2>
      <p style={{ color: '#6b7280' }}>사용자별 대화는 따로 보관되지만, 질문은 공유 캘린더를 기준으로 이어간다.</p>

      <div style={{ flex: 1, minHeight: 0, border: '1px solid #e5e7eb', borderRadius: 20, padding: 14, marginTop: 16, overflowY: 'auto', background: '#fff' }}>
        {chatLines.length === 0 ? <p>예: 이번주 일정 뭐 있어?</p> : null}
        {chatLines.map((message, index) => (
          <div key={index} style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{message.role === 'user' ? 'USER' : 'AGENT'}</div>
            <div style={{ whiteSpace: 'pre-wrap', maxWidth: '92%', padding: '10px 12px', borderRadius: 16, background: message.role === 'user' ? '#111827' : '#eef2ff', color: message.role === 'user' ? '#fff' : '#111827' }}>
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', gap: 8, marginTop: 16, paddingTop: 12, paddingBottom: 4, background: 'linear-gradient(180deg, rgba(252,252,255,0), #f8fafc 28%)' }}>
        <input value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} type="text" placeholder="공유 캘린더에 대해 물어보기" style={{ flex: 1, padding: 12, borderRadius: 14, border: '1px solid #dbe2ea', background: '#fff' }} />
        <button onClick={onSend} type="button" style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #111827', background: '#111827', color: '#fff' }}>전송</button>
      </div>
    </aside>
  );
}
