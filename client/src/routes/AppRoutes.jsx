import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ResultsPage from '../pages/ResultsPage';
import MyRoutePage from '../pages/MyRoutePage';
import SavedTripsPage from '../pages/SavedTripsPage';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/my-route" element={<MyRoutePage />} />
            <Route path="/saved-trips" element={<SavedTripsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Catch-all route to redirect back home if path not found */}
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default AppRoutes;
