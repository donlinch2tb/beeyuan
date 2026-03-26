import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './i18n/I18nContext'
import { AuthProvider } from './auth/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
