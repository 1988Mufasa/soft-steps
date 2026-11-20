import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource-variable/nunito/wght.css'
import '@fontsource-variable/literata/wght.css'
import './index.css'
import App from './App'
import { applyClientSecurityHints } from './security/headers'
import { AppProvider } from './store/AppContext'
import { initMobileShell } from './mobile'

applyClientSecurityHints()
registerSW({ immediate: true })
void initMobileShell()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
