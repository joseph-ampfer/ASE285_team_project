import { useState, useEffect, useMemo, useCallback } from 'react'
import TodoItem from './TodoItem'
import TaskDetailModal from './TaskDetailModal'
import FlaticonIcon from './FlaticonIcon'
import { KanbanStatus } from '../../../backend/models/Post'
import { isCanvasTask } from '../util/canvasTask'
import { isArchivedDoneTask } from '../util/archiveTask'
import { compareByDueDate, compareDoneRecentFirst } from '../util/taskSort'

const GROUP_LABELS = [
  { status: KanbanStatus.IN_PROGRESS, title: 'In progress', icon: 'pending' },
  { status: KanbanStatus.TODO, title: 'To do', icon: 'todo' },
  { status: KanbanStatus.DONE, title: 'Done', icon: 'doneCheckbox' },
]

function TodoList({
  todos,
  onAdd,
  onEdit,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  listGroupByStatus = false,
  listShowCanvas = true,
  listShowNonCanvas = true,
  onCompleteBurst,
}) {
  const [selectedTask, setSelectedTask] = useState(null)
  const [modalMode, setModalMode] = useState('view')
  const [isCreating, setIsCreating] = useState(false)
  const [archiveExpanded, setArchiveExpanded] = useState(false)
  const [dragOverGroupStatus, setDragOverGroupStatus] = useState(null)

  const handleAddTask = (form) => {
    onAdd(form.title, form.date, form.description)
  }

  const handleUpdateTask = (id, form) => {
    onEdit(id, {
      title: form.title,
      date: form.date,
      description: form.description,
      status: form.status,
    })
  }

  useEffect(() => {
    if (!selectedTask) return;
    const updated = todos.find((t) => t._id === selectedTask._id);
    if (updated) setSelectedTask(updated);
  }, [todos, selectedTask]);

  const passesCanvasFilter = useCallback(
    (todo) => {
      const c = isCanvasTask(todo)
      if (c && !listShowCanvas) return false
      if (!c && !listShowNonCanvas) return false
      return true
    },
    [listShowCanvas, listShowNonCanvas]
  );

  const { filteredArchived, filteredActive } = useMemo(() => {
    const arch = todos.filter(isArchivedDoneTask)
    const active = todos.filter((t) => !isArchivedDoneTask(t))
    return {
      filteredArchived: arch.filter(passesCanvasFilter),
      filteredActive: active.filter(passesCanvasFilter),
    }
  }, [todos, passesCanvasFilter]);

  const closeModal = () => {
    setSelectedTask(null)
    setIsCreating(false)
    setModalMode('view')
  };

  const openTask = (task, mode) => {
    setSelectedTask(task)
    setModalMode(mode)
  };

  const renderTodoItems = (list) =>
    list.map((todo) => (
      <TodoItem
        key={todo._id}
        todo={todo}
        onDelete={onDelete}
        onSelect={openTask}
      />
    ));


  const handleListDragStart = (e, todoId) => {
    e.dataTransfer.setData('todoId', String(todoId))
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.classList.add('dragging')
  }

  const handleListDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
    setDragOverGroupStatus(null)
  }

  const handleGroupDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverGroupStatus !== status) setDragOverGroupStatus(status)
  }

  const handleGroupDrop = (e, targetStatus) => {
    e.preventDefault()
    setDragOverGroupStatus(null)
    const todoId = e.dataTransfer.getData('todoId')
    if (!todoId) return
    const todo = todos.find((t) => String(t._id) === todoId)
    if (!todo || isArchivedDoneTask(todo)) return
    const current = todo.status || KanbanStatus.TODO
    if (current === targetStatus) return
    if (targetStatus === KanbanStatus.DONE && onCompleteBurst) {
      onCompleteBurst(e.clientX, e.clientY)
    }
    onEdit(todo._id, {
      title: todo.title,
      date: todo.date,
      description: todo.description,
      status: targetStatus,
    })
  }

  const sortedFlat = useMemo(
    () => [...filteredActive].sort(compareByDueDate),
    [filteredActive]
  )

  const groupedSections = useMemo(() => {
    return GROUP_LABELS.map(({ status, title, icon }) => {
      const raw = filteredActive.filter(
        (t) => (t.status || KanbanStatus.TODO) === status
      )
      const sorted =
        status === KanbanStatus.DONE
          ? [...raw].sort(compareDoneRecentFirst)
          : [...raw].sort(compareByDueDate)
      return { status, title, icon, items: sorted }
    })
  }, [filteredActive])

  const archivedSorted = useMemo(
    () => [...filteredArchived].sort(compareDoneRecentFirst),
    [filteredArchived]
  )

  const showFilterEmpty =
    todos.length > 0 &&
    filteredActive.length === 0 &&
    filteredArchived.length === 0

  return (
    <div className="todo-list">
      <button type="button" onClick={() => setIsCreating(true)}>
        <span className="inline-with-icon">
          <FlaticonIcon name="plus" size={18} />
          Add Task
        </span>
      </button>

      {todos.length === 0 && (
        <div className="todo-list-empty">
          <p>No todos yet! Add one above to get started.</p>
        </div>
      )}

      {showFilterEmpty && (
        <div className="todo-list-empty todo-list-filter-empty">
          <p>No tasks match the current filters.</p>
        </div>
      )}

      {!showFilterEmpty && todos.length > 0 && !listGroupByStatus && (
        <div className="todo-list-main">{renderTodoItems(sortedFlat)}</div>
      )}

      {!showFilterEmpty && todos.length > 0 && listGroupByStatus && (
        <div className="todo-list-main todo-list-grouped">
          {groupedSections.map(({ status, title, icon, items }) => (
            <section
              key={status}
              className={`list-status-group${
                dragOverGroupStatus === status ? ' drag-over' : ''
              }`}
              onDragOver={(e) => handleGroupDragOver(e, status)}
              onDrop={(e) => handleGroupDrop(e, status)}
              onDragLeave={() => setDragOverGroupStatus(null)}
            >
              <h3 className="list-status-group-title">
                <FlaticonIcon name={icon} size={16} />
                {title}
              </h3>
              <div className="list-status-group-items">
                {items.length === 0 ? (
                  <div className="list-status-group-empty">Drop tasks here</div>
                ) : (
                  items.map((todo) => (
                    <TodoItem
                      key={todo._id}
                      todo={todo}
                      onDelete={onDelete}
                      onSelect={openTask}
                      listDraggable
                      onListDragStart={handleListDragStart}
                      onListDragEnd={handleListDragEnd}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {filteredArchived.length > 0 && (
        <div className="list-archive">
          <button
            type="button"
            className="list-archive-header"
            onClick={() => setArchiveExpanded((v) => !v)}
            aria-expanded={archiveExpanded}
          >
            <span className="list-archive-chevron" aria-hidden>
              {archiveExpanded ? '▼' : '▶'}
            </span>
            Archived ({filteredArchived.length})
          </button>
          {archiveExpanded && (
            <div className="list-archive-body">
              {renderTodoItems(archivedSorted)}
            </div>
          )}
        </div>
      )}

      {(selectedTask || isCreating) && (
        <TaskDetailModal
          task={selectedTask}
          mode={isCreating ? 'create' : modalMode}
          onClose={closeModal}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={onDelete}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
        />
      )}
    </div>
  )
}

export default TodoList
