import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ResultsPage from '../pages/ResultsPage';
import MyRoutePage from '../pages/MyRoutePage';
import SavedTripsPage from '../pages/SavedTripsPage';
import ProfilePage from '../pages/ProfilePage';
import CommunityPage from '../pages/CommunityPage';
import RecommendationsExplorer from '../components/features/results/RecommendationsExplorer';

// קומפוננטת הניתוב המרכזית של האפליקציה
const AppRoutes = () => {
    return (
        <Routes>
            {/* דף הבית - דף הכניסה של האתר */}
            <Route path="/" element={<HomePage />} />

            {/* דף תוצאות החיפוש - מציג אטרקציות ומסעדות ביעד שנבחר */}
            <Route path="/results" element={<ResultsPage />} />

            {/* דף המסלול שלי - מציג את המסלול המפורט שבנה ה-AI */}
            <Route path="/my-route" element={<MyRoutePage />} />

            {/* דף המסלולים השמורים - ארכיון הטיולים של המשתמש המחובר */}
            <Route path="/saved-trips" element={<SavedTripsPage />} />

            {/* דף פרופיל המשתמש - ניהול פרטים אישיים וסיסמה */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* דף הקהילה - פיד של מסלולים ששותפו על ידי מטיילים אחרים */}
            <Route path="/community" element={<CommunityPage />} />

            {/* דף האקספלורר - ממשק לחקירה נוספת של המלצות */}
            <Route path="/explorer" element={<RecommendationsExplorer />} />

            {/* נתיב ברירת מחדל - מפנה לדף הבית אם הכתובת אינה קיימת */}
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default AppRoutes;
