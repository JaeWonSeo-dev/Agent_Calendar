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
    <div style={{ display: 'inline-flex', border: '1px solid #dbe2ea', borderRadius: 14, overflow: 'hidden' }}>
      {(['AM', 'PM'] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          style={{
            padding: '10px 12px',
            border: 'none',
            background: value === item ? '#111827' : '#fff',
            color: value === item ? '#fff' : '#111827',
            cursor: 'pointer',
          }}
        >
          {item === 'AM' ? '오전' : '오후'}
        </button>
      ))}
    </div>
  );
}

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
        marginTop: 24,
        border: '1px solid #e5e7eb',
        borderRadius: 24,
        padding: 20,
        background: 'rgba(255,255,255,0.88)',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
      }}
    >
      <h2 style={{ marginTop: 0 }}>{editing ? '일정 수정' : '일정 추가'}</h2>
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="일정 제목" style={{ padding: 12, borderRadius: 14, border: '1px solid #dbe2ea' }} />
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="설명" style={{ padding: 12, minHeight: 88, borderRadius: 14, border: '1px solid #dbe2ea' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>시작 날짜</label>
            <input value={startDate} onChange={(e) => onStartDateChange(e.target.value)} type="date" style={{ padding: 12, borderRadius: 14, border: '1px solid #dbe2ea' }} />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>종료 날짜</label>
            <input value={endDate} onChange={(e) => onEndDateChange(e.target.value)} type="date" style={{ padding: 12, borderRadius: 14, border: '1px solid #dbe2ea' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>시작 시간</label>
            <input value={startTime} onChange={(e) => onStartTimeChange(e.target.value)} type="text" placeholder="예: 09:30" style={{ padding: 12, borderRadius: 14, border: '1px solid #dbe2ea' }} />
          </div>
          <MeridiemToggle value={startMeridiem} onChange={onStartMeridiemChange} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>종료 시간</label>
            <input value={endTime} onChange={(e) => onEndTimeChange(e.target.value)} type="text" placeholder="예: 10:30" style={{ padding: 12, borderRadius: 14, border: '1px solid #dbe2ea' }} />
          </div>
          <MeridiemToggle value={endMeridiem} onChange={onEndMeridiemChange} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <PrimaryButton onClick={onSubmit} type="button" style={{ width: 160 }}>
            {editing ? '일정 수정' : '일정 추가'}
          </PrimaryButton>
          {editing ? (
            <button onClick={onCancel} type="button" style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff' }}>
              취소
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
