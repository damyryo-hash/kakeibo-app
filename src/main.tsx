import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applySavedTheme } from './hooks/useTheme'
import './index.css'

applySavedTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
