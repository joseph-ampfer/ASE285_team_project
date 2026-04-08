import { useState, useEffect } from 'react'
import axios from 'axios'
import TodoList from './components/TodoList'
import CalendarView from './components/CalendarView'
import KanbanView from './components/KanbanView'
import GamificationPanel from './components/GamificationPanel'
import ThemeToggle from './components/ThemeToggle'
import CanvasIntegration from './components/CanvasIntegration'
import ListViewToolbar from './components/ListViewToolbar'
import './App.css'
import './styles/canvasTask.css'
import './styles/taskStatus.css'

// API base URL - uses Vite proxy in development
const API_URL = '/api/posts'

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('list') // 'list', 'calendar', or 'kanban'
  const [stats, setStats] = useState({
    points: 0,
    level: 1,
    streakCount: 0,
    nextLevelAt: 100
  })
  const [history, setHistory] = useState([])
  const [isGamificationOpen, setIsGamificationOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [listGroupByStatus, setListGroupByStatus] = useState(false)
  const [listShowCanvas, setListShowCanvas] = useState(true)
  const [listShowNonCanvas, setListShowNonCanvas] = useState(true)

  // Fetch all todos and settings on mount
  useEffect(() => {
    fetchTodos()
    fetchGamification()
    fetchSettings()
    axios.get('/api/settings').then((r) => {
      if (r.data?.canvasApiToken?.trim()) {
        return axios.post('/api/canvas/sync').then(() => fetchTodos()).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  // Apply theme to body for global styles
  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings')
      setTheme(res.data.theme || 'dark')
    } catch (err) {
      console.error('Error fetching settings:', err)
    }
  }

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

  const addTodo = async (title, date, description) => {
    try {
      const response = await axios.post(API_URL, { title, date, description, status: 'todo' })
      setTodos([...todos, response.data])
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
        setTodos(todos.map(todo =>
          todo._id === id ? data.post : todo
        ))
        if (data.gamification) {
          setStats(data.gamification.stats)
          // refresh history to include the new event
          fetchGamification()
        }
      } else {
        setTodos(todos.map(todo =>
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
      setTodos(todos.filter(todo => todo._id !== id))
      setError(null)
    } catch (err) {
      console.error('Error deleting todo:', err)
      setError('Failed to delete todo')
    }
  }

  const addSubtask = async (taskId, title) => {
    try {
      const response = await axios.post(`/api/posts/${taskId}/subtasks`, { title })

      setTodos(todos.map(todo =>
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

      setTodos(todos.map(todo =>
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
    <div className="app" data-theme={theme}>
      <div className="app-top-controls">
        <CanvasIntegration onSyncComplete={fetchTodos} />
        <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
      </div>

      <GamificationPanel
        stats={stats}
        history={history}
        open={isGamificationOpen}
        onToggle={() => setIsGamificationOpen(!isGamificationOpen)}
      />

      <header className="app-header">
        <h1>📝 <span className='app-title'>TaskFlow</span></h1>
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
    </div>
  )
}

export default App

