import { useEffect, useRef } from 'react';

type ChatLine = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  chatLines: ChatLine[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
  agentName?: string;
  userNickname?: string;
};

export default function ChatPanel({ chatLines, chatInput, onChatInputChange, onSend, agentName = 'AGENT', userNickname = 'USER' }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatLines]);

  return (
    <aside
      style={{
        width: '30%',
        padding: '24px 24px 0 24px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, rgba(248,250,255,0.96) 0%, rgba(244,247,255,0.98) 100%)',
        height: 'calc(100vh - 88px)',
        position: 'sticky',
        top: 88,
        overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        borderLeft: '1px solid rgba(226,232,240,0.72)',
      }}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content', padding: '8px 12px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: '#4338ca', fontSize: 13, fontWeight: 800, letterSpacing: '0.04em' }}>
          AI CHAT SPACE
        </div>
        <h2 style={{ margin: 0, fontSize: 38, lineHeight: 1.02, letterSpacing: '-0.03em' }}>{agentName}</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>
          사용자를 닉네임으로 부르는 캘린더 어시스턴트
        </p>
      </div>

      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, border: '1px solid rgba(226,232,240,0.96)', borderRadius: 28, padding: '18px 18px 96px 18px', marginTop: 18, overflowY: 'auto', background: 'rgba(255,255,255,0.92)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}>
        {chatLines.length === 0 ? <p style={{ color: '#64748b', fontSize: 15 }}>예: 이번주 일정 뭐 있어?</p> : null}
        {chatLines.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div key={index} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 700, letterSpacing: '0.06em' }}>{isUser ? userNickname : agentName}</div>
              <div style={{ whiteSpace: 'pre-wrap', maxWidth: '94%', padding: '14px 16px', borderRadius: isUser ? '22px 22px 8px 22px' : '22px 22px 22px 8px', background: isUser ? 'linear-gradient(135deg, #111827, #312e81)' : 'linear-gradient(135deg, #eef2ff, #ecfeff)', color: '#111827', boxShadow: isUser ? '0 12px 30px rgba(17,24,39,0.20)' : '0 10px 24px rgba(99,102,241,0.10)', fontSize: 15, lineHeight: 1.7, border: isUser ? 'none' : '1px solid rgba(196,181,253,0.36)' }}>
                <span style={{ color: isUser ? '#fff' : '#111827' }}>{message.content}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 0, display: 'flex', gap: 10, paddingTop: 12, paddingBottom: 0, marginBottom: 0, background: 'linear-gradient(180deg, rgba(248,250,255,0), #f4f7ff 28%)' }}>
        <input value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} type="text" placeholder={`${agentName}에게 일정 물어보기`} style={{ flex: 1, padding: '16px 18px', borderRadius: 18, border: '1px solid #dbe2ea', background: 'rgba(255,255,255,0.98)', fontSize: 15, outline: 'none', boxShadow: '0 8px 20px rgba(148,163,184,0.10)' }} />
        <button onClick={onSend} type="button" style={{ padding: '14px 18px', borderRadius: 18, border: 'none', background: 'linear-gradient(135deg, #111827, #312e81)', color: '#fff', fontWeight: 800, minWidth: 84, boxShadow: '0 14px 30px rgba(49,46,129,0.28)', cursor: 'pointer' }}>전송</button>
      </div>
    </aside>
  );
}
