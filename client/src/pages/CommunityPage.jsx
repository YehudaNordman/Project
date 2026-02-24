import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import CommunityView from '../components/features/community/CommunityView';

/**
 * דף הקהילה (CommunityPage).
 * כאן משתמשים יכולים לראות מסלולים של מטיילים אחרים ולקבל השראה.
 */
const CommunityPage = () => {
    return (
        <MainLayout>
            <div className="page-wrapper community-page">
                {/* הצגת הפיד עם המסלולים המשותפים של קהילת BonusTrip */}
                <CommunityView />
            </div>
        </MainLayout>
    );
};

export default CommunityPage;
