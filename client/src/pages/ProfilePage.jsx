import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/features/auth/UserProfile';

const ProfilePage = () => {
    const navigate = useNavigate();

    return (
        <div className="profile-page-wrapper" style={{ padding: '2rem' }}>
            <UserProfile onClose={() => navigate('/')} />
        </div>
    );
};

export default ProfilePage;
