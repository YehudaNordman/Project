import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * רכיב ResultsHeader - מציג את נתוני מזג האוויר ואת זמני הטיסות שנבחרו.
 * לחיצה על שדות הזמן תפתח טופס קטן לעריכת תאריך ושעה; שמירה תעדכן את פרמטרי ה-URL
 * וכך העמוד ייטען מחדש עם הערכים המעודכנים.
 */
const ResultsHeader = ({ weather, destination, landingDate, landingTime, takeoffDate, takeoffTime }) => {

    const location = useLocation();
    const navigate = useNavigate();

    // מצב עריכה: null | 'landing' | 'takeoff'
    const [editType, setEditType] = useState(null);
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');

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

    // כאשר מתחילים לערוך, נאתחל את שדות הטופס מהפרופס הנוכחיים
    useEffect(() => {
        if (editType === 'landing') {
            setEditDate(landingDate || '');
            setEditTime(landingTime || '');
        } else if (editType === 'takeoff') {
            setEditDate(takeoffDate || '');
            setEditTime(takeoffTime || '');
        }
    }, [editType, landingDate, landingTime, takeoffDate, takeoffTime]);

    const openEdit = (type) => {
        setEditType(type);
    };

    const closeEdit = () => {
        setEditType(null);
    };

    // שמירת הערכים - נעדכן את ה-URL כך ש-ResultsPage ירענן את התוצאות
    const saveEdit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(location.search);

        if (editType === 'landing') {
            if (editDate) params.set('landingDate', editDate);
            if (editTime) params.set('landingTime', editTime);
        } else if (editType === 'takeoff') {
            if (editDate) params.set('takeoffDate', editDate);
            if (editTime) params.set('takeoffTime', editTime);
        }

        // אם אין destination בפרמטרים נוסיף אותו מה-props (שומר קישור תקין)
        if (destination && !params.get('destination')) params.set('destination', destination);

        // ניווט לאותו pathname עם הפרמטרים המעודכנים
        navigate(`${location.pathname}?${params.toString()}`);
    };

    return (
        <div className="results-header-row">
            {/* גוש מזג האוויר - עבר לצד ימין (קרוב לכפתור) */}
            <div className="weather-bubble">
                <span className="weather-emoji">{getWeatherEmoji(weather?.icon)}</span>
                <div className="weather-info-text">
                    <div className="temp-display">{weather?.temp || '--'}°C</div>
                    <div className="location-label">מזג האוויר ב-{destination}</div>
                </div>
            </div>

            {/* גוש זמני הטיסות - עבר לצד שמאל (רחוק מהכפתור) */}
            <div className="flight-times-bubble">
                <div className="time-item">
                    <span className="time-icon">🛬</span>
                    <div className="time-details">
                        <span className="time-label">נחיתה</span>
                        {editType === 'landing' ? (
                            <form className="time-edit-form" onSubmit={saveEdit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    required
                                />
                                <input
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    required
                                />
                                <button type="submit">שמור</button>
                                <button type="button" onClick={closeEdit}>בטל</button>
                            </form>
                        ) : (
                            <button className="time-value" onClick={() => openEdit('landing')} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 800 }}>
                                {formatDT(landingDate, landingTime)}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bubble-divider">|</div>

                <div className="time-item">
                    <span className="time-icon">🛫</span>
                    <div className="time-details">
                        <span className="time-label">המראה</span>
                        {editType === 'takeoff' ? (
                            <form className="time-edit-form" onSubmit={saveEdit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    required
                                />
                                <input
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    required
                                />
                                <button type="submit">שמור</button>
                                <button type="button" onClick={closeEdit}>בטל</button>
                            </form>
                        ) : (
                            <button className="time-value" onClick={() => openEdit('takeoff')} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 800 }}>
                                {formatDT(takeoffDate, takeoffTime)}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsHeader;
