import React from 'react';
import CalculationBreakdown from '../CalculationBreakdown';

/**
 * רכיב ResultsSummary - מציג את כרטיס סיכום זמני הסיור (נטו וברוטו)
 * כולל את פירוט הקיזוזים והמלצה לפי אורך הזמן שנותר.
 */
const ResultsSummary = ({ result }) => {
    const netMinutes = result?.netMinutes || 0;

    return (
        <div className="planner-summary-card">
            <h2 className="summary-title">סיכום זמני הסיור שלך</h2>

            <div className="summary-content-wrapper">
                {/* רכיב פירוט החישוב - מציג את הברוטו והקיזוזים */}
                <CalculationBreakdown result={result} />

                <div className="summary-result-divider"></div>

                {/* הצגת המלצה לפי הזמן הנותר (נטו) */}
                <div className="net-time-recommendation">
                    {netMinutes < 120 ? (
                        <div className="recommendation-box danger">
                            <div className="status-message">
                                ⚠️ זמן ההמתנה קצר מדי ליציאה מהשדה.<br />
                                מומלץ להישאר בטרמינל.
                            </div>
                        </div>
                    ) : netMinutes < 300 ? (
                        <div className="recommendation-box warning">
                            <div className="label">זמן נטו לסיור קצר:</div>
                            <div className="time-display">{result?.netTime}</div>
                            <div className="message">⏳ יש לך זמן מוגבל! מומלץ לבחור אטרקציה אחת קרובה ומהירה.</div>
                        </div>
                    ) : (
                        <div className="recommendation-box success">
                            <div className="label">זמן נטו לסיור מלא:</div>
                            <div className="time-display">{result?.netTime}</div>
                            <div className="message">🚀 יש לך המון זמן לטייל! תוכל ליהנות מכמה אטרקציות ומסעדה טובה.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsSummary;
