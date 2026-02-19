import React, { createContext, useState, useContext, useEffect } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('lastSearchFormData');
        return saved ? JSON.parse(saved) : {
            destination: '',
            landingDate: '',
            landingTime: '',
            takeoffDate: '',
            takeoffTime: ''
        };
    });

    const [results, setResults] = useState(() => {
        const saved = localStorage.getItem('lastSearchResults');
        return saved ? JSON.parse(saved) : null;
    });

    const [weatherData, setWeatherData] = useState(() => {
        const saved = localStorage.getItem('lastSearchWeather');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('lastSearchFormData', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        localStorage.setItem('lastSearchResults', JSON.stringify(results));
    }, [results]);

    useEffect(() => {
        localStorage.setItem('lastSearchWeather', JSON.stringify(weatherData));
    }, [weatherData]);

    const clearSearch = () => {
        setResults(null);
        setWeatherData(null);
        localStorage.removeItem('lastSearchResults');
        localStorage.removeItem('lastSearchWeather');
    };

    return (
        <SearchContext.Provider value={{
            formData,
            setFormData,
            results,
            setResults,
            weatherData,
            setWeatherData,
            clearSearch
        }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
