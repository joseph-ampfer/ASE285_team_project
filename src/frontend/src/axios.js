import axios from 'axios'
import { getAuthToken } from './auth'

axios.interceptors.request.use(config => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearAuth()
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export default axios

