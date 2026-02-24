import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyRouteView from '../components/results/MyRouteView';
import { useSearch } from '../context/SearchContext';

/**
 * דף המסלול המפורט (MyRoutePage).
 * כאן המשתמש רואה את הלו"ז הסופי שנבנה עבורו ע"י ה-AI.
 */
const MyRoutePage = () => {
    const navigate = useNavigate();
    // שליפת נתוני הזמנים והיעד מה-Context
    const { formData } = useSearch();

    return (
        // הצגת הרכיב המרכזי שמציג את ציר הזמן (Timeline) של הטיול
        <MyRouteView
            // כפתור חזרה לדף הקודם
            onBack={() => navigate(-1)}
            // העברת נתוני הזמנים לחישובים פנימיים ברכיב
            times={formData}
            // פונקציה למעבר לדף המסלולים השמורים
            onViewSaved={() => navigate('/saved-trips')}
        />
    );
};

export default MyRoutePage;
