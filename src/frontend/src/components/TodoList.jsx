import TodoItem from './TodoItem'

function TodoList({ todos, onEdit, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p>No todos yet! Add one above to get started.</p>
      </div>
    )
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem 
          key={todo._id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TodoList

