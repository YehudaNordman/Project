import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GuestPlanner from '../components/GuestPlanner'

/**
 * רכיב LandingPage - עמוד הבית והמעטפת הראשית של האפליקציה.
 * מנהל את הצגת ה-Navbar, התוכן המרכזי (מתכנן הטיולים) והפוטר.
 */
const LandingPage = () => {
    // State למעקב האם מוצגות תוצאות חישוב כרגע.
    // אם מוצגות תוצאות - נסתיר את ה-Navbar כדי לתת מקום לתצוגה המלאה.
    const [isShowingResults, setIsShowingResults] = useState(false);

    return (
        /* app-container: המיכל הראשי שמגדיר את מבנה הדף והרקע */
        <div className="app-container" dir="rtl">

            {/* Navbar (תפריט עליון): יוצג רק אם אנחנו בטופס ההזנה (לא בתוצאות) */}
            {!isShowingResults && <Navbar />}

            {/* main content: האזור המרכזי של האפליקציה */}
            <main className="content">
                {/* GuestPlanner: רכיב הליבה שמנהל את הטופס, הטעינה והתוצאות.
                    הוא מעדכן את האב (הדף הנוכחי) האם התוצאות מוצגות כרגע. */}
                <GuestPlanner onResultsShown={setIsShowingResults} />

                {/* Footer: שורת המידע התחתונה שקבועה בכל האתר */}
                <Footer />
            </main>
        </div>
    );
};

export default LandingPage;

