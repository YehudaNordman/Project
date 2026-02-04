// רכיב הסרגל העליון המוצג בדף הנחיתה
const TopBar = () => {
    return (
        /* סרגל עליון קבוע (Fixed) בחלק העליון של המסך */
        <div className="top-bar">
            {/* כפתור כניסה לאזור האישי */}
            <button className="login-button user-area-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                אזור אישי
            </button>
        </div>
    );
};

export default TopBar;
