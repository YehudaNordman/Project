
const RegistrationCards = ({ onGuestClick }) => {
    return (
        <div className="registration-section">
            <div className="feature-card premium">
                <div className="icon-circle">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="#86BDBF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h2>הרשמה</h2>
                <p className="subtitle">קבל את החוויה המלאה</p>
                <ul className="features-list">
                    <li><span className="check">✓</span> אטרקציות מומלצות אישית</li>
                    <li><span className="check">✓</span> הורדת מסלול לקובץ PDF</li>
                    <li><span className="check">✓</span> התראות חכמות בזמן אמת</li>
                </ul>
                <button className="card-cta primary">התחל עכשיו - בחינם</button>
            </div>

            <div className="feature-card">
                <div className="icon-circle">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
                </div>
                <h2>המשך ללא הרשמה</h2>
                <p className="subtitle">גישה בסיסית לשירות</p>
                <ul className="features-list">
                    <li><span className="check">✓</span> צפייה באטרקציות זמינות</li>
                    <li><span className="check">✓</span> חישוב זמנים בסיסי</li>
                    <li><span className="check">✓</span> בניית מסלול מוגבל</li>
                </ul>
                <button className="card-cta secondary" onClick={onGuestClick}>המשך ללא הרשמה</button>
            </div>
        </div>
    );
};

export default RegistrationCards;
