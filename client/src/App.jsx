import LandingPage from './pages/LandingPage'
import {BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom'
import MyTrip from './pages/myTrip';
/**
 * רכיב האפליקציה הראשי (Entry Point).
 * מגדיר את מבנה העטיפה הבסיסי ומטעין את דף הבית.
 */
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/my-trip" element={<MyTrip />} />
    </Routes>
    
    </BrowserRouter>
  );
}

export default App;

