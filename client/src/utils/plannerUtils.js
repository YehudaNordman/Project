/**
 * פונקציות עזר לחישוב זמני הטיול ומזג האוויר.
 */

import { decodeWeather } from './weatherUtils';

/**
 * פונקציה לחישוב זמני הטיול
 * @param {string} landingDate - תאריך נחיתה
 * @param {string} landingTime - שעת נחיתה
 * @param {string} takeoffDate - תאריך המראה
 * @param {string} takeoffTime - שעת המראה
 * @returns {Object} - אובייקט תוצאה עם זמני ברוטו ונטו
 */
export const calculateTripTime = (landingDate, landingTime, takeoffDate, takeoffTime) => {
    const landing = new Date(`${landingDate}T${landingTime}`);
    const takeoff = new Date(`${takeoffDate}T${takeoffTime}`);

    if (takeoff <= landing) {
        throw new Error('שעת ההמראה חייבת להיות אחרי שעת הנחיתה');
    }

    const diffInMs = takeoff - landing;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    // קיזוזים קבועים (בדקות)
    const offsets = {
        landing: 45,    // זמן יציאה מהמטוס, כבודה וביקורת דרכונים
        travel: 60,     // נסיעות לעיר ובחזרה (ממוצע)
        security: 120,  // זמן ביטחון ועלייה למטוס (שעתיים לפני המראה)
        total: 225      // סה"כ קיזוזים
    };

    const netMinutes = diffInMinutes - offsets.total;

    /**
     * פונקציה פנימית לעיצוב פורמט הזמן (שעות ודקות)
     */
    const formatDuration = (totalMins) => {
        if (totalMins <= 0) return "0 דקות";
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return h > 0 ? `${h} שעות ו-${m} דקות` : `${m} דקות`;
    };

    return {
        grossTime: formatDuration(diffInMinutes),
        grossMinutes: diffInMinutes,
        offsets,
        netTime: formatDuration(netMinutes),
        netMinutes,
        isValid: netMinutes >= 120 // מינימום שעתיים נטו כדי לצאת מהשדה
    };
};

/**
 * פונקציה לחיבור נתונים מדומים של המלצות (במקום קריאה ל-API חיצוני באורח)
 */
export const getMockRecommendations = () => {
    return {
        restaurants: [
            { properties: { name: "Skyline Bistro", address_line2: "מרכז העיר, 5 דקות הליכה" } },
            { properties: { name: "Local Flavors", address_line2: "הרובע העתיק" } },
            { properties: { name: "The Coffee Hub", address_line2: "ליד כיכר העיר" } },
            { properties: { name: "Sunset Grill", address_line2: "טיילת החוף" } },
            { properties: { name: "Urban Eats", address_line2: "שדרות העצמאות 12" } },
            { properties: { name: "Green Garden Cafe", address_line2: "פארק הירקון" } }
        ],
        attractions: [
            { properties: { name: "המוזיאון הלאומי", address_line2: "שדרות התרבות 10" } },
            { properties: { name: "תצפית פנורמית", address_line2: "מגדל העיר קומה 50" } },
            { properties: { name: "השוק המקומי", address_line2: "רחוב השוק" } },
            { properties: { name: "פארק ירוק", address_line2: "מרכז העיר" } },
            { properties: { name: "הגלריה לאמנות", address_line2: "סמטת האמנים 4" } },
            { properties: { name: "מזרקת האורות", address_line2: "כיכר המדינה" } }
        ]
    };
};

/**
 * פונקציה לשאילתת מזג אוויר
 */
export const fetchWeatherData = async (city) => {
    if (!city || city.trim().length < 2) return null;
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=he&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results[0]) {
            const { latitude, longitude } = geoData.results[0];
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
            const wData = await weatherRes.json();

            if (wData.current) {
                const decoded = decodeWeather(wData.current.weather_code);
                return {
                    temp: Math.round(wData.current.temperature_2m),
                    desc: decoded.desc,
                    icon: decoded.icon
                };
            }
        }
    } catch (err) {
        console.error("Weather service error:", err);
    }
    return null;
};
/**
 * פונקציה להבאת שער חליפין (מטבע מקור מול מטבע יעד)
 */
export const fetchExchangeRate = async (targetCurrency, baseCurrency = 'ILS') => {
    if (!targetCurrency || targetCurrency === baseCurrency) return 1;
    try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`);
        const data = await res.json();
        if (data && data.rates && data.rates[targetCurrency]) {
            return data.rates[targetCurrency];
        }
    } catch (err) {
        console.error("Exchange rate error:", err);
    }
    // Fallback בסיסי
    return 1;
};
