import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { ref, set, get, serverTimestamp } from 'firebase/database'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null) // { companyId, role, email }
  const [company, setCompany] = useState(null) // { name, ownerUid, createdAt }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const snap = await get(ref(db, `users/${user.uid}`))
        if (snap.exists()) {
          const p = snap.val()
          setProfile(p)
          const cSnap = await get(ref(db, `companies/${p.companyId}/profile`))
          setCompany(cSnap.exists() ? cSnap.val() : null)
        } else {
          setProfile(null)
          setCompany(null)
        }
      } else {
        setProfile(null)
        setCompany(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // First-time signup: this person becomes the company owner.
  // companyId === owner's uid, so all their data lives under companies/{uid}/...
  async function signup(email, password, companyName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const uid = cred.user.uid
    await set(ref(db, `users/${uid}`), {
      email,
      companyId: uid,
      role: 'owner',
      createdAt: Date.now()
    })
    await set(ref(db, `companies/${uid}/profile`), {
      name: companyName || 'My Company',
      ownerUid: uid,
      createdAt: Date.now()
    })
    await set(ref(db, `companies/${uid}/team/${uid}`), {
      email,
      role: 'owner',
      createdAt: Date.now()
    })
    return cred
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    return signOut(auth)
  }

  const value = {
    currentUser,
    profile,
    company,
    companyId: profile?.companyId || null,
    role: profile?.role || null,
    loading,
    signup,
    login,
    logout,
    setCompany
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
