import React from 'react';

/**
 * רכיב AccommodationCard - מציג הצעה להזמנת מלון לשבתות ארוכות (מעל 24 שעות).
 */
const AccommodationCard = ({ result, destination, landingDate, takeoffDate }) => {
    // מציגים רק אם השהות הכוללת היא מעל 1440 דקות (24 שעות)
    if (!result || result.grossMinutes < 1440) return null;

    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin=${landingDate}&checkout=${takeoffDate}`;

    return (
        <div className="accommodation-card-premium">
            <div className="acc-card-content">
                <div className="acc-text-side">
                    <h3 className="acc-title">יש לך זמן ללינה בעיר</h3>
                    <p className="acc-subtitle">השהות שלך ארוכה מ-24 שעות. כדאי להזמין מקום לינה.</p>
                </div>
                <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="acc-booking-btn"
                >
                    הזמן מלון עכשיו
                </a>
            </div>
            {/* רקע דקורטיבי */}
            <div className="acc-card-overlay"></div>
        </div>
    );
};

export default AccommodationCard;
