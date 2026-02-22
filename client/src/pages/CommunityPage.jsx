import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import CommunityView from '../components/features/community/CommunityView';

const CommunityPage = () => {
    return (
        <MainLayout>
            <div className="page-wrapper community-page">
                <CommunityView />
            </div>
        </MainLayout>
    );
};

export default CommunityPage;
