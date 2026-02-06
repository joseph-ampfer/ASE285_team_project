import { useState } from 'react'

function EditTodo({ todo, onUpdate, onCancel }) {
  const [title, setTitle] = useState(todo.title)
  const [date, setDate] = useState(todo.date)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!title.trim() || !date) {
      alert('Please fill in both title and date')
      return
    }

    onUpdate(todo._id, title.trim(), date)
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h2>✏️ Edit Todo</h2>
      
      <div className="form-group">
        <label htmlFor="edit-title">Title</label>
        <input
          type="text"
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-date">Due Date</label>
        <input
          type="date"
          id="edit-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default EditTodo

