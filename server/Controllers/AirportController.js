const path = require("path");
const { execFile } = require("child_process");
const axios = require('axios');
const fs = require('fs');

const getApiKey = () => {
  if (process.env.GEOAPIFY_KEY) return process.env.GEOAPIFY_KEY;
  // Fallback direct read if env loading failed for some reason
  try {
    const envPath = path.join(__dirname, "..", "password.env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEOAPIFY_KEY\s*=\s*(.*)/);
      if (match) return match[1].trim();
    }
  } catch (e) { console.error("Error reading API key manually:", e); }
  return null;
};

const API_KEY = getApiKey();

// פונקציות עזר פנימיות
function runSqliteJson({ dbPath, sql }) { //ריצה של קובץ SQLITE והחזרת JSON
  return new Promise((resolve, reject) => {
    execFile("sqlite3", ["-json", dbPath, sql], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      try { resolve(JSON.parse(stdout || "[]")); } catch (e) { reject(e); }
    });
  });
}

function escapeSqlString(value) {
  return String(value ?? "").replace(/'/g, "''");
}

// --- ייצוא הפונקציות ---

exports.getTop10 = async (req, res) => {  //מביא את כמות השדות שיוגדרו
  try {
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({
      dbPath, sql: "SELECT * FROM airports ORDER BY id LIMIT 10;" //מביא את כמות השדות שיוגדרו
    });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getNameCityCountry = async (req, res) => {  //מביא את כל השדות לפי שם עיר ומדינה
  try {
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({
      dbPath, sql: "SELECT id, name,iso_country FROM airports ORDER BY id LIMIT 1;"
    });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getAirportsByCountry = async (req, res) => {  //מביא את כל השדות לפי מדינה
  try {
    const country = req.params.country;
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: `SELECT id, name FROM airports WHERE iso_country = '${escapeSqlString(country)}';` });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getLocationByName = async (req, res) => { //מבין את המיקום לפי שם
  try {
    const name = req.params.name;
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: `SELECT id, latitude_deg, longitude_deg FROM airports WHERE name = '${escapeSqlString(name)}';` });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getLocationById = async (req, res) => { //מבין את המיקום לפי מזהה
  try {
    const id = req.params.id;
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: `SELECT id, name, iso_country, latitude_deg, longitude_deg FROM airports WHERE id = '${escapeSqlString(id)}';` });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

//===========================================================================================================

exports.fetchAttractions = async (req, res) => {
  try {
    const { lat, lon, landingTime, takeoffTime } = req.query;

    const airportsPath = path.join(__dirname, "..", "data", "airports.json");
    const airports = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));

    const targetAirport = airports.find(a =>
      Math.abs(a.latitude - parseFloat(lat)) < 0.01 &&
      Math.abs(a.longitude - parseFloat(lon)) < 0.01
    );

    const finalLat = targetAirport ? targetAirport.latitude : parseFloat(lat);
    const finalLon = targetAirport ? targetAirport.longitude : parseFloat(lon);

    let finalRadius = 5000;

    if (landingTime && takeoffTime) {
      const landing = new Date(landingTime);
      const takeoff = new Date(takeoffTime);

      if (!isNaN(landing.getTime()) && !isNaN(takeoff.getTime())) {
        const diffInMinutes = Math.floor((takeoff - landing) / (1000 * 60));
        const netMinutes = diffInMinutes - (45 + 60 + 120);
        finalRadius = Math.max(2000, (netMinutes / 60) * 5000);
      }
    }

    if (isNaN(finalRadius) || finalRadius <= 0) finalRadius = 5000;
    // הגדלת רדיוס מינימלי לאטרקציות כדי למצוא מקומות עם אתרים
    if (finalRadius < 8000) finalRadius = 8000;
    if (finalRadius > 50000) finalRadius = 50000;

    const categories = 'entertainment,tourism,leisure,commercial.shopping_mall,production.winery,production.brewery';
    const url = `https://api.geoapify.com/v2/places`;

    const response = await axios.get(url, {
      params: {
        categories,
        filter: `circle:${finalLon},${finalLat},${finalRadius}`,
        bias: `proximity:${finalLon},${finalLat}`,
        limit: 500, // Fetch more to allow filtering for websites
        apiKey: API_KEY
      }
    });

    // הוספת קישור למפות והחזרת 200 הכי קרובים (כולל כאלו ללא אתר רשמי)
    const results = (response.data.features || [])
      .slice(0, 200)
      .map(feature => {
        const [lon, lat] = feature.geometry.coordinates;
        return {
          ...feature.properties,
          googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
        };
      });

    return res.json(results);
  } catch (error) {
    console.error("fetchAttractions detailed error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.fetchRestaurants = async (req, res) => {
  try {
    const { lat, lon, landingTime, takeoffTime } = req.query;

    const airportsPath = path.join(__dirname, "..", "data", "airports.json");
    const airports = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));

    const targetAirport = airports.find(a =>
      Math.abs(a.latitude - parseFloat(lat)) < 0.01 &&
      Math.abs(a.longitude - parseFloat(lon)) < 0.01
    );

    const finalLat = targetAirport ? targetAirport.latitude : parseFloat(lat);
    const finalLon = targetAirport ? targetAirport.longitude : parseFloat(lon);

    let finalRadius = 5000;

    if (landingTime && takeoffTime) {
      const landing = new Date(landingTime);
      const takeoff = new Date(takeoffTime);

      if (!isNaN(landing.getTime()) && !isNaN(takeoff.getTime())) {
        const diffInMinutes = Math.floor((takeoff - landing) / (1000 * 60));
        const netMinutes = diffInMinutes - (45 + 60 + 120);
        finalRadius = Math.max(2000, (netMinutes / 60) * 5000);
      }
    }

    if (isNaN(finalRadius) || finalRadius <= 0) finalRadius = 5000;
    if (finalRadius > 50000) finalRadius = 50000;

    const categories = 'catering.restaurant,catering.cafe';
    const url = `https://api.geoapify.com/v2/places`;

    const response = await axios.get(url, {
      params: {
        categories,
        filter: `circle:${finalLon},${finalLat},${finalRadius}`,
        bias: `proximity:${finalLon},${finalLat}`,
        limit: 500,
        apiKey: API_KEY
      }
    });

    const results = (response.data.features || [])
      .slice(0, 200)
      .map(feature => {
        const [lon, lat] = feature.geometry.coordinates;
        return {
          ...feature.properties,
          googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
        };
      });

    return res.json(results);
  } catch (error) {
    console.error("fetchRestaurants detailed error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: error.message });
  }
};
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// exports.fetchAttractions = async (req, res) => {  //מחזיר אטרקציות לפי מיקום ורדיוס
//   try {
//     const { lat, lon, landingTime, takeoffTime } = req.query;

//     // 1. טעינת נתוני שדות התעופה מהשרת
//     const airportsPath = path.join(__dirname, "..", "data", "airports.json");
//     const airports = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));

//     const targetAirport = airports.find(a =>
//       Math.abs(a.latitude - parseFloat(lat)) < 0.01 &&
//       Math.abs(a.longitude - parseFloat(lon)) < 0.01
//     );

//     const finalLat = targetAirport ? targetAirport.latitude : parseFloat(lat);
//     const finalLon = targetAirport ? targetAirport.longitude : parseFloat(lon);

//     let finalRadius = 5000;

//     // 2. חישוב רדיוס לפי הלוגיקה של planTrip
//     if (landingTime && takeoffTime) {
//       const landing = new Date(landingTime);
//       const takeoff = new Date(takeoffTime);

//       if (!isNaN(landing.getTime()) && !isNaN(takeoff.getTime())) {
//         const diffInMinutes = Math.floor((takeoff - landing) / (1000 * 60));
//         const netMinutes = diffInMinutes - (45 + 60 + 120);
//         finalRadius = Math.max(2000, (netMinutes / 60) * 5000);
//       }
//     }

//     if (isNaN(finalRadius) || finalRadius <= 0) finalRadius = 5000;
//     if (finalRadius > 50000) finalRadius = 50000;

//     const categories = 'tourism.attraction,entertainment.museum,entertainment.culture,leisure.park,tourism.sights';
//     const url = `https://api.geoapify.com/v2/places`;

//     const response = await axios.get(url, {
//       params: {
//         categories,
//         filter: `circle:${finalLon},${finalLat},${finalRadius}`,
//         bias: `proximity:${finalLon},${finalLat}`,
//         limit: 15,
//         apiKey: API_KEY
//       }
//     });

//     return res.json(response.data.features || []);
//   } catch (error) {
//     console.error("fetchAttractions detailed error:", error.response ? error.response.data : error.message);
//     return res.status(500).json({ error: error.message }); 
//   }
// };

// exports.fetchRestaurants = async (req, res) => {  //מחזיר מסעדות לפי מיקום ורדיוס
//   try {
//     const { lat, lon, landingTime, takeoffTime } = req.query;

//     // 1. טעינת נתוני שדות התעופה מהשרת כדי לוודא מיקום מדויק
//     const airportsPath = path.join(__dirname, "..", "data", "airports.json");
//     const airports = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));

//     const targetAirport = airports.find(a =>
//       Math.abs(a.latitude - parseFloat(lat)) < 0.01 &&
//       Math.abs(a.longitude - parseFloat(lon)) < 0.01
//     );

//     const finalLat = targetAirport ? targetAirport.latitude : parseFloat(lat);
//     const finalLon = targetAirport ? targetAirport.longitude : parseFloat(lon);

//     let finalRadius = 5000;

//     // 2. חישוב רדיוס
//     if (landingTime && takeoffTime) {
//       const landing = new Date(landingTime);
//       const takeoff = new Date(takeoffTime);

//       if (!isNaN(landing.getTime()) && !isNaN(takeoff.getTime())) {
//         const diffInMinutes = Math.floor((takeoff - landing) / (1000 * 60));
//         const netMinutes = diffInMinutes - (45 + 60 + 120);
//         finalRadius = Math.max(2000, (netMinutes / 60) * 5000);
//       }
//     }

//     if (isNaN(finalRadius) || finalRadius <= 0) finalRadius = 5000;
//     if (finalRadius > 50000) finalRadius = 50000;

//     const categories = 'catering.restaurant,catering.cafe';
//     const url = `https://api.geoapify.com/v2/places`;

//     const response = await axios.get(url, {
//       params: {
//         categories,
//         filter: `circle:${finalLon},${finalLat},${finalRadius}`,
//         bias: `proximity:${finalLon},${finalLat}`,
//         limit: 15,
//         apiKey: API_KEY
//       }
//     });

//     return res.json(response.data.features || []);
//   } catch (error) {
//     console.error("fetchRestaurants detailed error:", error.response ? error.response.data : error.message);
//     return res.status(500).json({ error: error.message });
//   }
// };


exports.planTrip = async (req, res) => {  //פונקציה ראשית לתכנון הטיול - חישוב זמנים, רדיוס ומשיכת נתונים
  try {
    const { lat, lon, landingTime, takeoffTime } = req.body;

    console.log("--- New Plan Trip Request ---");
    console.log("Received Data:", { lat, lon, landingTime, takeoffTime });

    // 1. חישוב זמנים
    const landing = new Date(landingTime);
    const takeoff = new Date(takeoffTime);
    const diffInMinutes = Math.floor((takeoff - landing) / (1000 * 60));

    const totalOffsets = 45 + 60 + 120;
    const netMinutes = diffInMinutes - totalOffsets;

    // 2. קביעת רדיוס
    const calculatedRadius = Math.max(2000, (netMinutes / 60) * 5000);
    const attractionRadius = Math.max(8000, calculatedRadius);

    console.log("Calculated Net Minutes:", netMinutes);
    console.log("Calculated Radius:", calculatedRadius);

    // בדיקה אם המפתח קיים לפני השליחה
    if (!process.env.GEOAPIFY_KEY) {
      console.error("CRITICAL ERROR: API Key is missing in process.env!");
    }

    // 3. משיכת נתונים
    const [attractions, restaurants] = await Promise.all([
      fetchDataFromGeoapify(lat, lon, attractionRadius, 'entertainment,tourism,leisure,commercial.shopping_mall,production.winery,production.brewery'),
      fetchDataFromGeoapify(lat, lon, calculatedRadius, 'catering.restaurant,catering.cafe')
    ]);

    console.log(`Results found: ${attractions.length} attractions, ${restaurants.length} restaurants`);

    return res.json({
      timeSummary: {
        grossMinutes: diffInMinutes,
        netMinutes: netMinutes,
        calculatedRadius: calculatedRadius,
        isValid: netMinutes >= 120
      },
      results: {
        attractions,
        restaurants
      }
    });

  } catch (error) {
    console.error("planTrip internal error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getAirports = async (req, res) => {
  try {
    const airportsPath = path.join(__dirname, "..", "data", "airports.json");
    const data = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));

    // מיפוי השדות לפורמט שהקליינט מצפה לו (lat/lon)
    const mappedAirports = data.map(a => ({
      ...a,
      lat: a.latitude,
      lon: a.longitude,
      // הוספת ערכי ברירת מחדל לשדות שחסרים בקובץ השרת
      currency_code: a.currency_code || "",
      currency_name_hebrew: a.currency_name_hebrew || ""
    }));

    return res.json({ airports: mappedAirports });
  } catch (error) {
    console.error("Error in getAirports:", error);
    return res.status(500).json({ message: error.message });
  }
};

// פונקציית עזר פנימית כדי לא לשכפל קוד
async function fetchDataFromGeoapify(lat, lon, radius, categories) {
  const url = `https://api.geoapify.com/v2/places`;
  try {
    // וידוא שהערכים הם מספרים נקיים
    const cleanLat = parseFloat(lat);
    const cleanLon = parseFloat(lon);
    const cleanRadius = parseInt(radius);

    const response = await axios.get(url, {
      params: {
        categories,
        filter: `circle:${cleanLon},${cleanLat},${cleanRadius}`,
        bias: `proximity:${cleanLon},${cleanLat}`,
        limit: 500,
        apiKey: API_KEY
      }
    });

    // סינון עבור האתר הרשמי ולקיחת 200 הכי קרובים
    const rawFeatures = response.data.features || [];
    console.log(`🔍 Geoapify Raw Results (${categories}): ${rawFeatures.length} found`);

    // החזרת ה-200 הכי קרובים + הצמדת קישור גוגל מאפס ושיטוח נתונים
    const results = rawFeatures
      .slice(0, 200)
      .map(feature => {
        const [lon, lat] = feature.geometry.coordinates;
        return {
          ...feature.properties,
          googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
        };
      });

    console.log(`🎯 Total results returned: ${results.length}`);
    return results;
  } catch (error) {
    // הדפסה לטרמינל כדי שתדע אם ה-API של Geoapify החזיר שגיאה
    console.error("Geoapify API Error:", error.response ? error.response.data : error.message);
    return [];
  }
}