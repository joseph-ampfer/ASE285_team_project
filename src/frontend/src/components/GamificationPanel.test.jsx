import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GamificationPanel from './GamificationPanel'

/**
 * Unit tests for the GamificationPanel UI.
 *
 * Coverage:
 *   R6.2 — View profile → verify points total and current level are displayed,
 *          plus history entries with their gained points.
 */

vi.mock('./GamificationShareModal', () => ({
  default: ({ open }) => (open ? <div data-testid="share-modal" /> : null),
}))
vi.mock('./FlaticonIcon', () => ({
  default: () => null,
}))
vi.mock('./GamificationPanel.css', () => ({}))

const baseStats = {
  points: 250,
  level: 3,
  streakCount: 4,
  nextLevelAt: 300,
  completedLast7Days: 6,
}

const baseHistory = [
  {
    id: 'evt-1',
    title: 'Math HW',
    date: '2026-03-12',
    completionDay: '2026-03-10',
    gained: 18,
    breakdown: { base: 10, earlyBonus: 6, comboBonus: 2, daysEarly: 2 },
  },
  {
    id: 'evt-2',
    title: 'Reading',
    date: '2026-03-09',
    completionDay: '2026-03-09',
    gained: 12,
    breakdown: { base: 10, earlyBonus: 0, comboBonus: 2, daysEarly: 0 },
  },
]

function renderPanel(overrides = {}) {
  const props = {
    stats: baseStats,
    history: baseHistory,
    open: true,
    onToggle: vi.fn(),
    onDeleteHistoryItem: vi.fn(),
    refreshGamification: vi.fn(),
    theme: 'dark',
    ...overrides,
  }
  return { props, ...render(<GamificationPanel {...props} />) }
}

describe('GamificationPanel', () => {
  // ────────────────────────────────────────────────────────────
  // R6.2 — points & level on profile
  // ────────────────────────────────────────────────────────────
  describe('R6.2: profile shows points and level', () => {
    it('renders the user\'s current level', () => {
      renderPanel()
      expect(screen.getByText('Lv. 3')).toBeInTheDocument()
    })

    it('renders the user\'s total points', () => {
      renderPanel()
      expect(screen.getByText('250 points')).toBeInTheDocument()
    })

    it('shows how many points are needed for the next level', () => {
      renderPanel()
      // nextLevelAt 300 - points 250 = 50 to next
      expect(screen.getByText(/50 points to next level/i)).toBeInTheDocument()
    })

    it('renders the streak count alongside the level', () => {
      renderPanel()
      expect(screen.getByText(/4 days/i)).toBeInTheDocument()
    })

    it('falls back to safe defaults when no stats are provided', () => {
      renderPanel({ stats: null, history: [] })
      expect(screen.getByText('Lv. 1')).toBeInTheDocument()
      expect(screen.getByText('0 points')).toBeInTheDocument()
    })

    it('displays "Max level reached" when there are no points to next level', () => {
      renderPanel({
        stats: { ...baseStats, points: 300, nextLevelAt: 300 },
      })
      expect(screen.getByText(/max level reached/i)).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────────
  // History list (visible per-completion gains — implicitly R6.1/R6.3)
  // ────────────────────────────────────────────────────────────
  describe('completion history', () => {
    it('renders each history entry\'s title', () => {
      renderPanel()
      expect(screen.getByText('Math HW')).toBeInTheDocument()
      expect(screen.getByText('Reading')).toBeInTheDocument()
    })

    it('shows the points gained per completion with a "+" prefix', () => {
      renderPanel()
      expect(screen.getByText('+18')).toBeInTheDocument()
      expect(screen.getByText('+12')).toBeInTheDocument()
    })

    it('shows the count of recorded completions', () => {
      renderPanel()
      expect(screen.getByText('2 tasks')).toBeInTheDocument()
    })

    it('shows an empty state when there are no completions yet', () => {
      renderPanel({ history: [] })
      expect(screen.getByText(/no completions yet/i)).toBeInTheDocument()
    })

    it('calls onDeleteHistoryItem when the per-row × button is clicked', async () => {
      const onDeleteHistoryItem = vi.fn().mockResolvedValue(undefined)
      renderPanel({ onDeleteHistoryItem })

      const removeBtns = screen.getAllByLabelText(/delete this history entry/i)
      fireEvent.click(removeBtns[0])

      expect(onDeleteHistoryItem).toHaveBeenCalledWith('evt-1')
    })
  })

  // ────────────────────────────────────────────────────────────
  // Open/close + share modal
  // ────────────────────────────────────────────────────────────
  describe('panel controls', () => {
    it('calls onToggle when the gauge button is clicked', () => {
      const onToggle = vi.fn()
      renderPanel({ onToggle })

      // The "X pts" button is the toggle
      fireEvent.click(screen.getByText('250').closest('button'))

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('does not show the share modal until Share is clicked', () => {
      renderPanel()
      expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument()
    })

    it('opens the share modal and refreshes stats when Share is clicked', async () => {
      const refreshGamification = vi.fn().mockResolvedValue(undefined)
      renderPanel({ refreshGamification })

      fireEvent.click(screen.getByRole('button', { name: /^share$/i }))

      // refreshGamification is awaited before the modal opens
      expect(refreshGamification).toHaveBeenCalledTimes(1)
      // Wait for the awaited refresh + state update to flush
      await waitFor(() => {
        expect(screen.getByTestId('share-modal')).toBeInTheDocument()
      })
    })
  })
})
