import React, { useState, useEffect } from 'react';
/* ייבוא רכיבי המשנה של העמוד */
import PlannerResults from './PlannerResults';
import InfoCards from './InfoCards';
import Hero from './Hero';
import Testimonials from './Testimonials';
import LoadingScreen from './LoadingScreen';
import PlannerForm from './PlannerForm';
import { decodeWeather } from '../utils/weatherUtils';

/**
 * רכיב GuestPlanner - הלב של מתכנן הטיולים לאורחים.
 * מנהל את שלבי התכנון: טופס הזנת נתונים, מסך המתנה, והצגת תוצאות.
 */
const GuestPlanner = ({ onBack, onResultsShown }) => {
  // --- ניהול State (מצבי הרכיב) ---

  // נתוני הטופס שהמשתמש מזין
  const [formData, setFormData] = useState({
    destination: '',     // יעד הנסיעה
    landingDate: '',     // תאריך נחיתה
    landingTime: '',     // שעת נחיתה
    takeoffDate: '',     // תאריך המראה
    takeoffTime: ''      // שעת המראה
  });

  // תוצאות החישוב הסופיות (מוצגות ב-PlannerResults)
  const [result, setResult] = useState(null);
  // נתוני מזג האוויר המושכים מה-API
  const [weatherData, setWeatherData] = useState(null);
  // מצב טעינה עבור מסך ההמתנה (2 שניות)
  const [isLoading, setIsLoading] = useState(false);

  // הודעה לרכיב האב (LandingPage) האם אנחנו מציגים תוצאות כרגע
  useEffect(() => {
    if (onResultsShown) {
      onResultsShown(!!result);
    }
  }, [result, onResultsShown]);

  // עדכון השדות בטופס בכל לחיצה של המשתמש
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * משיכת נתוני מזג אוויר מה-API
   */
  const fetchWeather = async (city) => {
    if (!city || city.trim().length < 2) return;

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=he&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        const geoResRetry = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&format=json`);
        const geoDataRetry = await geoResRetry.json();
        if (!geoDataRetry.results || geoDataRetry.results.length === 0) return;
        geoData.results = geoDataRetry.results;
      }

      const { latitude, longitude } = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
      const weatherData = await weatherRes.json();

      if (weatherData && weatherData.current) {
        const decoded = decodeWeather(weatherData.current.weather_code);
        setWeatherData({
          temp: Math.round(weatherData.current.temperature_2m),
          desc: decoded.desc,
          icon: decoded.icon
        });
      }
    } catch (err) {
      console.error("שגיאה במשיכת מזג האוויר:", err);
    }
  };

  /**
   * פונקציה ראשית לחישוב זמני הנטו
   */
  const calculateTime = (e) => {
    e.preventDefault();

    if (!formData.landingDate || !formData.landingTime || !formData.takeoffDate || !formData.takeoffTime) {
      alert('אנא מלא את כל פרטי הזמנים');
      return;
    }

    setIsLoading(true);
    setResult(null);

    if (!weatherData && formData.destination) {
      fetchWeather(formData.destination);
    }

    const landing = new Date(`${formData.landingDate}T${formData.landingTime}`);
    const takeoff = new Date(`${formData.takeoffDate}T${formData.takeoffTime}`);

    if (takeoff <= landing) {
      alert('שעת ההמראה חייבת להיות אחרי שעת הנחיתה');
      setIsLoading(false);
      return;
    }

    const diffInMs = takeoff - landing;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    const landingOffset = 45;
    const travelOffset = 60;
    const securityOffset = 120;
    const totalOffsets = landingOffset + travelOffset + securityOffset;

    const netMinutes = diffInMinutes - totalOffsets;

    const formatDuration = (totalMins) => {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return h > 0 ? `${h} שעות ו-${m} דקות` : `${m} דקות`;
    };

    setTimeout(() => {
      setIsLoading(false);
      setResult({
        grossTime: formatDuration(diffInMinutes),
        offsets: {
          landing: landingOffset,
          travel: travelOffset,
          security: securityOffset,
          total: totalOffsets
        },
        netTime: formatDuration(netMinutes),
        netMinutes,
        isValid: netMinutes >= 120
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };


  // --- רינדור (Render) ---

  // שלב א': מסך המתנה (Loading)
  if (isLoading) {
    return <LoadingScreen />;
  }

  // שלב ב': הצגת התוצאות (Results)
  if (result) {
    return <PlannerResults
      result={result}
      destination={formData.destination}
      prefetchedWeather={weatherData}
      onBack={() => setResult(null)}
    />;
  }

  // שלב ג': טופס הזנת הנתונים (הדף הראשי)
  return (
    <div className="guest-planner-container home-planner-view animate-in">
      <Hero />
      <InfoCards />

      {/* רכיב הטופס המודולרי */}
      <PlannerForm
        formData={formData}
        handleChange={handleChange}
        onSubmit={calculateTime}
      />

      <Testimonials />
    </div>
  );
};

export default GuestPlanner;


