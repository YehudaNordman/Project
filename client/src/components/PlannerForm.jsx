import React, { useState, useEffect } from 'react';

const PlannerForm = ({ formData, handleChange, setFormData, onSubmit }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allAirports, setAllAirports] = useState([]);

    useEffect(() => {
        const loadAirports = async () => {
            try {
                const response = await fetch('/data.json');
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

    const handleSelectAirport = (airport) => {
        setFormData(prev => ({
            ...prev,
            destination: airport.city_hebrew,
            lat: airport.lat,
            lon: airport.lon,
            currency_code: airport.currency_code,
            currency_name_hebrew: airport.currency_name_hebrew
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

                <button type="submit" className="calculate-btn">חשב לי את הזמן</button>
            </form>
        </div>
    );
};

export default PlannerForm;
