import { useState } from 'react'
import taskflowLogo from '../../assets/taskflow_logo.png'
import axios from '../axios'
import { saveAuth } from '../auth'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const endpoint = isRegister
        ? '/api/auth/register'
        : '/api/auth/login'

      const payload = isRegister
        ? { email, password, username }
        : { email, password }

      const res = await axios.post(endpoint, payload)

      saveAuth(res.data.token)
      onLogin()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div className="auth-container">
      <div className="todo-form auth-card">
        <h1 className="app-brand-heading">
          <img
            src={taskflowLogo}
            alt=""
            className="app-brand-logo"
            width={40}
            height={40}
          />
          <span className="app-title">TaskFlow</span>
        </h1>
        <p className="subtitle">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </p>

        <br />

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div className="form-buttons">
            <button className="btn btn-primary" type="submit">
              {isRegister ? 'Register' : 'Login'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsRegister(prev => !prev)
                setError(null)
              }}
            >
              {isRegister ? 'Login instead' : 'Register instead'}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

