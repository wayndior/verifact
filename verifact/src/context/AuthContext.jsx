import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('vf_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setUser(data.user))
      .catch((status) => {
        localStorage.removeItem('vf_token')
        setToken(null)
        // Only clear if it was an auth error, not a network issue
        if (status === 401 || status === 403) setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = (tok, userData) => {
    localStorage.setItem('vf_token', tok)
    setToken(tok)
    setUser(userData)
  }

  const logout = useCallback(() => {
    localStorage.removeItem('vf_token')
    setToken(null)
    setUser(null)
  }, [])

  // Wrap fetch to auto-logout on 401 from any API call
  const authFetch = useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
    if (res.status === 401) {
      logout()
      window.location.replace('/login')
      throw new Error('Session expired. Please log in again.')
    }
    return res
  }, [token, logout])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
