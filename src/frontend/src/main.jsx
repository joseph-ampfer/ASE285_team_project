import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import taskflowLogo from '../assets/taskflow_logo.png'

const favicon =
  document.querySelector("link[rel='icon']") || document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/png'
favicon.href = taskflowLogo
document.head.appendChild(favicon)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

