import { useState } from 'react'
import Portal from './Portal'
import './CalendarView.css'

function TaskDetailModal({ task, onClose, onAddSubtask, onToggleSubtask }) {
    if (!task) return null

    // Handle click on overlay to close
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose()
        }
    }

    const handleAddSubtask = () => {
        const title = newSubtask.trim()
        if (!title) return

        onAddSubtask(task._id, title)
        setNewSubtask('')
    }

    const [newSubtask, setNewSubtask] = useState('')

    return (
        <Portal>
            <div className="modal-overlay" onClick={handleOverlayClick}>
                <div className="modal-content">
                    <h3>Task Details</h3>

                    <div className="modal-info">
                        <div className="info-group">
                            <span className="modal-label">Title</span>
                            <p className="modal-value">{task.title}</p>
                        </div>

                        <div className="info-group" style={{ marginTop: '1rem' }}>
                            <span className="modal-label">Status</span>
                            <p className="modal-value" style={{ textTransform: 'capitalize' }}>
                                {task.status?.replace('-', ' ') || 'Todo'}
                            </p>
                        </div>

                        <div className="info-group" style={{ marginTop: '1rem' }}>
                            <span className="modal-label">Due Date</span>
                            <p className="modal-value">📅 {task.date}</p>
                        </div>

                        {task.description && task.description.trim() !== '' && (
                            <div className="info-group" style={{ marginTop: '1rem' }}>
                                <span className="modal-label">Description</span>
                                <p className="modal-value">{task.description}</p>
                            </div>
                        )}
                        
                        {task.subtasks && task.subtasks.length > 0 && (
                            <div className="info-group" style={{ marginTop: '1rem' }}>
                                <span className="modal-label">Subtasks</span>

                                <ul className="subtask-list">
                                {task.subtasks.map(subtask => (
                                    <li key={subtask.id} className="subtask-item">
                                    <input
                                        type="checkbox"
                                        checked={subtask.completed}
                                        onChange={() => onToggleSubtask(task._id, subtask.id)}
                                    />
                                    <span className={subtask.completed ? 'completed' : ''}>
                                        {subtask.title}
                                    </span>
                                    </li>
                                ))}
                                </ul>

                            </div>
                        )}
                        <div className="subtask-add">
                            <input
                                type="text"
                                placeholder="Add subtask..."
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddSubtask()
                                }}
                            />
                            <button onClick={handleAddSubtask}>Add</button>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-close"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Portal>
    )
}

export default TaskDetailModal
