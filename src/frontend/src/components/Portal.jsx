import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

function Portal({ children, containerId = 'modal-root' }) {
  const [container, setContainer] = useState(null)

  useEffect(() => {
    const el = document.getElementById(containerId)
    setContainer(el)
  }, [containerId])

  if (!container) return null

  return createPortal(children, container)
}

export default Portal

