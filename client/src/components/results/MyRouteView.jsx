import React, { useState, useEffect } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import { calculateTripTime } from '../../utils/plannerUtils';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

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

    // useEffect to check for saved routes on page load
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
        console.log("Loaded saved routes from localStorage:", saved);
        // If we found a saved route for this specific destination, we could load it here
        const existing = saved.find(s => s.destination === destination);
        if (existing && !aiInfo) {
            setAi(existing.aiPlan);
            setShowSafetyBadge(true);
            setSaveStatus('saved');
        }
    }, [destination]);

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
            const response = await fetch('http://localhost:3006/ai/ask', {
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
        } catch (e) {
            console.error("AI Error:", e);
            setAi("אופס! נראה שיש עומס על שרתי ה-AI של גוגל (Quota Exceeded). ⏳ אנא המתן כדקה ונסה ללחוץ שוב, ניסינו להעביר אותך למודל חלופי.");
            setAiError(true);
            setIsTyping(false);
        }
    };

    const handleSaveRoute = () => {
        const aiPlan = aiInfo;
        const flightDetails = {
            destination: destination,
            landingDate: times.landingDate,
            landingTime: times.landingTime,
            takeoffDate: times.takeoffDate,
            takeoffTime: times.takeoffTime
        };

        if (!aiPlan) return;

        setSaveStatus('saving');

        // Logic to save multiple itineraries in an array
        const existingSaves = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
        const newSave = {
            ...flightDetails,
            aiPlan: aiPlan,
            timestamp: new Date().toISOString()
        };

        existingSaves.push(newSave);
        localStorage.setItem('saved_itineraries', JSON.stringify(existingSaves));

        // UI Feedback
        setSaveStatus('saved');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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
        <div className="explorer-page animate-in">
            <div className="explorer-header glass">
                <button className="back-btn-simple" onClick={onBack}>חזור</button>
                <div className="header-text-group">
                    <h2>המסלול שלי 🛣️</h2>
                    <p>המרת נתונים ל-{destination}</p>
                </div>
                {myRoute.length > 0 && <button className="clear-route-btn" onClick={clearRoute}>נקה הכל</button>}
            </div>

            <div className="explorer-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {myRoute.length > 0 ? (
                    <>
                        <div className="items-grid">
                            {myRoute.map((item, index) => (
                                <div key={index} className="item-card-premium glass">
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p className="item-address">📍 {item.address_line2}</p>
                                    </div>
                                    <div className="item-footer">
                                        <button className="remove-from-route-btn" onClick={() => removeFromRoute(item.place_id || item.name)}>הסר</button>
                                        <a href={item.googleMapsUri} target="_blank" rel="noopener noreferrer" className="item-action-btn maps-link-dual">ניווט</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="map-section-container">
                            <div className="map-resizable-wrapper" style={{ height: '300px', width: '100%', borderRadius: '15px', overflow: 'hidden' }}>
                                {isLoaded ? (
                                    <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12}>
                                        {myRoute.filter(item => item.lat && item.lon).map((item, idx) => (
                                            <Marker key={idx} position={{ lat: parseFloat(item.lat), lng: parseFloat(item.lon) }} onClick={() => setSelectedItem(item)} />
                                        ))}
                                    </GoogleMap>
                                ) : <div className="map-loading">טוען מפות...</div>}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-results-msg glass">
                        <p>המסלול שלך ריק. הוסף מקומות כדי להתחיל!</p>
                        <button className="retry-btn" onClick={onBack}>חזור להמלצות</button>
                    </div>
                )}
            </div>

            {aiInfo && (
                <div className="ai-response-card glass animate-in" style={{ marginTop: '20px', padding: '20px', width: '100%', maxWidth: '800px' }}>
                    <div className="ai-card-header">
                        <span className="ai-icon">🤖</span>
                        <h3>תכנית הטיול שלך</h3>
                    </div>
                    <div className={aiError ? "ai-error-state" : ""} dir="rtl">
                        <Typewriter html={aiInfo} onComplete={() => !aiError && setShowSafetyBadge(true)} />
                    </div>
                    {showSafetyBadge && !aiError && (
                        <div className="save-route-container animate-in" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className={`save-route-btn ${saveStatus}`} onClick={handleSaveRoute} disabled={saveStatus === 'saving' || saveStatus === 'saved'}>
                                {saveStatus === 'idle' && '💾 שמור מסלול'}
                                {saveStatus === 'saving' && '⌛ שומר...'}
                                {saveStatus === 'saved' && '✔️ נשמר!'}
                            </button>

                            {saveStatus === 'saved' && (
                                <button
                                    className="view-saved-btn"
                                    onClick={onViewSaved}
                                    style={{
                                        background: 'rgba(134, 189, 191, 0.2)',
                                        color: '#1a237e',
                                        border: '2px solid #86BDBF',
                                        padding: '12px 25px',
                                        borderRadius: '30px',
                                        fontWeight: '800',
                                        cursor: 'pointer'
                                    }}
                                >
                                    👀 צפה בכל המסלולים השמורים
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showToast && (
                <div className="toast-notification animate-in">
                    ✔️ Saved! Your itinerary is secure in local storage.
                </div>
            )}

            <button onClick={generateAiItinerary} className="ai-magic-button" disabled={isTyping} style={{ marginTop: '20px' }}>
                {isTyping ? '⌛ AI בתהליך תכנון...' : '✨ בנה לי מסלול מושלם עם AI'}
            </button>
        </div>
    );
};

export default MyRouteView;
