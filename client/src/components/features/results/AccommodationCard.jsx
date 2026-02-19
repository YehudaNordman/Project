import React from 'react';

/**
 * רכיב AccommodationCard - מציג הצעה להזמנת מלון לשבתות ארוכות (מעל 24 שעות).
 */
const AccommodationCard = ({ result, destination, landingDate, takeoffDate }) => {
    // מציגים רק אם השהות הכוללת היא מעל 1440 דקות (24 שעות)
    if (!result || result.grossMinutes < 1440) return null;

    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin=${landingDate}&checkout=${takeoffDate}`;

    return (
        <div className="tool-card accommodation-card-premium animate-in">
            <div className="tool-header">
                <span className="tool-icon">🏨</span>
                <h3>יש לך זמן ללינה בעיר</h3>
            </div>
            <p className="tool-desc">
                השהות שלך ארוכה מ-24 שעות ({Math.floor(result.grossMinutes / 60)} שעות).
                מומלץ להזמין מקום לינה כדי לנוח וליהנות מהעיר בצורה רגועה.
            </p>
            <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tool-action-btn teal"
                style={{ alignSelf: 'center' }}
            >
                הזמן מלון
            </a>
        </div>
    );
};

export default AccommodationCard;
