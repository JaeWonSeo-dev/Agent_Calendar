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
    <aside style={{ width: '30%', padding: 24, display: 'flex', flexDirection: 'column' }}>
      <h2>LLM Chatbot</h2>
      <p>사용자별 대화는 따로 보관되지만, 질문은 공유 캘린더를 기준으로 이어간다.</p>

      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 12, padding: 12, marginTop: 16, overflowY: 'auto' }}>
        {chatLines.length === 0 ? <p>예: 이번주 일정 뭐 있어?</p> : null}
        {chatLines.map((message, index) => (
          <div key={index} style={{ marginBottom: 12 }}>
            <strong>{message.role === 'user' ? 'USER' : 'AGENT'}</strong>
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} type="text" placeholder="공유 캘린더에 대해 물어보기" style={{ flex: 1, padding: 10 }} />
        <button onClick={onSend} type="button" style={{ padding: '10px 14px' }}>전송</button>
      </div>
    </aside>
  );
}
