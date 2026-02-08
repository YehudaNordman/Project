import React from 'react';

/**
 * רכיב RecommendationCards - מציג כפתורים גדולים ורכיבים ויזואליים להמלצות על מסעדות ואטרקציות.
 */
const RecommendationCards = ({ isValid, destination }) => {
    // מציגים רק אם יש מספיק זמן נטו (isValid)
    if (!isValid) return null;

    return (
        <div className="recommendations-container">
            {/* כרטיס מסעדות */}
            <button className="category-card restaurants">
                <div className="card-inner-content">
                    <h3 className="category-title">מסעדות מומלצות</h3>
                    <p className="category-subtitle">מקומות לאכול ב-{destination}</p>
                    <div className="discovery-badge">גלה עכשיו</div>
                </div>
            </button>

            {/* כרטיס אטרקציות */}
            <button className="category-card attractions">
                <div className="card-inner-content">
                    <h3 className="category-title">אטרקציות באזור</h3>
                    <p className="category-subtitle">מקומות לבקר ב-{destination}</p>
                    <div className="discovery-badge">גלה עכשיו</div>
                </div>
            </button>
        </div>
    );
};

export default RecommendationCards;
