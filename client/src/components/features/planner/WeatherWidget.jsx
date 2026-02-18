import React from 'react';

/**
 * רכיב WeatherWidget - גרסה קומפקטית ומעוצבת לפי צילום המסך.
 */
const WeatherWidget = ({ weather, destination }) => {
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
        <div className="weather-compact-card">
            <div className="weather-main-row">
                <span className="weather-icon-small">{getWeatherIcon(weather.icon)}</span>
                <span className="temp-value-small">{weather.temp}°C</span>
            </div>
            <div className="weather-loc-desc">
                <p className="weather-info-text">מזג האוויר ב-{destination}</p>
                <p className="weather-desc-small">{weather.desc}</p>
            </div>
        </div>
    );
};

export default WeatherWidget;
