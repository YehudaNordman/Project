import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/styles/main.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RouteProvider } from './context/RouteContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'

// נקודת הכניסה הראשית של אפליקציית ה-React
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* עטיפת האפליקציה ב-BrowserRouter כדי לאפשר ניווט בין דפים */}
    <BrowserRouter>
      {/* ספק אימות (AuthProvider) - מנהל את סטטוס ההתחברות של המשתמש */}
      <AuthProvider>
        {/* ספק מסלול (RouteProvider) - מנהל את רשימת האטרקציות שהמשתמש בחר */}
        <RouteProvider>
          {/* ספק חיפוש (SearchProvider) - מנהל את תוצאות החיפוש מה-Backend */}
          <SearchProvider>
            <App />
          </SearchProvider>
        </RouteProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
