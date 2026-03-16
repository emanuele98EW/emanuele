/* ============================================================
   Interesse Composto – script.js  (v2 – bug-fixed + features)
   ============================================================ */

'use strict';

// ── State ──────────────────────────────────────────────────────
let graficoChart   = null;
let extraInvCount  = 0;   // numero progressivo (non diminuisce mai)
let annotationCount = 0;
const MAX_EXTRA    = 3;
const activeExtras = new Set(); // ids delle card attive

const INV_COLORS = [
  { line: '#f59e0b', fill: 'rgba(245,158,11,0.10)', label: 'Invest. A' },
  { line: '#22c55e', fill: 'rgba(34,197,94,0.10)',  label: 'Invest. B' },
  { line: '#ec4899', fill: 'rgba(236,72,153,0.10)', label: 'Invest. C' },
];

// ── Utilità ────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(n);
}

function fmtShort(n) {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M €';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(0) + 'k €';
  return n.toFixed(0) + ' €';
}

// ── Investimenti extra ─────────────────────────────────────────
function addExtraInv() {
  if (activeExtras.size >= MAX_EXTRA) return;

  // Trova il primo slot libero (0,1,2)
  let slot = 0;
  while (activeExtras.has(slot)) slot++;
  activeExtras.add(slot);

  const color = INV_COLORS[slot];
  const container = document.getElementById('extra-inv-container');
  const div = document.createElement('div');
  div.className = 'extra-inv-card';
  div.id = 'extra-card-' + slot;
  div.style.cssText = `border-left: 3px solid ${color.line};`;

  div.innerHTML = `
    <div class="extra-inv-header">
      <span class="extra-inv-title" style="color:${color.line}">
        ${color.label} — Investimento aggiuntivo ${slot + 1}
      </span>
      <button class="btn-remove-inv" onclick="removeExtraInv(${slot})">✕ Rimuovi</button>
    </div>
    <div class="extra-inv-grid">
      <label>Importo (€)
        <input type="number" id="xi-importo-${slot}"    value="5000"  min="0">
      </label>
      <label>Versamento annuo (€)
        <input type="number" id="xi-versamento-${slot}" value="0"     min="0">
      </label>
      <label>Anno di inizio
        <input type="number" id="xi-inizio-${slot}"     value="10"    min="1">
      </label>
      <label>Durata (anni)
        <input type="number" id="xi-durata-${slot}"     value="10"    min="1">
      </label>
      <label>Tasso annuo (%)
        <input type="number" id="xi-tasso-${slot}"      value="5" step="0.1">
      </label>
    </div>`;

  container.appendChild(div);
  updateAddBtn();
}

function removeExtraInv(slot) {
  const el = document.getElementById('extra-card-' + slot);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(-6px)';
  el.style.transition = 'all 0.2s ease';
  setTimeout(() => {
    el.remove();
    activeExtras.delete(slot);
    updateAddBtn();
  }, 200);
}

function updateAddBtn() {
  const btn = document.getElementById('btn-add-inv');
  if (btn) btn.disabled = activeExtras.size >= MAX_EXTRA;
}

// ── Annotazioni ────────────────────────────────────────────────
function addAnnotation() {
  const list = document.getElementById('annotation-list');
  const id = annotationCount++;
  const row = document.createElement('div');
  row.className = 'annotation-row';
  row.id = 'ann-row-' + id;
  row.innerHTML = `
    <input type="number" id="ann-anno-${id}" value="10" min="1" placeholder="Anno">
    <input type="text"   id="ann-testo-${id}" value="Evento" placeholder="Testo…">
    <button class="btn-remove-ann" onclick="removeAnnotation(${id})">✕</button>`;
  list.appendChild(row);
}

function removeAnnotation(id) {
  const el = document.getElementById('ann-row-' + id);
  if (el) el.remove();
}

// ── Lettura investimenti extra ─────────────────────────────────
function readExtras(anniTotali) {
  const extras = [];
  activeExtras.forEach(slot => {
    const getVal = (key) => document.getElementById('xi-' + key + '-' + slot);
    if (!getVal('importo')) return; // card rimossa
    const importo    = parseFloat(getVal('importo').value)    || 0;
    const versamento = parseFloat(getVal('versamento').value) || 0;
    const inizio     = parseInt(getVal('inizio').value)       || 1;
    const durata     = parseInt(getVal('durata').value)       || 1;
    const tasso      = (parseFloat(getVal('tasso').value)     || 0) / 100;
    extras.push({ slot, importo, versamento, inizio, durata, tasso });
  });
  return extras;
}

