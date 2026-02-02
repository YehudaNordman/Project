const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');
const countries = require('i18n-iso-countries');
const fs = require('fs');

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const AIRPORTS_CSV_URL = 'https://ourairports.com/data/airports.csv';
const OUTPUT_FILE = 'airports_by_country.json';

async function build() {
  const res = await fetch(AIRPORTS_CSV_URL);
  if (!res.ok) throw new Error('Failed to download airports CSV: ' + res.status);
  const csvText = await res.text();

  const records = parse(csvText, { columns: true, skip_empty_lines: true });

  const byCountry = {};

  for (const r of records) {
    // OurAirports provides iso_country (2-letter). Try to resolve to full name.
    const iso = (r.iso_country || '').toUpperCase();
    let countryName = iso ? countries.getName(iso, 'en') : null;
    if (!countryName) countryName = iso || 'Unknown';

    const airportName = r.name && r.name.trim();
    if (!airportName) continue;

    if (!byCountry[countryName]) byCountry[countryName] = [];
    byCountry[countryName].push(airportName);
  }

  // Sort airport names for each country
  for (const k of Object.keys(byCountry)) {
    byCountry[k] = Array.from(new Set(byCountry[k])) // dedupe
      .sort((a, b) => a.localeCompare(b));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(byCountry, null, 2), 'utf8');
  console.log('Created', OUTPUT_FILE, 'with', Object.keys(byCountry).length, 'countries.');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});