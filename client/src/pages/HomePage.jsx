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
        const { destination, landingDate, landingTime, takeoffDate, takeoffTime } = formData;

        // בדיקה בסיסית שכל שדות החובה מלאים
        if (!destination || !landingDate || !landingTime || !takeoffDate || !takeoffTime) {
            setErrorMsg('נא למלא את כל השדות החובה');
            return;
        }

        setErrorMsg('');
        setIsLoading(true); // הצגת מסך טעינה (LoadingScreen)
        clearRoute();

        try {
            // התחלת משיכת נתוני מזג אוויר ליעד בנפרד (שיפור ביצועים)
            fetchWeatherData(destination).then(setWeatherData);

            // חישוב מטריקות הזמן (ברוטו/נטו) המבוסס על שעות נחיתה והמראה
            const tripMetrics = calculateTripTime(landingDate, landingTime, takeoffDate, takeoffTime);
            // משיכת המלצות ראשוניות (כרגע ב-Mock, בהמשך מה-Backend)
            const recommendations = getMockRecommendations();

            // סימולציה של זמן עיבוד קצר לטובת חווית משתמש
            setTimeout(() => {
                setIsLoading(false);
                setResults({
                    ...tripMetrics,
                    ...recommendations
                });
                navigate('/results'); // מעבר לדף התוצאות
            }, 1500);
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
