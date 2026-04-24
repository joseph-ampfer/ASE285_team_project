import { useState, useEffect } from 'react'
import axios from './axios'
import Login from './components/Login'
import LandingPage from './components/LandingPage'
import { clearAuth } from './auth'
import TodoList from './components/TodoList'
import CalendarView from './components/CalendarView'
import KanbanView from './components/KanbanView'
import GamificationPanel from './components/GamificationPanel'
import ThemeToggle from './components/ThemeToggle'
import CanvasIntegration from './components/CanvasIntegration'
import ListViewToolbar from './components/ListViewToolbar'
import taskflowLogo from '../assets/taskflow_logo.png'
import './App.css'
import './styles/canvasTask.css'
import './styles/taskStatus.css'

// API base URL
const API_URL = '/api/posts'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  )
  const [authView, setAuthView] = useState('landing')
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('list') // 'list', 'calendar', or 'kanban'
  const [stats, setStats] = useState({
    points: 0,
    level: 1,
    streakCount: 0,
    nextLevelAt: 100,
    completedLast7Days: 0,
  })
  const [history, setHistory] = useState([])
  const [isGamificationOpen, setIsGamificationOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [listGroupByStatus, setListGroupByStatus] = useState(false)
  const [listShowCanvas, setListShowCanvas] = useState(true)
  const [listShowNonCanvas, setListShowNonCanvas] = useState(true)

  // login or refresh-> load theme, auto-import Canvas assignments
  useEffect(() => {
    if (!isAuthenticated) return

    let active = true

    const bootstrapAuthenticatedSession = async () => {
      setLoading(true)
      void fetchGamification()

      try {
        const settingsRes = await axios.get('/api/settings')
        if (!active) return
        setTheme(settingsRes.data.theme || 'dark')

        const canvasToken = settingsRes.data?.canvasApiToken?.trim()
        if (canvasToken) {
          try {
            await axios.post('/api/canvas/sync')
          } catch (err) {
            console.error('Canvas auto-sync on session start failed:', err)
          }
        }
        if (!active) return
        await fetchTodos()
      } catch (err) {
        console.error('Error bootstrapping session:', err)
        if (active) await fetchTodos()
      } finally {
        if (!active) setLoading(false)
      }
    }

    void bootstrapAuthenticatedSession()
    return () => {
      active = false
    }
  }, [isAuthenticated])

  // Apply theme to body for global styles
  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const handleThemeToggle = async () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    try {
      await axios.put('/api/settings', { theme: next })
      setTheme(next)
    } catch (err) {
      console.error('Error updating theme:', err)
    }
  }

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL)
      setTodos(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching todos:', err)
      setError('Failed to fetch todos. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const fetchGamification = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        axios.get('/api/gamification/stats'),
        axios.get('/api/gamification/history')
      ])
      setStats(statsRes.data)
      setHistory(historyRes.data)
    } catch (err) {
      console.error('Error fetching gamification data:', err)
      // Gamification is optional; do not surface an error banner.
    }
  }

  const deleteGamificationHistoryItem = async (eventId) => {
    try {
      const res = await axios.delete(
        `/api/gamification/history/${encodeURIComponent(eventId)}`
      )
      setStats(res.data.stats)
      setHistory(res.data.history)
    } catch (err) {
      console.error('Error deleting gamification history:', err)
      throw err
    }
  }

  const addTodo = async (title, date, description) => {
    try {
      const response = await axios.post(API_URL, { title, date, description, status: 'todo' })
      setTodos(prev => [...prev, response.data])
      setError(null)
    } catch (err) {
      console.error('Error adding todo:', err)
      setError('Failed to add todo')
    }
  }

  const updateTodo = async (id, payload) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, payload)
      const data = response.data

      if (data && data.post) {
        setTodos(prev => prev.map(todo =>
          todo._id === id ? data.post : todo
        ))
        if (data.gamification) {
          setStats(data.gamification.stats)
          // refresh history to include the new event
          fetchGamification()
        }
      } else {
        setTodos(prev => prev.map(todo =>
          todo._id === id ? data : todo
        ))
      }
      setError(null)
    } catch (err) {
      console.error('Error updating todo:', err)
      setError('Failed to update todo')
    }
  }

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      setTodos(prev => prev.filter(todo => todo._id !== id))
      setError(null)
    } catch (err) {
      console.error('Error deleting todo:', err)
      setError('Failed to delete todo')
    }
  }

  const addSubtask = async (taskId, title) => {
    try {
      const response = await axios.post(`/api/posts/${taskId}/subtasks`, { title })

      setTodos(prev => prev.map(todo =>
        todo._id === taskId ? response.data : todo
      ))

      setError(null)
    } catch (err) {
      console.error('Error adding subtask:', err)
      setError('Failed to add subtask')
    }
  }

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const response = await axios.patch(
        `/api/posts/${taskId}/subtasks/${subtaskId}`
      )

      setTodos(prev => prev.map(todo =>
        todo._id === taskId ? response.data : todo
      ))

    } catch (err) {
      console.error('Error toggling subtask:', err)
      setError('Failed to update subtask')
    }
  }

  const renderContent = () => {
    if (loading) return <div className="loading">Loading todos...</div>

    switch (currentView) {
      case 'calendar':
        return (
          <CalendarView 
            todos={todos}
            onAddTask={addTodo}
            onUpdateTask={updateTodo}
            onDeleteTask={deleteTodo}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask} 
          />
        )
      case 'kanban':
        return (
          <KanbanView 
            todos={todos} 
            onAdd={addTodo}
            onEdit={updateTodo} 
            onDelete={deleteTodo}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
          />
        ) 
      case 'list':
      default:
        return (
          <TodoList
            todos={todos}
            onAdd={addTodo}
            onEdit={updateTodo}
            onDelete={deleteTodo}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            listGroupByStatus={listGroupByStatus}
            listShowCanvas={listShowCanvas}
            listShowNonCanvas={listShowNonCanvas}
          />
        )
    }
  }

  return (
    <div
      className={`app${!isAuthenticated && authView === 'landing' ? ' app--landing' : ''}`}
      data-theme={theme}
    >
      {!isAuthenticated ? (
        authView === 'landing' ? (
          <LandingPage onSignIn={() => setAuthView('login')} />
        ) : (
          <Login
            onLogin={() => setIsAuthenticated(true)}
            onBack={() => setAuthView('landing')}
          />
        )
      ) : (
        <>
          <div className="app-top-controls">
            <button
              className='btn-secondary'
              onClick={() => {
                clearAuth()
                setIsAuthenticated(false)
                setAuthView('landing')
              }}
            >
              Logout
            </button>
            <CanvasIntegration onSyncComplete={fetchTodos} />
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>

          <GamificationPanel
            stats={stats}
            history={history}
            open={isGamificationOpen}
            onToggle={() => setIsGamificationOpen(!isGamificationOpen)}
            onDeleteHistoryItem={deleteGamificationHistoryItem}
            theme={theme}
            refreshGamification={fetchGamification}
          />

          <header className="app-header">
            <h1 className="app-brand-heading">
              <img
                src={taskflowLogo}
                alt=""
                className="app-brand-logo"
                width={40}
                height={40}
              />
              <span className='app-title'>TaskFlow</span>
            </h1>
            <p className="subtitle">Manage your tasks efficiently</p>

            <nav className="app-nav">
              <button
                className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
                onClick={() => setCurrentView('list')}
              >
                📋 List
              </button>
              <button
                className={`nav-btn ${currentView === 'kanban' ? 'active' : ''}`}
                onClick={() => setCurrentView('kanban')}
              >
                ⚡ Kanban
              </button>
              <button
                className={`nav-btn ${currentView === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentView('calendar')}
              >
                📅 Calendar
              </button>
            </nav>

            {currentView === 'list' && (
              <ListViewToolbar
                groupByStatus={listGroupByStatus}
                onGroupByStatusChange={setListGroupByStatus}
                showCanvas={listShowCanvas}
                onShowCanvasChange={setListShowCanvas}
                showNonCanvas={listShowNonCanvas}
                onShowNonCanvasChange={setListShowNonCanvas}
              />
            )}
          </header>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          <main className="app-main">
            {renderContent()}
          </main>

          <footer className="app-footer">
            <p>ASE285 Team Project</p>
          </footer>
        </>
      )}
    </div>
  )
}

export default App

