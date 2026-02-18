import React, { useState, useEffect } from 'react';
import { translateCategory } from '../../../utils/translationUtils';
import { useAuth } from '../../../context/AuthContext';
import { useRoute } from '../../../context/RouteContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { API_BASE_URL } from '../../../constants';
import LoadingScreen from '../planner/LoadingScreen';

const containerStyle = {
    width: '100%',
    height: '100%'
};

/**
 * רכיב RecommendationsExplorer - "דף חדש" המציג תוצאות אמת מה-API.
 */
const RecommendationsExplorer = ({ type, destination, lat, lon, landingTime, takeoffTime, onBack, onRouteClick }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNavId, setActiveNavId] = useState(null);
    const [selectedMapItem, setSelectedMapItem] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { user, openAuthModal } = useAuth();
    const { myRoute, addToRoute } = useRoute();

    // Toggle visibility of scroll-to-top button
    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScrollTop && window.pageYOffset > 80) {
                setShowScrollTop(true);
            } else if (showScrollTop && window.pageYOffset <= 80) {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScrollTop]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAXfZDMRBOrC08lOEZEPvnggjQyL3_B_SE"
    });

    const handleAddToRoute = (item) => {
        if (!user) {
            openAuthModal('עליך להתחבר כדי לבנות מסלול ולהתחיל לתכנן את הטיול שלך');
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
                const url = `${API_BASE_URL}/airports/${endpoint}?lon=${lon}&lat=${lat}&landingTime=${landingTime}&takeoffTime=${takeoffTime}`;
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

    const getMapCenter = () => {
        if (lat && lon) return { lat: parseFloat(lat), lng: parseFloat(lon) };
        return { lat: 51.505, lng: -0.09 };
    };

    const mapCenter = getMapCenter();

    // בדיקה האם פריט כבר נמצא במסלול
    const isInRoute = (item) => {
        return myRoute.some(r => r.place_id === item.place_id || r.name === item.name);
    };

    if (loading) {
        const loadingMessage = type === 'restaurants'
            ? "מחפש את המסעדות המומלצות באיזור..."
            : "מחפש את האטרקציות המומלצות באיזור...";
        return <LoadingScreen message={loadingMessage} />;
    }

    return (
        <div className="explorer-page">
            <div className="animate-in">
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
                    {items.length > 0 ? (
                        <>
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
                                                {item.properties?.distance && (
                                                    <div className="dist-tag" style={{ background: 'white', padding: '4px 10px', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', color: '#1a237e' }}>
                                                        {item.properties.distance} ק"מ
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
                                                {item.open_now !== null && item.open_now !== undefined ? (
                                                    <>
                                                        <span className={`status-dot ${item.open_now ? 'online' : 'away'}`}></span>
                                                        {item.open_now ? 'פתוח עכשיו' : 'סגור כעת'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="status-dot unknown" style={{ background: '#94a3b8' }}></span>
                                                        <span>בדיקת שעות במקום</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card-footer-luxury">
                                            <button
                                                className={`add-route-action-btn ${isInRoute(item) ? 'item-added' : ''}`}
                                                onClick={() => handleAddToRoute(item)}
                                                style={isInRoute(item) ? { background: '#26a69a' } : {}}
                                            >
                                                <span className="icon-plus-plus"></span>
                                                {isInRoute(item) ? '✓ נוסף למסלול' : 'הוספה למסלול שלי'}
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

                            {/* תצוגת מפה מורחבת מתחת לכרטיסיות */}
                            <div className="map-section-container">
                                <h3 className="section-title-premium">גלה את הסביבה על המפה</h3>
                                <div className="map-resizable-wrapper">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={containerStyle}
                                            center={mapCenter}
                                            zoom={14}
                                            onLoad={map => {
                                                const bounds = new window.google.maps.LatLngBounds();
                                                items.forEach(item => {
                                                    if (item.lat && item.lon) {
                                                        bounds.extend({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                                                    }
                                                });
                                                if (items.length > 0) map.fitBounds(bounds);
                                            }}
                                        >
                                            {items.filter(item => item.lat && item.lon).map((item, idx) => (
                                                <Marker
                                                    key={idx}
                                                    position={{ lat: parseFloat(item.lat), lng: parseFloat(item.lon) }}
                                                    onClick={() => setSelectedMapItem(item)}
                                                    icon={{
                                                        url: isInRoute(item)
                                                            ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                                            : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                                    }}
                                                />
                                            ))}

                                            {selectedMapItem && (
                                                <InfoWindow
                                                    position={{ lat: parseFloat(selectedMapItem.lat), lng: parseFloat(selectedMapItem.lon) }}
                                                    onCloseClick={() => setSelectedMapItem(null)}
                                                >
                                                    <div className="map-popup-content">
                                                        <strong>{selectedMapItem.name}</strong>
                                                        <p>{selectedMapItem.address_line2}</p>
                                                        <button
                                                            onClick={() => handleAddToRoute(selectedMapItem)}
                                                            disabled={isInRoute(selectedMapItem)}
                                                            style={{
                                                                marginTop: '10px',
                                                                padding: '5px 12px',
                                                                background: '#1a237e',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                opacity: isInRoute(selectedMapItem) ? 0.6 : 1
                                                            }}
                                                        >
                                                            {isInRoute(selectedMapItem) ? 'כבר במסלול ✅' : 'הוסף למסלול +'}
                                                        </button>
                                                    </div>
                                                </InfoWindow>
                                            )}
                                        </GoogleMap>
                                    ) : <div className="map-loading">טוען מפות...</div>}
                                    <div className="resize-handle-hint">↕️ גרור לשינוי גובה המפה | כחול = המלצות | ירוק = הבחירות שלך</div>
                                </div>
                            </div>
                        </>
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
            {showScrollTop && (
                <button
                    className="scroll-top-btn animate-in"
                    onClick={scrollToTop}
                    title="גלילה לראש העמוד"
                >
                    ↑
                </button>
            )}
        </div>
    );
};

export default RecommendationsExplorer;
