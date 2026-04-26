import FlaticonIcon from './FlaticonIcon'
import './ThemeToggle.css'

function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light'

  return (
    <div className="theme-toggle-wrap">
      <span className="theme-toggle-label" aria-hidden>
        <FlaticonIcon name="moon" size={16} />
      </span>
      <button
        type="button"
        className={`theme-toggle ${isLight ? 'theme-toggle-on' : ''}`}
        onClick={onToggle}
        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        aria-pressed={isLight}
      >
        <span className="theme-toggle-thumb" />
      </button>
      <span className="theme-toggle-label" aria-hidden>
        <FlaticonIcon name="sun" size={16} />
      </span>
    </div>
  )
}

export default ThemeToggle
