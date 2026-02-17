import React, { useState, useEffect } from 'react';

const PlannerForm = ({ formData, handleChange, setFormData, onSubmit, error }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allAirports, setAllAirports] = useState([]);

    useEffect(() => {
        const loadAirports = async () => {
            try {
                const response = await fetch('http://127.0.0.1:3005/airports/getAirports');
                const data = await response.json();
                setAllAirports(data.airports || []);
            } catch (err) { console.error("Error loading airports:", err); }
        };
        loadAirports();
    }, []);

    useEffect(() => {
        if (formData.destination && formData.destination.length >= 2) {
            const trimmed = formData.destination.trim().toLowerCase();
            const filtered = allAirports.filter(airport =>
                airport.city_hebrew.toLowerCase().includes(trimmed) ||
                airport.airport_name.toLowerCase().includes(trimmed) ||
                (airport.state_hebrew && airport.state_hebrew.toLowerCase().includes(trimmed))
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [formData.destination, allAirports]);

    const countryToCurrency = {
        'בריטניה': { code: 'GBP', name: 'פאונד' },
        'צרפת': { code: 'EUR', name: 'אירו' },
        'איטליה': { code: 'EUR', name: 'אירו' },
        'גרמניה': { code: 'EUR', name: 'אירו' },
        'ספרד': { code: 'EUR', name: 'אירו' },
        'הולנד': { code: 'EUR', name: 'אירו' },
        'יוון': { code: 'EUR', name: 'אירו' },
        'קפריסין': { code: 'EUR', name: 'אירו' },
        'אוסטריה': { code: 'EUR', name: 'אירו' },
        'בלגיה': { code: 'EUR', name: 'אירו' },
        'פורטוגל': { code: 'EUR', name: 'אירו' },
        'אירלנד': { code: 'EUR', name: 'אירו' },
        'פינלנד': { code: 'EUR', name: 'אירו' },
        'ארצות הברית': { code: 'USD', name: 'דולר ארה"ב' },
        'USA': { code: 'USD', name: 'דולר ארה"ב' },
        'קנדה': { code: 'CAD', name: 'דולר קנדי' },
        'יפן': { code: 'JPY', name: 'יין יפני' },
        'תאילנד': { code: 'THB', name: 'בהאט תאילנדי' },
        'הונגריה': { code: 'HUF', name: 'פורינט הונגרי' },
        'צ׳כיה': { code: 'CZK', name: 'קורונה צ׳כית' },
        'טורקיה': { code: 'TRY', name: 'לירה טורקית' },
        'איחוד האמירויות': { code: 'AED', name: 'דירהם' },
        'סין': { code: 'CNY', name: 'יואן סיני' },
        'אוסטרליה': { code: 'AUD', name: 'דולר אוסטרלי' },
        'שווייץ': { code: 'CHF', name: 'פרנק שוויצרי' },
        'שוויץ': { code: 'CHF', name: 'פרנק שוויצרי' },
        'פולין': { code: 'PLN', name: 'זלוטי פולני' },
        'ישראל': { code: 'ILS', name: 'שקל חדש' },
    };

    const handleSelectAirport = (airport) => {
        const currency = airport.currency_code
            ? { code: airport.currency_code, name: airport.currency_name_hebrew }
            : (countryToCurrency[airport.state_hebrew] || { code: 'USD', name: 'דולר ארה"ב' });

        setFormData(prev => ({
            ...prev,
            destination: airport.city_hebrew,
            lat: airport.lat,
            lon: airport.lon,
            currency_code: currency.code,
            currency_name_hebrew: currency.name
        }));
        setShowSuggestions(false);
    };

    return (
        <div className="planner-card glass">
            <h1>פרטי ההמתנה שלך</h1>
            <form className="planner-form" onSubmit={onSubmit}>
                <div className="form-group destination-group">
                    <label className="input-label-premium">יעד עצירת הביניים (עיר או שדה תעופה)</label>
                    <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => formData.destination.length >= 2 && setShowSuggestions(true)}
                        placeholder="לדוגמה: לונדון, ברצלונה..."
                        className="planner-input"
                        autoComplete="off"
                    />

                    {showSuggestions && (
                        <ul className="suggestions-list">
                            {suggestions.map((airport) => (
                                <li key={airport.id} onClick={() => handleSelectAirport(airport)} className="suggestion-item">
                                    <div className="suggestion-icon">✈️</div>
                                    <div className="suggestion-main-info">
                                        <span className="city-name">{airport.city_hebrew}</span>
                                        <span className="airport-name">{airport.airport_name}</span>
                                    </div>
                                    <div className="suggestion-location-badge">{airport.state_hebrew}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="form-row-grid">
                    <div className="form-group">
                        <label className="input-label-premium">תאריך נחיתה</label>
                        <div className="premium-input-wrapper">
                            <input type="date" name="landingDate" value={formData.landingDate} onChange={handleChange} className="planner-input premium" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="input-label-premium">שעת נחיתה</label>
                        <div className="premium-input-wrapper">
                            <input type="time" name="landingTime" value={formData.landingTime} onChange={handleChange} className="planner-input premium" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="input-label-premium">תאריך המראה</label>
                        <div className="premium-input-wrapper">
                            <input type="date" name="takeoffDate" value={formData.takeoffDate} onChange={handleChange} className="planner-input premium" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="input-label-premium">שעת המראה</label>
                        <div className="premium-input-wrapper">
                            <input type="time" name="takeoffTime" value={formData.takeoffTime} onChange={handleChange} className="planner-input premium" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="planner-error-box animate-in">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <button type="submit" className="calculate-btn">חשב לי את הזמן</button>
            </form>
        </div>
    );
};

export default PlannerForm;
