import { useState, type CSSProperties, type FormEvent } from 'react'
import { useAuth } from './AuthContext'

export default function LoginScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Заполните почту и пароль')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не получилось войти')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--graphite)' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 24
        }}
      >
        <h1 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>HomeCraft3D</h1>
        <input type="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        {error && <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>}
        <button type="submit" disabled={busy} style={primaryBtnStyle}>
          {mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={ghostBtnStyle}>
          {mode === 'signin' ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
        </button>
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        <button type="button" onClick={() => void signInWithGoogle()} style={ghostBtnStyle}>
          Войти через Google
        </button>
      </form>
    </div>
  )
}

const inputStyle: CSSProperties = {
  background: 'var(--graphite)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '9px 10px',
  color: 'var(--paper)',
  fontSize: 13,
  fontFamily: 'inherit'
}
const primaryBtnStyle: CSSProperties = {
  background: 'var(--amber)',
  border: 'none',
  borderRadius: 6,
  padding: '9px 10px',
  color: '#242321',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer'
}
const ghostBtnStyle: CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '9px 10px',
  color: 'var(--paper-dim)',
  fontSize: 12.5,
  cursor: 'pointer'
}
