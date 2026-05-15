// data.jsx — Metrolink station + line dataset (original color palette)
// Station names and line associations are real public-domain facts about the
// Manchester Metrolink network. Colors, taxonomy and design are original.

const LINES = {
  ALT: { id: 'ALT', name: 'Altrincham',     short: 'Alt', color: '#3FA9B5' }, // teal
  BUR: { id: 'BUR', name: 'Bury',           short: 'Bury', color: '#F2C14E' }, // amber
  EDB: { id: 'EDB', name: 'East Didsbury',  short: 'EDid', color: '#8E5BD9' }, // violet
  ECC: { id: 'ECC', name: 'Eccles',         short: 'Ecc', color: '#3B82F6' }, // blue
  AIR: { id: 'AIR', name: 'Airport',        short: 'Air', color: '#22A06B' }, // green
  ASH: { id: 'ASH', name: 'Ashton',         short: 'Ash', color: '#60BAEF' }, // sky
  ROC: { id: 'ROC', name: 'Rochdale',       short: 'Roch', color: '#E55934' }, // red-orange
  TPK: { id: 'TPK', name: 'Trafford Park',  short: 'Traf', color: '#E94B8A' }, // pink
};

// Curated station list. (lines: which routes serve it; zone: real Metrolink zone)
const STATIONS = [
  // City centre interchange
  { id: 'pic',  name: 'Piccadilly',             lines: ['BUR','AIR','ECC'],                 zone: 1, area: 'City centre' },
  { id: 'picg', name: 'Piccadilly Gardens',     lines: ['BUR','AIR','ECC','ASH','EDB','ROC'], zone: 1, area: 'City centre' },
  { id: 'mkt',  name: 'Market Street',          lines: ['BUR','ROC','EDB','ASH'],           zone: 1, area: 'City centre' },
  { id: 'shu',  name: 'Shudehill',              lines: ['BUR','ROC','EDB','ASH'],           zone: 1, area: 'City centre' },
  { id: 'vic',  name: 'Victoria',               lines: ['BUR','ROC','EDB','ASH'],           zone: 1, area: 'City centre' },
  { id: 'exc',  name: 'Exchange Square',        lines: ['BUR','ROC','EDB','ASH'],           zone: 1, area: 'City centre' },
  { id: 'sps',  name: 'St Peter\u2019s Square', lines: ['ALT','BUR','EDB','AIR','ECC','ROC','TPK'], zone: 1, area: 'City centre' },
  { id: 'dgc',  name: 'Deansgate\u2011Castlefield', lines: ['ALT','AIR','ECC','TPK'],       zone: 1, area: 'City centre' },
  { id: 'cor',  name: 'Cornbrook',              lines: ['ALT','AIR','ECC','TPK'],           zone: 1, area: 'City centre' },

  // South / Altrincham
  { id: 'pom',  name: 'Pomona',                 lines: ['ECC','TPK'],                       zone: 2, area: 'South' },
  { id: 'eqy',  name: 'Exchange Quay',          lines: ['ECC'],                             zone: 2, area: 'South' },
  { id: 'sqy',  name: 'Salford Quays',          lines: ['ECC'],                             zone: 2, area: 'South' },
  { id: 'and',  name: 'Anchorage',              lines: ['ECC'],                             zone: 2, area: 'South' },
  { id: 'hbr',  name: 'Harbour City',           lines: ['ECC'],                             zone: 2, area: 'South' },
  { id: 'mcu',  name: 'MediaCityUK',            lines: ['ECC'],                             zone: 2, area: 'South' },
  { id: 'tpk',  name: 'Trafford Centre',        lines: ['TPK'],                             zone: 3, area: 'South' },
  { id: 'oltr', name: 'Old Trafford',           lines: ['ALT'],                             zone: 2, area: 'South' },
  { id: 'tba',  name: 'Trafford Bar',           lines: ['ALT','AIR'],                       zone: 2, area: 'South' },
  { id: 'str',  name: 'Stretford',              lines: ['ALT'],                             zone: 2, area: 'South' },
  { id: 'sal',  name: 'Sale',                   lines: ['ALT'],                             zone: 3, area: 'South' },
  { id: 'alt',  name: 'Altrincham',             lines: ['ALT'],                             zone: 3, area: 'South' },

  // South / East Didsbury / Airport
  { id: 'wdy',  name: 'West Didsbury',          lines: ['EDB'],                             zone: 3, area: 'South' },
  { id: 'edb',  name: 'East Didsbury',          lines: ['EDB'],                             zone: 3, area: 'South' },
  { id: 'wit',  name: 'Withington',             lines: ['EDB'],                             zone: 3, area: 'South' },
  { id: 'air',  name: 'Manchester Airport',     lines: ['AIR'],                             zone: 4, area: 'South' },
  { id: 'wth',  name: 'Wythenshawe Town Centre', lines: ['AIR'],                            zone: 3, area: 'South' },

  // North / Bury / Rochdale
  { id: 'bur',  name: 'Bury',                   lines: ['BUR'],                             zone: 3, area: 'North' },
  { id: 'wfd',  name: 'Whitefield',             lines: ['BUR'],                             zone: 2, area: 'North' },
  { id: 'prw',  name: 'Prestwich',              lines: ['BUR'],                             zone: 2, area: 'North' },
  { id: 'crm',  name: 'Crumpsall',              lines: ['BUR'],                             zone: 2, area: 'North' },
  { id: 'roc',  name: 'Rochdale Town Centre',   lines: ['ROC'],                             zone: 4, area: 'North' },
  { id: 'old',  name: 'Oldham Mumps',           lines: ['ROC'],                             zone: 3, area: 'North' },

  // East / Ashton
  { id: 'eti',  name: 'Etihad Campus',          lines: ['ASH'],                             zone: 2, area: 'East' },
  { id: 'hol',  name: 'Holt Town',              lines: ['ASH'],                             zone: 1, area: 'East' },
  { id: 'nis',  name: 'New Islington',          lines: ['ASH'],                             zone: 1, area: 'East' },
  { id: 'dro',  name: 'Droylsden',              lines: ['ASH'],                             zone: 3, area: 'East' },
  { id: 'ash',  name: 'Ashton\u2011under\u2011Lyne', lines: ['ASH'],                        zone: 3, area: 'East' },
];

