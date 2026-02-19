import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/main.css'
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
