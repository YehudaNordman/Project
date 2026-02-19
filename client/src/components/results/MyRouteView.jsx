import React, { useState, useEffect } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import { calculateTripTime } from '../../services/plannerService';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { API_BASE_URL } from '../../constants';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const Typewriter = ({ html, speed = 10, onComplete }) => {
    const [displayedHtml, setDisplayedHtml] = useState("");

    useEffect(() => {
        let i = 0;
        let current = "";
        setDisplayedHtml("");
        const timer = setInterval(() => {
            if (i < html.length) {
                if (html[i] === '<') {
                    const closingIndex = html.indexOf('>', i);
                    if (closingIndex !== -1) {
                        current += html.substring(i, closingIndex + 1);
                        i = closingIndex + 1;
                    } else {
                        current += html[i];
                        i++;
                    }
                } else {
                    current += html[i];
                    i++;
                }
                setDisplayedHtml(current);
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [html, speed, onComplete]);

    return <div className="ai-content" dangerouslySetInnerHTML={{ __html: displayedHtml }} />;
};

const MyRouteView = ({ onBack, times, onViewSaved }) => {
    const { myRoute, removeFromRoute, clearRoute } = useRoute();
    const { token, user, openAuthModal } = useAuth();
    const [selectedItem, setSelectedItem] = useState(null);
    const [aiInfo, setAi] = useState();
    const [isTyping, setIsTyping] = useState(false);
    const [aiError, setAiError] = useState(false);
    const [showSafetyBadge, setShowSafetyBadge] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [showToast, setShowToast] = useState(false);

    // Extracting destination and calculating netTravelTime
    const destination = times?.destination || "Unknown Destination";

    const tripMetrics = (times?.landingDate && times?.takeoffDate)
        ? calculateTripTime(times.landingDate, times.landingTime, times.takeoffDate, times.takeoffTime)
        : null;

    const netTravelTime = tripMetrics ? (tripMetrics.netMinutes / 60).toFixed(1) : "N/A";

    // Removed automatic loading of saved routes to ensure new searches always start fresh.
    // This addresses the user's request to not show old, outdated routes for the same destination.

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAXfZDMRBOrC08lOEZEPvnggjQyL3_B_SE"
    });

    const generateAiItinerary = async () => {
        // Validation check
        if (!times?.landingDate || !times?.takeoffDate) {
            setAi("⚠️ שים לב: עליך למלא את פרטי הטיסה (נחיתה והמראה) בטופס הראשי כדי שה-AI יוכל לתכנן לך מסלול לפי הזמן הזמין לך.");
            setAiError(true);
            return;
        }

        if (myRoute.length === 0) {
            setAi("⚠️ המסלול שלך ריק. הוסף לפחות מקום אחד (מסעדה או אטרקציה) כדי שה-AI יוכל לבנות לך תכנית.");
            setAiError(true);
            return;
        }

        setIsTyping(true);
        setAiError(false);
        setAi("");

        const systemPrompt = `You are a travel expert for BonusTrip. Plan a layout for ${destination} for ${netTravelTime} hours. Return a structured list with times.`;
        const itinerarySummary = myRoute.map(item => `${item.name} (${item.address_line2 || ''})`).join(', ');

        const enhancedPrompt = `
            Context: Flight times are from ${times.landingTime} to ${times.takeoffTime}.
            Available Time: ${netTravelTime} hours.
            Places chosen by user: ${itinerarySummary}
            
            Instruction: ${systemPrompt}
            Important: Return exactly in Hebrew and use HTML tags like <h3> and <ul>.
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/ai/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: enhancedPrompt }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error');
            }

            setAi(data.answer);
            setIsTyping(false);
            setSaveStatus('idle'); // Reset save status for new generation
        } catch (e) {
            console.error("AI Error:", e);
            setAi("אופס! נראה שיש עומס על שרתי ה-AI של גוגל (Quota Exceeded). ⏳ אנא המתן כדקה ונסה ללחוץ שוב, ניסינו להעביר אותך למודל חלופי.");
            setAiError(true);
            setIsTyping(false);
        }
    };

    const handleSaveRoute = async () => {
        const aiPlan = aiInfo;
        const flightDetails = {
            destination: destination,
            landingDate: times.landingDate,
            landingTime: times.landingTime,
            takeoffDate: times.takeoffDate,
            takeoffTime: times.takeoffTime
        };

        if (!aiPlan) return;

        if (!user) {
            openAuthModal("עליך להתחבר כדי לשמור ולצפות במסלולים שלך באזור האישי");
            return;
        }

        setSaveStatus('saving');

        try {
            // Save to Local Storage for guest/quick access
            const existingSaves = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
            const newSave = {
                ...flightDetails,
                aiPlan: aiPlan,
                timestamp: new Date().toISOString()
            };
            existingSaves.push(newSave);
            localStorage.setItem('saved_itineraries', JSON.stringify(existingSaves));

            // Save to Server Database if user is logged in
            if (token) {
                await fetch(`${API_BASE_URL}/user/save-route`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ itinerary: aiPlan, times: flightDetails }),
                });
            }

            setSaveStatus('saved');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            console.error("Error saving route:", err);
            setSaveStatus('idle');
        }
    };

    const getMapCenter = () => {
        const validItems = myRoute.filter(item => item.lat && item.lon);
        if (validItems.length === 0) return { lat: 51.505, lng: -0.09 };
        const avgLat = validItems.reduce((sum, item) => sum + parseFloat(item.lat), 0) / validItems.length;
        const avgLon = validItems.reduce((sum, item) => sum + parseFloat(item.lon), 0) / validItems.length;
        return { lat: avgLat, lng: avgLon };
    };

    const mapCenter = getMapCenter();

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
                        <h1 className="explorer-title-premium">
                            המסלול שלי
                            <span className="dest-text"> ל-{destination}</span>
                        </h1>
                        <p className="explorer-subtitle-premium">
                            {myRoute.length > 0
                                ? `בחרת ${myRoute.length} מקומות מדהים! בוא נהפוך אותם לטיול.`
                                : 'המסלול שלך עדיין ריק. הוסף מקומות כדי להתחיל!'}
                        </p>
                        {myRoute.length > 0 && (
                            <button className="clear-route-link" onClick={clearRoute} style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                marginTop: '10px',
                                fontSize: '0.9rem'
                            }}>
                                נקה את כל המסלול
                            </button>
                        )}
                    </div>
                </div>

                <div className="explorer-content">
                    {myRoute.length > 0 ? (
                        <>
                            <div className="items-grid-premium">
                                {myRoute.map((item, index) => (
                                    <div key={index} className="item-card-luxury glass animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <div className="card-media">
                                            {item.photoUrl ? (
                                                <img src={item.photoUrl} alt={item.name} loading="lazy" />
                                            ) : (
                                                <div className="placeholder-media">📍</div>
                                            )}
                                            <div className="media-overlay">
                                                <div className="rating-tag">
                                                    ⭐ {item.rating || '4.5'}
                                                </div>
                                            </div>
                                            <button
                                                className="remove-icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromRoute(item.place_id || item.name);
                                                }}
                                                title="הסר מהמסלול"
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    left: '10px',
                                                    zIndex: 10,
                                                    background: 'rgba(255,255,255,0.95)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                    color: '#ef4444',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.background = '#fff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="card-body-luxury">
                                            <h4 className="item-title-luxury">{item.name}</h4>
                                            <p className="item-address-luxury">📍 {item.address_line2 || item.formatted_address}</p>
                                        </div>

                                        <div className="card-footer-luxury">
                                            <div className="dual-action-row">
                                                <a href={item.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`}
                                                    target="_blank" rel="noopener noreferrer" className="action-btn-luxury maps">
                                                    🗺️ נווט
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="map-section-container">
                                <h3 className="section-title-premium">תצוגת המסלול על המפה</h3>
                                <div className="map-resizable-wrapper">
                                    {isLoaded ? (
                                        <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12}>
                                            {myRoute.filter(item => item.lat && item.lon).map((item, idx) => (
                                                <Marker
                                                    key={idx}
                                                    position={{ lat: parseFloat(item.lat), lng: parseFloat(item.lon) }}
                                                    onClick={() => setSelectedItem(item)}
                                                />
                                            ))}
                                        </GoogleMap>
                                    ) : <div className="map-loading">טוען מפות...</div>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-data-luxury glass">
                            <div className="no-data-icon">🗺️</div>
                            <h3>עדיין לא בחרת מקומות</h3>
                            <p>חזור לרשימת ההמלצות ובחר את המקומות שהכי אהבת.</p>
                            <button className="back-home-btn" onClick={onBack}>חזור להמלצות</button>
                        </div>
                    )}
                </div>

                {/* AI Section stays but wrapped in animate-in-up class if needed, or kept as is */}
                <div style={{ padding: '0 20px 100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                    {myRoute.length > 0 && (
                        <button onClick={generateAiItinerary} className="ai-magic-button" disabled={isTyping} style={{ width: '100%', maxWidth: '600px', margin: '20px auto', display: 'block' }}>
                            {isTyping ? '⌛ AI בתהליך תכנון...' : '✨ בנה לי מסלול מושלם עם AI'}
                        </button>
                    )}

                    {aiInfo && (
                        <div className="ai-response-card glass animate-in" style={{ marginTop: '30px' }}>
                            <div className="ai-card-header">
                                <span className="ai-icon">🤖</span>
                                <h3>תכנית הטיול שלך</h3>
                            </div>
                            <div className={aiError ? "ai-error-state" : ""} dir="rtl">
                                <div className="ai-content" dangerouslySetInnerHTML={{ __html: aiInfo }} />
                            </div>
                            {!aiError && (
                                <div className="save-route-container animate-in">
                                    <button className={`save-route-btn ${saveStatus}`} onClick={handleSaveRoute} disabled={saveStatus === 'saving' || saveStatus === 'saved'}>
                                        {saveStatus === 'idle' && '💾 שמור מסלול'}
                                        {saveStatus === 'saving' && '⌛ שומר...'}
                                        {saveStatus === 'saved' && '✔️ נשמר!'}
                                    </button>

                                    {saveStatus === 'saved' && user && (
                                        <button
                                            className="view-saved-btn"
                                            onClick={onViewSaved}
                                        >
                                            👀 צפה בכל המסלולים השמורים
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showToast && (
                <div className="toast-notification animate-in">
                    ✔️ המסלול נשמר בהצלחה!
                </div>
            )}
        </div>
    );
};

export default MyRouteView;