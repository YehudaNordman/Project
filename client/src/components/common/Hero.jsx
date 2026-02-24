import React from 'react';

/**
 * רכיב Hero - קטע הכותרת המרכזי של האתר.
 * מציג כותרת מרשימה באנגלית ותת כותרת עם אנימציית כניסה.
 */
const Hero = () => {
    return (
        // הקונטיינר הראשי של ה-Hero עם קלאס לאנימציית כניסה
        <div className="hero-section animate-in">

            {/* כותרת ראשית של האפליקציה עם אפקט גרדיאנט (Gradient) נע */}
            <h1 className="hero-title">
                <span className="text-gradient-animate">BonusTrip</span>
            </h1>

            {/* תת-כותרת באנגלית המבטאת את המעבר מתכנון לביצוע */}
            <h2 className="hero-subtitle" style={{ marginTop: '0.0rem' }}>
                <span className="text-gradient-animate">From connection to action</span>
            </h2>

        </div>
    );
};

export default Hero;

