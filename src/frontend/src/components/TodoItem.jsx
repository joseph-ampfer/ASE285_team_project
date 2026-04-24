import { isCanvasTask } from '../util/canvasTask'
import { taskStatusModifierClass } from '../util/taskStatus'
import FlaticonIcon from './FlaticonIcon'

function TodoItem({
  todo,
  onDelete,
  onSelect,
  listDraggable = false,
  onListDragStart,
  onListDragEnd,
}) {
  const handleDelete = () => {
    if (window.confirm(`Delete "${todo.title}"?`)) {
      onDelete(todo._id)
    }
  }

  const fromCanvas = isCanvasTask(todo)
  const statusMod = taskStatusModifierClass(todo.status)

  return (
    <div
      className={`todo-item${fromCanvas ? ' canvas-task' : ''}${statusMod ? ` ${statusMod}` : ''}${listDraggable ? ' todo-item--list-draggable' : ''}`}
      draggable={listDraggable}
      onDragStart={
        listDraggable && onListDragStart
          ? (e) => onListDragStart(e, todo._id)
          : undefined
      }
      onDragEnd={listDraggable ? onListDragEnd : undefined}
      onClick={() => onSelect(todo, 'view')}
    >
      <div className="todo-content">
        <div className="todo-title">
          {todo.title}
          {fromCanvas && <span className="canvas-task-suffix">[Canvas]</span>}
        </div>
        <div className="todo-date">
          <FlaticonIcon name="calendar" size={15} />
          {todo.date}
        </div>
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
          <FlaticonIcon name="pencil" size={18} variant="toolbar" />
        </button>
        <button 
          className="btn-icon btn-delete"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          title="Delete"
        >
          <FlaticonIcon name="trash" size={18} variant="toolbar" />
        </button>
      </div>
    </div>
  )
}

export default TodoItem

