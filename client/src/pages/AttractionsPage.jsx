import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecommendationsExplorer from '../components/features/results/RecommendationsExplorer';

const AttractionsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);

    const destination = params.get('destination') || '';
    const lat = params.get('lat') || '';
    const lon = params.get('lon') || '';
    const landingTime = params.get('landingTime') || '';
    const takeoffTime = params.get('takeoffTime') || '';
    const type = 'attractions';

    if (!destination || !landingTime || !takeoffTime) {
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

export default AttractionsPage;
