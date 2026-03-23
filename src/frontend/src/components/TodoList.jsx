import { useState, useEffect } from 'react'
import TodoItem from './TodoItem'
import TaskDetailModal from './TaskDetailModal'

function TodoList({ todos, onEdit, onDelete, onAddSubtask, onToggleSubtask }) {
  const [selectedTask, setSelectedTask] = useState(null)
  
  useEffect(() => {
    if (!selectedTask) return

    const updated = todos.find(t => t._id === selectedTask._id)
    if (updated) setSelectedTask(updated)

  }, [todos])

  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p>No todos yet! Add one above to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem 
            key={todo._id}
            todo={todo}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={() => setSelectedTask(todo)}
          />
        ))}

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
          />
        )}
      </div>
    </>
  )
}

export default TodoList

