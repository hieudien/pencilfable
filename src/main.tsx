import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Early versions had paid plans and stored a license key; remove any leftover so nothing stale stays on the computer.
try {
  localStorage.removeItem('el:license')
} catch {
  /* storage can be blocked; nothing to clean */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
