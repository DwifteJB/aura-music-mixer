import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './src/css/index.css'

import Router from './src/components/global/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
