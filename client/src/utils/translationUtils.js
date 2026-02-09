/**
 * Utility for translating Geoapify categories and UI labels to Hebrew.
 */

export const categoryTranslations = {
    // Catering / Food
    'catering': 'הסעדה',
    'catering.restaurant': 'מסעדה',
    'catering.cafe': 'בית קפה',
    'catering.fast_food': 'אוכל מהיר',
    'catering.bar': 'בר',
    'catering.pub': 'פאב',
    'catering.ice_cream': 'גלידריה',

    // Tourism & Sightseeing
    'tourism': 'תיירות',
    'tourism.attraction': 'אטרקציה',
    'tourism.sights': 'אתר תיירות',
    'tourism.information': 'מידע לתייר',
    'tourism.viewpoint': 'נקודת תצפית',

    // Entertainment & Culture
    'entertainment': 'בידור ופנאי',
    'entertainment.museum': 'מוזיאון',
    'entertainment.culture': 'מרכז תרבות',
    'entertainment.cinema': 'קולנוע',
    'entertainment.theatre': 'תיאטרון',
    'entertainment.zoo': 'גן חיות',
    'entertainment.aquarium': 'אקווריום',

    // Leisure & Nature
    'leisure': 'פנאי',
    'leisure.park': 'פארק',
    'leisure.garden': 'גן',
    'leisure.playground': 'גיל שעשועים',
    'leisure.swimming_pool': 'בריכה',
    'leisure.beach': 'חוף ים',
    'natural': 'טבע',

    // Others
    'amenity': 'שירותים',
    'healthcare': 'בריאות',
    'shopping': 'קניות',
    'commercial': 'מסחרי',
    'sport': 'ספורט',
    'heritage': 'אתר מורשת'
};

/**
 * Translates a single category or a list of categories.
 * @param {string|string[]} category 
 * @returns {string}
 */
export const translateCategory = (category) => {
    if (Array.isArray(category)) {
        // Find the most specific translation available
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
 * Formats address lines to look better in Hebrew context if needed.
 * Currently just a placeholder for potential future logic.
 */
export const formatAddress = (address) => {
    return address || 'כתובת לא ידועה';
};
