import { useState } from 'react'
import TaskDetailModal from './TaskDetailModal'
import './KanbanView.css'
import { KanbanStatus } from '../../../backend/models/Post'
import { isCanvasTask } from '../util/canvasTask'
import { taskStatusModifierClass } from '../util/taskStatus'
import { compareByDueDate, compareKanbanDoneOrder } from '../util/taskSort'
import { isArchivedDoneTask } from '../util/archiveTask'

const COLUMNS = [
    { id: KanbanStatus.TODO, title: 'Todo', emoji: '📥' },
    { id: KanbanStatus.IN_PROGRESS, title: 'In Progress', emoji: '⚡' },
    { id: KanbanStatus.DONE, title: 'Done', emoji: '✅' }
]

function KanbanView({ todos, onEdit, onAdd, onDelete, onAddSubtask, onToggleSubtask }) {
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)
    const [isCreating, setIsCreating] = useState(false)
    const [modalMode, setModalMode] = useState('view')

    const selectedTask = todos.find(t => t._id === selectedTaskId)

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
            onEdit(todo._id, {
                title: todo.title,
                date: todo.date,
                description: todo.description,
                status: columnId
            })
        }
    }
        
    const handleCloseModal = () => {
        setSelectedTaskId(null)
        setIsCreating(false)
        setModalMode('view')
    }

    const handleAddTask = (form) => {
        onAdd(form.title, form.date, form.description)
        handleCloseModal()
    }

    const handleUpdateTask = (id, form) => {
        onEdit(id, {
            title: form.title,
            date: form.date,
            description: form.description,
            status: form.status
        })
        handleCloseModal()
    }

    const handleDeleteTask = (id) => {
        onDelete(id)
        handleCloseModal()
    }

    const getTasksByStatus = (status) => {
        const list = todos.filter((todo) => {
            const st = todo.status || KanbanStatus.TODO
            if (st !== status) return false
            if (status === KanbanStatus.DONE && isArchivedDoneTask(todo)) return false
            return true
        })
        if (status === KanbanStatus.TODO || status === KanbanStatus.IN_PROGRESS) {
            return [...list].sort(compareByDueDate)
        }
        if (status === KanbanStatus.DONE) {
            return [...list].sort(compareKanbanDoneOrder)
        }
        return list
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

                            {column.id === KanbanStatus.TODO && (
                                <button
                                className="btn-add-task"
                                onClick={() => {
                                    setIsCreating(true)
                                    setModalMode('create')
                                }}
                                >
                                ➕ Add Task
                                </button>
                            )}

                            <div className="kanban-tasks">
                                {columnTasks.map((todo, index) => {
                                    const fromCanvas = isCanvasTask(todo)
                                    const statusMod = taskStatusModifierClass(todo.status)
                                    return (
                                    <div
                                        key={todo._id}
                                        className={`kanban-item${fromCanvas ? ' canvas-task' : ''}${statusMod ? ` ${statusMod}` : ''}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, todo._id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedTaskId(todo._id)}
                                    >
                                        {column.id === 'in-progress' && index === 0 && (
                                            <span className="focus-badge">Focus</span>
                                        )}
                                        <div className="kanban-item-title">
                                            {todo.title}
                                            {fromCanvas && <span className="canvas-task-suffix">[Canvas]</span>}
                                        </div>
                                        <div className="kanban-item-footer">
                                            <span>📅 {todo.date}</span>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {(selectedTask || isCreating) && (
                <TaskDetailModal
                    task={selectedTask}
                    mode={isCreating ? 'create' : modalMode}
                    onClose={handleCloseModal}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtask}
                />
            )}
        </div>
    )
}

export default KanbanView
