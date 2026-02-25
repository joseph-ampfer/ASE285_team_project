import { useState } from 'react'
import TaskDetailModal from './TaskDetailModal'
import './KanbanView.css'

const COLUMNS = [
    { id: 'todo', title: 'Start', emoji: '📥' },
    { id: 'in-progress', title: 'In Progress', emoji: '⚡' },
    { id: 'done', title: 'Completed', emoji: '✅' }
]

function KanbanView({ todos, onUpdateTodo }) {
    const [selectedTask, setSelectedTask] = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)

    const handleDragStart = (e, todoId) => {
        e.dataTransfer.setData('todoId', todoId)
        // Add a class for visual feedback
        e.currentTarget.classList.add('dragging')
    }

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging')
        setDragOverColumn(null)
    }

    const handleDragOver = (e, columnId) => {
        e.preventDefault()
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId)
        }
    }

    const handleDrop = (e, columnId) => {
        e.preventDefault()
        const todoId = parseInt(e.dataTransfer.getData('todoId'), 10)
        setDragOverColumn(null)

        const todo = todos.find(t => t._id === todoId)
        if (todo && todo.status !== columnId) {
            onUpdateTodo(todo._id, todo.title, todo.date, todo.description, columnId)
        }
    }

    const getTasksByStatus = (status) => {
        return todos.filter(todo => (todo.status || 'todo') === status)
    }

    return (
        <div className="kanban-container">
            <div className="kanban-board">
                {COLUMNS.map(column => {
                    const columnTasks = getTasksByStatus(column.id)
                    return (
                        <div
                            key={column.id}
                            className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDrop={(e) => handleDrop(e, column.id)}
                            onDragLeave={() => setDragOverColumn(null)}
                        >
                            <h3>
                                <span>{column.emoji} {column.title}</span>
                                <span className="column-count">{columnTasks.length}</span>
                            </h3>

                            <div className="kanban-tasks">
                                {columnTasks.map((todo, index) => (
                                    <div
                                        key={todo._id}
                                        className="kanban-item"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, todo._id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedTask(todo)}
                                    >
                                        {column.id === 'in-progress' && index === 0 && (
                                            <span className="focus-badge">Focus</span>
                                        )}
                                        <div className="kanban-item-title">{todo.title}</div>
                                        <div className="kanban-item-footer">
                                            <span>📅 {todo.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    )
}

export default KanbanView
