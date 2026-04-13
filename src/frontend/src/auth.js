export function saveAuth(token) {
  localStorage.setItem('token', token)
}

export function getAuthToken() {
  return localStorage.getItem('token')
}

export function clearAuth() {
  localStorage.removeItem('token')
}

