import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * רכיב Navbar - תפריט הניווט העליון של האתר.
 * כולל לוגו בצד אחד וכפתור גישה לאזור האישי בצד השני.
 * מעוצב בסגנון פרימיום דביק (Sticky).
 */
const Navbar = ({ onLoginClick, onRouteClick }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    // סגירת התפריט בלחיצה בחוץ
    React.useEffect(() => {
        const handleClickOutside = () => setIsDropdownOpen(false);
        if (isDropdownOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    // העדפה לשם מלא, אם אין אז שם מהאימייל, ואם אין כלום אז אורח
    const userName = user?.fullName || (user?.email ? user.email.split('@')[0] : 'אורח');

    const handleLoginAction = () => {
        setIsDropdownOpen(false);
        onLoginClick();
    };

    const handleRouteAction = () => {
        setIsDropdownOpen(false);
        onRouteClick();
    };

    const handleLogoutAction = () => {
        setIsDropdownOpen(false);
        logout();
    };

    return (
        <nav className="navbar-premium sticky-top" dir="rtl">
            <div className="navbar-content">
                {/* צד ימין: כפתור תפריט אישי (Dropdown) */}
                <div className="navbar-right" onClick={(e) => e.stopPropagation()}>
                    <div className="user-menu-container">
                        <button
                            className={`navbar-user-btn ${isDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="user-btn-content">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>אזור אישי</span>
                                <svg className={`chevron-icon ${isDropdownOpen ? 'rotate' : ''}`} viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </button>

                        {/* תפריט נפתח (Dropdown) */}
                        {isDropdownOpen && (
                            <div className="user-dropdown-menu glass animate-in">
                                <div className="dropdown-header">
                                    <p className="welcome-text">שלום, <strong>{userName}</strong></p>
                                </div>
                                <div className="dropdown-divider"></div>

                                <div className="dropdown-links">
                                    {user ? (
                                        <>
                                            <button className="dropdown-item" onClick={handleRouteAction}>
                                                <span className="item-icon">🛣️</span>
                                                <div className="item-text">
                                                    <span className="item-title">המסלול שלי</span>
                                                    <span className="item-desc">צפייה וניהול המקומות ששמרת</span>
                                                </div>
                                            </button>
                                            <button className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                <span className="item-icon">👤</span>
                                                <div className="item-text">
                                                    <span className="item-title">פרופיל משתמש</span>
                                                    <span className="item-desc">הגדרות ופרטים אישיים</span>
                                                </div>
                                            </button>
                                            <div className="dropdown-divider"></div>
                                            <button className="dropdown-item logout-item" onClick={handleLogoutAction}>
                                                <span className="item-icon">🏃‍♂️</span>
                                                <span className="item-title">התנתקות מהמערכת</span>
                                            </button>
                                        </>
                                    ) : (
                                        <button className="dropdown-item login-item" onClick={handleLoginAction}>
                                            <span className="item-icon">🔑</span>
                                            <div className="item-text">
                                                <span className="item-title">התחברות / הרשמה</span>
                                                <span className="item-desc">התחבר כדי לשמור מסלולים</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* צד שמאל: לוגו המותג וסלוגן האתר */}
                <div className="navbar-left">
                    <div className="logo-container">
                        <span className="logo-text">Bonus<span className="logo-accent">Trip</span></span>
                        <p className="slogan-text">Your Layover, Upgraded</p>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

