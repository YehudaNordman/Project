import React, { useState, useEffect } from 'react';
import { fetchExchangeRate } from '../../utils/plannerUtils';

const currencyData = {
    'ILS': { name: 'שקל חדש', symbol: '₪' },
    'USD': { name: 'דולר ארה"ב', symbol: '$' },
    'EUR': { name: 'אירו', symbol: '€' },
    'GBP': { name: 'פאונד', symbol: '£' },
    'JPY': { name: 'יין יפני', symbol: '¥' },
    'THB': { name: 'בהאט תאילנדי', symbol: '฿' },
};

const destinationToCurrency = {
    'לונדון': { code: 'GBP', name: 'פאונד', symbol: '£' },
    'פריז': { code: 'EUR', name: 'אירו', symbol: '€' },
    'רומא': { code: 'EUR', name: 'אירו', symbol: '€' },
    'מדריד': { code: 'EUR', name: 'אירו', symbol: '€' },
    'ברלין': { code: 'EUR', name: 'אירו', symbol: '€' },
    'אמסטרדם': { code: 'EUR', name: 'אירו', symbol: '€' },
    'ניו יורק': { code: 'USD', name: 'דולר ארה"ב', symbol: '$' },
    'טוקיו': { code: 'JPY', name: 'יין יפני', symbol: '¥' },
    'תאילנד': { code: 'THB', name: 'בהאט תאילנדי', symbol: '฿' },
    'בודפשט': { code: 'HUF', name: 'פורינט הונגרי', symbol: 'Ft' },
    'פראג': { code: 'CZK', name: 'קורונה צ׳כית', symbol: 'Kč' },
    'אתונה': { code: 'EUR', name: 'אירו', symbol: '€' },
    'וינה': { code: 'EUR', name: 'אירו', symbol: '€' },
    'ליסבון': { code: 'EUR', name: 'אירו', symbol: '€' },
    'ברצלונה': { code: 'EUR', name: 'אירו', symbol: '€' },
    'תל אביב': { code: 'ILS', name: 'שקל חדש', symbol: '₪' },
};

const QuickToolsSection = ({ destination, currencyCode: propCurrencyCode, currencyName: propCurrencyName, landingTime, takeoffTime }) => {
    // פונקציית עזר להוצאת סמל מטבע
    const getSymbol = (code) => {
        const symbols = { 'ILS': '₪', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'THB': '฿' };
        return symbols[code] || '';
    };

    // קביעת מטבע היעד - עדיפות לפרופס מהטופס, אחר כך למיפוי, ולבסוף דולר
    const destInfo = (propCurrencyCode && propCurrencyName)
        ? { code: propCurrencyCode, name: propCurrencyName, symbol: getSymbol(propCurrencyCode) }
        : (destinationToCurrency[destination] || { code: 'USD', name: 'דולר ארה"ב', symbol: '$' });

    const [sourceCurrency, setSourceCurrency] = useState('ILS');
    const [amount, setAmount] = useState('100');
    const [converted, setConverted] = useState(0);
    const [rate, setRate] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const sourceCurrencyInfo = currencyData[sourceCurrency] || { name: sourceCurrency, symbol: sourceCurrency };

    // חישוב משך השהות
    const durationHrs = (new Date(takeoffTime) - new Date(landingTime)) / (1000 * 60 * 60);

    // עדכון שער החליפין כשמטבע המקור או היעד משתנים
    useEffect(() => {
        const updateRate = async () => {
            setIsLoading(true);
            try {
                // הבאת שער בין מטבע המקור (למשל ILS) למטבע היעד
                const newRate = await fetchExchangeRate(destInfo.code, sourceCurrency);
                setRate(newRate);
            } catch (err) {
                console.error("Failed to fetch rate:", err);
            } finally {
                setIsLoading(false);
            }
        };
        updateRate();
    }, [destInfo.code, sourceCurrency]);

    // עדכון הסכום המומר כשחל שינוי בסכום או בשער
    useEffect(() => {
        const val = parseFloat(amount) || 0;
        setConverted((val * rate).toFixed(2));
    }, [amount, rate]);

    return (
        <div className="quick-tools-wrapper">
            <div className="quick-tools-container">
                {/* Currency Converter */}
                <div className="tool-card currency-card-premium">
                    <div className="tool-content">
                        <div className="tool-header">
                            <span className="tool-icon">🪙</span>
                            <h3>ממיר מטבע למטבע המקומי</h3>
                        </div>
                        <div className="converter-logic">
                            {/* צד מקור */}
                            <div className="column-modern">
                                <div className="amount-field-wrapper">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="סכום"
                                    />
                                </div>
                                <div className="info-field-wrapper">
                                    <span className="currency-label">מטבע מקור:</span>
                                    <select
                                        className="currency-select-premium"
                                        value={sourceCurrency}
                                        onChange={(e) => setSourceCurrency(e.target.value)}
                                    >
                                        {Object.keys(currencyData).map(code => (
                                            <option key={code} value={code}>
                                                {currencyData[code].symbol} ({currencyData[code].name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="converter-arrow">➡️</div>

                            {/* צד יעד */}
                            <div className="column-modern">
                                <div className="amount-field-wrapper">
                                    <div className="result-value">
                                        {isLoading ? '...' : converted}
                                    </div>
                                </div>
                                <div className="info-field-wrapper">
                                    <span className="currency-label">מטבע יעד: {destination}</span>
                                    <div className="dest-pill-modern">
                                        {destInfo.symbol} {destInfo.name} ({destInfo.code})
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="rate-info">
                            שער המרה: 1 {sourceCurrencyInfo.name} ≈ {isLoading ? '...' : rate.toFixed(3)} {destInfo.name}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickToolsSection;
