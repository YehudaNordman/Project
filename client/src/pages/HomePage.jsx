import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/common/Hero';
import InfoCards from '../components/common/InfoCards';
import Testimonials from '../components/common/Testimonials';
import PlannerForm from '../components/features/planner/PlannerForm';
import LoadingScreen from '../components/features/planner/LoadingScreen';
import { useSearch } from '../context/SearchContext';
import { useRoute } from '../context/RouteContext';
import { calculateTripTime, fetchWeatherData, getMockRecommendations } from '../services/plannerService';

/**
 * דף הבית (HomePage) - השער המרכזי למשתמשים.
 * כאן המשתמש מזין את פרטי הטיסה שלו ומתחיל את תהליך התכנון.
 */
const HomePage = () => {
    const navigate = useNavigate();
    // שימוש ב-Contexts כדי לנהל את נתוני החיפוש והמסלול
    const { formData, setFormData, setResults, setWeatherData, clearSearch } = useSearch();
    const { clearRoute } = useRoute();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // איפוס תוצאות חיפוש ומסלולים קודמים בכל פעם שנכנסים לדף הבית
    // כדי להבטיח התחלה נקייה של תכנון חדש
    useEffect(() => {
        clearSearch();
        clearRoute();
    }, []);

    // עדכון נתוני הטופס בכל שינוי בשדות הקלט (יעד, תאריכים וכו')
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * פונקציית החישוב המרכזית - נקראת בעת שליחת הטופס.
     * בודקת תקינות נתונים, שואבת מזג אוויר ומחשבת את חלון הזמן לטיול.
     */
    const handleCalculate = async (e) => {
        e.preventDefault();
        const { destination, landingDate, landingTime, takeoffDate, takeoffTime, lat, lon, currency_code, currency_name_hebrew } = formData;

        // בדיקה בסיסית שכל שדות החובה מלאים
        if (!destination || !landingDate || !landingTime || !takeoffDate || !takeoffTime) {
            setErrorMsg('נא למלא את כל השדות החובה');
            return;
        }

        setErrorMsg('');
        clearRoute(); // Clear the current itinerary route when starting a fresh search

        try {
            // Build query params from formData (include optional fields if present)
            const params = new URLSearchParams();
            params.set('destination', destination);
            params.set('landingDate', landingDate);
            params.set('landingTime', landingTime);
            params.set('takeoffDate', takeoffDate);
            params.set('takeoffTime', takeoffTime);
            if (lat) params.set('lat', lat);
            if (lon) params.set('lon', lon);
            if (currency_code) params.set('currency_code', currency_code);
            if (currency_name_hebrew) params.set('currency_name_hebrew', currency_name_hebrew);

            // Navigate to results page with query string. ResultsPage will perform the data fetching.
            navigate(`/results?${params.toString()}`);
        } catch (err) {
            setErrorMsg(err.message);
            setIsLoading(false);
        }
    };

    // אם המערכת בטעינה, נציג את מסך ההמתנה המעוצב
    if (isLoading) return <LoadingScreen />;

    return (
        <div className="guest-planner-container animate-in">
            {/* כותרת מרכזית */}
            <Hero />

            {/* כרטיסי מידע על היתרונות של השרות */}
            <InfoCards />

            {/* טופס הזנת פרטי הטיסה המעוצב */}
            <PlannerForm
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                onSubmit={handleCalculate}
                error={errorMsg}
            />

            {/* המלצות של מטיילים מרוצים */}
            <Testimonials />
        </div>
    );
};

export default HomePage;
