import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from '../features/auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * רכיב המבנה הראשי (MainLayout).
 * עוטף את כל דפי האפליקציה ומספק את סרגל הניווט (Navbar),
 * התפריט התחתון (Footer) ומודאל האימות (AuthModal) באופן גלובלי.
 */
const MainLayout = ({ children }) => {
    const { openAuthModal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="app-container" dir="rtl">
            {/* סרגל ניווט עליון עם פונקציות מעבר לדפים השונים */}
            <Navbar
                onLoginClick={() => openAuthModal()}
                onRouteClick={() => navigate('/my-route')}
                onSavedTripsClick={() => navigate('/saved-trips')}
                onProfileClick={() => navigate('/profile')}
            />

            {/* חלון התחברות גלובלי שמוצג לפי הצורך */}
            <AuthModal />

            {/* התוכן המשתנה של כל דף מוצג כאן */}
            <main className="content">
                {children}
            </main>

            {/* סרגל תחתון (Footer) קבוע */}
            <Footer />
        </div>
    );
};

export default MainLayout;