// ── Lettura annotazioni ────────────────────────────────────────
function readAnnotations() {
  const anns = [];
  document.querySelectorAll('.annotation-row').forEach(row => {
    const id    = row.id.replace('ann-row-', '');
    const annoEl = document.getElementById('ann-anno-' + id);
    const testoEl = document.getElementById('ann-testo-' + id);
    if (!annoEl || !testoEl) return;
    const anno  = parseInt(annoEl.value) || 0;
    const testo = testoEl.value.trim();
    if (anno > 0 && testo) anns.push({ anno, testo });
  });
  return anns;
}

// ── Simulazione anno per anno ──────────────────────────────────
function simulate(C0, V, r, anniTotali, extras) {
  const baseArr  = [];
  const extraArrs = extras.map(() => []);
  const totaleArr = [];

  let baseVal   = C0;
  const eVal    = extras.map(() => 0);

  let anni100k  = null;
  let anni1M    = null;

  for (let t = 0; t <= anniTotali; t++) {
    if (t > 0) {
      baseVal = baseVal * (1 + r) + V;
    }

    extras.forEach((e, i) => {
      if (t < e.inizio) {
        eVal[i] = 0;
      } else if (t === e.inizio) {
        eVal[i] = e.importo + (t > 0 ? e.versamento : 0);
      } else {
        const stillDepositing = t < e.inizio + e.durata;
        eVal[i] = eVal[i] * (1 + e.tasso) + (stillDepositing ? e.versamento : 0);
      }
    });

    const totale = baseVal + eVal.reduce((s, v) => s + v, 0);
    baseArr.push(Math.round(baseVal));
    extras.forEach((_, i) => extraArrs[i].push(Math.round(eVal[i])));
    totaleArr.push(Math.round(totale));

    if (!anni100k  && totale >= 100000)  anni100k  = t;
    if (!anni1M    && totale >= 1000000) anni1M    = t;
  }

  return { baseArr, extraArrs, totaleArr, anni100k, anni1M };
}

// ── Calcola ────────────────────────────────────────────────────
function calcola() {
  const C0   = parseFloat(document.getElementById('capitale').value)   || 0;
  const V    = parseFloat(document.getElementById('versamento').value) || 0;
  const r    = (parseFloat(document.getElementById('tasso').value)     || 0) / 100;
  const anniTotali = parseInt(document.getElementById('anni').value)   || 0;
  if (anniTotali <= 0) return;

  const extras      = readExtras(anniTotali);
  const annotations = readAnnotations();

  const { baseArr, extraArrs, totaleArr, anni100k, anni1M } =
    simulate(C0, V, r, anniTotali, extras);

  const totaleFinale = totaleArr[anniTotali];

  // Calcolo totale versato corretto
  let versato = C0 + V * anniTotali;
  extras.forEach(e => {
    const anniEff = Math.min(e.durata, Math.max(0, anniTotali - e.inizio + 1));
    versato += e.importo + e.versamento * anniEff;
  });
  const interessi = totaleFinale - versato;

  // ── UI: risultati ──
  document.getElementById('finale').textContent    = fmt(totaleFinale);
  document.getElementById('interessi').textContent = fmt(Math.max(0, interessi));
  document.getElementById('anni100k').textContent  =
    anni100k !== null ? anni100k + ' anni' : '> ' + anniTotali + ' anni';
  document.getElementById('anni1M').textContent    =
    anni1M   !== null ? anni1M   + ' anni' : '> ' + anniTotali + ' anni';

  // ── Nuove card extra ──
  aggiornaCardExtra(C0, V, r, anniTotali, extras, interessi, versato, totaleFinale);

  // ── Grafico ──
  disegnaGrafico(anniTotali, baseArr, extraArrs, totaleArr, extras, annotations, C0, V);
}

// ── Card riepilogo avanzato ────────────────────────────────────
function aggiornaCardExtra(C0, V, r, anni, extras, interessi, versato, totale) {
  // CAGR
  const cagr = C0 > 0 ? (Math.pow(totale / C0, 1 / anni) - 1) * 100 : 0;
  document.getElementById('cagr-val').textContent     = cagr.toFixed(2) + '%';

  // Moltiplicatore
  const mult = versato > 0 ? (totale / versato).toFixed(2) + 'x' : '—';
  document.getElementById('mult-val').textContent = mult;

  // % interessi sul totale
  const pctInt = totale > 0 ? ((interessi / totale) * 100).toFixed(1) : 0;
  document.getElementById('pct-int-val').textContent  = pctInt + '%';

  // Interesse giornaliero medio (ultimo anno)
  const dailyAvg = totale * r / 365;
  document.getElementById('daily-val').textContent    = fmt(dailyAvg) + '/g';

  // Rendi visibile il blocco stats
  document.getElementById('stats-extra').style.display = 'flex';
}

