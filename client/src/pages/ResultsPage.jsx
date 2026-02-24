// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import PlannerResults from '../components/features/planner/PlannerResults';
// import { useSearch } from '../context/SearchContext';

// const ResultsPage = () => {
//     const navigate = useNavigate();
//     const { results, formData, weatherData, clearSearch } = useSearch();

//     useEffect(() => {
//         if (!results) {
//             navigate('/');
//         }
//     }, [results, navigate]);

//     if (!results) return null;

//     return (
//         <PlannerResults
//             result={results}
//             destination={formData.destination}
//             prefetchedWeather={weatherData}
//             currencyCode={formData.currency_code}
//             currencyName={formData.currency_name_hebrew}
//             onBack={() => {
//                 clearSearch();
//                 navigate('/');
//             }}
//             onRouteClick={() => navigate('/my-route')}
//             lat={formData.lat}
//             lon={formData.lon}
//             landingDate={formData.landingDate}
//             takeoffDate={formData.takeoffDate}
//             landingTime={formData.landingTime}
//             takeoffTime={formData.takeoffTime}
//         />
//     );
// };

// export default ResultsPage;
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlannerResults from '../components/features/planner/PlannerResults';
import { useSearch } from '../context/SearchContext';

/**
 * דף התוצאות (ResultsPage) - מרכז את הצגת נתוני התכנון שחזרו מהשרת.
 * אם אין תוצאות ב-SearchContext, המשתמש מופנה אוטומטית חזרה לדף הבית.
 */
const ResultsPage = () => {
    const navigate = useNavigate();
    // שליפת הנתונים מהקשר החיפוש (SearchContext)
    const { results, formData, weatherData, clearSearch } = useSearch();

    // אפקט המבטיח שאם המשתמש הגיע לדף ללא תוצאות (למשל ברענון), הוא יחזור להתחלה
    useEffect(() => {
        if (!results) {
            navigate('/');
        }
    }, [results, navigate]);

    // אם עדיין אין תוצאות, אל תרנדר כלום (מונע שגיאות)
    if (!results) return null;

    /**
     * פונקציה למעבר לדף ה"אקספלורר" לפי סוג (מסעדות או אטרקציות).
     * מעבירה את כל הפרמטרים הרלוונטיים דרך ה-Route State.
     */
    const handleOpenExplorer = (type) => {
        navigate('/explorer', {
            state: {
                type: type, // 'restaurants' או 'attractions'
                destination: formData.destination,
                lat: formData.lat,
                lon: formData.lon,
                landingTime: formData.landingTime,
                takeoffTime: formData.takeoffTime
            }
        });
    };

    return (
        // רכיב התצוגה המרכזי שמציג את חישובי הזמנים, מזג האוויר וההמלצות
        <PlannerResults
            result={results}
            destination={formData.destination}
            prefetchedWeather={weatherData}
            currencyCode={formData.currency_code}
            currencyName={formData.currency_name_hebrew}
            // פעולה בעת חזרה אחורה: ניקוי החיפוש וחזרה לדף הבית
            onBack={() => {
                clearSearch();
                navigate('/');
            }}
            // מעבר לדף שמציג את המסלול המפורט שבנה ה-AI
            onRouteClick={() => navigate('/my-route')}
            // הזרקת הפונקציה לפתיחת האקספלורר (מסעדות/אטרקציות)
            setExplorerView={handleOpenExplorer}
            lat={formData.lat}
            lon={formData.lon}
            landingDate={formData.landingDate}
            takeoffDate={formData.takeoffDate}
            landingTime={formData.landingTime}
            takeoffTime={formData.takeoffTime}
        />
    );
};

export default ResultsPage;