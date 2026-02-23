import React, { useState, useEffect, use, useRef } from 'react';
import { translateCategory } from '../../../utils/translationUtils';
import { useAuth } from '../../../context/AuthContext';
import { useRoute } from '../../../context/RouteContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { API_BASE_URL } from '../../../constants';
import LoadingScreen from '../planner/LoadingScreen';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = {
    width: '100%',
    height: '250px',
    borderRadius: '12px',
    marginBottom: '15px'
};

/**
 * רכיב RecommendationsExplorer - עימוד חדש עם Side-Panel קבוע בצד ימין
 */
const RecommendationsExplorer = ({ type, destination, lat, lon, landingTime, takeoffTime, onBack, onRouteClick, setExplorerView }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNavId, setActiveNavId] = useState(null);
    const [selectedMapItem, setSelectedMapItem] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { user, openAuthModal } = useAuth();
    const { myRoute, addToRoute, removeFromRoute } = useRoute(); // הנחה שקיימת פונקציית removeFromRoute


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
    };

    const handleRemoveFromRoute = (item, e) => {
        e.stopPropagation();
        if (removeFromRoute) {
            removeFromRoute(item.place_id || item.name);
        }
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
        <div className="explorer-page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* כותרת הדף - מיקומה לא משתנה */}
            <div className="explorer-header-premium glass animate-in">
                <div className="explorer-header-top">
                    <div className="header-actions">
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

            <div className="explorer-layout">
                {/* צד ימין - Sticky Sidebar */}
                <aside className="explorer-sidebar">
                    <div className="sidebar-content glass" style={{ padding: '20px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                        {/* מפה קטנה עד בינונית */}
                        <div className="mini-map-container">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={mapCenter}
                                    zoom={13}
                                    options={{ disableDefaultUI: true, zoomControl: true }}
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
                                </GoogleMap>
                            ) : <div>טוען מפה...</div>}
                        </div>

                        {/* רשימת הבחירות שלי */}
                        <div className="my-selections-container">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a237e', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                                הבחירות שלי ({myRoute.length})
                            </h3>
                            <div className="selections-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {myRoute.length > 0 ? (
                                    myRoute.map((selected, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            background: '#f8fafc',
                                            borderRadius: '10px',
                                            marginBottom: '8px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                                {selected.name}
                                            </span>
                                            <button
                                                onClick={(e) => handleRemoveFromRoute(selected, e)}
                                                style={{
                                                    background: '#fee2e2',
                                                    border: 'none',
                                                    padding: '6px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: '0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>טרם הוספת מקומות למסלול</p>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* צד שמאל - רשימת אטרקציות נגללת */}
                <main className="explorer-main-content">
                    {items.length > 0 ? (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '15px',
                                margin: '20px 0',
                                width: '100%'
                            }}>
                                <button
                                    onClick={() => setExplorerView('attractions')}
                                    style={{
                                        padding: '12px 28px',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#ffffff',
                                        backgroundColor: '#1a237e', // כחול כהה
                                        border: 'none',
                                        borderRadius: '50px', // פינות מעוגלות מאוד (סגנון Pill)
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(26, 35, 126, 0.2)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        minWidth: '140px'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#283593';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 35, 126, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1a237e';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 35, 126, 0.2)';
                                    }}
                                >
                                    אטרקציות
                                </button>

                                <button
                                    onClick={() => setExplorerView('restaurants')}
                                    style={{
                                        padding: '12px 28px',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#ffffff',
                                        backgroundColor: '#1a237e', // כחול כהה
                                        border: 'none',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(26, 35, 126, 0.2)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        minWidth: '140px'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#283593';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 35, 126, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1a237e';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 35, 126, 0.2)';
                                    }}
                                >
                                    מסעדות
                                </button>
                            </div>
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
                                                <div className="rating-tag">⭐ {item.rating || '4.5'}</div>
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
                                                disabled={isInRoute(item)}
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
                                                                <a href={item.lat && item.lon ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}` : '#'} target="_blank" rel="noopener noreferrer" className="mini-nav-item">
                                                                    <img src="https://www.google.com/s2/favicons?sz=128&domain=maps.google.com" alt="Google" />
                                                                    <span>Google Maps</span>
                                                                </a>
                                                                <a href={`https://waze.com/ul?ll=${item.lat},${item.lon}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="mini-nav-item">
                                                                    <img src="https://www.google.com/s2/favicons?sz=128&domain=waze.com" alt="Waze" />
                                                                    <span>Waze</span>
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
                        </div>
                    ) : (
                        <div className="no-data-luxury glass">
                            <div className="no-data-icon">🔍</div>
                            <h3>לא נמצאו תוצאות מתאימות</h3>
                            <button className="back-home-btn" onClick={onBack}>חזור לחיפוש</button>
                        </div>
                    )}
                </main>
            </div>

            {showScrollTop && (
                <button className="scroll-top-btn animate-in" onClick={scrollToTop} title="גלילה לראש העמוד">↑</button>
            )}
            {/* --- כפתור הצג עוד --- */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '40px',
                marginBottom: '20px',
                width: '100%'
            }}>
                <button
                    onClick={() => {
                        /* כאן תוכל להוסיף לוגיקה לטעינת עוד פריטים בעתיד */
                        console.log("Loading more items...");
                    }}
                    style={{
                        padding: '14px 40px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#ffffff',
                        backgroundColor: '#1a237e', // כחול כהה זהה
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(26, 35, 126, 0.25)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#283593';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 35, 126, 0.35)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a237e';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 35, 126, 0.25)';
                    }}
                >
                    <span>הצג עוד תוצאות</span>
                    <span style={{ fontSize: '1.2rem' }}>↓</span>
                </button>
            </div>
        </div>
    );
};

export default RecommendationsExplorer;
