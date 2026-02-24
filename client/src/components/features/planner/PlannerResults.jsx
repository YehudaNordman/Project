import React, { useState, useEffect } from 'react';
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
 * רכיב זה משמש כקונטיינר המרכזי שמרכז את כל חלקי התצוגה של התוצאות (מזג אוויר, זמנים, כלים, המלצות).
 */
const PlannerResults = ({ result, onBack, onRouteClick, destination, prefetchedWeather, currencyCode, currencyName, landingDate, takeoffDate, landingTime, takeoffTime, lat, lon }) => {

    // State לניהול נתוני מזג האוויר במידה ולא הגיעו מראש
    const [weather, setWeather] = useState(prefetchedWeather || null);

    // טעינת מזג האוויר אם המידע לא הועבר ב-Props
    useEffect(() => {
        if (!prefetchedWeather && destination) {
            const loadWeather = async () => {
                const data = await fetchWeatherData(destination);
                if (data) setWeather(data);
            };
            loadWeather();
        }
    }, [destination, prefetchedWeather]);

    // State לניהול דפי "גילוי" (Explorer) - האם להציג עכשיו רשימת מסעדות או אטרקציות לבחירה
    const [explorerView, setExplorerView] = useState(null); // 'restaurants' | 'attractions' | null

    // אם המשתמש בחר להיכנס למצב "גילוי", הרינדור עובר לרכיב ה-Explorer
    if (explorerView) {
        return (
            <RecommendationsExplorer
                setExplorerView={setExplorerView}
                type={explorerView}
                destination={destination}
                lat={lat}
                lon={lon}
                landingTime={`${landingDate}T${landingTime}:00`}
                takeoffTime={`${takeoffDate}T${takeoffTime}:00`}
                onBack={() => setExplorerView(null)}
                onRouteClick={onRouteClick}
            />
        );
    }


    return (
        <div className="planner-results-container">
            {/* 1. הצגת כותרת היעד, זמני טיסה ומזג אוויר */}
            <ResultsHeader
                weather={weather}
                destination={destination}
                landingDate={landingDate}
                landingTime={landingTime}
                takeoffDate={takeoffDate}
                takeoffTime={takeoffTime}
            />

            {/* 2. סיכום חישובי ה-AI: זמן ברוטו (מרגע שהמטוס נחת) מול זמן נטו (זמן לטיול בפועל) */}
            <ResultsSummary result={result} />

            {/* 3. סקציית הכלים המהירים: ממיר מטבע מובנה ליעד והתראות חכמות */}
            <QuickToolsSection
                destination={destination}
                currencyCode={currencyCode}
                currencyName={currencyName}
                landingTime={`${landingDate}T${landingTime}:00`}
                takeoffTime={`${takeoffDate}T${takeoffTime}:00`}
            />

            {/* 4. כרטיס המלצת לינה: יוצג אוטומטית רק אם השהות במדינה היא מעל 24 שעות */}
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

            {/* 5. המלצות AI: כרטיסיות המציעות למשתמש לחקור מסעדות או אטרקציות ולהוסיף אותן למסלול */}
            <RecommendationCards
                isValid={result?.isValid}
                destination={destination}
                onDiscover={(type) => setExplorerView(type)}
            />
        </div>
    );
};

export default PlannerResults;
