import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/styles/main.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RouteProvider } from './context/RouteContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RouteProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </RouteProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
