type Props = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  editing: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartAtChange: (value: string) => void;
  onEndAtChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function EventForm(props: Props) {
  const {
    title,
    description,
    startAt,
    endAt,
    editing,
    onTitleChange,
    onDescriptionChange,
    onStartAtChange,
    onEndAtChange,
    onSubmit,
    onCancel,
  } = props;

  return (
    <div style={{ marginTop: 24, border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
      <h2>{editing ? '일정 수정' : '일정 추가'}</h2>
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="일정 제목" style={{ padding: 10 }} />
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="설명" style={{ padding: 10, minHeight: 80 }} />
        <input value={startAt} onChange={(e) => onStartAtChange(e.target.value)} type="datetime-local" style={{ padding: 10 }} />
        <input value={endAt} onChange={(e) => onEndAtChange(e.target.value)} type="datetime-local" style={{ padding: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSubmit} type="button" style={{ padding: '10px 14px', width: 160 }}>
            {editing ? '일정 수정' : '일정 추가'}
          </button>
          {editing ? (
            <button onClick={onCancel} type="button" style={{ padding: '10px 14px' }}>
              취소
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
