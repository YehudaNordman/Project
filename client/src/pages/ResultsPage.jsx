import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlannerResults from '../components/features/planner/PlannerResults';
import { useSearch } from '../context/SearchContext';

const ResultsPage = () => {
    const navigate = useNavigate();
    const { results, formData, weatherData, clearSearch } = useSearch();

    useEffect(() => {
        if (!results) {
            navigate('/');
        }
    }, [results, navigate]);

    if (!results) return null;

    return (
        <PlannerResults
            result={results}
            destination={formData.destination}
            prefetchedWeather={weatherData}
            currencyCode={formData.currency_code}
            currencyName={formData.currency_name_hebrew}
            onBack={() => {
                clearSearch();
                navigate('/');
            }}
            onRouteClick={() => navigate('/my-route')}
            lat={formData.lat}
            lon={formData.lon}
            landingDate={formData.landingDate}
            takeoffDate={formData.takeoffDate}
            landingTime={formData.landingTime}
            takeoffTime={formData.takeoffTime}
        />
    );
};

export default ResultsPage;
