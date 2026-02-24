import MainLayout from './components/layout/MainLayout';
import AppRoutes from './routes/AppRoutes';

/**
 * קומפוננטת ה-App הראשית.
 * עוטפת את האפליקציה בפריסה הראשית (Layout) ובמערכת הניתוב (Routes).
 */
function App() {
  return (
    <div className="App">
      {/* אלמנטים דקורטיביים של מטוסים שנעים ברקע האתר */}
      <div className="airplane-bg-element planeify-1">✈️</div>
      <div className="airplane-bg-element planeify-2">✈️</div>
      <div className="airplane-bg-element planeify-3">✈️</div>

      {/* ה-Layout המרכזי שמכיל את ה-Navbar וה-Footer הקבועים */}
      <MainLayout>
        {/* הזרקת התוכן המשתנה לפי הכתובת (URL) שבה נמצא המשתמש */}
        <AppRoutes />
      </MainLayout>
    </div>
  );
}

export default App;

