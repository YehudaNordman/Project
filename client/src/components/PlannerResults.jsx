import React from 'react';

const PlannerResults = ({ result, onBack }) => {
    return (
        <div className="planner-results-container animate-in">
            <button className="back-button" onClick={onBack}>
                <span>→</span> חזרה לעריכת פרטים
            </button>

            <div className="planner-card glass">
                {result.isValid ? (
                    <div className="success-result animate-in">
                        <div className="result-icon">✨</div>
                        <h2>יש לך זמן לטייל!</h2>

                        <div className="calculation-breakdown">
                            <div className="breakdown-item">
                                <span>זמן כולל בין טיסות:</span>
                                <strong>{result.grossTime}</strong>
                            </div>
                            <div className="breakdown-divider"></div>
                            <div className="breakdown-item offset">
                                <span>נחיתה וכבודה:</span>
                                <strong>- {result.offsets.landing} דקות</strong>
                            </div>
                            <div className="breakdown-item offset">
                                <span>נסיעות הלוך-חזור:</span>
                                <strong>- {result.offsets.travel} דקות</strong>
                            </div>
                            <div className="breakdown-item offset">
                                <span>ביטחון ועלייה למטוס:</span>
                                <strong>- {result.offsets.security} דקות</strong>
                            </div>
                            <div className="breakdown-divider-main"></div>
                            <div className="breakdown-item total-net">
                                <span>זמן נטו לסיור:</span>
                                <strong>{result.netTime}</strong>
                            </div>
                        </div>

                        <div className="time-display-wrapper">
                            <p>הזמן הנטו שלך לסיור והנאה הוא:</p>
                            <div className="time-display">{result.netTime}</div>
                        </div>

                        <div className="placeholders-grid">
                            <div className="placeholder-card">
                                <div className="placeholder-img">🍽️</div>
                                <h3>מסעדות מומלצות</h3>
                                <p>בקרוב יופיעו כאן מקומות לאכול בהם</p>
                            </div>
                            <div className="placeholder-card">
                                <div className="placeholder-img">🏛️</div>
                                <h3>אטרקציות באזור</h3>
                                <p>בקרוב יופיעו כאן המקומות הכי שווים לבקר בהם</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="error-result animate-in">
                        <div className="result-icon">⚠️</div>
                        <p className="error-message">
                            זמן ההמתנה קצר מדי ליציאה מהשדה. מומלץ להישאר בטרמינל.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlannerResults;
