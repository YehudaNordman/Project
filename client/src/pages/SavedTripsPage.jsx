import React from 'react';
import { useNavigate } from 'react-router-dom';
import SavedItinerariesView from '../components/features/itinerary/SavedItinerariesView';

/**
 * דף הטיולים השמורים (SavedTripsPage).
 * כאן המשתמש יכול לצפות בכל המסלולים ששמר בעבר בחשבונו.
 */
const SavedTripsPage = () => {
    const navigate = useNavigate();

    return (
        // הצגת רכיב המסלולים השמורים עם כפתור חזרה לדף הקודם
        <SavedItinerariesView onBack={() => navigate(-1)} />
    );
};

export default SavedTripsPage;
