import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import CanvasIntegration from './CanvasIntegration'

/**
 * Frontend unit tests for the CanvasIntegration UI.
 *
 * Coverage:
 *   R5.1 — User enters Canvas API token → success message is shown
 *   R5.2 — User clicks "Import from Canvas" → import result is shown
 *
 * `axios` and CSS are mocked so the component is tested in isolation.
 */

vi.mock('axios')
vi.mock('./CanvasIntegration.css', () => ({}))

describe('CanvasIntegration', () => {
  let onSyncComplete

  beforeEach(() => {
    onSyncComplete = vi.fn()
    // Default: user has no saved token until the panel opens
    axios.get.mockResolvedValue({ data: { canvasApiToken: '' } })
    axios.put.mockResolvedValue({ data: { canvasApiToken: '' } })
    axios.post.mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────────
  // Panel toggle / initial render
  // ────────────────────────────────────────────────────────────
  it('renders the Sync with Canvas button', () => {
    render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
    expect(
      screen.getByRole('button', { name: /sync with canvas settings/i })
    ).toBeInTheDocument()
  })

  it('does not show the token input until the panel is opened', () => {
    render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
    expect(screen.queryByPlaceholderText('Canvas API Token')).not.toBeInTheDocument()
  })

  it('opens the settings panel and loads the saved token', async () => {
    axios.get.mockResolvedValue({ data: { canvasApiToken: 'saved-token' } })

    render(<CanvasIntegration onSyncComplete={onSyncComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/settings')
    })

    const input = await screen.findByPlaceholderText('Canvas API Token')
    await waitFor(() => {
      expect(input).toHaveValue('saved-token')
    })
  })

  // ────────────────────────────────────────────────────────────
  // R5.1 — Connect Canvas account
  // ────────────────────────────────────────────────────────────
  describe('R5.1: Connect Canvas account', () => {
    it('saves the token and shows a success message that includes the user name', async () => {
      axios.put.mockResolvedValue({ data: { canvasApiToken: 'tok-123' } })
      axios.get
        .mockResolvedValueOnce({ data: { canvasApiToken: '' } }) // initial fetch
        .mockResolvedValueOnce({ data: { ok: true, user: { name: 'Naeun Kim' } } }) // verify

      render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))

      const input = await screen.findByPlaceholderText('Canvas API Token')
      fireEvent.change(input, { target: { value: 'tok-123' } })

      fireEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('/api/settings', {
          canvasApiToken: 'tok-123',
        })
      })
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/canvas/verify')
      })

      expect(
        await screen.findByText(/connected as naeun kim/i)
      ).toBeInTheDocument()
    })

    it('shows a "Save failed" message when the save request errors', async () => {
      axios.put.mockRejectedValue(new Error('boom'))

      render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))

      const input = await screen.findByPlaceholderText('Canvas API Token')
      fireEvent.change(input, { target: { value: 'bad' } })
      fireEvent.click(screen.getByRole('button', { name: /verify/i }))

      expect(await screen.findByText(/save failed/i)).toBeInTheDocument()
      // We never reached the verify step because saving threw
      expect(axios.get).not.toHaveBeenCalledWith('/api/canvas/verify')
    })

    it('surfaces the verify error message when the token fails Canvas verification', async () => {
      axios.put.mockResolvedValue({ data: { canvasApiToken: 'tok' } })
      axios.get.mockResolvedValueOnce({ data: { canvasApiToken: '' } })
      // verify call fails
      const verifyErr = Object.assign(new Error('Bad token'), {
        response: { data: { error: 'Canvas API 401' } },
      })
      axios.get.mockRejectedValueOnce(verifyErr)

      render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))

      const input = await screen.findByPlaceholderText('Canvas API Token')
      fireEvent.change(input, { target: { value: 'tok' } })
      fireEvent.click(screen.getByRole('button', { name: /verify/i }))

      expect(await screen.findByText(/canvas api 401/i)).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────────
  // R5.2 — Import from Canvas (button kicks off /api/canvas/sync)
  // ────────────────────────────────────────────────────────────
  describe('R5.2: Import from Canvas', () => {
    it('disables Import button when no token is saved yet', async () => {
      axios.get.mockResolvedValue({ data: { canvasApiToken: '' } })

      render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))

      const importBtn = await screen.findByRole('button', { name: /import from canvas/i })
      expect(importBtn).toBeDisabled()
    })

    it('imports assignments and renders a result message including counts', async () => {
      axios.get.mockResolvedValue({ data: { canvasApiToken: 'saved' } })
      axios.post.mockResolvedValue({
        data: {
          created: 3,
          skipped: 1,
          assignmentCount: 4,
          courseCount: 2,
        },
      })

      render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))

      const importBtn = await screen.findByRole('button', { name: /import from canvas/i })
      // Wait for the saved token to load so the button enables
      await waitFor(() => expect(importBtn).not.toBeDisabled())

      fireEvent.click(importBtn)

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/canvas/sync')
      })

      const msg = await screen.findByText(/imported 3 new/i)
      expect(msg).toBeInTheDocument()
      expect(msg.textContent).toMatch(/4 future\/incomplete/i)
      expect(msg.textContent).toMatch(/2 course\(s\)/i)

      expect(onSyncComplete).toHaveBeenCalledTimes(1)
    })

    it('shows the API error message if sync fails', async () => {
      axios.get.mockResolvedValue({ data: { canvasApiToken: 'saved' } })
      const err = Object.assign(new Error('Server'), {
        response: { data: { error: 'Canvas API 500' } },
      })
      axios.post.mockRejectedValue(err)

      render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))
      const importBtn = await screen.findByRole('button', { name: /import from canvas/i })
      await waitFor(() => expect(importBtn).not.toBeDisabled())

      fireEvent.click(importBtn)

      expect(await screen.findByText(/canvas api 500/i)).toBeInTheDocument()
      expect(onSyncComplete).not.toHaveBeenCalled()
    })

    it('renders the friendly "no matching assignments" message from the backend', async () => {
      axios.get.mockResolvedValue({ data: { canvasApiToken: 'saved' } })
      axios.post.mockResolvedValue({
        data: {
          created: 0,
          skipped: 0,
          assignmentCount: 0,
          courseCount: 0,
          message: 'No matching assignments in the planner window.',
        },
      })

      render(<CanvasIntegration onSyncComplete={onSyncComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /sync with canvas settings/i }))
      const importBtn = await screen.findByRole('button', { name: /import from canvas/i })
      await waitFor(() => expect(importBtn).not.toBeDisabled())

      fireEvent.click(importBtn)

      expect(
        await screen.findByText(/no matching assignments/i)
      ).toBeInTheDocument()
    })
  })
})
