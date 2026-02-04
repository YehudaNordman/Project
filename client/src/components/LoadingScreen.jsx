import React from 'react';
import waitingLogo from './background/Gemini_Generated_Image_27yxmk27yxmk27yx.png';

/**
 * רכיב LoadingScreen - מסך המתנה פרימיום עם אנימציית מטוס.
 * מוצג בזמן חישוב התוצאות ומשיכת נתונים.
 */
const LoadingScreen = () => {
    return (
        <div className="loading-screen full-bg" style={{ backgroundImage: `url(${waitingLogo})` }} dir="rtl">
            <div className="loading-content white-text">
                {/* לואדר מטוס מסתובב בעיצוב מתקדם */}
                <div className="airplane-loader-premium">
                    <div className="orbit-ring outer"></div>
                    <div className="orbit-ring inner"></div>
                    <div className="plane-container-rotating">
                        <div className="exhaust-trail">
                            <span className="particle p1"></span>
                            <span className="particle p2"></span>
                            <span className="particle p3"></span>
                        </div>
                        {/* אייקון מטוס SVG בעיצוב פרימיום */}
                        <svg className="premium-jet" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="jetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#86BDBF', stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                            <path d="M50 10 L55 35 L85 50 L55 55 L55 80 L65 90 L50 85 L35 90 L45 80 L45 55 L15 50 L45 35 Z" fill="url(#jetGrad)" />
                            <path d="M50 10 L52 30 L48 30 Z" fill="#ffffff" />
                        </svg>
                    </div>
                </div>
                {/* טקסט פועם מתחת ללואדר */}
                <p className="pulse-text">מחשבים לכם את המסלול המושלם...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
