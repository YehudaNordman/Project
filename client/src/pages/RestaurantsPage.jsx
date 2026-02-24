import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecommendationsExplorer from '../components/features/results/RecommendationsExplorer';

const RestaurantsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);

    const destination = params.get('destination') || '';
    const lat = params.get('lat') || '';
    const lon = params.get('lon') || '';
    const landingTime = params.get('landingTime') || '';
    const takeoffTime = params.get('takeoffTime') || '';
    const type = 'restaurants';

    // Basic validation: if required times are missing, go back to results
    if (!destination || !landingTime || !takeoffTime) {
        // navigate back to results page
        navigate('/results');
        return null;
    }

    return (
        <RecommendationsExplorer
            type={type}
            destination={destination}
            lat={lat}
            lon={lon}
            landingTime={landingTime}
            takeoffTime={takeoffTime}
            onBack={() => navigate(-1)}
            onRouteClick={() => navigate('/my-route')}
        />
    );
};

export default RestaurantsPage;
