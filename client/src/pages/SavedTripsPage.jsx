import React from 'react';
import { useNavigate } from 'react-router-dom';
import SavedItinerariesView from '../components/features/itinerary/SavedItinerariesView';

const SavedTripsPage = () => {
    const navigate = useNavigate();

    return (
        <SavedItinerariesView onBack={() => navigate(-1)} />
    );
};

export default SavedTripsPage;
