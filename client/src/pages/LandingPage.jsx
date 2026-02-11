import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GuestPlanner from '../components/GuestPlanner'
import AuthModal from '../components/AuthModal'
import MyRouteView from '../components/results/MyRouteView'

/**
 * רכיב LandingPage - עמוד הבית והמעטפת הראשית של האפליקציה.
 * מנהל את הצגת ה-Navbar, התוכן המרכזי (מתכנן הטיולים) והפוטר.
 */
const LandingPage = () => {
    // State למעקב האם מוצגות תוצאות חישוב כרגע.
    const [isShowingResults, setIsShowingResults] = useState(false);
    // State למעקב האם מוצג המסלול האישי.
    const [isShowingMyRoute, setIsShowingMyRoute] = useState(false);
    // State לניהול חלון ההתחברות (Modal)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        /* app-container: המיכל הראשי שמגדיר את מבנה הדף והרקע */
        <div className="app-container" dir="rtl">

            {/* Navbar (תפריט עליון): יוצג רק אם אנחנו בטופס ההזנה (לא בתוצאות או במסלול) */}
            {!isShowingResults && !isShowingMyRoute && (
                <Navbar
                    onLoginClick={() => setIsAuthModalOpen(true)}
                    onRouteClick={() => setIsShowingMyRoute(true)}
                />
            )}

            {/* חלון מודאלי להתחברות והרשמה */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* main content: האזור המרכזי של האפליקציה */}
            <main className="content">
                {isShowingMyRoute ? (
                    <MyRouteView onBack={() => setIsShowingMyRoute(false)} />
                ) : (
                    <GuestPlanner
                        onResultsShown={setIsShowingResults}
                        onRouteClick={() => setIsShowingMyRoute(true)}
                    />
                )}

                {/* Footer: שורת המידע התחתונה שקבועה בכל האתר */}
                <Footer />
            </main>
        </div>
    );
};

export default LandingPage;

