const path = require("path");
const { execFile } = require("child_process");
const axios = require('axios');
const fs = require('fs');

// מפתח ה-API של גוגל - וודא שהוא מוגדר ב-process.env
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// --- פונקציות עזר פנימיות ---

/**
 * פונקציה לחישוב מרחק אווירי בין שתי נקודות (בקילומטרים)
 */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // רדיוס כדור הארץ
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * הרצת שאילתות על בסיס הנתונים SQLite
 */
function runSqliteJson({ dbPath, sql }) {
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

/**
 * פונקציית עזר לבניית אובייקט תוצאה מותאם (כולל חישוב מרחק וסידור properties)
 */
const mapGooglePlaceToAppFormat = (place, customCategory, userLat, userLon) => {
  // חישוב מרחק אם יש נתוני מיקום משתמש
  let distance = 0;
  if (userLat && userLon && place.geometry && place.geometry.location) {
    distance = getDistance(userLat, userLon, place.geometry.location.lat, place.geometry.location.lng);
  }

  return {
    name: place.name,
    address_line2: place.vicinity || place.formatted_address,
    rating: place.rating || "N/A",
    user_ratings_total: place.user_ratings_total || 0,
    website: place.website, // יתכן וריק ב-Nearby Search, אך כדאי לשמור ליתר ביטחון
    formatted_phone_number: place.formatted_phone_number,
    // יצירת לינק לתמונה אמיתית מגוגל
    photoUrl: place.photos
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
      : 'https://via.placeholder.com/800x600?text=No+Image+Available',
    googleMapsUri: place.geometry 
      ? `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}`
      : '#',
    // לינק ישיר לניווט בגוגל מפות
    googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}`,
    lat: place.geometry.location.lat,
    lon: place.geometry.location.lng,
    place_id: place.place_id,
    // עטיפת הנתונים ב-properties כדי שה-sort והפרונט יעבדו
    properties: {
      address_line2: place.vicinity || place.formatted_address,
      rating: place.rating || "N/A",
      user_ratings_total: place.user_ratings_total || 0,
      distance: parseFloat(distance.toFixed(2)), // עיגול ל-2 ספרות
      categories: customCategory ? [customCategory] : (place.types || [])
    }
  };
};

// --- ייצוא פונקציות בסיס (SQLite) ---

exports.getTop10 = async (req, res) => {
  try {
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: "SELECT * FROM airports ORDER BY id LIMIT 10;" });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getNameCityCountry = async (req, res) => {
  try {
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: "SELECT id, name, iso_country FROM airports ORDER BY id LIMIT 1;" });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getAirportsByCountry = async (req, res) => {
  try {
    const country = req.params.country;
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: `SELECT id, name FROM airports WHERE iso_country = '${escapeSqlString(country)}';` });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getLocationByName = async (req, res) => {
  try {
    const name = req.params.name;
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: `SELECT id, latitude_deg, longitude_deg FROM airports WHERE name = '${escapeSqlString(name)}';` });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

exports.getLocationById = async (req, res) => {
  try {
    const id = req.params.id;
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({ dbPath, sql: `SELECT id, name, iso_country, latitude_deg, longitude_deg FROM airports WHERE id = '${escapeSqlString(id)}';` });
    return res.json(rows);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// --- פונקציות ה-API של Google Places ---

exports.fetchAttractions = async (req, res) => {
  try {
    const { lat, lon, landingTime, takeoffTime } = req.query;
    const uLat = parseFloat(lat);
    const uLon = parseFloat(lon);
    
    let finalRadius = 5000;
    if (landingTime && takeoffTime) {
      const diff = (new Date(takeoffTime) - new Date(landingTime)) / (1000 * 60);
      finalRadius = Math.max(2000, ((diff - 225) / 60) * 5000);
    }
    if (finalRadius > 100000) finalRadius = 100000;

    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: { location: `${uLat},${uLon}`, radius: finalRadius, type: 'tourist_attraction', key: GOOGLE_API_KEY, language: 'he' }
    });

    const results = (response.data.results || [])
      .map(place => mapGooglePlaceToAppFormat(place, 'Attraction', uLat, uLon))
      .sort((a, b) => a.properties.distance - b.properties.distance);

    return res.json(results);
  } catch (error) {
    console.error("fetchAttractions error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.fetchRestaurants = async (req, res) => {
  try {
    const { lat, lon, landingTime, takeoffTime } = req.query;
    const uLat = parseFloat(lat);
    const uLon = parseFloat(lon);

    let finalRadius = 5000;
    if (landingTime && takeoffTime) {
      const diff = (new Date(takeoffTime) - new Date(landingTime)) / (1000 * 60);
      finalRadius = Math.max(2000, ((diff - 225) / 60) * 5000);
    }
    if (finalRadius > 50000) finalRadius = 50000;

    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: { location: `${uLat},${uLon}`, radius: finalRadius, type: 'restaurant', key: GOOGLE_API_KEY, language: 'he' }
    });

    const results = (response.data.results || [])
      .map(place => mapGooglePlaceToAppFormat(place, 'Restaurant', uLat, uLon))
      .sort((a, b) => a.properties.distance - b.properties.distance);

    return res.json(results);
  } catch (error) {
    console.error("fetchRestaurants error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.planTrip = async (req, res) => {
  try {
    const { lat, lon, landingTime, takeoffTime } = req.body;
    const uLat = parseFloat(lat);
    const uLon = parseFloat(lon);
    
    const landing = new Date(landingTime);
    const takeoff = new Date(takeoffTime);
    const diffInMinutes = Math.floor((takeoff - landing) / (1000 * 60));
    const netMinutes = diffInMinutes - 225;
    const calculatedRadius = Math.max(2000, (netMinutes / 60) * 5000);

    const [attrRes, restRes] = await Promise.all([
      axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
        params: { location: `${uLat},${uLon}`, radius: calculatedRadius, type: 'tourist_attraction', key: GOOGLE_API_KEY, language: 'he' }
      }),
      axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
        params: { location: `${uLat},${uLon}`, radius: calculatedRadius, type: 'restaurant', key: GOOGLE_API_KEY, language: 'he' }
      })
    ]);

    // מיפוי תוצאות ה-Promise
    const attractions = (attrRes.data.results || []).map(p => mapGooglePlaceToAppFormat(p, 'Attraction', uLat, uLon));
    const restaurants = (restRes.data.results || []).map(p => mapGooglePlaceToAppFormat(p, 'Restaurant', uLat, uLon));

    return res.json({
      timeSummary: { grossMinutes: diffInMinutes, netMinutes, calculatedRadius, isValid: netMinutes >= 120 },
      results: { attractions, restaurants }
    });
  } catch (error) {
    console.error("planTrip error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.getAirports = async (req, res) => {
  try {
    const airportsPath = path.join(__dirname, "..", "data", "airports.json");
    if (!fs.existsSync(airportsPath)) {
      return res.status(404).json({ message: "Airports data not found" });
    }
    const data = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));
    const mappedAirports = data.map(a => ({
      ...a, lat: a.latitude, lon: a.longitude
    }));
    return res.json({ airports: mappedAirports });
  } catch (error) {
    console.error("getAirports error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};