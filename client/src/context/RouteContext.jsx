import React, { createContext, useState, useContext, useEffect } from 'react';

const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
    const [myRoute, setMyRoute] = useState(() => {
        try {
            const saved = localStorage.getItem('userRoute');
            if (saved && saved !== "undefined") {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Error parsing userRoute from localStorage", e);
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('userRoute', JSON.stringify(myRoute));
    }, [myRoute]);

    const addToRoute = (item) => {
        // Prevent duplicates
        setMyRoute((prev) => {
            const exists = prev.find(i => (i.place_id && i.place_id === item.place_id) || i.name === item.name);
            if (exists) return prev;
            return [...prev, item];
        });
    };

    const removeFromRoute = (itemId) => {
        setMyRoute((prev) => prev.filter(item => (item.place_id || item.name) !== itemId));
    };

    const clearRoute = () => {
        setMyRoute([]);
    };

    return (
        <RouteContext.Provider value={{ myRoute, addToRoute, removeFromRoute, clearRoute }}>
            {children}
        </RouteContext.Provider>
    );
};

export const useRoute = () => {
    const context = useContext(RouteContext);
    if (!context) {
        throw new Error('useRoute must be used within a RouteProvider');
    }
    return context;
};
