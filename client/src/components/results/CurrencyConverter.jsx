import React, { useState, useEffect } from 'react';
import { fetchExchangeRate } from '../../utils/plannerUtils';

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
                    <label>בחר מטבע מקור וסכום</label>
                    <div className="input-with-select">
                        <select
                            value={baseCurrency}
                            onChange={(e) => setBaseCurrency(e.target.value)}
                            className="currency-select"
                        >
                            {commonCurrencies.map(curr => (
                                <option key={curr.code} value={curr.code}>
                                    {curr.code} - {curr.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="converter-input"
                        />
                    </div>
                </div>

                <div className="converter-arrow">←</div>

                <div className="converter-result-group">
                    <label>סכום ב-{currencyName}</label>
                    <div className="result-display">
                        {loading ? 'טוען...' : converted}
                        <span className="unit">{currencyCode}</span>
                    </div>
                </div>
            </div>

            <div className="converter-footer">
                * שער החליפין הנוכחי: 1 {baseCurrency} = {loading ? '...' : (rate || 0).toFixed(4)} {currencyCode}
            </div>
        </div>
    );
};

export default CurrencyConverter;
