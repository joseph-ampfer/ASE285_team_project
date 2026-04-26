import { useEffect, useMemo } from 'react'
import './CompletionBurst.css'

const PARTICLE_COUNT = 20
/** delay time before motion starts */
const BURST_START_OFFSET_MS = 200

const PALETTE = [
  '#fbbf24',
  '#34d399',
  '#60a5fa',
  '#f472b6',
  '#fde047',
  '#a7f3d0',
  '#38bdf8',
  '#c4b5fd',
]

function CompletionBurst({ x, y, onDone }) {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const baseAngle = (Math.PI * 2 * i) / PARTICLE_COUNT
      const angle = baseAngle + (Math.random() - 0.5) * 0.55
      const dist = 88 + Math.random() * 132
      const tx = Math.cos(angle) * dist
      const ty = Math.sin(angle) * dist
      const size = 6 + Math.random() * 9
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      const delay = Math.random() * 45
      return { tx, ty, size, color, delay }
    })
  }, [])

  useEffect(() => {
    const id = window.setTimeout(
      onDone,
      BURST_START_OFFSET_MS + 1120
    )
    return () => window.clearTimeout(id)
  }, [onDone])

  return (
    <div className="completion-burst" style={{ left: x, top: y }} aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="completion-burst__dot"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--size': `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 ${Math.max(2, p.size * 0.6)}px ${p.color}`,
            animationDelay: `${BURST_START_OFFSET_MS + p.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default CompletionBurst
