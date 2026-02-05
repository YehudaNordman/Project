import React from 'react';

/**
 * רכיב CalculationBreakdown - פירוט החישוב המתמטי של הזמנים.
 * מפרט כמה זמן יורד על נחיתה, נסיעות וביטחון.
 */
const CalculationBreakdown = ({ result }) => {
    return (
        <div className="calculation-breakdown">
            {/* זמן ברוטו (מרגע הנחיתה עד ההמראה) */}
            <div className="breakdown-item">
                <span>זמן כולל בין טיסות:</span>
                <strong>{result.grossTime}</strong>
            </div>

            <div className="breakdown-divider"></div>

            {/* קיזוזי זמנים (Offsets) */}
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

            {/* תוצאה סופית (נטו) */}
            <div className="breakdown-item total-net">
                <span>זמן נטו לסיור:</span>
                <strong>{result.netTime}</strong>
            </div>
        </div>
    );
};

export default CalculationBreakdown;
