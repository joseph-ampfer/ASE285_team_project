export const SHARE_CARD_WIDTH = 1080
export const SHARE_CARD_HEIGHT = SHARE_CARD_WIDTH

const LOGO_LEFT = 72
const LOGO_SIZE = 72
const HEADER_ROW_TOP = 56

function drawXpBar(ctx, x, y, w, h, fillRatio, theme) {
  const isLight = theme === 'light'
  const r = h / 2
  ctx.save()
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(15, 23, 42, 0.92)'
  ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(148, 163, 184, 0.35)'
  ctx.lineWidth = 2
  ctx.fill()
  ctx.stroke()

  const innerPad = 3
  const innerW = Math.max(0, w - innerPad * 2)
  const innerH = Math.max(0, h - innerPad * 2)
  const fillW = Math.max(0, innerW * Math.min(1, Math.max(0, fillRatio)))
  if (fillW > 1) {
    const g = ctx.createLinearGradient(x + innerPad, 0, x + innerPad + fillW, 0)
    g.addColorStop(0, '#00d9ff')
    g.addColorStop(1, '#00ff88')
    ctx.fillStyle = g
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x + innerPad, y + innerPad, fillW, innerH, innerH / 2)
    } else {
      ctx.rect(x + innerPad, y + innerPad, fillW, innerH)
    }
    ctx.fill()
  }
  ctx.restore()
}

function drawStatBlock(ctx, label, value, x, y, w, h, theme) {
  const isLight = theme === 'light'
  ctx.save()
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 20)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.fillStyle = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.55)'
  ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(148,163,184,0.35)'
  ctx.lineWidth = 2
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8'
  ctx.font = '28px system-ui, "Segoe UI", sans-serif'
  ctx.fillText(label, x + 32, y + 40)
  ctx.fillStyle = isLight ? '#0f172a' : '#f1f5f9'
  ctx.font = 'bold 52px system-ui, "Segoe UI", sans-serif'
  const valueBaseline = y + h - 44
  ctx.fillText(value, x + 32, valueBaseline)
  ctx.restore()
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{
 *   level: number,
 *   points: number,
 *   streakCount: number,
 *   completedLast7Days: number,
 *   nextLevelAt?: number,
 * }} data
 * @param {'dark' | 'light'} theme
 * @param {HTMLImageElement | null} logo
 */
export function drawGamificationShareCard(canvas, data, theme = 'dark', logo = null) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { level, points, streakCount, completedLast7Days, nextLevelAt: rawNext } = data
  const isLight = theme === 'light'
  const lv = level ?? 1
  const pts = points ?? 0
  const nextLevelAt = rawNext != null && rawNext > 0 ? rawNext : lv * 100
  const levelStartAt = Math.max(0, nextLevelAt - 100)
  const levelSpan = Math.max(1, nextLevelAt - levelStartAt)
  const pointsInLevel = Math.max(0, pts - levelStartAt)
  const xpFillRatio = pointsInLevel / levelSpan

  canvas.width = SHARE_CARD_WIDTH
  canvas.height = SHARE_CARD_HEIGHT

  const bg = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)
  if (isLight) {
    bg.addColorStop(0, '#f8fafc')
    bg.addColorStop(0.45, '#e2e8f0')
    bg.addColorStop(1, '#cbd5e1')
  } else {
    bg.addColorStop(0, '#020617')
    bg.addColorStop(0.4, '#0f172a')
    bg.addColorStop(1, '#1e1b4b')
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)

  const glow = ctx.createRadialGradient(
    SHARE_CARD_WIDTH * 0.82,
    SHARE_CARD_HEIGHT * 0.18,
    0,
    SHARE_CARD_WIDTH * 0.82,
    SHARE_CARD_HEIGHT * 0.18,
    Math.min(SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT) * 0.42
  )
  glow.addColorStop(0, isLight ? 'rgba(16,158,146,0.25)' : 'rgba(0,217,255,0.18)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)

  if (logo && logo.complete && logo.naturalWidth > 0) {
    ctx.drawImage(logo, LOGO_LEFT, HEADER_ROW_TOP, LOGO_SIZE, LOGO_SIZE)
  }

  const titleX = LOGO_LEFT + LOGO_SIZE + 18
  ctx.fillStyle = isLight ? '#0d9488' : '#5eead4'
  ctx.font = 'bold 44px system-ui, "Segoe UI", sans-serif'
  ctx.fillText('TaskFlow', titleX, HEADER_ROW_TOP + 50)

  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8'
  ctx.font = '30px system-ui, "Segoe UI", sans-serif'
  ctx.fillText('My progress', 72, 165)

  const levelText = `Lv.${lv}`
  const levelBaseline = 325
  const grad = ctx.createLinearGradient(72, 0, 420, 0)
  grad.addColorStop(0, '#00d9ff')
  grad.addColorStop(1, '#00ff88')
  ctx.fillStyle = grad
  ctx.font = 'bold 118px system-ui, "Segoe UI", sans-serif'
  ctx.fillText(levelText, 72, levelBaseline)
  const levelTextWidth = ctx.measureText(levelText).width

  const barGap = 36
  const barX = 72 + levelTextWidth + barGap
  const barW = Math.max(120, SHARE_CARD_WIDTH - 72 - barX)
  const barH = 40
  const barY = levelBaseline - 58
  drawXpBar(ctx, barX, barY, barW, barH, xpFillRatio, theme)

  const colW = SHARE_CARD_WIDTH - 144
  let rowY = 432
  const rowH = 150
  const gap = 18

  drawStatBlock(
    ctx,
    'Points',
    `${pts}`,
    72,
    rowY,
    colW,
    rowH,
    theme
  )
  rowY += rowH + gap
  drawStatBlock(
    ctx,
    'Streak',
    `${streakCount ?? 0} days`,
    72,
    rowY,
    colW,
    rowH,
    theme
  )

  const doneCount = completedLast7Days ?? 0
  const taskWord = doneCount === 1 ? 'task' : 'tasks'
  const weekLine = `You completed ${doneCount} ${taskWord} this week!`

  ctx.font = '600 56px system-ui, "Segoe UI", sans-serif'
  ctx.fillStyle = isLight ? '#0d9488' : '#5eead4'
  ctx.fillText(weekLine, 72, SHARE_CARD_HEIGHT - 200)
}
