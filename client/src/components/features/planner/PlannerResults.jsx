import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWeatherData } from '../../../services/plannerService';
import ResultsHeader from '../results/ResultsHeader';
import CurrencyConverter from '../results/CurrencyConverter';
import ResultsSummary from '../results/ResultsSummary';
import QuickToolsSection from '../results/QuickToolsSection';
import AccommodationCard from '../results/AccommodationCard';
import RecommendationCards from '../results/RecommendationCards';

import RecommendationsExplorer from '../results/RecommendationsExplorer';

/**
 * רכיב PlannerResults - עמוד התוצאות הראשי.
 * רכיב זה משמש כקונטיינר המרכזי שמרכז את כל חלקי התצוגה של התוצאות.
 */
const PlannerResults = ({ result, onBack, onRouteClick, destination, prefetchedWeather, currencyCode, currencyName, landingDate, takeoffDate, landingTime, takeoffTime, lat, lon }) => {
    const navigate = useNavigate();
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

    // Handler שיעביר לראוט ייעודי עם הפרמטרים ב-URL
    const openExplorer = (type) => {
        const params = new URLSearchParams();
        if (destination) params.set('destination', destination);
        if (lat) params.set('lat', lat);
        if (lon) params.set('lon', lon);
        if (landingDate && landingTime) params.set('landingTime', `${landingDate}T${landingTime}:00`);
        if (takeoffDate && takeoffTime) params.set('takeoffTime', `${takeoffDate}T${takeoffTime}:00`);

        if (type === 'restaurants') {
            navigate(`/restaurants?${params.toString()}`);
        } else {
            navigate(`/attractions?${params.toString()}`);
        }
    };

    return (
        <div className="planner-results-container">
            {/* 1. כותרת ומזג אוויר */}
            <ResultsHeader
                weather={weather}
                destination={destination}
                landingDate={landingDate}
                landingTime={landingTime}
                takeoffDate={takeoffDate}
                takeoffTime={takeoffTime}
            />

            {/* 3. כרטיס סיכום זמנים (ברוטו/נטו) */}
            <ResultsSummary result={result} />

            {/* כלים מהירים: ממיר מטבע והתראת לינה */}
            <QuickToolsSection
                destination={destination}
                currencyCode={currencyCode}
                currencyName={currencyName}
                landingTime={`${landingDate}T${landingTime}:00`}
                takeoffTime={`${takeoffDate}T${takeoffTime}:00`}
            />

            {/* 4. כרטיס לינה (יוצג רק בשהות ארוכה) */}
            <div className="quick-tools-wrapper" style={{ marginTop: '0' }}>
                <div className="quick-tools-container">
                    <AccommodationCard
                        result={result}
                        destination={destination}
                        landingDate={landingDate}
                        takeoffDate={takeoffDate}
                    />
                </div>
            </div>

            {/* 5. המלצות (יוצג רק אם יש מספיק זמן נטו) */}
            <RecommendationCards
                isValid={result?.isValid}
                destination={destination}
                onDiscover={(type) => openExplorer(type)}
            />
        </div>
    );
};

export default PlannerResults;
