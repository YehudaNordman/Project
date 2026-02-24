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
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PlannerResults from '../components/features/planner/PlannerResults';
import LoadingScreen from '../components/features/planner/LoadingScreen';
import { useSearch } from '../context/SearchContext';
import { calculateTripTime, fetchWeatherData, getMockRecommendations } from '../services/plannerService';

/**
 * דף התוצאות (ResultsPage) - מרכז את הצגת נתוני התכנון שחזרו מהשרת.
 * אם אין תוצאות ב-SearchContext, המשתמש מופנה אוטומטית חזרה לדף הבית.
 */
const ResultsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { results, formData, weatherData, setResults, setWeatherData, setFormData, clearSearch } = useSearch();
    const [localResults, setLocalResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // אפקט המבטיח שאם המשתמש הגיע לדף ללא תוצאות (למשל ברענון), הוא יחזור להתחלה
    useEffect(() => {
        const loadFromQuery = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const destination = params.get('destination');
                const landingDate = params.get('landingDate');
                const landingTime = params.get('landingTime');
                const takeoffDate = params.get('takeoffDate');
                const takeoffTime = params.get('takeoffTime');
                const lat = params.get('lat') || '';
                const lon = params.get('lon') || '';
                const currency_code = params.get('currency_code') || '';
                const currency_name_hebrew = params.get('currency_name_hebrew') || '';

                // Validate required
                if (!destination || !landingDate || !landingTime || !takeoffDate || !takeoffTime) {
                    // Missing data -> go back to home
                    navigate('/');
                    return;
                }

                // Persist formData in context so other components can read it
                const newForm = {
                    destination,
                    landingDate,
                    landingTime,
                    takeoffDate,
                    takeoffTime,
                    lat,
                    lon,
                    currency_code,
                    currency_name_hebrew
                };

                setFormData(newForm);

                setIsLoading(true);

                // Start weather fetch in parallel
                const weatherPromise = fetchWeatherData(destination);

                // Compute trip metrics (may throw)
                let tripMetrics;
                try {
                    tripMetrics = calculateTripTime(landingDate, landingTime, takeoffDate, takeoffTime);
                } catch (err) {
                    setErrorMsg(err.message);
                    // Return to home after brief delay to let user see error
                    setTimeout(() => navigate('/'), 1500);
                    return;
                }

                // Recommendations (mock or real)
                const recommendations = getMockRecommendations();

                const weather = await weatherPromise;

                const composedResults = {
                    ...tripMetrics,
                    ...recommendations
                };

                // Update context so the rest of the app (e.g. Saved state) can access
                setResults(composedResults);
                setWeatherData(weather);

                // Also keep a local copy for this page render
                setLocalResults(composedResults);
                setIsLoading(false);
            } catch (err) {
                console.error('Results load error:', err);
                navigate('/');
            }
        };

        loadFromQuery();
        // We only want to run this on mount / when location.search changes
    }, [location.search, navigate, setResults, setWeatherData, setFormData]);

    if (isLoading) return <LoadingScreen message="טוען נתונים..." />;

    if (errorMsg) {
        return (
            <div className="planner-results-container">
                <div className="planner-error-box animate-in">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{errorMsg}</span>
                </div>
            </div>
        );
    }

    // Use the context formData (which we set from query) to pass props to PlannerResults
    return (
        // רכיב התצוגה המרכזי שמציג את חישובי הזמנים, מזג האוויר וההמלצות
        <PlannerResults
            result={localResults || results}
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
            setExplorerView={(type) => {
                const params = new URLSearchParams();
                params.set('type', type);
                params.set('destination', formData.destination || '');
                if (formData.lat) params.set('lat', formData.lat);
                if (formData.lon) params.set('lon', formData.lon);
                if (formData.landingDate && formData.landingTime) params.set('landingTime', `${formData.landingDate}T${formData.landingTime}:00`);
                if (formData.takeoffDate && formData.takeoffTime) params.set('takeoffTime', `${formData.takeoffDate}T${formData.takeoffTime}:00`);
                navigate(`/explorer?${params.toString()}`);
            }}
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