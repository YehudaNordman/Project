/**
 * פונקציות עזר לחישוב זמני הטיול ומזג האוויר.
 */

import { decodeWeather } from '../utils/weatherUtils';

/**
 * פונקציה לחישוב זמני הטיול
 * @param {string} landingDate - תאריך נחיתה
 * @param {string} landingTime - שעת נחיתה
 * @param {string} takeoffDate - תאריך המראה
 * @param {string} takeoffTime - שעת המראה
 * @returns {Object} - אובייקט תוצאה עם זמני ברוטו ונטו
 */
export const calculateTripTime = (landingDate, landingTime, takeoffDate, takeoffTime) => {
    // יצירת אובייקטי תאריך לחישוב הפרשי זמנים
    const landing = new Date(`${landingDate}T${landingTime}`);
    const takeoff = new Date(`${takeoffDate}T${takeoffTime}`);

    // בדיקת תקינות: שעת המראה חייבת להיות אחרי שעת הנחיתה
    if (takeoff <= landing) {
        throw new Error('שעת ההמראה חייבת להיות אחרי שעת הנחיתה');
    }

    // חישוב ההפרש הכולל בדקות (זמן "ברוטו")
    const diffInMs = takeoff - landing;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    // הגדרת קיזוזי זמן הכרחיים (בדקות) כחלק מפרוטוקול בטיחות
    const offsets = {
        landing: 45,    // זמן לביקורת דרכונים, כבודה ויציאה מהטרמינל
        travel: 0,      // נסיעות (כרגע מחושב כ-0 כי ה-POI מחושבים לפי הגעה עצמית)
        security: 180,  // הגעה לשדה 3 שעות לפני המראה (בידוק בטחוני ו-Gate)
        total: 225      // סה"כ זמן "מת" בשדות התעופה
    };

    // חישוב הזמן הפנוי לטיול בפועל (זמן "נטו")
    const netMinutes = diffInMinutes - offsets.total;

    /**
     * פונקציה פנימית לעיצוב פורמט הזמן (למשל: "5 שעות ו-20 דקות")
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
        // ולידציה: האם יש לפחות שעתיים נטו כדי להצדיק יציאה מהשדה
        isValid: netMinutes >= 120
    };
};

/**
 * פונקציה להחזרת נתונים מדומים של המלצות (Mock Data)
 * משמש כשלב ביניים לפני הטמעת API מלא של המלצות
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
 * פונקציה למשיכת נתוני מזג אוויר בזמן אמת ע"י שימוש ב-Geocoding ו-Open-Meteo
 */
export const fetchWeatherData = async (city) => {
    if (!city || city.trim().length < 2) return null;
    try {
        // שלב 1: מציאת קואורדינטות (קו אורך ורוחב) של העיר
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=he&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results[0]) {
            const { latitude, longitude } = geoData.results[0];
            // שלב 2: שאילתת תחזית מזג אוויר לפי הקואורדינטות
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
            const wData = await weatherRes.json();

            if (wData.current) {
                // פיענוח קוד מזג האוויר לטקסט ואיקון קריא בעברית
                const decoded = decodeWeather(wData.current.weather_code);
                return {
                    temp: Math.round(wData.current.temperature_2m),
                    desc: decoded.desc,
                    icon: decoded.icon
                };
            }
        }
    } catch (err) {
        console.error("שגיאה בשירות מזג האוויר:", err);
    }
    return null;
};

/**
 * פונקציה להבאת שער חליפין עדכני (למשל: שקל מול אירו) ע"י Frankfurter API
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
        console.error("שגיאה במשיכת שער חליפין:", err);
    }
    // החזרת 1 כברירת מחדל במקרה של שגיאה (כדי לא לשבור חישובים)
    return 1;
};
