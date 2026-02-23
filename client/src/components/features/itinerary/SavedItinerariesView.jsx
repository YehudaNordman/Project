import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';


/**
 * רכיב המציג את כל המסלולים שהמשתמש שמר ב-localStorage.
 * כולל אפשרות להורדת המסלול כקובץ PDF בצורה מעוצבת ותומכת RTL.
 */
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../constants';
import savedBg from '../../background/Gemini_Generated_Image_nin71enin71enin7.png';
import ItineraryStepCard from './ItineraryStepCard';

const SavedItinerariesView = ({ onBack }) => {
    const { user, token } = useAuth();
    const [savedTrips, setSavedTrips] = useState([]);
    const [expandedTrip, setExpandedTrip] = useState(null);
    const [isSharing, setIsSharing] = useState(null); // ID of the trip being shared

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            onBack();
        }
    }, [user, onBack]);

    useEffect(() => {
        if (user) {
            const data = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
            setSavedTrips(data);
        }
    }, [user]);

    if (!user) return null;

    const deleteTrip = (e, timestamp) => {
        e.stopPropagation();
        const updated = savedTrips.filter(t => t.timestamp !== timestamp);
        localStorage.setItem('saved_itineraries', JSON.stringify(updated));
        setSavedTrips(updated);
        if (expandedTrip === timestamp) setExpandedTrip(null);
    };

    const toggleExpand = (timestamp) => {
        setExpandedTrip(expandedTrip === timestamp ? null : timestamp);
    };

    /**
     * פונקציה להורדת מסלול ספציפי כ-PDF - תיקון סופי למניעת דריסת טקסט (עברית ואנגלית)
     */
    const downloadDestinationPDF = (e, trip) => {
        e.stopPropagation();
        const element = document.createElement('div');

        // Helper to wrap LTR text
        const wrapLtr = (text) => {
            if (!text) return "";
            if (typeof text !== 'string') return text;
            return text.replace(/([a-zA-Z0-9][a-zA-Z0-9\s:/-]{1,}[a-zA-Z0-9])/g, (match) => {
                return `<span dir="ltr" style="display: inline-block; unicode-bidi: isolate;">${match}</span>`;
            });
        };

        // Parse JSON if possible, otherwise fallback to original
        let itineraryHtml = "";
        try {
            const parsed = JSON.parse(trip.aiPlan);
            const steps = parsed.itinerary || (Array.isArray(parsed) ? parsed : []);

            if (steps.length > 0) {
                itineraryHtml = steps.map((step, idx) => `
                    <div style="margin-bottom: 25px; padding: 15px; border-right: 4px solid #86BDBF; background: #fcfcfc;">
                        <div style="display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3 style="margin: 0; color: #1a237e; font-size: 18px;">${step.title}</h3>
                            <span style="background: #1a237e; color: white; padding: 4px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; direction: ltr;">${step.hours}</span>
                        </div>
                        <p style="margin: 10px 0; font-size: 14px; color: #444; line-height: 1.6;">${step.description}</p>
                        <div style="display: flex; flex-direction: row-reverse; gap: 20px; margin-top: 10px; font-size: 13px;">
                            <div style="color: #008080;"><strong>🚗 תחבורה:</strong> ${wrapLtr(step.transport)}</div>
                            <div style="color: #008080;"><strong>🍽️ קולינריה:</strong> ${step.food}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                itineraryHtml = `<div style="text-align: center; padding: 20px;">${trip.aiPlan}</div>`;
            }
        } catch (err) {
            itineraryHtml = `<div style="text-align: right; padding: 20px; line-height: 1.8;">${trip.aiPlan}</div>`;
        }

        const pdfStyles = `<style>
            .pdf-body { direction: rtl; unicode-bidi: isolate; text-align: right; font-family: 'Arial', sans-serif; padding: 30px; background: white; color: #333; }
            .pdf-table { width: 100%; border-collapse: collapse; }
            .pdf-header-cell { border-bottom: 3px solid #86BDBF; padding-bottom: 20px; }
            .trip-summary-box { background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0; display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; }
        </style>`;

        element.innerHTML = `${pdfStyles}
            <div class="pdf-body">
                <table class="pdf-table">
                    <tr><td class="pdf-header-cell">
                        <div style="float: left; font-size: 26px; font-weight: 900; color: #1a237e;">Bonus<span style="color: #86BDBF;">Trip</span></div>
                        <div style="float: right;"><h1 style="margin: 0; color: #008080; font-size: 28px;">${trip.destination} 🌍</h1></div>
                    </td></tr>
                    <tr><td style="padding-top: 10px;">
                        <div class="trip-summary-box">
                            <div style="font-size: 16px; font-weight: bold; color: #1a237e;">תכנית הטיול המוצעת</div>
                            <div style="font-weight: bold; color: #1a237e; direction: ltr; background: #e8eaf6; padding: 5px 15px; border-radius: 20px; font-size: 13px;">
                                ${trip.landingDate} (${trip.landingTime}) ➜ ${trip.takeoffDate} (${trip.takeoffTime})
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
                <div className="explorer-header-top">

                </div>

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
                        const isExpanded = expandedTrip === trip.timestamp;
                        return (
                            <div
                                key={trip.timestamp || index}
                                className={`saved-trip-card glass animate-in ${isExpanded ? 'active-expanded' : ''}`}
                                onClick={() => toggleExpand(trip.timestamp)}
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
                                        onClick={(e) => deleteTrip(e, trip.timestamp)}
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
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s',
                                            zIndex: 10
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        title="מחק מסלול"
                                    >✕</button>

                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>🌍</div>
                                        <h3 style={{
                                            fontSize: '2.2rem',
                                            margin: '0',
                                            color: '#1a237e',
                                            fontWeight: '900',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>{trip.destination}</h3>

                                        <div className="trip-time-info" style={{
                                            marginTop: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '15px',
                                            fontSize: '1.1rem',
                                            color: '#455a64',
                                            background: 'rgba(236, 239, 241, 0.6)',
                                            padding: '8px 20px',
                                            borderRadius: '50px',
                                            width: 'fit-content',
                                            margin: '15px auto 0'
                                        }}>
                                            <span dir="ltr" style={{ fontWeight: '600' }}>({trip.landingTime}) {trip.landingDate}</span>
                                            <span style={{ color: '#008080', fontWeight: '900', fontSize: '1.2rem' }}>➜</span>
                                            <span dir="ltr" style={{ fontWeight: '600' }}>({trip.takeoffTime}) {trip.takeoffDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="trip-full-plan animate-in" style={{ marginTop: '25px', padding: '20px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px' }}>
                                        <div className="ai-content-wrapper">
                                            {(() => {
                                                try {
                                                    const parsed = JSON.parse(trip.aiPlan);
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
                                                    return <div className="ai-content" dangerouslySetInnerHTML={{ __html: trip.aiPlan }} />;
                                                } catch (e) {
                                                    return <div className="ai-content" dangerouslySetInnerHTML={{ __html: trip.aiPlan }} />;
                                                }
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
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 35, 126, 0.4)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 35, 126, 0.3)';
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                                הורד סיכום מסלול (PDF)
                                            </button>
                                            <button
                                                className={`share-community-btn ${isSharing === trip.timestamp ? 'loading' : ''}`}
                                                disabled={isSharing === trip.timestamp}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!token) {
                                                        alert("עליך להתחבר כדי לשתף את המסלול בקהילה.");
                                                        return;
                                                    }

                                                    setIsSharing(trip.timestamp);
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
                                                                    landingDate: trip.landingDate,
                                                                    landingTime: trip.landingTime,
                                                                    takeoffDate: trip.takeoffDate,
                                                                    takeoffTime: trip.takeoffTime
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
                                                        alert('שגיאת תקשורת עם השרת. וודא שאתה מחובר לאינטרנט.');
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
                                                    cursor: isSharing === trip.timestamp ? 'wait' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    boxShadow: '0 4px 15px rgba(134, 189, 191, 0.4)',
                                                    transition: 'all 0.3s ease',
                                                    opacity: isSharing === trip.timestamp ? 0.7 : 1
                                                }}
                                            >
                                                {isSharing === trip.timestamp ? '⌛ משתף...' : '👥 שתף בקהילה'}
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
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            margin: '0 auto',
                            boxShadow: '0 5px 15px rgba(26, 35, 126, 0.3)'
                        }}>
                            ✈️ חזור להמלצות
                        </button>
                    </div>
                )}
            </div>
            {/* Scroll Button removed from here as it's global or specific to other pages, but can assume standard scrolling works */}
        </div>
    );
};

export default SavedItinerariesView;
