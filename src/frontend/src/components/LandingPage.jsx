import taskflowLogo from '../../assets/taskflow_logo.png'
import taskflowChar from '../../assets/taskflow_char.png'
import './LandingPage.css'

const FEATURES = [
  'Subtask tracking',
  'Powerful Canvas-linked assignment import',
  'Kanban-style workflow',
  'Calendar visualization',
  'Motivation through gamification',
  'Share what you accomplished with a generated image',
]

export default function LandingPage({ onSignIn }) {
  return (
    <div className="landing-page">
      <div className="landing-top-orb" aria-hidden="true" />
      <div className="landing-inner">
        <header className="landing-topbar">
          <h1 className="app-brand-heading">
            <img
              src={taskflowLogo}
              alt=""
              className="app-brand-logo"
              width={40}
              height={40}
            />
            <span className="app-title">TaskFlow</span>
          </h1>
          <button
            type="button"
            className="landing-sign-in"
            onClick={onSignIn}
          >
            Sign in
          </button>
        </header>

        <main className="landing-main">
          <h2 className="landing-hero">Make your Task Flow better</h2>

          <div className="landing-copy">
            <p className="landing-copy-intro">
              Struggling to stay on top of everything you need to do?
              <br />
              Unsure which assignments live in Canvas?
              <br />
              Want to manage all your tasks in one simple place?
            </p>
            <div className="landing-copy-divider" aria-hidden="true" />
            <p className="landing-copy-emphasis">
              Improve your task flow with{' '}
              <span className="landing-copy-brand">TaskFlow</span> today.
            </p>
          </div>

          <ul className="landing-features">
            {FEATURES.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </main>

        <div className="landing-char-wrap" aria-hidden="true">
          <img
            src={taskflowChar}
            alt=""
            className="landing-char"
          />
        </div>
      </div>
    </div>
  )
}