const STATION_BY_ID = Object.fromEntries(STATIONS.map(s => [s.id, s]));

// Destinations served by each line (used for departure generation).
const LINE_TERMINI = {
  ALT: ['Altrincham', 'Bury', 'Piccadilly'],
  BUR: ['Bury', 'Altrincham', 'Piccadilly'],
  EDB: ['East Didsbury', 'Rochdale Town Centre', 'Shaw and Crompton'],
  ECC: ['Eccles', 'Ashton-under-Lyne', 'MediaCityUK'],
  AIR: ['Manchester Airport', 'Victoria', 'Deansgate-Castlefield'],
  ASH: ['Ashton-under-Lyne', 'Eccles', 'MediaCityUK'],
  ROC: ['Rochdale Town Centre', 'East Didsbury', 'Shaw and Crompton'],
  TPK: ['Trafford Centre', 'Cornbrook'],
};

// Seeded RNG so departures are stable across renders for a given station + minute.
function rngFromString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t>>>15), t | 1); t ^= t + Math.imul(t ^ (t>>>7), t | 61); return ((t ^ (t>>>14)) >>> 0) / 4294967296; };
}

function generateDepartures(station, nowMs, count = 14) {
  // bucket by minute so the same minute returns the same list
  const bucket = Math.floor(nowMs / 60000);
  const rng = rngFromString(station.id + ':' + bucket);
  const out = [];
  let t = 0;
  const platforms = ['A', 'B'];
  for (let i = 0; i < count; i++) {
    const lineId = station.lines[Math.floor(rng() * station.lines.length)];
    const termini = LINE_TERMINI[lineId];
    let dest = termini[Math.floor(rng() * termini.length)];
    // avoid "to here"
    if (dest === station.name) dest = termini[(termini.indexOf(dest) + 1) % termini.length];
    const gap = i === 0 ? Math.floor(rng() * 4) + 1 : Math.floor(rng() * 6) + 3;
    t += gap;
    const carriages = rng() > 0.55 ? 2 : 1;
    const platform = platforms[Math.floor(rng() * platforms.length)];
    const status = i === 0 && rng() > 0.85 ? 'delayed' : (rng() > 0.97 ? 'cancelled' : 'on-time');
    out.push({
      line: lineId,
      destination: dest,
      mins: t,
      carriages,
      platform,
      status,
    });
  }
  return out;
}

Object.assign(window, { LINES, STATIONS, STATION_BY_ID, LINE_TERMINI, generateDepartures });
