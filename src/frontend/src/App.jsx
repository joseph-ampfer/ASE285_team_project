import { useState, useEffect } from 'react'
import axios from 'axios'
import TodoList from './components/TodoList'
import CalendarView from './components/CalendarView'
import KanbanView from './components/KanbanView'
import './App.css'

// API base URL - uses Vite proxy in development
const API_URL = '/api/posts'

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('list') // 'list', 'calendar', or 'kanban'

  // Fetch all todos on component mount
  useEffect(() => {
    fetchTodos()
  }, [])

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

  const updateTodo = async (id, title, date, description, status) => {
    try {
      const payload = { title, date, description }
      if (status) payload.status = status

      const response = await axios.put(`${API_URL}/${id}`, payload)
      setTodos(todos.map(todo =>
        todo._id === id ? response.data : todo
      ))
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
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask} 
          />
        )
      case 'kanban':
        return (
          <KanbanView 
            todos={todos} 
            onUpdateTodo={updateTodo}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
          />
        ) 
      case 'list':
      default:
        return (

            <TodoList
              todos={todos}
              onEdit={startEditing}
              onDelete={deleteTodo}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
            />
          </>
        )
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Todo App</h1>
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

