import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from '../features/auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const { openAuthModal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we should show the navbar in its full state
    // For example, researchers, we might want to hide it on specific results views as before
    // but typically a professional app keeps it or minimalizes it.
    // Let's stick to the user's previous preference if needed, or keep it consistent.

    return (
        <div className="app-container" dir="rtl">
            <Navbar
                onLoginClick={() => openAuthModal()}
                onRouteClick={() => navigate('/my-route')}
                onSavedTripsClick={() => navigate('/saved-trips')}
                onProfileClick={() => navigate('/profile')}
            />

            <AuthModal />

            <main className="content">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
