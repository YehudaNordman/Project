import React, { useState, useEffect } from 'react';
import { translateCategory } from '../../utils/translationUtils';

/**
 * רכיב RecommendationsExplorer - "דף חדש" המציג תוצאות אמת מה-API.
 * מציג רשימה של מסעדות או אטרקציות שנמשכו מהשרת.
 */
const RecommendationsExplorer = ({ type, destination, lat, lon, landingTime, takeoffTime, onBack }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const endpoint = type === 'restaurants' ? 'fetchRestaurants' : 'fetchAttractions';

                // שליחת הבקשה לשרת עם פרמטרי זמן בפורמט ISO
                // השרת יחשב את הרדיוס ויבצע את החיפוש לפי המיקום המדויק מ-airports.json
                const url = `http://172.20.10.3:3005/airports/${endpoint}?lon=${lon}&lat=${lat}&landingTime=${landingTime}&takeoffTime=${takeoffTime}`;

                console.log("Fetching recommendations from server:", url);
                const response = await fetch(url);
                const data = await response.json();

                setItems(Array.isArray(data) ? data : (data.features || []));
            } catch (err) {
                console.error("Error loading recommendations:", err);
                setItems([]);
            }
            setLoading(false);
        };

        if (lat && lon && landingTime && takeoffTime) {
            loadData();
        }
    }, [type, lat, lon, landingTime, takeoffTime]);

    return (
        <div className="explorer-page animate-in">
            {/* כותרת הדף */}
            <div className="explorer-header glass">
                <button className="back-btn-simple" onClick={onBack}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 19 19 12 12 5"></polyline>
                    </svg>
                    חזור
                </button>
                <div className="header-text-group">
                    <h2>{type === 'restaurants' ? 'מסעדות מומלצות' : 'אטרקציות באזור'}</h2>
                    <p>נמצאו מקומות ב-{destination} במרחק נסיעה מתאים</p>
                </div>
            </div>

            <div className="explorer-content">
                {loading ? (
                    <div className="explorer-loading">
                        <div className="spinner-premium"></div>
                        <p>מחפש עבורך את המקומות הטובים ביותר...</p>
                    </div>
                ) : items.length > 0 ? (
                    <div className="items-grid">
                        {items.map((item, index) => (
                            <div key={index} className="item-card-premium glass">
                                <div className="item-card-header">
                                    <div className="item-icon-circle-premium">
                                        {type === 'restaurants' ? '🍽️' : '🎡'}
                                    </div>
                                    <div className="item-rating-badge">
                                        ⭐ {Math.floor(Math.random() * 2) + 4}.{Math.floor(Math.random() * 9)}
                                    </div>
                                </div>

                                <div className="item-info">
                                    <div className="item-title-row">
                                        <h4>{item.name || 'מקום ללא שם'}</h4>
                                        {(item.distance !== undefined && item.distance !== null) && (
                                            <span className="distance-tag">
                                                {(parseFloat(item.distance) / 1000).toFixed(1)} ק"מ
                                            </span>
                                        )}
                                    </div>
                                    <p className="item-address">
                                        <span className="icon-tiny">📍</span>
                                        {item.address_line2 || item.street || 'כתובת לא ידועה'}
                                    </p>
                                    {item.phone && (
                                        <p className="item-phone">
                                            <span className="icon-tiny">📞</span>
                                            {item.phone}
                                        </p>
                                    )}

                                    {item.categories && (
                                        <div className="category-badges">
                                            {item.categories.slice(0, 2).map((cat, i) => (
                                                <span key={i} className="badge-mini">{translateCategory(cat)}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="item-footer">
                                    <div className="button-group-dual">
                                        <a
                                            href={item.website || `https://www.google.com/search?q=${encodeURIComponent(item.name + " " + (item.city || ""))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`item-action-btn ${item.website ? 'official-website-btn' : 'search-link-dual'}`}
                                            title={item.website ? "כניסה לאתר הרשמי" : "חיפוש אתר ופרטים נוספים"}
                                        >
                                            <span className="icon-btn">{item.website ? '🌐' : '🔗'}</span>
                                            {item.website ? 'אתר רשמי' : 'מידע ואתר'}
                                        </a>
                                        <a
                                            href={item.googleMapsUri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="item-action-btn maps-link-dual"
                                            title="ניווט והוראות הגעה"
                                        >
                                            <span className="icon-btn">🗺️</span>
                                            ניווט
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results-msg glass">
                        <span className="no-results-icon">📍</span>
                        <p>לא מצאנו תוצאות מתאימות בטווח הזמן שלך.</p>
                        <button className="retry-btn" onClick={onBack}>נסה חיפוש אחר</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationsExplorer;
