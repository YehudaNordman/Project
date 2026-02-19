import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyRouteView from '../components/results/MyRouteView';
import { useSearch } from '../context/SearchContext';

const MyRoutePage = () => {
    const navigate = useNavigate();
    const { formData } = useSearch();

    return (
        <MyRouteView
            onBack={() => navigate(-1)}
            times={formData}
            onViewSaved={() => navigate('/saved-trips')}
        />
    );
};

export default MyRoutePage;
