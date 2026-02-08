const path = require("path");
const { execFile } = require("child_process");
const axios = require('axios');

const API_KEY = process.env.GEOAPIFY_KEY;

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

exports.fetchAttractions = async (req, res) => {  //מחזיר אטרקציות לפי מיקום ורדיוס
  // המרה למספרים כדי ש-Geoapify יקבל ערכים נקיים
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const radius = parseInt(req.query.radius) || 5000;
  const categories = 'entertainment,tourism.attraction,catering.restaurant'; 
  const url = `https://api.geoapify.com/v2/places`;

  try {
    const response = await axios.get(url, {
      params: {
        categories: categories,
        filter: `circle:${lon},${lat},${radius}`, // וודא ש-lon מופיע ראשון
        bias: `proximity:${lon},${lat}`,
        limit: 20,
        apiKey: API_KEY
      }
    });
    
    console.log("Found results count:", response.data.features.length);
    return res.json(response.data.features);
  } catch (error) {
    console.error("API Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.fetchRestaurants = async (req, res) => {
  // המרת הנתונים למספרים כדי להבטיח שה-API יקבל ערכים תקינים
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const radius = parseInt(req.query.radius) || 5000; // ברירת מחדל של 5 ק"מ אם לא הוזן רדיוס

  // הדפסת בדיקה לטרמינל כדי לוודא שהנתונים הגיעו ועובדו
  console.log("--- New Restaurant Request ---");
  console.log("Searching at:", lat, lon, "within radius:", radius);
  console.log("Using API KEY:", API_KEY);

  // בדיקת תקינות בסיסית לפני הפנייה ל-API
  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "Latitude and Longitude must be valid numbers" });
  }

  const categories = 'catering.restaurant,catering.cafe';
  const url = `https://api.geoapify.com/v2/places`;

  try {
    const response = await axios.get(url, {
      params: {
        categories: categories,
        // סדר חשוב ב-Geoapify: קודם lon ואז lat
        filter: `circle:${lon},${lat},${radius}`,
        bias: `proximity:${lon},${lat}`,
        limit: 20,
        apiKey: API_KEY
      }
    });

    console.log("Found restaurants count:", response.data.features.length);
    return res.json(response.data.features);
  } catch (error) {
    // הדפסת שגיאה מפורטת בטרמינל במקרה של תקלה ב-API
    console.error("API Error Detail:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: error.message });
  }
};