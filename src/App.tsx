import { useState } from 'react'
import { Scene } from './components/Scene'

function App() {
  const [started, setStarted] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {!started && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10, color: 'white'
        }}>
          <h1>3D Flying Ad Game</h1>
          <p>Click to start. WASD + Space/Ctrl to move. Shift to boost. Click to capture mouse.</p>
          <button 
            style={{ padding: '10px 20px', fontSize: '20px', cursor: 'pointer' }}
            onClick={() => setStarted(true)}
          >
            Start Game
          </button>
        </div>
      )}
      {started && <Scene />}
      {started && (
          <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              color: 'white',
              pointerEvents: 'none',
              background: 'rgba(0,0,0,0.5)',
              padding: '10px'
          }}>
              WASD: Move | Space: Up | Ctrl: Down | Shift: Boost
          </div>
      )}
    </div>
  )
}

export default App

