import React from 'react';

/**
 * רכיב Navbar - תפריט הניווט העליון של האתר.
 * כולל לוגו בצד אחד וכפתור גישה לאזור האישי בצד השני.
 * מעוצב בסגנון פרימיום דביק (Sticky).
 */
const Navbar = () => {
    return (
        <nav className="navbar-premium sticky-top">
            <div className="navbar-content">
                {/* צד ימין: כפתור התחברות / אזור אישי עם אייקון משתמש */}
                <div className="navbar-right">
                    <button className="navbar-login-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>אזור אישי</span>
                    </button>
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

