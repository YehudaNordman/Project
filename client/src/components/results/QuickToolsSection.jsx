import React, { useState, useEffect } from 'react';

const currencyData = {
    'ILS': { name: 'שקל חדש', symbol: '₪', rate: 1 },
    'USD': { name: 'דולר ארה"ב', symbol: '$', rate: 3.7 },
    'EUR': { name: 'אירו', symbol: '€', rate: 4.1 },
    'GBP': { name: 'פאונד', symbol: '£', rate: 4.8 },
    'JPY': { name: 'יין יפני', symbol: '¥', rate: 0.025 },
    'THB': { name: 'בהאט תאילנדי', symbol: '฿', rate: 0.1 },
};

const destinationToCurrency = {
    'לונדון': 'GBP',
    'פריז': 'EUR',
    'רומא': 'EUR',
    'מדריד': 'EUR',
    'ברלין': 'EUR',
    'אמסטרדם': 'EUR',
    'ניו יורק': 'USD',
    'טוקיו': 'JPY',
    'תאילנד': 'THB',
};

const QuickToolsSection = ({ destination, landingTime, takeoffTime }) => {
    const defaultDestCurrency = destinationToCurrency[destination] || 'USD';
    const [sourceCurrency, setSourceCurrency] = useState('ILS');
    const [amount, setAmount] = useState('100');
    const [converted, setConverted] = useState(0);

    const destCurrencyInfo = currencyData[defaultDestCurrency];
    const sourceCurrencyInfo = currencyData[sourceCurrency];

    const durationHrs = (new Date(takeoffTime) - new Date(landingTime)) / (1000 * 60 * 60);
    const showAccommodation = durationHrs > 24;

    useEffect(() => {
        const val = parseFloat(amount) || 0;
        // Logic: amount in sourceCurrency -> convert to ILS -> convert to destinationCurrency
        const amountInILS = val * sourceCurrencyInfo.rate;
        const finalAmount = amountInILS / destCurrencyInfo.rate;
        setConverted(finalAmount.toFixed(2));
    }, [amount, sourceCurrency, destCurrencyInfo]);

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
                                    <div className="result-value">{converted}</div>
                                </div>
                                <div className="info-field-wrapper">
                                    <span className="currency-label">מטבע יעד:</span>
                                    <div className="dest-pill-modern">
                                        {destCurrencyInfo.symbol} ({destCurrencyInfo.name})
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="rate-info">
                            שער המרה: 1 {sourceCurrencyInfo.name} ≈ {(sourceCurrencyInfo.rate / destCurrencyInfo.rate).toFixed(3)} {destCurrencyInfo.name}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickToolsSection;
