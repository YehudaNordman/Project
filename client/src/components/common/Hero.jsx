import React from 'react';

/**
 * רכיב Hero - קטע הכותרת המרכזי של האתר.
 * מציג כותרת מרשימה באנגלית ותת כותרת בעברית עם אנימציית כניסה.
 */
const Hero = () => {
    return (
        <div className="hero-section animate-in">
            {/* כותרת ראשית מעוצבת עם מעבר צבעים (Gradient) */}
            <h1 className="hero-title">
                נצלו כל רגע <br />
                <span className="text-gradient-animate">מזמן ההמתנה</span>
            </h1>

        </div>
    );
};

export default Hero;

