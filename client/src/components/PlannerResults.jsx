import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from '../utils/plannerUtils';
import ResultsHeader from './results/ResultsHeader';
import CurrencyConverter from './results/CurrencyConverter';
import ResultsSummary from './results/ResultsSummary';
import AccommodationCard from './results/AccommodationCard';
import RecommendationCards from './results/RecommendationCards';

import RecommendationsExplorer from './results/RecommendationsExplorer';

/**
 * רכיב PlannerResults - עמוד התוצאות הראשי.
 * רכיב זה משמש כקונטיינר המרכזי שמרכז את כל חלקי התצוגה של התוצאות.
 */
const PlannerResults = ({ result, onBack, destination, prefetchedWeather, currencyCode, currencyName, landingDate, takeoffDate, landingTime, takeoffTime, lat, lon }) => {
    console.log("PlannerResults Props:", { lat, lon, landingDate, takeoffDate, landingTime, takeoffTime });

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

    // State לניהול דפי "גילוי" (מסעדות/אטרקציות)
    const [explorerView, setExplorerView] = useState(null); // 'restaurants' | 'attractions' | null

    // אם אנחנו במצב "גילוי", נציג את ה-Explorer כ"דף חדש"
    if (explorerView) {
        return (
            <RecommendationsExplorer
                type={explorerView}
                destination={destination}
                lat={lat}
                lon={lon}
                landingTime={`${landingDate}T${landingTime}:00`}
                takeoffTime={`${takeoffDate}T${takeoffTime}:00`}
                onBack={() => setExplorerView(null)}
            />
        );
    }


    return (
        <div className="planner-results-container">
            {/* כפתור חזרה מעוצב (Fixed) */}
            <button className="back-circle-btn" onClick={onBack} title="חזור לחיפוש">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 19 19 12 12 5"></polyline>
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

            {/* 2. מחשבון המרת מטבע (חדש!) */}
            <CurrencyConverter currencyCode={currencyCode} currencyName={currencyName} />

            {/* 3. כרטיס סיכום זמנים (ברוטו/נטו) */}
            <ResultsSummary result={result} />

            {/* 4. כרטיס לינה (יוצג רק בשהות ארוכה) */}
            <AccommodationCard
                result={result}
                destination={destination}
                landingDate={landingDate}
                takeoffDate={takeoffDate}
            />

            {/* 5. המלצות (יוצג רק אם יש מספיק זמן נטו) */}
            <RecommendationCards
                isValid={result?.isValid}
                destination={destination}
                onDiscover={(type) => setExplorerView(type)}
            />
        </div>
    );
};

export default PlannerResults;
