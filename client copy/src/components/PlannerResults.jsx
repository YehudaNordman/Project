import React, { useState, useEffect } from 'react';
import WeatherWidget from './WeatherWidget';
import PressureGauge from './PressureGauge';
import CalculationBreakdown from './CalculationBreakdown';
import { decodeWeather } from '../utils/weatherUtils';

/**
 * רכיב PlannerResults - מציג את תוצאות חישוב הנטו לסיור.
 * משמש כמתאם (Coordinator) המרכז את מזג האוויר, מד הלחץ והפירוט.
 */
const PlannerResults = ({ result, onBack, destination, prefetchedWeather }) => {
    // --- State לניהול נתוני מזג האוויר ---
    const [weather, setWeather] = useState(prefetchedWeather || null);

    /**
     * משיכת נתוני מזג אוויר אם לא הועברו מהרכיב הקודם.
     */
    useEffect(() => {
        if (prefetchedWeather) {
            setWeather(prefetchedWeather);
            return;
        }

        if (destination) {
            const fetchWeather = async () => {
                try {
                    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination.trim())}&count=1&language=he&format=json`;
                    const geoRes = await fetch(geoUrl);
                    const geoData = await geoRes.json();

                    if (!geoData.results || geoData.results.length === 0) {
                        const geoResRetry = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination.trim())}&count=1&format=json`);
                        const geoDataRetry = await geoResRetry.json();
                        if (geoDataRetry.results && geoDataRetry.results.length > 0) {
                            geoData.results = geoDataRetry.results;
                        }
                    }

                    if (geoData.results && geoData.results.length > 0) {
                        const { latitude, longitude } = geoData.results[0];
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
                        const weatherData = await weatherRes.json();

                        if (weatherData && weatherData.current) {
                            const decoded = decodeWeather(weatherData.current.weather_code);
                            setWeather({
                                temp: Math.round(weatherData.current.temperature_2m),
                                desc: decoded.desc,
                                icon: decoded.icon
                            });
                        }
                    }
                } catch (err) {
                    console.error("שגיאה במשיכת מזג האוויר בתוצאות:", err);
                }
            };
            fetchWeather();
        }
    }, [destination, prefetchedWeather]);

    return (
        <>
            {/* כפתור חזרה מעוצב בפינה העליונה - מחוץ לאנימציה כדי שלא יושפע */}
            <button className="back-button fixed-top-right" onClick={onBack} title="חזרה לעריכה">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>

            <div className="planner-results-container animate-in">
                <div className="planner-card glass">
                    {/* הצגת תוצאות אם הזמן תקין (מעל שעתיים נטו) */}
                    {result.isValid ? (
                        <div className="success-result animate-in">

                            {/* שימוש ברכיב מזג האוויר המודולרי */}
                            <WeatherWidget weather={weather} destination={destination} />

                            {/* שימוש ברכיב מד הלחץ המודולרי */}
                            <PressureGauge netMinutes={result.netMinutes} />

                            {/* שימוש ברכיב פירוט החישוב המודולרי */}
                            <CalculationBreakdown result={result} />

                            {/* תצוגה מודגשת של הזמן הסופי */}
                            <div className="time-display-wrapper">
                                <p>הזמן הנטו שלך לסיור והנאה הוא:</p>
                                <div className="time-display">{result.netTime}</div>
                            </div>

                            {/* כרטיסי המלצות ראשוניים (Placeholders) */}
                            <div className="placeholders-grid">
                                <div className="placeholder-wrapper">
                                    <h3 className="external-card-title">🍽️ מסעדות באזור</h3>
                                    <div className="placeholder-card restaurants-card"></div>
                                </div>
                                <div className="placeholder-wrapper">
                                    <h3 className="external-card-title">🏛️ אטרקציות באזור</h3>
                                    <div className="placeholder-card attractions-card"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // הצגת הודעת שגיאה אם הזמן קצר מדי
                        <div className="error-result animate-in">
                            <div className="result-icon">⚠️</div>
                            <p className="error-message">
                                זמן ההמתנה קצר מדי ליציאה מהשדה. מומלץ להישאר בטרמינל וליהנות מהדיוטי פרי.
                            </p>
                            <button className="home-button secondary" onClick={onBack}>
                                חזרה לעריכת פרטים
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PlannerResults;
