import React from 'react';

/**
 * רכיב ResultsHeader - מציג את נתוני מזג האוויר ואת זמני הטיסות שנבחרו.
 * מעוצב כחלק העליון של עמוד התוצאות.
 */
const ResultsHeader = ({ weather, destination, landingDate, landingTime, takeoffDate, takeoffTime }) => {

    // מיפוי אייקוני מזג אוויר לאימוג'י
    const getWeatherEmoji = (iconName) => {
        const mapping = { 'sun': '☀️', 'cloud': '☁️', 'rain': '🌧️', 'snow': '❄️', 'thunder': '⛈️' };
        return mapping[iconName] || '🌤️';
    };

    // פורמט תצוגה לתאריך ושעה
    const formatDT = (date, time) => {
        if (!date || !time) return '--:--';
        return `${date.split('-').reverse().join('.')} (${time})`;
    };

    return (
        <div className="results-header-container">
            {/* גוש מזג האוויר */}
            <div className="weather-summary-box">
                <span className="weather-emoji">{getWeatherEmoji(weather?.icon)}</span>
                <div className="weather-info-text">
                    <div className="temp-display">{weather?.temp || '--'}°C</div>
                    <div className="location-label">מזג האוויר ב-{destination}</div>
                </div>
            </div>

            {/* גוש זמני הטיסות */}
            <div className="flight-times-summary">
                <div className="time-item">
                    <span className="time-icon">📅</span>
                    <div className="time-details">
                        <span className="time-label">נחיתה</span>
                        <span className="time-value">{formatDT(landingDate, landingTime)}</span>
                    </div>
                </div>

                <div className="header-divider"></div>

                <div className="time-item">
                    <span className="time-icon">🛫</span>
                    <div className="time-details">
                        <span className="time-label">המראה</span>
                        <span className="time-value">{formatDT(takeoffDate, takeoffTime)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsHeader;
