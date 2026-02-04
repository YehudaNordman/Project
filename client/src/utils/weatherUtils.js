/**
 * פונקציית עזר לתרגום קוד מזג האוויר של Open-Meteo לעברית ותיאור.
 * מחזירה אובייקט עם תיאור (desc) ואייקון (icon).
 */
export const decodeWeather = (code) => {
    const codes = {
        0: { desc: 'שמיים בהירים', icon: 'sun' },
        1: { desc: 'בעיקר בהיר', icon: 'sun' },
        2: { desc: 'מעונן חלקית', icon: 'cloud' },
        3: { desc: 'מעונן', icon: 'cloud' },
        45: { desc: 'ערפל', icon: 'cloud' },
        48: { desc: 'ערפל קפוא', icon: 'cloud' },
        51: { desc: 'טפטוף קל', icon: 'rain' },
        53: { desc: 'טפטוף בינוני', icon: 'rain' },
        55: { desc: 'טפטוף כבד', icon: 'rain' },
        61: { desc: 'גשם קל', icon: 'rain' },
        63: { desc: 'גשם בינוני', icon: 'rain' },
        65: { desc: 'גשם כבד', icon: 'rain' },
        71: { desc: 'שלג קל', icon: 'snow' },
        73: { desc: 'שלג בינוני', icon: 'snow' },
        74: { desc: 'שלג כבד', icon: 'snow' },
        80: { desc: 'ממטרים קלים', icon: 'rain' },
        81: { desc: 'ממטרים בינוניים', icon: 'rain' },
        82: { desc: 'ממטרים כבדים', icon: 'rain' },
        95: { desc: 'סופת רעמים', icon: 'thunder' },
    };
    return codes[code] || { desc: 'מזג אוויר משתנה', icon: 'cloud' };
};
