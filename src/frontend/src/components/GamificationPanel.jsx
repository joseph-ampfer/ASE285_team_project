import './GamificationPanel.css'

function ProgressBar({ value, max }) {
  const percent = Math.min(100, Math.round((value / (max || 1)) * 100))
  return (
    <div className="gp-progress">
      <div className="gp-progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function GamificationPanel({ stats, history, open, onToggle }) {
  const { points, level, streakCount, nextLevelAt } = stats || {}
  const pointsToNext = Math.max(0, (nextLevelAt || 0) - (points || 0))
  const levelFillPercent = Math.min(
    100,
    (nextLevelAt && nextLevelAt > 0)
      ? Math.round(((points || 0) / nextLevelAt) * 100)
      : 0
  )

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
      <button className="gp-toggle" onClick={onToggle}>
        <span
          className="gp-toggle-gauge"
          style={{ height: `${levelFillPercent}%` }}
          aria-hidden
        />
        <span className="gp-toggle-inner">
          <span className="gp-toggle-points-wrap">
            <span className="gp-toggle-points">{points ?? 0}</span>
            <span className="gp-toggle-pt">pt</span>
          </span>
          <span className="gp-toggle-meta">
            Lv.{level ?? 1} · 🔥 {streakCount ?? 0}
          </span>
        </span>
      </button>

      <div className="gp-card">
        <div className="gp-header">
          <div className="gp-level">
            <span className="gp-level-label">Level</span>
            <span className="gp-level-value">Lv. {level ?? 1}</span>
          </div>
          <div className="gp-points">
            <span className="gp-points-value">{points ?? 0} pts</span>
            <span className="gp-points-sub">
              {pointsToNext > 0
                ? `${pointsToNext} pts to next level`
                : 'Max level reached'}
            </span>
          </div>
        </div>

        <ProgressBar value={points || 0} max={nextLevelAt || 100} />

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
                    📅 {event.date} · ✅ {event.completionDay}
                  </span>
                </div>
                <div className="gp-history-points">+{event.gained}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default GamificationPanel

