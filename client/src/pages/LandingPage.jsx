import { useState } from 'react'
import TopBar from '../components/TopBar'
import RegistrationCards from '../components/RegistrationCards'
import InfoCards from '../components/InfoCards'
import Footer from '../components/Footer'
import GuestPlanner from '../components/GuestPlanner'
import waitingLogo from '../waiting/Gemini_Generated_Image_p8t408p8t408p8t4 (1).png'

const LandingPage = () => {
    const [view, setView] = useState('landing');
    const [isLoading, setIsLoading] = useState(false);

    const handleGuestClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setView('guest');
        }, 2000); // המתנה של 2 שניות
    };

    if (isLoading) {
        return (
            <div className="loading-screen full-bg" style={{ backgroundImage: `url(${waitingLogo})` }} dir="rtl">
                <div className="loading-content white-text">
                    <div className="airplane-loader-premium">
                        <div className="orbit-ring outer"></div>
                        <div className="orbit-ring inner"></div>
                        <div className="plane-container-rotating">
                            <div className="exhaust-trail">
                                <span className="particle p1"></span>
                                <span className="particle p2"></span>
                                <span className="particle p3"></span>
                            </div>
                            {/* מטוס סילון יוקרתי ומפורט */}
                            <svg className="premium-jet" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="jetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#86BDBF', stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M50 10 L55 35 L85 50 L55 55 L55 80 L65 90 L50 85 L35 90 L45 80 L45 55 L15 50 L45 35 Z"
                                    fill="url(#jetGrad)"
                                />
                                <path d="M50 10 L52 30 L48 30 Z" fill="#ffffff" /> {/* חרטום מודגש */}
                            </svg>
                        </div>
                    </div>
                    <p className="pulse-text">מכינים לכם את הבונוס המושלם...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container ${view === 'guest' ? 'guest-mode' : ''}`} dir="rtl">
            <main className="content">
                {view === 'landing' ? (
                    <>
                        <TopBar />
                        <RegistrationCards onGuestClick={handleGuestClick} />
                        <InfoCards />
                    </>
                ) : (
                    <GuestPlanner onBack={() => setView('landing')} />
                )}
                <Footer />
            </main>
        </div>
    );
};

export default LandingPage;
