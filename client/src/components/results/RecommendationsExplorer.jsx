import React, { useState, useEffect } from 'react';
import { translateCategory } from '../../utils/translationUtils';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '../../context/RouteContext';

import QuickToolsSection from './QuickToolsSection';

/**
 * רכיב RecommendationsExplorer - "דף חדש" המציג תוצאות אמת מה-API.
 * מציג רשימה של מסעדות או אטרקציות שנמשכו מהשרת.
 */
const RecommendationsExplorer = ({ type, destination, lat, lon, landingTime, takeoffTime, onBack, onRouteClick }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNavId, setActiveNavId] = useState(null);
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

    const toggleNavOptions = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveNavId(activeNavId === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveNavId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const endpoint = type === 'restaurants' ? 'fetchRestaurants' : 'fetchAttractions';


                // שליחת הבקשה לשרת עם פרמטרי זמן בפורמט ISO
                // השרת יחשב את הרדיוס ויבצע את החיפוש לפי המיקום המדויק מ-airports.json
                const url = `http://localhost:3005/airports/${endpoint}?lon=${lon}&lat=${lat}&landingTime=${landingTime}&takeoffTime=${takeoffTime}`;
                console.log("Fetching recommendations from server:", url);
                const response = await fetch(url);
                const data = await response.json();
                console.log("Data received from server:", data);

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
            <div className="explorer-header-premium glass">
                <div className="explorer-header-top">
                    <div className="header-actions">
                        <button className="back-btn-circle-top" onClick={onBack} title="חזרה">
                            <svg viewBox="0 0 24 24" width="42" height="42" stroke="#1a237e" strokeWidth="2.5" fill="none">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="10 8 14 12 10 16"></polyline>
                                <line x1="8" y1="12" x2="14" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="explorer-header-main">
                    {user && (
                        <div className="hero-route-container">
                            <button className="hero-route-btn-premium" onClick={onRouteClick}>
                                <span className="hero-route-icon">🗺️</span>
                                <span className="hero-route-text">צפה במסלול האישי שלי</span>
                            </button>
                        </div>
                    )}
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

                                    <div className="dual-action-row" style={{ position: 'relative' }}>
                                        <div className="nav-btn-wrapper">
                                            <a href="#" onClick={(e) => toggleNavOptions(e, item.place_id || index)} className="action-btn-luxury maps">
                                                🚀 ניווט מהיר
                                            </a>

                                            {activeNavId === (item.place_id || index) && (
                                                <div className="mini-nav-popup animate-in" onClick={e => e.stopPropagation()}>
                                                    <div className="mini-nav-grid">
                                                        <a href={item.lat && item.lon ?
                                                            `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}` :
                                                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`}
                                                            target="_blank" rel="noopener noreferrer" className="mini-nav-item">
                                                            <img src="https://www.google.com/s2/favicons?sz=128&domain=maps.google.com" alt="Google" />
                                                            <span>Google Maps</span>
                                                        </a>
                                                        <a href={item.lat && item.lon ?
                                                            `https://waze.com/ul?ll=${item.lat},${item.lon}&navigate=yes` :
                                                            `https://waze.com/ul?q=${encodeURIComponent(item.name)}&navigate=yes`}
                                                            target="_blank" rel="noopener noreferrer" className="mini-nav-item">
                                                            <img src="https://www.google.com/s2/favicons?sz=128&domain=waze.com" alt="Waze" />
                                                            <span>Waze</span>
                                                        </a>
                                                        <a href={`https://moovitapp.com/index/he/תחבורה_ציבורית-directions?to=${encodeURIComponent(item.name)}&dest.lat=${item.lat}&dest.lon=${item.lon}`}
                                                            target="_blank" rel="noopener noreferrer" className="mini-nav-item">
                                                            <img src="https://www.google.com/s2/favicons?sz=128&domain=moovit.com" alt="Moovit" />
                                                            <span>Moovit</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {item.website && (
                                            <a href={item.website} target="_blank" rel="noopener noreferrer" className="action-btn-luxury site official">
                                                🌐 אתר רשמי
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
