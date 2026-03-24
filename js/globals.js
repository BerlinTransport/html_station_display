let currentId = null;
let timer = null;
let currentVariant = 'daisy';
let currentStationName = '';
let currentLines = 7;

const MIN_FONT_PX = 16;

const TEXT_COL_RATIO = { daisy: 0.65, tft: 0.75 };
const CONTAINER_PADDING_VW = { daisy: 0.06, tft: 0.03 };
const CHAR_FACTOR = { daisy: 0.47, tft: 0.47 };

// ── Zieltext kürzen ──────────────────────────────────────────────────────────

const GENERIC_SUFFIXES = [
  'Bahnhof', 'Hauptbahnhof', 'Bhf', 'Bf',
  'Straßenbahnschleife', 'Schleife',
  'Busbahnhof', 'ZOB',
  'Markt', 'Dorfplatz', 'Rathaus'
];

function shortenDestination(text, threshold, product) {
  // Immer: Klammern und eckige Klammern entfernen
  let t = text.replace(/\s*[\(\[].*?[\)\]]/g, '').trim();

  // Immer: "Bhf" / "Bahnhof" / ", Bahnhof" am Ende entfernen
  t = t.replace(/,?\s+(Bhf|Bahnhof|Bf)\.?$/i, '').trim();

  // Immer: " via ..." entfernen
  t = t.replace(/\s+via\s+.*/i, '').trim();

  // Nur bei S-Bahn und Regio: "S " und "S+U " vorne entfernen
  if (product === 'suburban' || product === 'regional') {
    t = t.replace(/^S\+U\s+/i, '').replace(/^S\s+/i, '').trim();
  }

  if (t.length <= threshold) return t;

  // Schritt 1: "Stadt, Ziel" → nur Ziel (außer Ziel ist generisch)
  const commaIdx = t.indexOf(',');
  if (commaIdx !== -1) {
    const before = t.slice(0, commaIdx).trim();
    const after  = t.slice(commaIdx + 1).trim();
    const isGeneric = GENERIC_SUFFIXES
      .some(s => after.toLowerCase() === s.toLowerCase());
    t = isGeneric ? before : after;
  }
  if (t.length <= threshold) return t;

  // Schritt 2: Letzter Ausweg — hart abschneiden
  return t.slice(0, threshold - 1) + '…';
}

// ── DOM & Loader ─────────────────────────────────────────────────────────────

const loaderOverlay = document.getElementById('loader-overlay');
const searchErrorEl  = document.getElementById('search-error');
const searchLoaderEl = document.getElementById('search-loader');

function showLoader()            { loaderOverlay.style.display = 'flex'; }
function hideLoader()            { setTimeout(() => loaderOverlay.style.display = 'none', 400); }
function setSearchError(msg)     { searchErrorEl.textContent = msg; }
function showSearchLoader()      { searchLoaderEl.style.display = 'inline-block'; }
function hideSearchLoader()      { searchLoaderEl.style.display = 'none'; }
