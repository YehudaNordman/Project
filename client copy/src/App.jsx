import LandingPage from './pages/LandingPage'

/**
 * רכיב האפליקציה הראשי (Entry Point).
 * מגדיר את מבנה העטיפה הבסיסי ומטעין את דף הבית.
 */
function App() {
  return (
    <div className="App">
      {/* אלמנטים דקורטיביים של מטוסים "מעופפים" ברקע האתר */}
      <div className="airplane-bg-element planeify-1">✈️</div>
      <div className="airplane-bg-element planeify-2">✈️</div>
      <div className="airplane-bg-element planeify-3">✈️</div>

      {/* טעינת הרכיב המרכזי שמרכז את כל תוכן האתר */}
      <LandingPage />
    </div>
  );
}

export default App

