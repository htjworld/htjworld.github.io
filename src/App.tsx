import { useGameStore } from './store/gameStore'
import { Scene } from './components/Scene'

function App() {
  const { started, start, reset, theme, setTheme } = useGameStore()

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {!started && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10, color: 'white',
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>htjworld</h1>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>비행기로 날아다니며 블로그를 탐험하세요</p>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>맵 선택: </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              style={{ padding: '5px 10px', fontSize: '16px' }}
            >
              <option value="creative">Creative City</option>
              <option value="ice">Ice Prison</option>
              <option value="maze">Maze Runner</option>
              <option value="hallway">Shining Hallway</option>
            </select>
          </div>

          <button
            style={{ padding: '10px 30px', fontSize: '18px', cursor: 'pointer' }}
            onClick={start}
          >
            탐험 시작
          </button>

          <p style={{ marginTop: '30px', fontSize: '0.85rem', color: '#666' }}>
            WASD 이동 | Space 상승 | Ctrl 하강 | Shift 부스트
          </p>
        </div>
      )}

      <Scene />

      {started && (
        <button
          style={{
            position: 'absolute', top: '10px', left: '10px',
            padding: '5px 12px', cursor: 'pointer',
            background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #666',
            borderRadius: '4px',
          }}
          onClick={reset}
        >
          ← 맵 선택
        </button>
      )}
    </div>
  )
}

export default App
