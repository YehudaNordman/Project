import React from 'react';

/**
 * רכיב PressureGauge - מד הלחץ הוויזואלי.
 * מציג בצורה גרפית כמה "לחוץ" הטיול על סמך כמות דקות הנטו הנותרות.
 */
const PressureGauge = ({ netMinutes }) => {
    /**
     * פונקציה המחשבת את רמת ה"לחץ" של הטיול לפי מספר דקות הנטו.
     * מחזירה צבע, כותרת, הודעה ואחוז למד הלחץ.
     */
    const getPressureStatus = (minutes) => {
        if (minutes >= 300) return { // מעל 5 שעות - רגוע (ירוק)
            colorClass: 'level-green',
            title: "יש לך המון זמן לטייל!",
            message: "הזמן בשפע, אפשר ליהנות מהעיר בנחת",
            percent: 100
        };
        if (minutes >= 180) return { // 3-5 שעות - גבולי (צהוב)
            colorClass: 'level-yellow',
            title: "זמן גבולי - צא בזהירות",
            message: "יש זמן לסיור קצר, מומלץ להישאר קרוב או להשתמש במוניות",
            percent: 65
        };
        return { // פחות מ-3 שעות - דחוף (אדום)
            colorClass: 'level-red',
            title: "זמן לחוץ - ריצה קלה!",
            message: "צא מהשדה רק אם יש לך סיבה טובה ותכנון מדויק",
            percent: 35
        };
    };

    const status = getPressureStatus(netMinutes);

    return (
        <div className={`pressure-gauge-wrapper ${status.colorClass}`}>
            <div className="gauge-visual">
                <div className="gauge-background-arc"></div>
                <div className="gauge-fill-arc"></div>
                <div className="gauge-needle"></div>
                <div className="gauge-center"></div>
            </div>
            <h2 className="status-title">{status.title}</h2>
        </div>
    );
};

export default PressureGauge;
