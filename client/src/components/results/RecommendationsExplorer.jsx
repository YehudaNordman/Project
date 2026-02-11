import React, { useState, useEffect } from 'react';
import { translateCategory } from '../../utils/translationUtils';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '../../context/RouteContext';

/**
 * רכיב RecommendationsExplorer - "דף חדש" המציג תוצאות אמת מה-API.
 * מציג רשימה של מסעדות או אטרקציות שנמשכו מהשרת.
 */
const RecommendationsExplorer = ({ type, destination, lat, lon, landingTime, takeoffTime, onBack, onRouteClick }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { addToRoute } = useRoute();

    const handleAddToRoute = (item) => {
        if (!user) {
            alert('עליך להתחבר כדי לבנות מסלול');
            return;
        }
        addToRoute(item);
        alert(`התווסף למסלול: ${item.name}`);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const endpoint = type === 'restaurants' ? 'fetchRestaurants' : 'fetchAttractions';
<<<<<<< HEAD

                // שליחת הבקשה לשרת עם פרמטרי זמן בפורמט ISO
                // השרת יחשב את הרדיוס ויבצע את החיפוש לפי המיקום המדויק מ-airports.json
                const url = `http://172.20.10.3:3005/airports/${endpoint}?lon=${lon}&lat=${lat}&landingTime=${landingTime}&takeoffTime=${takeoffTime}`;
=======
                const url = `http://localhost:3005/airports/${endpoint}?lon=${lon}&lat=${lat}&landingTime=${landingTime}&takeoffTime=${takeoffTime}`;
>>>>>>> 62be9b40abf2fd55fc79526a89a9cbc9813dd9a0

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
            {/* הדר מעוצב בסגנון פרימיום */}
            <div className="explorer-header-premium glass">
                <div className="explorer-header-top">
                    <div className="header-actions">
                        <button className="back-btn-modern" onClick={onBack}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            חזרה לתוצאות
                        </button>
                        {user && (
                            <button className="navbar-route-btn explorer-route-btn-premium" onClick={onRouteClick}>
                                <span className="icon-btn">🛣️</span>
                                עבר למסלול שלי
                            </button>
                        )}
                    </div>
                </div>

                <div className="explorer-header-main">
                    <h1 className="explorer-title-premium">
                        {type === 'restaurants' ? 'חוויה קולינרית' : 'אטרקציות ופנאי'}
                        <span className="dest-text"> ב{destination}</span>
                    </h1>
                    <p className="explorer-subtitle-premium">אספנו עבורך המלצות איכותיות שמשתלבות בלוח הזמנים שלך</p>
                </div>
            </div>

            <div className="explorer-content">
                {loading ? (
                    <div className="explorer-loading-view">
                        <div className="spinner-luxury"></div>
                        <p>אנחנו אוספים את המקומות הטובים ביותר עבורך...</p>
                    </div>
                ) : items.length > 0 ? (
                    <div className="items-grid-premium">
                        {items.map((item, index) => (
                            <div key={index} className="item-card-luxury glass animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="card-media">
                                    {item.photoUrl ? (
                                        <img src={item.photoUrl} alt={item.name} loading="lazy" />
                                    ) : (
                                        <div className="placeholder-media">
                                            {type === 'restaurants' ? '🍽️' : '🎡'}
                                        </div>
                                    )}
                                    <div className="media-overlay">
                                        <div className="rating-tag">
                                            ⭐ {item.rating || '4.5'}
                                        </div>
                                        {item.distance && (
                                            <div className="dist-tag">
                                                {(item.distance / 1000).toFixed(1)} ק"מ מהמרכז
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-body-luxury">
                                    <div className="category-row">
                                        <span className="item-category-label">
                                            {item.categories ? translateCategory(item.categories[0]) : (type === 'restaurants' ? 'מסעדה' : 'אטרקציה')}
                                        </span>
                                    </div>
                                    <h4 className="item-title-luxury">{item.name || 'מקום מומלץ'}</h4>
                                    <p className="item-address-luxury">📍 {item.address_line2 || item.street || 'כתובת זמינה בבחירה'}</p>

                                    <div className="item-status-luxury">
                                        <span className={`status-dot ${item.open_now ? 'online' : 'away'}`}></span>
                                        {item.open_now ? 'פתוח עכשיו' : 'סגור כעת'}
                                    </div>
                                </div>

                                <div className="card-footer-luxury">
                                    <button className="add-route-action-btn" onClick={() => handleAddToRoute(item)}>
                                        <span className="icon-plus-plus">+</span>
                                        הוספה למסלול שלי
                                    </button>

                                    <div className="dual-action-row">
                                        <a href={item.googleMapsUri} target="_blank" rel="noopener noreferrer" className="action-btn-luxury maps">
                                            🚀 ניווט מהיר
                                        </a>
                                        {item.website && (
                                            <a href={item.website} target="_blank" rel="noopener noreferrer" className="action-btn-luxury site">
                                                🌐 לאתר
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-data-luxury glass">
                        <div className="no-data-icon">🔍</div>
                        <h3>לא נמצאו תוצאות מתאימות</h3>
                        <p>נסה לשנות את זמני השהות או לחפש יעד קרוב אחר.</p>
                        <button className="back-home-btn" onClick={onBack}>חזור לחיפוש</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationsExplorer;
