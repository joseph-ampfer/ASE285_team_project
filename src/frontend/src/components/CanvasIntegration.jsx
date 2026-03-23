import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './CanvasIntegration.css'

const CANVAS_TOKEN_PLACEHOLDER = 'Canvas API Token'
const HELP_TOOLTIP_TEXT =
  'Connect Canvas to automatically add your Canvas assignments to the Todo App. Click this button to learn how to get a Canvas API token.'
const HELP_LINK_URL =
  'https://community.instructure.com/en/kb/articles/662901-how-do-i-manage-api-access-tokens-in-my-user-account'

function CanvasIntegration({ onSyncComplete }) {
  const wrapRef = useRef(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [token, setToken] = useState('')
  const [savedToken, setSavedToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)
  const [message, setMessage] = useState(null)
  const [showHelpTooltip, setShowHelpTooltip] = useState(false)

  const fetchToken = async () => {
    try {
      const res = await axios.get('/api/settings')
      const value = res.data.canvasApiToken ?? ''
      setSavedToken(value)
      setToken(value)
    } catch (err) {
      console.error('Error fetching Canvas token:', err)
    }
  }

  useEffect(() => {
    if (panelOpen) fetchToken()
  }, [panelOpen])

  useEffect(() => {
    if (!panelOpen) return
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setPanelOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [panelOpen])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    setVerifyMessage(null)
    setSyncMessage(null)
    try {
      await axios.put('/api/settings', { canvasApiToken: token })
      setSavedToken(token)
      setMessage('Saved')
    } catch (err) {
      console.error('Error saving Canvas token:', err)
      setMessage('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    setVerifyMessage(null)
    try {
      const res = await axios.get('/api/canvas/verify')
      const name = res.data?.user?.name || res.data?.user?.short_name
      setVerifyMessage(name ? `Connected as ${name}` : 'Connection successful')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Verification failed'
      setVerifyMessage(msg)
    } finally {
      setVerifying(false)
    }
  }

  const handleSyncNow = async () => {
    setSyncing(true)
    setSyncMessage(null)
    setMessage(null)
    setVerifyMessage(null)
    try {
      const res = await axios.post('/api/canvas/sync')
      const { created = 0, updated = 0, courseCount, errors = [], message: apiMsg } = res.data || {}
      let msg = apiMsg || `Synced: ${created} created, ${updated} updated`
      if (!apiMsg) {
        if (courseCount != null) msg += ` (${courseCount} courses)`
        if (errors.length) {
          const errText = errors.map((e) => `${e.course}: ${e.error}`).join('; ')
          msg += `. Issues: ${errText}`
        }
      }
      setSyncMessage(msg)
      if (typeof onSyncComplete === 'function') onSyncComplete()
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Sync failed'
      setSyncMessage(msg)
      console.error('Error syncing Canvas:', err)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="canvas-integration-wrap" ref={wrapRef}>
      <div className="canvas-integration-buttons">
        <div
          className="canvas-integration-help-wrap"
          onMouseEnter={() => setShowHelpTooltip(true)}
          onMouseLeave={() => setShowHelpTooltip(false)}
        >
          {showHelpTooltip && (
            <div className="canvas-integration-help-tooltip" role="tooltip">
              {HELP_TOOLTIP_TEXT}
            </div>
          )}
          <button
            type="button"
            className="canvas-integration-help-btn"
            onClick={() => window.open(HELP_LINK_URL, '_blank', 'noopener,noreferrer')}
            aria-label="How to get Canvas API token"
          >
            ?
          </button>
        </div>
        <button
          type="button"
          className="canvas-integration-btn"
          onClick={() => setPanelOpen(!panelOpen)}
          aria-expanded={panelOpen}
          aria-label="Sync with Canvas settings"
        >
          Sync with Canvas
        </button>
      </div>
      {panelOpen && (
        <div className="canvas-integration-panel" role="dialog" aria-label="Canvas API Token Settings">
          <div className="canvas-integration-row">
            <input
              type="text"
              className="canvas-integration-input"
              placeholder={CANVAS_TOKEN_PLACEHOLDER}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              aria-label="Canvas API Token"
            />
            <button
              type="button"
              className="canvas-integration-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {message && (
            <p className="canvas-integration-message" role="status">
              {message}
            </p>
          )}
          <div className="canvas-integration-actions">
            <button
              type="button"
              className="canvas-integration-verify-btn"
              onClick={handleVerify}
              disabled={verifying || !savedToken?.trim()}
            >
              {verifying ? 'Verifying...' : 'Verify connection'}
            </button>
            <button
              type="button"
              className="canvas-integration-sync-btn"
              onClick={handleSyncNow}
              disabled={syncing || !savedToken?.trim()}
            >
              {syncing ? 'Syncing...' : 'Import from Canvas'}
            </button>
          </div>
          {verifyMessage && (
            <p className="canvas-integration-message canvas-integration-verify-msg" role="status">
              {verifyMessage}
            </p>
          )}
          {syncMessage && (
            <p className="canvas-integration-message canvas-integration-sync-msg" role="status">
              {syncMessage}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CanvasIntegration
