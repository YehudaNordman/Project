import React, { useState, useEffect } from 'react';
/* ייבוא רכיבי המשנה של העמוד */
import PlannerResults from './PlannerResults';
import InfoCards from './InfoCards';
import Hero from './Hero';
import Testimonials from './Testimonials';
import LoadingScreen from './LoadingScreen';
import PlannerForm from './PlannerForm';
/* ייבוא פונקציות עזר וחישוב */
import { calculateTripTime, fetchWeatherData, getMockRecommendations } from '../utils/plannerUtils';

/**
 * רכיב GuestPlanner - הלב של מתכנן הטיולים לאורחים.
 * מנהל את שלבי התכנון: טופס הזנת נתונים, מסך המתנה, והצגת תוצאות.
 * הארכיטקטורה מבוססת על הפרדת לוגיקה (Utils) מתצוגה (Components).
 */
const GuestPlanner = ({ onResultsShown }) => {
  // --- מצבים (States) ---

  // נתוני הטופס
  const [formData, setFormData] = useState({
    destination: '',
    landingDate: '',
    landingTime: '',
    takeoffDate: '',
    takeoffTime: ''
  });

  const [result, setResult] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // עדכון האב (LandingPage) בשינוי מצב התוצאות
  useEffect(() => {
    if (onResultsShown) {
      onResultsShown(!!result);
    }
  }, [result, onResultsShown]);

  /**
   * עדכון שדות הטופס
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * פונקציית הגשת הטופס והרצת החישוב
   */
  const handleCalculate = async (e) => {
    e.preventDefault();

    // בדיקת תקינות בסיסית של שדות
    const { destination, landingDate, landingTime, takeoffDate, takeoffTime } = formData;
    if (!landingDate || !landingTime || !takeoffDate || !takeoffTime) {
      alert('אנא מלא את כל פרטי הזמנים');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setWeatherData(null);

    try {
      // 1. קריאה למזג אוויר (במקביל לחישוב)
      if (destination) {
        fetchWeatherData(destination).then(setWeatherData);
      }

      // 2. חישוב זמנים באמצעות פונקציית ה-Utils
      const tripMetrics = calculateTripTime(landingDate, landingTime, takeoffDate, takeoffTime);

      // 3. הוספת המלצות נתונים מדומים
      const recommendations = getMockRecommendations();

      // סימולציית טעינה לחוויית משתמש (2 שניות)
      setTimeout(() => {
        setIsLoading(false);
        setResult({
          ...tripMetrics,
          ...recommendations
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);

    } catch (err) {
      alert(err.message);
      setIsLoading(false);
    }
  };

  // --- רינדור מותנה לפי המצב ---

  // 1. מסך טעינה
  if (isLoading) return <LoadingScreen />;

  // 2. תצוגת תוצאות
  if (result) {
    return (
      <PlannerResults
        result={result}
        destination={formData.destination}
        prefetchedWeather={weatherData}
        currencyCode={formData.currency_code}
        currencyName={formData.currency_name_hebrew}
        onBack={() => setResult(null)}
        lat={formData.lat}
        lon={formData.lon}
        landingDate={formData.landingDate}
        takeoffDate={formData.takeoffDate}
        landingTime={formData.landingTime}
        takeoffTime={formData.takeoffTime}
      />
    );
  }

  // 3. תצוגת עמוד הבית (Hero, טופס, המלצות)
  return (
    <div className="guest-planner-container animate-in">
      <Hero />
      <InfoCards />
      <PlannerForm
        formData={formData}
        handleChange={handleChange}
        setFormData={setFormData}
        onSubmit={handleCalculate}
      />
      <Testimonials />
    </div>
  );
};

export default GuestPlanner;
