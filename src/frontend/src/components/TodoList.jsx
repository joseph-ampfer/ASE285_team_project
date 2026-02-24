import { useState } from 'react'
import TodoItem from './TodoItem'
import TaskDetailModal from './TaskDetailModal'

function TodoList({ todos, onEdit, onDelete }) {
  const [selectedTask, setSelectedTask] = useState(null)

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
          />
        )}
      </div>
    </>
  )
}

export default TodoList

