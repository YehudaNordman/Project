import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles-fix.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RouteProvider } from './context/RouteContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouteProvider>
        <App />
      </RouteProvider>
    </AuthProvider>
  </StrictMode>,
)
