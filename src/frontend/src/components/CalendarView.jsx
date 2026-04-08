import { useState } from 'react'
import TaskDetailModal from './TaskDetailModal'
import { isCanvasTask } from '../util/canvasTask'
import { taskStatusModifierClass } from '../util/taskStatus'
import './CalendarView.css'

const CALENDAR_PILL_TITLE_MAX = 14

function truncateCalendarTitle(text, maxLen = CALENDAR_PILL_TITLE_MAX) {
  const s = text == null ? '' : String(text)
  if (s.length <= maxLen) return s
  return `${s.slice(0, maxLen)}···`
}

function CalendarView({ todos, onUpdateTask, onDeleteTask, onAddSubtask, onToggleSubtask }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [modalMode, setModalMode] = useState('view')

    const selectedTask = todos.find(t => t._id === selectedTaskId)

    // Navigation handlers
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const monthName = currentMonth.toLocaleString('default', { month: 'long' })

    // Generate days for the grid
    const days = []
    const daysPrevMonth = daysInMonth(year, month - 1)

    // Padding for start of month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({ day: daysPrevMonth - i, isCurrentMonth: false, date: new Date(year, month - 1, daysPrevMonth - i) })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth(year, month); i++) {
        days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) })
    }

    // Padding for end of month to complete a 6-week grid (42 cells)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) })
    }

    // Helper to check if a task is on a specific date
    const getTasksForDate = (date) => {
        const dateString = date.toISOString().split('T')[0]
        return todos.filter(todo => todo.date === dateString)
    }

    const isToday = (date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    const handleCloseModal = () => setSelectedTaskId(null)

    return (
        <div className="calendar-container">
            <header className="calendar-header">
                <h2>{monthName} {year}</h2>
                <div className="calendar-controls">
                    <button className="btn-nav" onClick={prevMonth}>←</button>
                    <button className="btn-nav" onClick={() => setCurrentMonth(new Date())}>Today</button>
                    <button className="btn-nav" onClick={nextMonth}>→</button>
                </div>
            </header>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(label => (
                    <div key={label} className="calendar-day-label">{label}</div>
                ))}

                {days.map((dayObj, index) => {
                    const tasksForDay = getTasksForDate(dayObj.date)
                    return (
                        <div
                            key={index}
                            className={`calendar-day-cell ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday(dayObj.date) ? 'today' : ''}`}
                        >
                            <span className="day-number">{dayObj.day}</span>
                            <div className="calendar-tasks">
                                {tasksForDay.map(todo => {
                                    const fromCanvas = isCanvasTask(todo)
                                    const statusMod = taskStatusModifierClass(todo.status)
                                    return (
                                    <div
                                        key={todo._id}
                                        className={`task-pill${fromCanvas ? ' canvas-task' : ''}${statusMod ? ` ${statusMod}` : ''}`}
                                        onClick={() => setSelectedTaskId(todo._id)}
                                        title={todo.title}
                                    >
                                        {truncateCalendarTitle(todo.title)}
                                        {fromCanvas && <span className="canvas-task-suffix">[Canvas]</span>}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          mode={modalMode}
          onClose={handleCloseModal}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
        />
      )}
    </div>
  )
}

export default CalendarView
