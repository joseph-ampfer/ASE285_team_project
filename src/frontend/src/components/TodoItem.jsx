import { isCanvasTask } from '../util/canvasTask'

function TodoItem({ todo, onDelete, onSelect }) {
  const handleDelete = () => {
    if (window.confirm(`Delete "${todo.title}"?`)) {
      onDelete(todo._id)
    }
  }

  const fromCanvas = isCanvasTask(todo)

  return (
    <div
      className={`todo-item${fromCanvas ? ' canvas-task' : ''}`}
      onClick={() => onSelect(todo, 'view')}
    >
      <div className="todo-content">
        <div className="todo-title">
          {todo.title}
          {fromCanvas && <span className="canvas-task-suffix">[Canvas]</span>}
        </div>
        <div className="todo-date">📅 {todo.date}</div>
      </div>
      <div className="todo-actions">
        <button 
          className="btn-icon btn-edit"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(todo, 'edit')
          }}
          title="Edit"
        >
          ✏️
        </button>
        <button 
          className="btn-icon btn-delete"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default TodoItem