// ── Grafico Chart.js ───────────────────────────────────────────
function disegnaGrafico(anni, baseArr, extraArrs, totaleArr, extras, annotations, C0, V) {
  const labels = Array.from({ length: anni + 1 }, (_, i) => 'Anno ' + i);

  // Dataset capitale versato (stacked area di confronto)
  const versatoArr = Array.from({ length: anni + 1 }, (_, t) => {
    let v = C0 + V * t;
    extras.forEach(e => {
      if (t >= e.inizio) {
        v += e.importo + e.versamento * Math.min(t - e.inizio, e.durata);
      }
    });
    return Math.round(v);
  });

  const datasets = [];

  // 1) Area capitale versato (grigio tratteggiato)
  datasets.push({
    label: 'Capitale versato',
    data: versatoArr,
    borderColor: 'rgba(150,150,150,0.5)',
    backgroundColor: 'rgba(150,150,150,0.05)',
    fill: true,
    tension: 0.2,
    pointRadius: 0,
    borderWidth: 1.5,
    borderDash: [6, 4],
  });

  // 2) Investimento base
  datasets.push({
    label: 'Invest. base',
    data: baseArr,
    borderColor: 'rgba(37,99,235,1)',
    backgroundColor: 'rgba(37,99,235,0.08)',
    fill: extras.length > 0 ? false : true,
    tension: 0.35,
    pointRadius: anni <= 30 ? 3 : 0,
    pointHoverRadius: 6,
    borderWidth: 2.5,
  });

  // 3) Extra
  extras.forEach((e, i) => {
    const c = INV_COLORS[e.slot] || INV_COLORS[i];
    datasets.push({
      label: c.label + ' (da a.' + e.inizio + ', ' + e.durata + 'a)',
      data: extraArrs[i],
      borderColor: c.line,
      backgroundColor: c.fill,
      fill: false,
      tension: 0.35,
      pointRadius: anni <= 30 ? 2 : 0,
      pointHoverRadius: 6,
      borderWidth: 2,
      borderDash: [5, 3],
    });
  });

  // 4) Totale combinato (solo se ci sono extra)
  if (extras.length > 0) {
    datasets.push({
      label: 'Totale',
      data: totaleArr,
      borderColor: '#f8fafc',
      backgroundColor: 'rgba(248,250,252,0.05)',
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 7,
      borderWidth: 3,
    });
  }

  // ── Plugin frecce annotazioni ──────────────────────────────
  const dataForAnnotations = extras.length > 0 ? totaleArr : baseArr;

  const arrowPlugin = {
    id: 'arrowPlugin',
    afterDatasetsDraw(chart) {
      if (!annotations.length) return;
      const canvasCtx = chart.ctx;
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;

      annotations.forEach(ann => {
        const ti = ann.anno;
        if (ti < 0 || ti >= dataForAnnotations.length) return;

        const xPx  = xScale.getPixelForValue(ti);
        const yVal = dataForAnnotations[ti];
        const yPx  = yScale.getPixelForValue(yVal);

        const ARROW_H = 42;
        const tipX = xPx, tipY = yPx - 8;
        const botX = xPx, botY = tipY - ARROW_H;

        canvasCtx.save();

        // Linea freccia
        canvasCtx.beginPath();
        canvasCtx.moveTo(botX, botY);
        canvasCtx.lineTo(tipX, tipY);
        canvasCtx.strokeStyle = '#c084fc';
        canvasCtx.lineWidth = 2;
        canvasCtx.setLineDash([]);
        canvasCtx.stroke();

        // Punta
        canvasCtx.beginPath();
        canvasCtx.moveTo(tipX, tipY);
        canvasCtx.lineTo(tipX - 5, tipY - 9);
        canvasCtx.lineTo(tipX + 5, tipY - 9);
        canvasCtx.closePath();
        canvasCtx.fillStyle = '#c084fc';
        canvasCtx.fill();

        // Pill testo
        canvasCtx.font = "bold 10px 'Orbitron', monospace";
        canvasCtx.textAlign = 'center';
        const tw = canvasCtx.measureText(ann.testo).width;
        const pw = tw + 18, ph = 20;
        const px = botX - pw / 2, py = botY - ph - 3;

        canvasCtx.beginPath();
        if (canvasCtx.roundRect) {
          canvasCtx.roundRect(px, py, pw, ph, 5);
        } else {
          canvasCtx.rect(px, py, pw, ph);
        }
        canvasCtx.fillStyle = 'rgba(25,15,45,0.92)';
        canvasCtx.fill();
        canvasCtx.strokeStyle = 'rgba(192,132,252,0.6)';
        canvasCtx.lineWidth = 1;
        canvasCtx.stroke();

        canvasCtx.fillStyle = '#e9d5ff';
        canvasCtx.fillText(ann.testo, botX, botY - 7);

        canvasCtx.restore();
      });
    }
  };

  // ── Linee milestone ─────────────────────────────────────────
  const milestonePlugin = {
    id: 'milestoneLines',
    afterDatasetsDraw(chart) {
      const canvasCtx = chart.ctx;
      const yScale = chart.scales.y;
      const xScale = chart.scales.x;
      const yMin = yScale.min, yMax = yScale.max;
      const milestones = [
        { val: 100000,  color: '#22c55e', label: '100k' },
        { val: 1000000, color: '#f59e0b', label: '1M'   },
      ];
      milestones.forEach(m => {
        if (m.val < yMin || m.val > yMax) return;
        const y = yScale.getPixelForValue(m.val);
        canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.moveTo(xScale.left, y);
        canvasCtx.lineTo(xScale.right, y);
        canvasCtx.strokeStyle = m.color;
        canvasCtx.lineWidth = 1;
        canvasCtx.setLineDash([8, 5]);
        canvasCtx.globalAlpha = 0.4;
        canvasCtx.stroke();
        canvasCtx.globalAlpha = 0.8;
        canvasCtx.setLineDash([]);
        canvasCtx.font = "bold 9px 'Orbitron', monospace";
        canvasCtx.fillStyle = m.color;
        canvasCtx.textAlign = 'right';
        canvasCtx.fillText(m.label, xScale.right - 4, y - 4);
        canvasCtx.restore();
      });
    }
  };

  // ── Distruggi e ricostruisci ─────────────────────────────────
  if (graficoChart) { graficoChart.destroy(); graficoChart = null; }

  const canvas = document.getElementById('grafico');
  const canvasCtx2 = canvas.getContext('2d');

  graficoChart = new Chart(canvasCtx2, {
    type: 'line',
    data: { labels, datasets },
    plugins: [arrowPlugin, milestonePlugin],
    options: {
      responsive: true,
      animation: { duration: 600, easing: 'easeInOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#ccc',
            font: { family: "'Orbitron', sans-serif", size: 9 },
            boxWidth: 14,
            padding: 14,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)',
          borderColor: 'rgba(37,99,235,0.4)',
          borderWidth: 1,
          titleColor: '#93c5fd',
          bodyColor: '#e2e8f0',
          padding: 12,
          titleFont: { family: "'Orbitron', sans-serif", size: 10 },
          bodyFont:  { family: "'Orbitron', sans-serif", size: 10 },
          callbacks: {
            title: items => 'Anno ' + items[0].dataIndex,
            label: item => '  ' + item.dataset.label + ':  ' + fmt(item.parsed.y),
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#666',
            font: { family: "'Orbitron', sans-serif", size: 8 },
            maxTicksLimit: 12,
            maxRotation: 0,
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          ticks: {
            color: '#666',
            font: { family: "'Orbitron', sans-serif", size: 8 },
            callback: v => fmtShort(v),
            maxTicksLimit: 8,
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });
}

// ── Fullscreen grafico ─────────────────────────────────────────
let _fsActive = false;
let _fsScrollY = 0;

function toggleFullscreen() {
  const section   = document.getElementById('grafico-section');
  const backdrop  = document.getElementById('fs-backdrop');
  const iconExp   = document.getElementById('fs-icon-expand');
  const iconCompr = document.getElementById('fs-icon-compress');
  const label     = document.getElementById('fs-label');
  const canvas    = document.getElementById('grafico');

  if (!_fsActive) {
    // Entra in fullscreen
    _fsScrollY = window.scrollY;
    _fsActive  = true;

    backdrop.style.display = 'block';
    section.classList.add('is-fullscreen');
    document.body.style.overflow = 'hidden';

    iconExp.style.display   = 'none';
    iconCompr.style.display = 'block';
    label.textContent       = 'ESCI';

    requestAnimationFrame(() => {
      if (graficoChart) {
        canvas.style.height = '';
        graficoChart.resize();
        graficoChart.update('none');
      }
    });

    document.addEventListener('keydown', _onFsKeydown);

  } else {
    // Esci da fullscreen
    _fsActive = false;

    backdrop.style.display = 'none';
    section.classList.remove('is-fullscreen');
    document.body.style.overflow = '';

    iconExp.style.display   = 'block';
    iconCompr.style.display = 'none';
    label.textContent       = 'FULLSCREEN';

    requestAnimationFrame(() => {
      if (graficoChart) {
        canvas.style.height = '';
        graficoChart.resize();
        graficoChart.update('none');
      }
      window.scrollTo({ top: _fsScrollY, behavior: 'instant' });
    });

    document.removeEventListener('keydown', _onFsKeydown);
  }
}

function _onFsKeydown(e) {
  if (e.key === 'Escape') toggleFullscreen();
}
