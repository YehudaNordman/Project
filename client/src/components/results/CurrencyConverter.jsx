import React, { useState, useEffect } from 'react';
import { fetchExchangeRate } from '../../utils/plannerUtils';

/**
 * רכיב CurrencyConverter - כלי להמרת מטבע מקומי.
 * מאפשר למשתמש להבין את ערך הכסף ביעד.
 */
const CurrencyConverter = ({ currencyCode, currencyName }) => {
    const [rate, setRate] = useState(null);
    const [amount, setAmount] = useState(100); // ברירת מחדל: 100 ש"ח
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currencyCode) {
            const getRate = async () => {
                setLoading(true);
                const r = await fetchExchangeRate(currencyCode);
                setRate(r);
                setLoading(false);
            };
            getRate();
        }
    }, [currencyCode]);

    if (!currencyCode || currencyCode === 'ILS') return null;

    const converted = (amount * (rate || 0)).toFixed(2);

    return (
        <div className="currency-converter-card animate-in">
            <div className="converter-header">
                <span className="converter-icon">💱</span>
                <div className="converter-title-group">
                    <h4>מחשבון המרת מטבע</h4>
                    <p>שקל חדש (ILS) ⟷ {currencyName} ({currencyCode})</p>
                </div>
            </div>

            <div className="converter-body">
                <div className="converter-input-group">
                    <label>סכום בשקלים</label>
                    <div className="input-wrapper">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="converter-input"
                        />
                        <span className="unit">₪</span>
                    </div>
                </div>

                <div className="converter-arrow">⇄</div>

                <div className="converter-result-group">
                    <label>סכום ב-{currencyCode}</label>
                    <div className="result-display">
                        {loading ? 'טוען...' : converted}
                        <span className="unit">{currencyCode}</span>
                    </div>
                </div>
            </div>

            <div className="converter-footer">
                * שער החליפין הנוכחי: 1 ₪ = {loading ? '...' : (rate || 0).toFixed(4)} {currencyCode}
            </div>
        </div>
    );
};

export default CurrencyConverter;
