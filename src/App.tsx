import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginScreen from './auth/LoginScreen'

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  return online
}

function Shell() {
  const online = useOnlineStatus()
  const { user, signOut } = useAuth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: 46,
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel)',
          flexShrink: 0
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13 }}>HomeCraft3D</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--paper-dim)' }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: online ? 'var(--green)' : 'var(--red)'
              }}
            />
            {online ? 'Онлайн' : 'Офлайн'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--paper-dim)' }}>{user?.email}</span>
          <button
            onClick={() => void signOut()}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 9px',
              color: 'var(--paper-dim)',
              fontSize: 11.5,
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [6, 5, 6], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1} />
          <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} />
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 1, 1.5]} />
            <meshStandardMaterial color="#d99a4e" />
          </mesh>
          <OrbitControls />
        </Canvas>
      </main>
    </div>
  )
}

function Gate() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ height: '100vh', background: 'var(--graphite)' }} />
  return user ? <Shell /> : <LoginScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
