/**
 * כלי עזר לתרגום קטגוריות של Geoapify ותוויות ממשק לעברית.
 * משמש להצגת שמות ידידותיים למשתמש עבור סוגי מקומות (מסעדות, מוזיאונים וכו').
 */

export const categoryTranslations = {
    // קטגוריות אוכל והסעדה
    'catering': 'הסעדה',
    'catering.restaurant': 'מסעדה',
    'catering.cafe': 'בית קפה',
    'catering.fast_food': 'אוכל מהיר',
    'catering.bar': 'בר',
    'catering.pub': 'פאב',
    'catering.ice_cream': 'גלידריה',

    // תיירות ואטרקציות
    'tourism': 'תיירות',
    'tourism.attraction': 'אטרקציה',
    'tourism.sights': 'אתר תיירות',
    'tourism.information': 'מידע לתייר',
    'tourism.viewpoint': 'נקודת תצפית',

    // בידור ותרבות
    'entertainment': 'בידור ופנאי',
    'entertainment.museum': 'מוזיאון',
    'entertainment.culture': 'מרכז תרבות',
    'entertainment.cinema': 'קולנוע',
    'entertainment.theatre': 'תיאטרון',
    'entertainment.zoo': 'גן חיות',
    'entertainment.aquarium': 'אקווריום',

    // פנאי וטבע
    'leisure': 'פנאי',
    'leisure.park': 'פארק',
    'leisure.garden': 'גן',
    'leisure.playground': 'גן שעשועים',
    'leisure.swimming_pool': 'בריכה',
    'leisure.beach': 'חוף ים',
    'natural': 'טבע',

    // קטגוריות נוספות
    'amenity': 'שירותים',
    'healthcare': 'בריאות',
    'shopping': 'קניות',
    'commercial': 'מסחרי',
    'sport': 'ספורט',
    'heritage': 'אתר מורשת'
};

/**
 * פונקציה המתרגמת קטגוריה בודדת או רשימת קטגוריות לעברית.
 * אם מועבר מערך, היא מחפשת את התרגום הספציפי ביותר הזמין.
 */
export const translateCategory = (category) => {
    if (Array.isArray(category)) {
        // חיפוש מהסוף להתחלה כדי למצוא את התת-קטגוריה הכי ספציפית
        for (let i = category.length - 1; i >= 0; i--) {
            if (categoryTranslations[category[i]]) {
                return categoryTranslations[category[i]];
            }
        }
        return category[category.length - 1] || 'כללי';
    }
    return categoryTranslations[category] || category;
};

/**
 * עיצוב כתובות לתצוגה נעימה. 
 * מוודא שאם אין כתובת, המשתמש יראה טקסט ברירת מחדל.
 */
export const formatAddress = (address) => {
    return address || 'כתובת לא ידועה';
};
