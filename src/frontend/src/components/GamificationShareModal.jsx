import { useLayoutEffect, useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  drawGamificationShareCard,
  SHARE_CARD_WIDTH,
  SHARE_CARD_HEIGHT,
} from '../util/gamificationShareImage'
import taskflowLogo from '../../assets/taskflow_logo.png'
import './GamificationShareModal.css'

function GamificationShareModal({ open, onClose, stats, theme }) {
  const canvasRef = useRef(null)
  const [logoImage, setLogoImage] = useState(null)

  useEffect(() => {
    if (!open) {
      setLogoImage(null)
      return
    }
    const img = new Image()
    img.onload = () => setLogoImage(img)
    img.onerror = () => setLogoImage(null)
    img.src = taskflowLogo
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [open])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !open) return
    drawGamificationShareCard(
      canvas,
      {
        level: stats?.level ?? 1,
        points: stats?.points ?? 0,
        streakCount: stats?.streakCount ?? 0,
        completedLast7Days: stats?.completedLast7Days ?? 0,
        nextLevelAt: stats?.nextLevelAt,
      },
      theme || 'dark',
      logoImage
    )
  }, [open, stats, theme, logoImage])

  useLayoutEffect(() => {
    redraw()
  }, [redraw])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    redraw()
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `taskflow-gamification-${new Date().toISOString().slice(0, 10)}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  if (!open) return null

  return createPortal(
    <div
      className="gp-share-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="gp-share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gp-share-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="gp-share-title" className="gp-share-title">
          Share
        </h2>
        <p className="gp-share-hint">Preview</p>
        <div className="gp-share-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="gp-share-canvas"
            width={SHARE_CARD_WIDTH}
            height={SHARE_CARD_HEIGHT}
            aria-hidden
          />
        </div>
        <button type="button" className="gp-share-save" onClick={handleSave}>
          Save image
        </button>
        <button type="button" className="gp-share-close" onClick={onClose} aria-label="Close">
          Close
        </button>
      </div>
    </div>,
    document.body
  )
}

export default GamificationShareModal
