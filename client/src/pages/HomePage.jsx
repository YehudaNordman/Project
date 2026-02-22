import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/common/Hero';
import InfoCards from '../components/common/InfoCards';
import Testimonials from '../components/common/Testimonials';
import PlannerForm from '../components/features/planner/PlannerForm';
import LoadingScreen from '../components/features/planner/LoadingScreen';
import { useSearch } from '../context/SearchContext';
import { useRoute } from '../context/RouteContext';
import { calculateTripTime, fetchWeatherData, getMockRecommendations } from '../services/plannerService';

const HomePage = () => {
    const navigate = useNavigate();
    const { formData, setFormData, setResults, setWeatherData, clearSearch } = useSearch();
    const { clearRoute } = useRoute();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Clear previous search results and route when landing on home page
    // to ensure a fresh start for the next search session.
    useEffect(() => {
        clearSearch();
        clearRoute();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        const { destination, landingDate, landingTime, takeoffDate, takeoffTime } = formData;

        if (!destination || !landingDate || !landingTime || !takeoffDate || !takeoffTime) {
            setErrorMsg('נא למלא את כל השדות החובה');
            return;
        }

        setErrorMsg('');
        setIsLoading(true);
        clearRoute(); // Clear the current itinerary route when starting a fresh search

        try {
            // Start weather fetch
            fetchWeatherData(destination).then(setWeatherData);

            const tripMetrics = calculateTripTime(landingDate, landingTime, takeoffDate, takeoffTime);
            const recommendations = getMockRecommendations();

            setTimeout(() => {
                setIsLoading(false);
                setResults({
                    ...tripMetrics,
                    ...recommendations
                });
                navigate('/results');
            }, 1500);
        } catch (err) {
            setErrorMsg(err.message);
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <div className="guest-planner-container animate-in">
            <Hero />
            <InfoCards />
            <PlannerForm
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                onSubmit={handleCalculate}
                error={errorMsg}
            />
            <Testimonials />
        </div>
    );
};

export default HomePage;
