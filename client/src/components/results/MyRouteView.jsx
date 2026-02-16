import React, { useState } from 'react';
import { useRoute } from '../../context/RouteContext';
import { translateCategory } from '../../utils/translationUtils';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useEffect } from 'react';


const containerStyle = {
    width: '100%',
    height: '100%'
};


const MyRouteView = ({ onBack , times}) => {

    
    
    const { myRoute, removeFromRoute, clearRoute } = useRoute();
    const [selectedItem, setSelectedItem] = useState(null);
    const [aiInfo, setAi] = useState();


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAXfZDMRBOrC08lOEZEPvnggjQyL3_B_SE"
    });
const promptText = myRoute.map(item => item.name).join(", ")


const aiFetch = async () => {
    setAi("AI מכין לך את המסלול...");
    try {
        const response = await fetch('http://localhost:3005/ai/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: promptText + JSON.stringify(times) }), // שליחת שמות המקומות ל-AI
        });

        // 1. חייב להשתמש ב-await כאן כדי לקבל את הנתונים עצמם
        const data = await response.json(); 
        
        console.log("AI Response:", data);

        // 2. מעדכנים את ה-State עם הנתונים שחזרו (למשל data.answer או data)
        // חשוב לוודא שמה שאתה מכניס ל-setAi הוא מחרוזת או מערך ולא אובייקט Response
        setAi(data.answer || data); 

    } catch(e) {
        console.log("Error in AI Fetch:", e);    
        setAi("אירעה שגיאה בקבלת המידע מה-AI. אנא נסה שוב מאוחר יותר.");    
    }
}


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
            <div className="explorer-header glass">
                <button className="back-btn-simple" onClick={onBack}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 19 19 12 12 5"></polyline>
                    </svg>
                    חזור
                </button>
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
                        <div className="items-grid">
                            {myRoute.map((item, index) => (
                                <div key={index} className="item-card-premium glass">
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

                        <div className="map-section-container">
                            <h3 className="section-title-premium">פריסת המסלול על המפה</h3>
                            <div className="map-resizable-wrapper">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={mapCenter}
                                        zoom={12}
                                        onLoad={map => {
                                            const bounds = new window.google.maps.LatLngBounds();
                                            myRoute.forEach(item => {
                                                if (item.lat && item.lon) {
                                                    bounds.extend({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                                                }
                                            });
                                            if (myRoute.length > 0) map.fitBounds(bounds);
                                        }}
                                    >
                                        {myRoute.filter(item => item.lat && item.lon).map((item, idx) => (
                                            <Marker
                                                key={idx}
                                                position={{ lat: parseFloat(item.lat), lng: parseFloat(item.lon) }}
                                                onClick={() => setSelectedItem(item)}
                                            />
                                        ))}

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
                    <div className="no-results-msg glass">
                        <span className="no-results-icon">🗺️</span>
                        <p>המסלול שלך ריק. התחל להוסיף מקומות מההמלצות!</p>
                        <button className="retry-btn" onClick={onBack}>חזור להמלצות</button>
                    </div>
                )}
            </div>

            <div className="ai-response-container">
  {/* אם ai הוא מחרוזת המכילה HTML, זה יציג אותו מעוצב */}
  <div dangerouslySetInnerHTML={{ __html: aiInfo }} />
</div>
<button onClick={aiFetch}>קבל Ai</button>
        </div>
    );
};

export default MyRouteView;
