import { useState, CSSProperties } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGuestbookStore } from '../store/guestbookStore';

const POST_COLORS = [
  '#fff176', // 노랑
  '#f48fb1', // 핑크
  '#a5d6a7', // 초록
  '#90caf9', // 파랑
  '#ffcc80', // 주황
  '#ce93d8', // 보라
];

const overlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.55)',
  zIndex: 100,
};

const modal: CSSProperties = {
  background: '#1a1a2e',
  border: '1px solid rgba(100,140,220,0.3)',
  borderRadius: '12px',
  padding: '28px 32px',
  minWidth: '320px',
  maxWidth: '400px',
  width: '90%',
  fontFamily: 'system-ui, sans-serif',
  color: '#ddeeff',
  boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
};

export const GuestBookUI = () => {
  const slot = useGameStore((s) => s.openGuestbookSlot);
  const setOpenGuestbookSlot = useGameStore((s) => s.setOpenGuestbookSlot);
  const { entries, addEntry, removeEntry } = useGuestbookStore();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [color, setColor] = useState(POST_COLORS[0]);

  if (slot === null) return null;

  const entry = entries[slot];

  const handleClose = () => {
    setOpenGuestbookSlot(null);
    setName('');
    setMessage('');
    setColor(POST_COLORS[0]);
    // 포인터락 재진입
    document.querySelector('canvas')?.requestPointerLock();
  };

  const handleSave = async () => {
    if (!message.trim()) return;
    await addEntry(slot, {
      color,
      name: name.trim(),
      message: message.trim(),
      createdAt: Date.now(),
    });
    handleClose();
  };

  const handleDelete = async () => {
    await removeEntry(slot);
    handleClose();
  };

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={modal}>
        {/* 제목 */}
        <div style={{ fontSize: '1rem', color: '#7a99cc', marginBottom: '20px', letterSpacing: '0.1em' }}>
          {entry ? '📌 방명록' : `✏️ 방명록 남기기 (슬롯 ${slot + 1})`}
        </div>

        {entry ? (
          /* ── 기존 포스트잇 보기 ── */
          <>
            <div style={{
              background: entry.color,
              color: '#111',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '80px',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}>
              {entry.name && (
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>{entry.name}</div>
              )}
              <div>{entry.message}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleDelete} style={btnStyle('#7a2020')}>
                포스트잇 떼기
              </button>
              <button onClick={handleClose} style={btnStyle('#223355')}>
                닫기
              </button>
            </div>
          </>
        ) : (
          /* ── 새 포스트잇 작성 ── */
          <>
            {/* 색상 선택 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#557799', marginBottom: '8px' }}>색상 선택</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {POST_COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      border: color === c ? '2px solid white' : '2px solid transparent',
                      boxSizing: 'border-box',
                      transition: 'transform 0.1s',
                      transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 이름 */}
            <input
              placeholder="이름 (선택)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              style={inputStyle}
            />

            {/* 메시지 */}
            <textarea
              placeholder="방명록을 남겨주세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={80}
              rows={3}
              style={{ ...inputStyle, resize: 'none', height: '80px' }}
            />

            {/* 미리보기 */}
            {message && (
              <div style={{
                background: color,
                color: '#111',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '14px',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}>
                {name && <div style={{ fontWeight: 700, marginBottom: '4px' }}>{name}</div>}
                <div>{message}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={btnStyle('#223355')}>취소</button>
              <button
                onClick={handleSave}
                disabled={!message.trim()}
                style={btnStyle('#1a4a8a', !message.trim())}
              >
                붙이기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const inputStyle: CSSProperties = {
  width: '100%',
  background: '#111828',
  border: '1px solid rgba(100,140,220,0.25)',
  borderRadius: '6px',
  padding: '10px 12px',
  color: '#ddeeff',
  fontSize: '0.9rem',
  marginBottom: '12px',
  outline: 'none',
  fontFamily: 'system-ui, sans-serif',
  boxSizing: 'border-box',
};

function btnStyle(bg: string, disabled = false): CSSProperties {
  return {
    background: disabled ? '#1a1a2e' : bg,
    color: disabled ? '#334' : '#ddeeff',
    border: '1px solid rgba(100,140,220,0.2)',
    borderRadius: '6px',
    padding: '8px 18px',
    fontSize: '0.88rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'system-ui, sans-serif',
    transition: 'background 0.15s',
  };
}
