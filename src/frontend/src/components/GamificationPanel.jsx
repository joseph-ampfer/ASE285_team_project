import { useState } from 'react'
import GamificationShareModal from './GamificationShareModal'
import FlaticonIcon from './FlaticonIcon'
import './GamificationPanel.css'

function ProgressBar({ value, max }) {
  const percent = Math.min(100, Math.round((value / (max || 1)) * 100))
  return (
    <div className="gp-progress">
      <div className="gp-progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function GamificationPanel({
  stats,
  history,
  open,
  onToggle,
  onDeleteHistoryItem,
  theme = 'dark',
  refreshGamification,
}) {
  const [deletingId, setDeletingId] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const { points, level, streakCount, nextLevelAt } = stats || {}
  const pointsToNext = Math.max(0, (nextLevelAt || 0) - (points || 0))
  const levelStartAt = Math.max(0, (nextLevelAt || 100) - 100)
  const levelSpan = Math.max(1, (nextLevelAt || 100) - levelStartAt)
  const pointsInLevel = Math.max(0, (points || 0) - levelStartAt)
  const levelFillPercent = Math.min(
    100,
    (levelSpan > 0)
      ? Math.round((pointsInLevel / levelSpan) * 100)
      : 0
  )

  const openShare = async () => {
    await refreshGamification?.()
    setShareOpen(true)
  }

  const handleDeleteHistory = async (eventId, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onDeleteHistoryItem || deletingId) return
    setDeletingId(eventId)
    try {
      await onDeleteHistoryItem(eventId)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {open && (
        <button
          type="button"
          className="gp-backdrop"
          aria-label="Close"
          onClick={onToggle}
        />
      )}
      <div className={`gp-root ${open ? 'gp-open' : ''}`}>
      <div className="gp-column">
        <button type="button" className="gp-toggle" onClick={onToggle}>
          <span
            className="gp-toggle-gauge"
            style={{ height: `${levelFillPercent}%` }}
            aria-hidden
          />
          <span className="gp-toggle-inner">
            <span className="gp-toggle-points-wrap">
              <span className="gp-toggle-points">{points ?? 0}</span>
              <span className="gp-toggle-pt">pts</span>
            </span>
            <span className="gp-toggle-meta">
              Lv.{level ?? 1} · 🔥 {streakCount ?? 0}
            </span>
          </span>
        </button>
        <button type="button" className="gp-share-trigger" onClick={openShare}>
          Share
        </button>
      </div>

      <div className="gp-card">
        <div className="gp-header">
          <div className="gp-level">
            <span className="gp-level-value">Lv. {level ?? 1}</span>
          </div>
          <div className="gp-points">
            <span className="gp-points-value">{points ?? 0} points</span>
            <span className="gp-points-sub">
              {pointsToNext > 0
                ? `${pointsToNext} points to next level`
                : 'Max level reached'}
            </span>
          </div>
        </div>

        <ProgressBar value={pointsInLevel} max={levelSpan} />

        <div className="gp-streak">
          <span>🔥 Streak</span>
          <span className="gp-streak-value">{streakCount ?? 0} days</span>
        </div>

        <div className="gp-history">
          <div className="gp-history-header">
            <span>Completion History</span>
            <span className="gp-history-count">
              {history?.length ? `${history.length} tasks` : 'No completions yet'}
            </span>
          </div>
          <div className="gp-history-list">
            {history?.map((event) => (
              <div key={event.id} className="gp-history-item">
                <div className="gp-history-main">
                  <span className="gp-history-title">{event.title}</span>
                  <span className="gp-history-date">
                    <span className="inline-with-icon">
                      <FlaticonIcon name="calendar" size={13} />
                      {event.date}
                    </span>
                    <span aria-hidden> · </span>
                    <span className="inline-with-icon">
                      <FlaticonIcon name="doneCheckbox" size={13} />
                      {event.completionDay}
                    </span>
                  </span>
                </div>
                <div className="gp-history-right">
                  <div className="gp-history-points">+{event.gained}</div>
                  {onDeleteHistoryItem && (
                    <button
                      type="button"
                      className="gp-history-remove"
                      aria-label="Delete this history entry"
                      disabled={deletingId === event.id}
                      onClick={(e) => handleDeleteHistory(event.id, e)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      <GamificationShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        stats={stats}
        theme={theme}
      />
    </>
  )
}

export default GamificationPanel

