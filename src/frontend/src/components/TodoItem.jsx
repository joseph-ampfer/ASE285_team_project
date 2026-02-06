function TodoItem({ todo, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm(`Delete "${todo.title}"?`)) {
      onDelete(todo._id)
    }
  }

  return (
    <div className="todo-item">
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        <div className="todo-date">📅 {todo.date}</div>
      </div>
      <div className="todo-actions">
        <button 
          className="btn-icon btn-edit"
          onClick={() => onEdit(todo)}
          title="Edit"
        >
          ✏️
        </button>
        <button 
          className="btn-icon btn-delete"
          onClick={handleDelete}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default TodoItem

