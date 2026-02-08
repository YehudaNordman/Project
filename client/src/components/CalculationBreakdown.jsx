import React from 'react';

/**
 * רכיב CalculationBreakdown - פירוט החישוב המתמטי של הזמנים.
 * גרסה מעודכנת לפי העיצוב המדויק מהצהריים (צבעים וסימנים).
 */
const CalculationBreakdown = ({ result }) => {
    return (
        <div className="calculation-breakdown">
            {/* זמן ברוטו */}
            <div className="breakdown-item">
                <span className="item-label">זמן כולל בין טיסות:</span>
                <strong className="item-value">{result.grossMinutes >= 60 ? `${Math.floor(result.grossMinutes / 60)} שעות ו-${result.grossMinutes % 60} דקות` : `${result.grossMinutes} דקות`}</strong>
            </div>

            <div className="breakdown-divider-thin"></div>

            {/* קיזוזי זמנים (Offsets) - באדום לפי צילום המסך */}
            <div className="breakdown-item offset">
                <span className="item-label">נחיתה וכבודה:</span>
                <strong className="item-value red-text">- {result.offsets.landing} דקות</strong>
            </div>
            <div className="breakdown-item offset">
                <span className="item-label">נסיעות הלוך-חזור:</span>
                <strong className="item-value red-text">- {result.offsets.travel} דקות</strong>
            </div>
            <div className="breakdown-item offset">
                <span className="item-label">ביטוח ועלייה למטוס:</span>
                <strong className="item-value red-text">- {result.offsets.security} דקות</strong>
            </div>

            <div className="breakdown-divider-thick"></div>

            {/* תוצאה סופית (נטו) - בצבע טורקיז לוגו */}
            <div className="breakdown-item total-net">
                <span className="item-label">זמן נטו לסיור:</span>
                <strong className="item-value teal-text">{result.netTime}</strong>
            </div>
        </div>
    );
};

export default CalculationBreakdown;
