import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import html2pdf from 'html2pdf.js';
import { API_BASE_URL } from '../../../constants';
import savedBg from '../../background/Gemini_Generated_Image_nin71enin71enin7.png';
import ItineraryStepCard from './ItineraryStepCard';

const tryParseJSON = (str) => {
    if (!str || typeof str !== 'string') return null;
    let jsonStr = str.trim();

    // Remove markdown code blocks
    jsonStr = jsonStr.replace(/^```json\s*|```$/g, '').trim();

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        // Find the first { or [ and the last } or ]
        const startBracket = jsonStr.search(/[\{\[]/);
        const endBracket = Math.max(jsonStr.lastIndexOf('}'), jsonStr.lastIndexOf(']'));

        if (startBracket !== -1 && endBracket !== -1 && endBracket > startBracket) {
            const potentialJson = jsonStr.substring(startBracket, endBracket + 1);
            try {
                return JSON.parse(potentialJson);
            } catch (e2) {
                return null;
            }
        }
    }
    return null;
};

const SavedItinerariesView = ({ onBack }) => {
    const { user, token } = useAuth();
    const [savedTrips, setSavedTrips] = useState([]);
    const [expandedTrip, setExpandedTrip] = useState(null);
    const [isSharing, setIsSharing] = useState(null); // ID of the trip being shared

    useEffect(() => {
        // Scroll to top when view opens
        window.scrollTo(0, 0);
        if (!user && onBack) {
            onBack();
        }
    }, [user, onBack]);

    useEffect(() => {
        const fetchUserRoutes = async () => {
            if (!user || !token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/user/my-itineraries`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setSavedTrips(data);
                }
            } catch (err) {
                console.error("Error fetching user routes:", err);
            }
        };
        fetchUserRoutes();
    }, [user, token]);

    if (!user) return null;

    const deleteTrip = async (e, tripId) => {
        e.stopPropagation();
        if (!window.confirm("האם אתה בטוח שברצונך למחוק את המסלול?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/user/itinerary/${tripId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const updated = savedTrips.filter(t => t._id !== tripId);
                setSavedTrips(updated);
                if (expandedTrip === tripId) setExpandedTrip(null);
            }
        } catch (err) {
            console.error("Error deleting trip:", err);
        }
    };

    const toggleExpand = (tripId) => {
        setExpandedTrip(expandedTrip === tripId ? null : tripId);
    };

    /**
     * PDF Generation Logic
     */
    const downloadDestinationPDF = (e, trip) => {
        e.stopPropagation();
        const element = document.createElement("div");
        element.style.padding = "40px";
        element.style.fontFamily = "'Assistant', sans-serif";
        element.style.direction = "rtl";
        element.style.background = "#fff";
        element.style.unicodeBidi = "isolate";

        // Parse JSON if possible, otherwise fallback to original
        let itineraryHtml = "";
        const parsed = tryParseJSON(trip.aiPlan);
        if (parsed) {
            const steps = parsed.itinerary || (Array.isArray(parsed) ? parsed : []);

            if (steps.length > 0) {
                itineraryHtml = `
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 15px;">
                    ${steps.map(step => `
                    <tr><td style="background: #f8f9fa; border-right: 4px solid #008080; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <span style="font-weight: 900; color: #008080; font-size: 18px;">${step.title}</span>
                            <span style="background: #008080; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 700; white-space: nowrap; direction: ltr;">
                                ${step.hours}
                            </span>
                        </div>
                        <div style="color: #444; margin-bottom: 12px; line-height: 1.6; font-size: 15px;">${step.description}</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                            <div>
                                <span style="font-weight: 700; color: #1a237e; font-size: 13px; display: block; margin-bottom: 4px;">🚗 הגעה:</span>
                                <span style="font-size: 13px; color: #666;">${step.transport}</span>
                            </div>
                            <div style="text-align: left; border-right: 1px solid #eee; padding-right: 15px;">
                                <span style="font-weight: 700; color: #d32f2f; font-size: 13px; display: block; margin-bottom: 4px;">🍴 אוכל מומלץ:</span>
                                <span style="font-size: 13px; color: #666;">${step.food}</span>
                            </div>
                        </div>
                    </td></tr>
                    `).join('')}
                </table>`;
            } else {
                itineraryHtml = `<div style="text-align: center; padding: 20px;">${trip.aiPlan}</div>`;
            }
        } else {
            itineraryHtml = `<div style="text-align: right; padding: 20px; line-height: 1.8;">${trip.aiPlan}</div>`;
        }

        element.innerHTML = `
            <div style="border: 2px solid #e0e0e0; border-radius: 15px; padding: 30px;">
                <table style="width: 100%; margin-bottom: 30px;">
                    <tr><td class="pdf-header-cell">
                        <div style="float: left; font-size: 26px; font-weight: 900; color: #1a237e;">Bonus<span style="color: #86BDBF;">Trip</span></div>
                        <div style="float: right;"><h1 style="margin: 0; color: #008080; font-size: 28px;">${trip.destination} 🌍</h1></div>
                    </td></tr>
                    <tr><td style="padding-top: 10px;">
                        <div class="trip-summary-box">
                            <div style="font-size: 16px; font-weight: bold; color: #1a237e;">תכנית הטיול המוצעת</div>
                            <div style="font-weight: bold; color: #1a237e; direction: ltr; background: #e8eaf6; padding: 5px 15px; border-radius: 20px; font-size: 13px;">
                                ${trip.flightDetails?.landingDate || trip.landingDate} (${trip.flightDetails?.landingTime || trip.landingTime}) ➜ ${trip.flightDetails?.takeoffDate || trip.takeoffDate} (${trip.flightDetails?.takeoffTime || trip.takeoffTime})
                            </div>
                        </div>
                    </td></tr>
                    <tr><td>${itineraryHtml}</td></tr>
                </table>
                <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 15px;">
                    נבנה באמצעות <strong>BonusTrip</strong> | www.bonustrip.co.il
                </div>
            </div>`;

        html2pdf().from(element).set({
            margin: [0.4, 0.4],
            filename: `BonusTrip_${trip.destination}.pdf`,
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        }).save();
    };

    return (
        <div className="explorer-page animate-in" dir="rtl" style={{
            backgroundImage: `url(${savedBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            height: '100vh',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 100,
            overflowY: 'auto',
            overflowX: 'hidden'
        }}>

            <div className="explorer-header-premium glass" style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.85)', position: 'relative', zIndex: 1 }}>
                <div className="explorer-header-main">
                    <h1 className="explorer-title-premium">
                        המסלולים השמורים שלי 
                    </h1>
                    <p className="explorer-subtitle-premium">
                        צפייה בכל הטיולים שתכננת בעזרת ה-AI
                    </p>
                </div>
            </div>

            <div className="explorer-content itinerary-grid" style={{ paddingBottom: '100px', maxWidth: '1000px', margin: '0 auto' }}>
                {savedTrips.length > 0 ? (
                    savedTrips.map((trip, index) => {
                        const isExpanded = expandedTrip === trip._id;
                        return (
                            <div
                                key={trip._id || index}
                                className={`saved-trip-card glass animate-in ${isExpanded ? 'active-expanded' : ''}`}
                                onClick={() => toggleExpand(trip._id)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '24px',
                                    padding: '25px',
                                    marginBottom: '20px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                    border: '1px solid rgba(255,255,255,0.4)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                    <button
                                        onClick={(e) => deleteTrip(e, trip._id)}
                                        className="delete-trip-btn-circle"
                                        style={{
                                            position: 'absolute',
                                            top: '15px',
                                            left: '15px',
                                            background: '#ffebee',
                                            color: '#d32f2f',
                                            border: 'none',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease',
                                            zIndex: 5
                                        }}
                                        title="מחק מסלול"
                                    >
                                        ✕
                                    </button>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div className="destination-icon-circle">🌍</div>
                                            <div>
                                                <h3 style={{ margin: 0, color: '#1a237e', fontSize: '1.4rem' }}>{trip.destination}</h3>
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    📅 נשמר בתאריך: {new Date(trip.createdAt || Date.now()).toLocaleDateString('he-IL')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flight-route-badge" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            background: 'rgba(134, 189, 191, 0.2)',
                                            padding: '8px 18px',
                                            borderRadius: '50px',
                                            fontSize: '0.9rem',
                                            width: 'fit-content',
                                            margin: '15px auto 0'
                                        }}>
                                            <span dir="ltr" style={{ fontWeight: '600' }}>({trip.flightDetails?.landingTime || trip.landingTime}) {trip.flightDetails?.landingDate || trip.landingDate}</span>
                                            <span style={{ color: '#008080', fontWeight: '900', fontSize: '1.2rem' }}>➜</span>
                                            <span dir="ltr" style={{ fontWeight: '600' }}>({trip.flightDetails?.takeoffTime || trip.takeoffTime}) {trip.flightDetails?.takeoffDate || trip.takeoffDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="trip-full-plan animate-in" style={{ marginTop: '25px', padding: '20px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px' }}>
                                        <div className="ai-content-wrapper">
                                            {(() => {
                                                const parsed = tryParseJSON(trip.aiPlan);
                                                if (parsed) {
                                                    const itinerary = parsed.itinerary || (Array.isArray(parsed) ? parsed : null);

                                                    if (itinerary && Array.isArray(itinerary)) {
                                                        return (
                                                            <div className="itinerary-steps-container">
                                                                {itinerary.map((step, idx) => (
                                                                    <ItineraryStepCard key={idx} data={step} />
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                }
                                                return <div className="ai-content" dangerouslySetInnerHTML={{ __html: trip.aiPlan }} />;
                                            })()}
                                        </div>

                                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                            <button
                                                className="pdf-download-btn"
                                                onClick={(e) => downloadDestinationPDF(e, trip)}
                                                style={{
                                                    background: '#1a237e',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 25px',
                                                    borderRadius: '12px',
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                הורד סיכום מסלול (PDF)
                                            </button>
                                            <button
                                                className={`share-community-btn ${isSharing === trip._id ? 'loading' : ''}`}
                                                disabled={isSharing === trip._id}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!token) {
                                                        alert("עליך להתחבר כדי לשתף את המסלול בקהילה.");
                                                        return;
                                                    }

                                                    if (isSharing === trip._id) return;
                                                    setIsSharing(trip._id);
                                                    try {
                                                        const res = await fetch(`${API_BASE_URL}/community/share`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({
                                                                destination: trip.destination,
                                                                aiPlan: trip.aiPlan,
                                                                flightDetails: {
                                                                    landingDate: trip.flightDetails?.landingDate || trip.landingDate,
                                                                    landingTime: trip.flightDetails?.landingTime || trip.landingTime,
                                                                    takeoffDate: trip.flightDetails?.takeoffDate || trip.takeoffDate,
                                                                    takeoffTime: trip.flightDetails?.takeoffTime || trip.takeoffTime
                                                                }
                                                            })
                                                        });

                                                        const result = await res.json();
                                                        if (res.ok) {
                                                            alert('🚀 המסלול שותף בהצלחה בקהילה! מוזמן לצפות בו שם.');
                                                        } else {
                                                            alert(`תקלה בשיתוף: ${result.message || 'תקלה לא ידועה'}`);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('שגיאת תקשורת עם השרת.');
                                                    } finally {
                                                        setIsSharing(null);
                                                    }
                                                }}
                                                style={{
                                                    background: 'linear-gradient(135deg, #86BDBF 0%, #1a237e 100%)',
                                                    color: 'white',
                                                    padding: '12px 25px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    fontWeight: '700',
                                                    cursor: isSharing === trip._id ? 'wait' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    boxShadow: '0 4px 15px rgba(134, 189, 191, 0.4)',
                                                    transition: 'all 0.3s ease',
                                                    opacity: isSharing === trip._id ? 0.7 : 1
                                                }}
                                            >
                                                {isSharing === trip._id ? '⌛ משתף...' : '👥 שתף בקהילה'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isExpanded && (
                                    <div style={{
                                        marginTop: '20px',
                                        fontSize: '0.9rem',
                                        color: '#008080',
                                        fontWeight: '700',
                                        textAlign: 'center',
                                        paddingTop: '15px',
                                        borderTop: '1px dashed rgba(0,0,0,0.1)'
                                    }}>
                                        ↡ לחץ לחשיפת המסלול המלא ↡
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-results-msg glass" style={{
                        padding: '3rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '24px',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📂</div>
                        <h3 style={{ fontSize: '2rem', color: '#1a237e', margin: '0 0 1rem' }}>עדיין אין מסלולים שמורים</h3>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#546e7a' }}>התחל לתכנן את הטיול הבא שלך והמסלולים ישמרו כאן אוטומטית!</p>
                        <button className="retry-btn" onClick={() => window.location.href = '/results'} style={{
                            background: '#1a237e',
                            color: 'white',
                            padding: '12px 30px',
                            borderRadius: '50px',
                            border: 'none',
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            cursor: 'pointer'
                        }}>תכנן מסלול חדש</button>
                    </div>
                )}
            </div>


        </div>
    );
};

export default SavedItinerariesView;
