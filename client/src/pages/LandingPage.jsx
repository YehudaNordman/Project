import { useState } from 'react'
import TopBar from '../components/TopBar'
import RegistrationCards from '../components/RegistrationCards'
import InfoCards from '../components/InfoCards'
import Footer from '../components/Footer'
import GuestPlanner from '../components/GuestPlanner'
import waitingLogo from '../waiting/Gemini_Generated_Image_p8t408p8t408p8t4 (1).png'

const LandingPage = () => {
    const [view, setView] = useState('landing');
    const handleGuestClick = () => {
        setView('guest');
    };

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
