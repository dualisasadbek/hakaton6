import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { setUnauthorizedHandler, clearUnauthorizedHandler } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const userRef = useRef(null)
  const navigate = useNavigate()

  const applyUser = useCallback((u) => {
    userRef.current = u
    setUser(u)
  }, [])

  // App ochilganda sessiyani aniqlash
  useEffect(() => {
    let active = true
    api
      .get('/auth/me', { skipRefresh: true })
      .then((res) => {
        if (active && res?.data?.user) applyUser(res.data.user)
      })
      .catch(() => {
        /* sessiya yo'q — anonim */
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [applyUser])

  // 401 + refresh muvaffaqiyatsiz → logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (userRef.current) {
        applyUser(null)
        navigate('/login')
      }
    })
    return () => clearUnauthorizedHandler()
  }, [applyUser, navigate])

  const login = useCallback(
    async (email, password) => {
      const res = await api.post('/auth/login', { email, password })
      applyUser(res.data.user)
      return res.data.user
    },
    [applyUser]
  )

  const register = useCallback(
    async (payload) => {
      const res = await api.post('/auth/register', payload)
      applyUser(res.data.user)
      return res.data.user
    },
    [applyUser]
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', null, { skipRefresh: true })
    } catch {
      /* cookie bo'lmasa ham davom etamiz */
    }
    applyUser(null)
    navigate('/login')
  }, [applyUser, navigate])

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me', { skipRefresh: true })
    if (res?.data?.user) applyUser(res.data.user)
  }, [applyUser])

  const value = useMemo(() => {
    const isAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
    const isSuperAdmin = user?.role === 'SUPER_ADMIN'
    return { user, loading, login, register, logout, refreshUser, isAdmin, isSuperAdmin }
  }, [user, loading, login, register, logout, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return ctx
}
