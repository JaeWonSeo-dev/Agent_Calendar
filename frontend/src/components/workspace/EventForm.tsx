import PrimaryButton from '../ui/PrimaryButton';

type Props = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  startMeridiem: 'AM' | 'PM';
  endMeridiem: 'AM' | 'PM';
  editing: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onStartMeridiemChange: (value: 'AM' | 'PM') => void;
  onEndMeridiemChange: (value: 'AM' | 'PM') => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function MeridiemToggle({ value, onChange }: { value: 'AM' | 'PM'; onChange: (value: 'AM' | 'PM') => void }) {
  return (
    <div style={{ display: 'inline-flex', border: '1px solid #dbe2ea', borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 18px rgba(148,163,184,0.08)' }}>
      {(['AM', 'PM'] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          style={{
            padding: '12px 14px',
            border: 'none',
            background: value === item ? 'linear-gradient(135deg, #111827, #312e81)' : '#fff',
            color: value === item ? '#fff' : '#111827',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          {item === 'AM' ? '오전' : '오후'}
        </button>
      ))}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '16px 18px',
  borderRadius: 18,
  border: '1px solid #dbe2ea',
  background: '#fbfdff',
  fontSize: 15,
  boxSizing: 'border-box' as const,
  outline: 'none',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
};

export default function EventForm(props: Props) {
  const {
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    startMeridiem,
    endMeridiem,
    editing,
    onTitleChange,
    onDescriptionChange,
    onStartDateChange,
    onEndDateChange,
    onStartTimeChange,
    onEndTimeChange,
    onStartMeridiemChange,
    onEndMeridiemChange,
    onSubmit,
    onCancel,
  } = props;

  return (
    <div
      style={{
        marginTop: 28,
        border: '1px solid rgba(226,232,240,0.92)',
        borderRadius: 32,
        padding: 28,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,255,0.92))',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content', padding: '8px 12px', borderRadius: 999, background: 'rgba(244,114,182,0.12)', color: '#be185d', fontSize: 13, fontWeight: 800, letterSpacing: '0.04em' }}>
          EVENT EDITOR
        </div>
        <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.04, letterSpacing: '-0.04em' }}>{editing ? '일정 수정' : '일정 추가'}</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 16, lineHeight: 1.75 }}>일정을 빠르게 추가하고, 수정 중일 때는 같은 카드에서 바로 정리할 수 있다냥.</p>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="일정 제목" style={inputStyle} />
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="설명" style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontWeight: 700, color: '#334155' }}>시작 날짜</label>
            <input value={startDate} onChange={(e) => onStartDateChange(e.target.value)} type="date" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontWeight: 700, color: '#334155' }}>종료 날짜</label>
            <input value={endDate} onChange={(e) => onEndDateChange(e.target.value)} type="date" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontWeight: 700, color: '#334155' }}>시작 시간</label>
            <input value={startTime} onChange={(e) => onStartTimeChange(e.target.value)} type="text" placeholder="예: 09:30" style={inputStyle} />
          </div>
          <MeridiemToggle value={startMeridiem} onChange={onStartMeridiemChange} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontWeight: 700, color: '#334155' }}>종료 시간</label>
            <input value={endTime} onChange={(e) => onEndTimeChange(e.target.value)} type="text" placeholder="예: 10:30" style={inputStyle} />
          </div>
          <MeridiemToggle value={endMeridiem} onChange={onEndMeridiemChange} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <PrimaryButton onClick={onSubmit} type="button" style={{ width: 170, padding: '14px 18px', borderRadius: 18, background: 'linear-gradient(135deg, #111827, #312e81)', border: 'none', boxShadow: '0 16px 30px rgba(49,46,129,0.22)' }}>
            {editing ? '일정 수정' : '일정 추가'}
          </PrimaryButton>
          {editing ? (
            <button onClick={onCancel} type="button" style={{ padding: '14px 18px', borderRadius: 18, border: '1px solid #d1d5db', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              취소
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
