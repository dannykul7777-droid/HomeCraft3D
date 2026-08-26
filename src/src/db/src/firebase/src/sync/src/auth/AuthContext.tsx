import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth'
import { getFirebaseApp } from '../firebase/config'
import { getDb, type AppDB } from '../db/schema'
import { flushQueue } from '../sync/syncQueue'

interface AuthState {
  user: User | null
  db: AppDB | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const dbRef = useRef<AppDB | null>(null)

  const db = user ? getDb(user.uid) : null
  dbRef.current = db

  useEffect(() => {
    const auth = getAuth(getFirebaseApp())
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const handler = () => {
      if (dbRef.current) void flushQueue(dbRef.current)
    }
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [])

  const value: AuthState = {
    user,
    db,
    loading,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(getAuth(getFirebaseApp()), email, password)
    },
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(getAuth(getFirebaseApp()), email, password)
    },
    signInWithGoogle: async () => {
      await signInWithPopup(getAuth(getFirebaseApp()), new GoogleAuthProvider())
    },
    signOut: async () => {
      await firebaseSignOut(getAuth(getFirebaseApp()))
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
