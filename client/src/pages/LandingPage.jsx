import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import GuestPlanner from '../components/features/planner/GuestPlanner'
import AuthModal from '../components/features/auth/AuthModal'
import MyRouteView from '../components/features/itinerary/MyRouteView'
import SavedItinerariesView from '../components/features/itinerary/SavedItinerariesView'
import UserProfile from '../components/features/auth/UserProfile'
import { useAuth } from '../context/AuthContext'

/**
 * רכיב LandingPage - עמוד הבית והמעטפת הראשית של האפליקציה.
 * מנהל את הצגת ה-Navbar, התוכן המרכזי (מתכנן הטיולים) והפוטר.
 */
const LandingPage = () => {
    // State למעקב האם מוצגות תוצאות חישוב כרגע.
    const [isShowingResults, setIsShowingResults] = useState(false);
    // State למעקב האם מוצג המסלול האישי.
    const [isShowingMyRoute, setIsShowingMyRoute] = useState(false);
    // State למעקב האם מוצגות הנסיעות השמורות.
    const [isShowingSavedTrips, setIsShowingSavedTrips] = useState(false);
    // State למעקב האם מוצג פרופיל המשתמש
    const [isShowingProfile, setIsShowingProfile] = useState(false);

    const [formData, setFormData] = useState({
        destination: '',  // עיר או שדה תעופה
        landingDate: '',  // תאריך נחיתה
        landingTime: '',  // שעת נחיתה
        takeoffDate: '',  // תאריך המראה
        takeoffTime: ''   // שעת המראה
    });

    const { openAuthModal } = useAuth();

    return (
        /* app-container: המיכל הראשי שמגדיר את מבנה הדף והרקע */
        <div className="app-container" dir="rtl">

            {/* Navbar (תפריט עליון): יוצג רק אם אנחנו בטופס ההזנה (לא בתוצאות או במסלול) */}
            {!isShowingResults && !isShowingMyRoute && !isShowingSavedTrips && (
                <Navbar
                    onLoginClick={() => openAuthModal()}
                    onRouteClick={() => setIsShowingMyRoute(true)}
                    onSavedTripsClick={() => setIsShowingSavedTrips(true)}
                    onProfileClick={() => setIsShowingProfile(true)}
                />
            )}

            {/* חלון מודאלי להתחברות והרשמה - מופעל גלובלית דרך AuthContext */}
            <AuthModal />

            {/* User Profile Modal */}
            {isShowingProfile && <UserProfile onClose={() => setIsShowingProfile(false)} />}

            {/* main content: האזור המרכזי של האפליקציה */}
            <main className="content">
                {isShowingMyRoute ? (
                    <MyRouteView
                        onBack={() => setIsShowingMyRoute(false)}
                        times={formData}
                        onViewSaved={() => {
                            setIsShowingMyRoute(false);
                            setIsShowingSavedTrips(true);
                        }}
                    />
                ) : null}

                {isShowingSavedTrips ? (
                    <SavedItinerariesView onBack={() => setIsShowingSavedTrips(false)} />
                ) : null}

                <div style={{ display: (isShowingMyRoute || isShowingSavedTrips) ? 'none' : 'block' }}>
                    <GuestPlanner
                        onResultsShown={setIsShowingResults}
                        onRouteClick={() => setIsShowingMyRoute(true)}
                        setFormData={setFormData}
                        formData={formData}
                    />
                </div>

                {/* Footer: שורת המידע התחתונה שקבועה בכל האתר */}
                <Footer />
            </main>
        </div>
    );
};

export default LandingPage;
