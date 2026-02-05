import React from 'react';

/**
 * רכיב InfoCards - מציג שלישיית כרטיסי מידע על יתרונות המערכת.
 * כולל אנימציות כניסה ואפקט הרחבה (Hover) לכל כרטיס.
 */
const InfoCards = () => {
    // מערך נתונים המכיל את תוכן הכרטיסים
    const cards = [
        {
            id: 'planning-card',
            title: 'תכנון מהיר',
            text: 'מחשבים את הזמן המדויק שנשאר לכם בין טיסות',
            extraInfo: 'אלגוריתם חכם הלוקח בחשבון בידוק ביטחוני, זמני נסיעה ועוד - כדי שתחזרו לטיסה בזמן ובביטחון.'
        },
        {
            id: 'recommendations-card',
            title: 'המלצות מקומיות',
            text: 'מגלים את המקומות הכי שווים לבקר בהם בזמן ההמתנה',
            extraInfo: 'ניתוח מבוסס מרחק מהשדה כדי להציע לכם מסעדות, אטרקציות ופינות חמד שבאמת מספיקים לבקר בהן.'
        },
        {
            id: 'weather-card',
            title: 'מזג אוויר חי',
            text: 'מתעדכנים במזג האוויר ביעד בזמן אמת',
            extraInfo: 'חיזוי מדויק של הטמפרטורה ותנאי השמים כדי שתדעו אם לארוז מעיל או לקחת משקפי שמש לסיור.'
        }
    ];

    return (
        <div className="info-cards-container">
            {/* מיפוי (Mapping) של המערך ליצירת כרטיסים על המסך */}
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`info-item-card glass animate-in ${card.id || ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }} // יצירת השהייה מדורגת לאנימציה
                >
                    <div className="info-card-content-wrapper">
                        <h3 className="info-card-title">{card.title}</h3>
                        <p className="info-card-text">{card.text}</p>

                        {/* האזור המתרחב שמוצג רק בריחוף (CSS) */}
                        <div className="info-card-expanded">
                            <div className="info-card-divider"></div>
                            <p className="expanded-text-content">{card.extraInfo}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InfoCards;

