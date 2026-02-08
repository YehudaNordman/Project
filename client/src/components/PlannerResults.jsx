import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from '../utils/plannerUtils';
import ResultsHeader from './results/ResultsHeader';
import ResultsSummary from './results/ResultsSummary';
import AccommodationCard from './results/AccommodationCard';
import RecommendationCards from './results/RecommendationCards';

/**
 * רכיב PlannerResults - עמוד התוצאות הראשי.
 * רכיב זה משמש כקונטיינר המרכזי שמרכז את כל חלקי התצוגה של התוצאות.
 */
const PlannerResults = ({ result, onBack, destination, prefetchedWeather, landingDate, takeoffDate, landingTime, takeoffTime }) => {
    // State למזג האוויר במידה ולא נטען בטופס (Fallback)
    const [weather, setWeather] = useState(prefetchedWeather || null);

    // טעינת מזג אוויר אם חסר
    useEffect(() => {
        if (!prefetchedWeather && destination) {
            const loadWeather = async () => {
                const data = await fetchWeatherData(destination);
                if (data) setWeather(data);
            };
            loadWeather();
        }
    }, [destination, prefetchedWeather]);

    return (
        <div className="planner-results-container">
            {/* כפתור חזרה מעוצב (Fixed) */}
            <button className="back-circle-btn" onClick={onBack} title="חזור לחיפוש">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>

            {/* 1. כותרת ומזג אוויר */}
            <ResultsHeader
                weather={weather}
                destination={destination}
                landingDate={landingDate}
                landingTime={landingTime}
                takeoffDate={takeoffDate}
                takeoffTime={takeoffTime}
            />

            {/* 2. כרטיס סיכום זמנים (ברוטו/נטו) */}
            <ResultsSummary result={result} />

            {/* 3. כרטיס לינה (יוצג רק בשהות ארוכה) */}
            <AccommodationCard
                result={result}
                destination={destination}
                landingDate={landingDate}
                takeoffDate={takeoffDate}
            />

            {/* 4. המלצות (יוצג רק אם יש מספיק זמן נטו) */}
            <RecommendationCards
                isValid={result?.isValid}
                destination={destination}
            />
        </div>
    );
};

export default PlannerResults;
