import React, { useState, useEffect } from 'react';
import { useRoute } from '../context/RouteContext';
import { translateCategory } from '../utils/translationUtils';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Ai from '../components/Ai';

// עיצוב קונטיינר המפה - תופס 100% מהשטח המוקצה
const containerStyle = {
    width: '100%',
    height: '100%'
};

/**
 * רכיב MyTrip - מציג את רשימת המקומות שהמשתמש בחר ואת פריסתם על המפה.
 * כולל אינטגרציה עם Google Maps API ושימוש ב-AI לבניית לו"ז.
 */
const MyTrip = ({ onBack, times }) => {
    // שליפת נתוני המסלול והפונקציות לניהולו מהקשר המסלול
    const { myRoute, removeFromRoute, clearRoute } = useRoute();
    // מצב לניהול פריט שנבחר על המפה (להצגת חלון מידע)
    const [selectedItem, setSelectedItem] = useState(null);

    // טעינת ספריית המפות של גוגל
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAXfZDMRBOrC08lOEZEPvnggjQyL3_B_SE"
    });

    /**
     * פונקציה לחישוב מרכז המפה על בסיס ממוצע המיקומים במסלול.
     * אם אין מקומות, המפה תתמרכז במיקום ברירת מחדל (לונדון).
     */
    const getMapCenter = () => {
        const validItems = myRoute.filter(item => item.lat && item.lon);
        if (validItems.length === 0) return { lat: 51.505, lng: -0.09 };

        const avgLat = validItems.reduce((sum, item) => sum + parseFloat(item.lat), 0) / validItems.length;
        const avgLon = validItems.reduce((sum, item) => sum + parseFloat(item.lon), 0) / validItems.length;
        return { lat: avgLat, lng: avgLon };
    };

    const mapCenter = getMapCenter();

    return (
        <div className="explorer-page animate-in">
            {/* כותרת הדף עם אפשרות לניקוי כל המסלול */}
            <div className="explorer-header glass">
                <div className="header-text-group">
                    <h2>המסלול שלי 🛣️</h2>
                    <p>המקומות ששמרת לטיול שלך</p>
                </div>
                {myRoute.length > 0 && (
                    <button className="clear-route-btn" onClick={clearRoute}>
                        נקה הכל
                    </button>
                )}
            </div>

            <div className="explorer-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {myRoute.length > 0 ? (
                    <>
                        {/* תצוגת כרטיסיות עבור כל מקום שנבחר */}
                        <div className="items-grid">
                            {myRoute.map((item, index) => (
                                <div key={index} className="item-card-premium glass">
                                    {/* הצגת תמונה אם קיימת */}
                                    {item.photoUrl && (
                                        <div className="item-card-image">
                                            <img src={item.photoUrl} alt={item.name} loading="lazy" />
                                            <div className="image-overlay-gradient"></div>
                                        </div>
                                    )}
                                    <div className="item-card-header">
                                        <div className="item-icon-circle-premium">
                                            {item.categories?.includes('Restaurant') ? '🍽️' : '🎡'}
                                        </div>
                                        <div className="item-rating-badge">
                                            ⭐ {item.rating || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="item-info">
                                        <div className="item-title-row">
                                            <h4>{item.name || 'מקום ללא שם'}</h4>
                                        </div>
                                        <p className="item-address">
                                            <span className="icon-tiny">📍</span>
                                            {item.address_line2 || 'כתובת לא ידועה'}
                                        </p>
                                    </div>

                                    <div className="item-footer">
                                        {/* כפתור הסרה שמעדכן את ה-Context הגלובלי */}
                                        <button
                                            className="remove-from-route-btn"
                                            onClick={() => removeFromRoute(item.place_id || item.name)}
                                        >
                                            הסר מהמסלול
                                        </button>
                                        <div className="button-group-dual">
                                            <a
                                                href={item.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name || '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="item-action-btn maps-link-dual"
                                                style={{ width: '100%', gridColumn: 'span 2' }}
                                            >
                                                <span className="icon-btn">🗺️</span>
                                                ניווט בגוגל מפות
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* סקציית המפה המציגה את כל הנקודות */}
                        <div className="map-section-container">
                            <h3 className="section-title-premium">פריסת המסלול על המפה</h3>
                            <div className="map-resizable-wrapper">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={mapCenter}
                                        zoom={12}
                                        onLoad={map => {
                                            // התאמת זום המפה כך שכל המרקרים יופיעו בו זמנית
                                            const bounds = new window.google.maps.LatLngBounds();
                                            myRoute.forEach(item => {
                                                if (item.lat && item.lon) {
                                                    bounds.extend({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                                                }
                                            });
                                            if (myRoute.length > 0) map.fitBounds(bounds);
                                        }}
                                    >
                                        {/* ציור מרקר לכל אטרקציה */}
                                        {myRoute.filter(item => item.lat && item.lon).map((item, idx) => (
                                            <Marker
                                                key={idx}
                                                position={{ lat: parseFloat(item.lat), lng: parseFloat(item.lon) }}
                                                onClick={() => setSelectedItem(item)}
                                            />
                                        ))}

                                        {/* חלון מידע קופץ בעת לחיצה על מרקר */}
                                        {selectedItem && (
                                            <InfoWindow
                                                position={{ lat: parseFloat(selectedItem.lat), lng: parseFloat(selectedItem.lon) }}
                                                onCloseClick={() => setSelectedItem(null)}
                                            >
                                                <div className="map-popup-content">
                                                    <strong>{selectedItem.name}</strong>
                                                    <p>{selectedItem.address_line2}</p>
                                                </div>
                                            </InfoWindow>
                                        )}
                                    </GoogleMap>
                                ) : <div className="map-loading">טוען מפות גוגל...</div>}
                                <div className="resize-handle-hint">↕️ גרור לשינוי גובה המפה</div>
                            </div>
                        </div>
                    </>
                ) : (
                    // הודעה המוצגת כשהמסלול ריק
                    <div className="no-results-msg glass">
                        <span className="no-results-icon">🗺️</span>
                        <p>המסלול שלך ריק. התחל להוסיף מקומות מההמלצות!</p>
                        <button className="retry-btn" onClick={onBack}>חזור להמלצות</button>
                    </div>
                )}
            </div>

            {/* רכיב ה-AI שמנתח את המסלול ובונה את הלו"ז המפורט */}
            <Ai times={times} myRoute={myRoute} />

        </div>
    );
};

export default MyTrip;
