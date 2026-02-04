import React from 'react';

/**
 * רכיב WeatherWidget - מציג את נתוני מזג האוויר בפורמט מעוצב.
 * כולל אייקון, טמפרטורה ותיאור.
 */
const WeatherWidget = ({ weather, destination }) => {
    /**
     * בחירת אייקון גרפי לפי תיאור מזג האוויר.
     */
    const getWeatherIcon = (desc) => {
        if (!desc) return '☀️';
        const d = desc.toLowerCase();
        if (d.includes('sun') || d.includes('clear')) return '☀️';
        if (d.includes('cloud')) return '☁️';
        if (d.includes('rain')) return '🌧️';
        if (d.includes('snow')) return '❄️';
        if (d.includes('thunder')) return '⛈️';
        return '🌤️';
    };

    if (!weather) return null;

    return (
        <div className="weather-widget-inline animate-in">
            <div className="weather-icon-featured">
                {getWeatherIcon(weather.icon)}
            </div>
            <div className="weather-details-vertical">
                <p className="weather-label">מזג האוויר ב-{destination}</p>
                <h3 className="weather-temp-large">{weather.temp}°C</h3>
                <p className="weather-desc-premium">{weather.desc}</p>
            </div>
        </div>
    );
};

export default WeatherWidget;
