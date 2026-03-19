import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Scene } from './components/Scene';

const requestLock = () => document.querySelector('canvas')?.requestPointerLock();

function App() {
  const { started, start, fastMode } = useGameStore();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  const handleOverlayClick = () => {
    if (!started) start();
    requestLock();
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Scene />

      {/* Overlay: shown when pointer is not locked */}
      {!locked && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(0,0,10,0.88) 0%, rgba(0,0,30,0.82) 100%)',
            cursor: 'pointer',
            userSelect: 'none',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 900,
            margin: '0 0 0.15em',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 0%, #aaccff 60%, #6699ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            htjworld
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '1.05rem',
            color: '#7a99cc',
            margin: '0 0 0.5em',
            textAlign: 'center',
            lineHeight: 1.7,
          }}>
            비행기로 도시를 날아다니며 나의 글과 프로젝트를 탐험하세요
          </p>

          {/* Velog link (not a real anchor - just display text to prevent click hijack) */}
          <p style={{
            fontSize: '0.9rem',
            color: '#4a6a99',
            margin: '0 0 2.5em',
          }}>
            📝 velog.io/@htjworld 에서도 만나보실 수 있습니다
          </p>

          {/* Controls guide */}
          <div style={{
            fontSize: '0.78rem',
            color: '#3a5a88',
            lineHeight: 2.1,
            textAlign: 'center',
            marginBottom: '2.5em',
            borderTop: '1px solid rgba(100,140,220,0.15)',
            borderBottom: '1px solid rgba(100,140,220,0.15)',
            padding: '1em 2em',
          }}>
            <div><span style={{ color: '#6688bb' }}>WASD</span> — 이동 &nbsp;·&nbsp; <span style={{ color: '#6688bb' }}>Space</span> — 상승 &nbsp;·&nbsp; <span style={{ color: '#6688bb' }}>Shift</span> — 하강</div>
            <div><span style={{ color: '#6688bb' }}>Space 더블탭</span> — ⚡ 빠른 모드 토글 (속도 3배) &nbsp;·&nbsp; <span style={{ color: '#6688bb' }}>ESC</span> — 일시정지</div>
            <div>크로스헤어로 빌딩을 가리키고 클릭하면 블로그로 이동</div>
          </div>

          {/* CTA */}
          <div style={{
            fontSize: '0.95rem',
            color: 'rgba(180,210,255,0.6)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            클릭하여 계속하기
          </div>
        </div>
      )}

      {/* Crosshair (only when locked) */}
      {locked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          userSelect: 'none',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '20px',
          lineHeight: 1,
          textShadow: '0 0 6px rgba(0,0,0,1)',
        }}>
          +
        </div>
      )}

      {/* Fast mode HUD */}
      {locked && fastMode && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1.2rem',
          pointerEvents: 'none',
          userSelect: 'none',
          fontSize: '1.5rem',
          color: '#ffe44d',
          textShadow: '0 0 10px rgba(255,220,0,0.8)',
        }}>
          ⚡
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
