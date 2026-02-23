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
                <span className="text-gradient-animate">BonusTrip</span>
            </h1>

            {/* Subtitle with the same gradient effect, attached under the title */}
            <h2 className="hero-subtitle" style={{ marginTop: '0.0rem' }}>
                <span className="text-gradient-animate">From connection to action</span>
            </h2>

        </div>
    );
};

export default Hero;

