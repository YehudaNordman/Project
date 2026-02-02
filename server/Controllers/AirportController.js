const path = require("path");
const { execFile } = require("child_process");

function runSqliteJson({ dbPath, sql }) {
  return new Promise((resolve, reject) => {
    execFile("sqlite3", ["-json", dbPath, sql], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || err.message));
      }
      try {
        const parsed = JSON.parse(stdout || "[]");
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    });
  });
}

function escapeSqlString(value) {
  // Escape for single-quoted SQLite string literal: ' -> ''
  return String(value ?? "").replace(/'/g, "''");
}

// GET /airports/top10
exports.getTop10 = async (req, res) => {
  try {
    const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
    const rows = await runSqliteJson({
      dbPath,
      sql: "SELECT * FROM airports ORDER BY id LIMIT 10;",
    });
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getNameCityCountry = async (req, res) => {
    try {
      const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
      const rows = await runSqliteJson({
        dbPath,
        sql: "SELECT id, name,iso_country FROM airports ORDER BY id LIMIT 10;",
      });
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  //getAirportsByCountry
  exports.getAirportsByCountry = async (req, res) => {
    try {
      const country = req.params.country;
      const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
      const countryEscaped = escapeSqlString(country);
      const rows = await runSqliteJson({
        dbPath,
        sql: `SELECT id, name, iso_country FROM airports WHERE iso_country = '${countryEscaped}';`,
      });
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  exports.getLocationByName = async (req, res) => {
    try {
      const name = req.params.name;
      const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
      const nameEscaped = escapeSqlString(name);
      const rows = await runSqliteJson({
        dbPath,
        sql: `SELECT id, name, iso_country, latitude_deg, longitude_deg FROM airports WHERE name = '${nameEscaped}';`,
      });
    }
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  exports.getLocationById = async (req, res) => {
    try {
      const id = req.params.id;
      const dbPath = path.join(__dirname, "..", "data", "airports.sqlite");
      const idEscaped = escapeSqlString(id);
      const rows = await runSqliteJson({
        dbPath,
        sql: `SELECT id, name, iso_country, latitude_deg, longitude_deg FROM airports WHERE id = '${idEscaped}';`,
      });
      return res.json(rows);
    }
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };