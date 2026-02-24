import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/features/auth/UserProfile';

/**
 * דף הפרופיל האישי (ProfilePage).
 * מאפשר למשתמש לצפות ולערוך את פרטיו האישיים.
 */
const ProfilePage = () => {
    const navigate = useNavigate();

    return (
        <div className="profile-page-wrapper" style={{ padding: '2rem' }}>
            {/* הצגת רכיב פרופיל המשתמש עם פונקציית סגירה שמחזירה לדף הבית */}
            <UserProfile onClose={() => navigate('/')} />
        </div>
    );
};

export default ProfilePage;
