import { createContext, useCallback, useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { AUTH } from '../utils/apiPaths'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('authUser')
    return saved ? JSON.parse(saved) : null
  })
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)

  const storeAuthData = (data) => {
    localStorage.setItem('authUser', JSON.stringify(data))
    localStorage.setItem('authToken', data.token)
    setUser(data)
  }

  const logout = useCallback(() => {
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get(AUTH.profile)
      const token = localStorage.getItem('authToken')
      const profile = { ...response.data, token }
      localStorage.setItem('authUser', JSON.stringify(profile))
      setUser(profile)
    } catch (error) {
      toast.error('Session expired, please log in again.')
      logout()
    }
  }, [logout])

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      refreshProfile().finally(() => setInitialized(true))
    } else {
      setInitialized(true)
    }
  }, [refreshProfile])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const { data } = await axiosInstance.post(AUTH.login, credentials)
      storeAuthData(data)
      return data
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    try {
      setLoading(true)
      const { data } = await axiosInstance.post(AUTH.register, payload)
      storeAuthData(data)
      return data
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
