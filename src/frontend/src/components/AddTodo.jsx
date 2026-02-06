import { useState } from 'react'

function AddTodo({ onAdd }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!title.trim() || !date) {
      alert('Please fill in both title and date')
      return
    }

    onAdd(title.trim(), date)
    setTitle('')
    setDate('')
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h2>➕ Add New Todo</h2>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Due Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn btn-primary">
          Add Todo
        </button>
      </div>
    </form>
  )
}

export default AddTodo

