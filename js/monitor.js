// ── Zurück zum Menü ──────────────────────────────────────────
function goToMenu() {
    showLoader();
    document.getElementById('search-overlay').style.display = 'flex';
    document.getElementById('monitor-daisy').style.display = 'none';
    document.getElementById('monitor-tft').style.display = 'none';
    document.getElementById('global-station-name').textContent = '';
    clearInterval(timer);
    hideLoader();
}

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') goToMenu();
});

document.getElementById('footer-back-btn').addEventListener('click', goToMenu);

// ── API-Abfrage & Render ─────────────────────────────────────
async function update() {
    if (!currentId) return;

    const cfgLines     = document.getElementById('cfg-max-lines');
    const cfgThreshold = document.getElementById('cfg-threshold');
    const cfgTicker    = document.getElementById('cfg-show-ticker');

    const totalLines = cfgLines     ? parseInt(cfgLines.value) || 7  : 7;
    const threshold  = cfgThreshold ? parseInt(cfgThreshold.value) || 22 : 22;
    const showTicker = cfgTicker    ? cfgTicker.checked : true;

    const cfgFilters = {
        suburban: document.getElementById('f-suburban'),
        subway:   document.getElementById('f-subway'),
        tram:     document.getElementById('f-tram'),
        bus:      document.getElementById('f-bus'),
        regional: document.getElementById('f-regional')
    };

    const filters = {
        suburban: cfgFilters.suburban ? cfgFilters.suburban.checked : true,
        subway:   cfgFilters.subway   ? cfgFilters.subway.checked   : true,
        tram:     cfgFilters.tram     ? cfgFilters.tram.checked     : true,
        bus:      cfgFilters.bus      ? cfgFilters.bus.checked      : true,
        regional: cfgFilters.regional ? cfgFilters.regional.checked : true
    };

    const params = new URLSearchParams({
        duration: currentVariant === 'daisy' ? 60 : 90,
        results:  currentVariant === 'daisy' ? 40 : 50,
        suburban: filters.suburban,
        subway:   filters.subway,
        tram:     filters.tram,
        bus:      filters.bus,
        regional: filters.regional
    });

    try {
        const res  = await fetch(`https://v6.vbb.transport.rest/stops/${currentId}/departures?${params.toString()}`);
        const data = await res.json();

        if (!data.departures) { hideLoader(); return; }

        const departures = data.departures.sort((a, b) =>
            new Date(a.when || a.plannedWhen) - new Date(b.when || b.plannedWhen)
        );

        if (currentVariant === 'daisy') {
            renderDaisy(departures, totalLines, threshold, showTicker);
        } else {
            renderTFT(departures, totalLines, threshold);
        }

    } catch (e) {
        console.error(e);
        hideLoader();
    }
}

// ── Monitor starten ──────────────────────────────────────────
function startMonitor() {
    update();
    if (timer) clearInterval(timer);
    timer = setInterval(update, currentVariant === 'daisy' ? 20000 : 30000);
}
