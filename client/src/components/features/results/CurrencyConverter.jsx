import React, { useState, useEffect } from 'react';
import { fetchExchangeRate } from '../../../services/plannerService';

/**
 * רכיב CurrencyConverter - כלי להמרת מטבע רב-מטבעי.
 * מאפשר למשתמש להמיר מכל מטבע נפוץ למטבע המקומי ביעד.
 */
const CurrencyConverter = ({ currencyCode, currencyName }) => {
    const [rate, setRate] = useState(null);
    const [amount, setAmount] = useState(100);
    const [loading, setLoading] = useState(true);
    const [baseCurrency, setBaseCurrency] = useState('ILS');

    const commonCurrencies = [
        { code: 'ILS', name: 'שקל חדש' },
        { code: 'USD', name: 'דולר ארה"ב' },
        { code: 'EUR', name: 'אירו' },
        { code: 'GBP', name: 'ליש"ט' }
    ];

    useEffect(() => {
        if (currencyCode) {
            const getRate = async () => {
                setLoading(true);
                const r = await fetchExchangeRate(currencyCode, baseCurrency);
                setRate(r);
                setLoading(false);
            };
            getRate();
        }
    }, [currencyCode, baseCurrency]);

    if (!currencyCode || (currencyCode === baseCurrency && baseCurrency === 'ILS')) return null;

    const converted = (amount * (rate || 0)).toFixed(2);

    return (
        <div className="currency-converter-card animate-in">
            <div className="converter-header">
                <span className="converter-icon">💱</span>
                <div className="converter-title-group">
                    <h4>מחשבון המרת מטבע</h4>
                    <p>המרה למטבע המקומי: {currencyName} ({currencyCode})</p>
                </div>
            </div>

            <div className="converter-body">
                <div className="converter-input-group">
                    <label>סכום במטבע מקור:</label>
                    <div className="amount-field-wrapper">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="הזן סכום"
                        />
                    </div>
                    <div className="info-field-wrapper">
                        <span className="currency-label">מטבע מקור:</span>
                        <select
                            value={baseCurrency}
                            onChange={(e) => setBaseCurrency(e.target.value)}
                            className="currency-select-premium"
                        >
                            {commonCurrencies.map(curr => (
                                <option key={curr.code} value={curr.code}>
                                    {curr.code} - {curr.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>                <div className="converter-arrow-static">←</div>
                <div className="converter-result-group">
                    <label>סכום ב-{currencyName}:</label>
                    <div className="amount-field-wrapper">
                        <div className="result-value">
                            {loading ? '...' : converted}
                        </div>
                    </div>
                    <div className="info-field-wrapper">
                        <span className="currency-label">מטבע יעד:</span>
                        <div className="dest-pill-modern">{currencyCode} - {currencyName}</div>
                    </div>
                </div>
            </div>

            <div className="rate-info">
                * שער חליפין: 1 {baseCurrency} = {loading ? '...' : (rate || 0).toFixed(4)} {currencyCode}
            </div>
        </div>
    );
};

export default CurrencyConverter;
