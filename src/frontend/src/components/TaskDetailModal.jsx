import { useState } from 'react'
import Portal from './Portal'
import './CalendarView.css'

function TaskDetailModal({
    task,
    mode: initialMode,
    onClose,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
    onAddSubtask,
    onToggleSubtask,
	initialDate
}) {
	const isCreate = !task
	const [mode, setMode] = useState(initialMode)
	const [newSubtask, setNewSubtask] = useState('')
	const today = new Date().toISOString().split('T')[0]

	const [form, setForm] = useState({
		title: task?.title || '',
		date: task?.date || initialDate?.toISOString().split('T')[0] || today,
		description: task?.description || ''
	})

	const handleOverlayClick = (e) => {
		if (e.target.classList.contains('modal-overlay')) onClose()
	}

	const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

	const handleSave = () => {
		if (!form.title.trim() || !form.date) return
		if (isCreate) onAddTask(form)
		else onUpdateTask(task._id, {
			title: form.title,
				date: form.date,
				description: form.description,
				status: form.status
			})
		onClose()
	}

	const handleDelete = () => {
		if (!task?._id) return
		if (window.confirm(`Delete "${task.title}"?`)) {
		onDeleteTask(task._id)
		}
		onClose()
	}

	const handleAddSubtask = () => {
		const title = newSubtask.trim()
		if (!title || !task?._id) return
		onAddSubtask(task._id, title)
		setNewSubtask('')
	}

	const showSubtasks = task?.subtasks?.length > 0 || mode === 'edit'
	const showDescription = isCreate || mode === 'edit' || task?.description?.trim()

	return (
		<Portal>
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal-content">
			<div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h3>{isCreate ? 'Add Task' : 'Task Details'}</h3>
				<div className="modal-header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
				{mode === 'view' && !isCreate && (
					<>
					<button className="btn-icon btn-edit" title="Edit" onClick={() => setMode('edit')}>✏️</button>
					<button className="btn-icon btn-delete" title="Delete" onClick={handleDelete}>🗑️</button>
					</>
				)}
				{(mode === 'edit' || isCreate) && (
					<>
					<button className="btn-icon btn-primary" title="Save" onClick={handleSave}>💾</button>
					<button className="btn-icon btn-secondary" title="Cancel" onClick={() => isCreate ? onClose() : setMode('view')}>❌</button>
					</>
				)}
				</div>
			</div>

			<div className="modal-info" style={{ marginTop: '1rem' }}>
				<div className="info-group">
				<label>
					<span className="modal-label">Title</span>
					{mode === 'view' ? <p className="modal-value">{task?.title}</p> :
						<input value={form.title} onChange={e => handleChange('title', e.target.value)} />}
				</label>
				</div>

				<div className="info-group" style={{ marginTop: '1rem' }}>
				<label>
					<span className="modal-label">Due Date</span>
					{mode === 'view' ? <p className="modal-value">📅 {task?.date}</p> :
						<input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />}
				</label>
				</div>

				{mode === 'view' && (
					<div className="info-group" style={{ marginTop: '1rem' }}>
						<span className="modal-label">Status</span>
						<p className="modal-value" style={{ textTransform: 'capitalize' }}>
							{task?.status?.replace('-', ' ') || 'Todo'}
						</p>
					</div>
				)}

				{showDescription && (
				<div className="info-group" style={{ marginTop: '1rem' }}>
					<label>
					<span className="modal-label">Description</span>
					{mode === 'view' ? <p className="modal-value">{task?.description}</p> :
						<textarea value={form.description} onChange={e => handleChange('description', e.target.value)} />}
					</label>
				</div>
				)}

				{showSubtasks && (
				<div className="info-group" style={{ marginTop: '1rem' }}>
					<span className="modal-label">Subtasks</span>
					<ul className="subtask-list">
					{task?.subtasks?.map(subtask => (
						<li key={subtask.id} className="subtask-item">
						<input
							type="checkbox"
							checked={subtask.completed}
							onChange={() => onToggleSubtask(task._id, subtask.id)}
						/>
						<span className={subtask.completed ? 'completed' : ''}>{subtask.title}</span>
						</li>
					))}
					</ul>

					{mode === 'edit' && !isCreate && (
					<div className="subtask-add" style={{ marginTop: '0.5rem' }}>
						<input
							type="text"
							placeholder="Add subtask..."
							value={newSubtask}
							onChange={e => setNewSubtask(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
						/>
						<button onClick={handleAddSubtask}>Add</button>
					</div>
					)}
				</div>
				)}
			</div>
			</div>
		</div>
		</Portal>
	)
}

export default TaskDetailModal
