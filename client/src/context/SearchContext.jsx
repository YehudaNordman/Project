import React, { createContext, useState, useContext, useEffect } from 'react';

// יצירת הקשר (Context) לניהול נתוני החיפוש והתוצאות של המשתמש
const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    // טעינת נתוני הטופס (יעד ותאריכים) מה-sessionStorage כדי למנוע אובדן נתונים ברענון
    const [formData, setFormData] = useState(() => {
        const saved = sessionStorage.getItem('lastSearchFormData');
        return saved ? JSON.parse(saved) : {
            destination: '',
            landingDate: '',
            landingTime: '',
            takeoffDate: '',
            takeoffTime: ''
        };
    });

    // שמירת תוצאות החיפוש (חישובי הזמן והמלצות) בזיכרון הזמני
    const [results, setResults] = useState(() => {
        const saved = sessionStorage.getItem('lastSearchResults');
        return saved ? JSON.parse(saved) : null;
    });

    // שמירת נתוני מזג האוויר בזיכרון הזמני
    const [weatherData, setWeatherData] = useState(() => {
        const saved = sessionStorage.getItem('lastSearchWeather');
        return saved ? JSON.parse(saved) : null;
    });

    // עדכון ה-sessionStorage בכל פעם שנתוני הטופס משתנים
    useEffect(() => {
        sessionStorage.setItem('lastSearchFormData', JSON.stringify(formData));
    }, [formData]);

    // עדכון ה-sessionStorage בכל פעם שתוצאות החיפוש משתנות
    useEffect(() => {
        sessionStorage.setItem('lastSearchResults', JSON.stringify(results));
    }, [results]);

    // עדכון ה-sessionStorage בכל פעם שנתוני מזג האוויר משתנים
    useEffect(() => {
        sessionStorage.setItem('lastSearchWeather', JSON.stringify(weatherData));
    }, [weatherData]);

    // פונקציה לניקוי החיפוש הנוכחי (למשל כשחוזרים לדף הבית או מתחילים חיפוש חדש)
    const clearSearch = () => {
        setResults(null);
        setWeatherData(null);
        sessionStorage.removeItem('lastSearchResults');
        sessionStorage.removeItem('lastSearchWeather');
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

// Hook מותאם אישית לשימוש בנתוני החיפוש בכל רחבי האפליקציה
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
