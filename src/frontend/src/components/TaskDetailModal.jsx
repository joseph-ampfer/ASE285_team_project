function TaskDetailModal({ task, onClose }) {
    if (!task) return null

    // Handle click on overlay to close
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <h3>Task Details</h3>

                <div className="modal-info">
                    <div className="info-group">
                        <span className="modal-label">Title</span>
                        <p className="modal-value">{task.title}</p>
                    </div>

                    <div className="info-group" style={{ marginTop: '1rem' }}>
                        <span className="modal-label">Due Date</span>
                        <p className="modal-value">📅 {task.date}</p>
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
    )
}

export default TaskDetailModal
