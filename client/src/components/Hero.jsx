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
                Maximize Your <br />
                <span className="text-gradient-animate">Travel Pause</span>
            </h1>
            {/* תת-כותרת המסבירה את הערך המוסף של האתר */}
            <p className="hero-subtitle">הופכים את זמן ההמתנה שלך בשדה התעופה לטיול בלתי נשכח</p>
        </div>
    );
};

export default Hero;

