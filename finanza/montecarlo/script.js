/* ============================================================
   Simulazione Monte Carlo – script.js
   ============================================================ */

'use strict';

let montecarloChart = null;

// Formattazione valuta
function fmt(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(n);
}

// Formattazione abbreviata per grafico (M, k)
function fmtShort(n) {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M €';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(0) + 'k €';
  return n.toFixed(0) + ' €';
}

// Generatore di numeri casuali da distribuzione Normale Standard (Box-Muller transform)
function randn_bm() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); 
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Elabora la simulazione Monte Carlo vettorizzata
function runSimulation() {
  const capIniziale   = parseFloat(document.getElementById('capitale').value) || 0;
  const versAnnuo     = parseFloat(document.getElementById('versamento').value) || 0;
  const mu            = (parseFloat(document.getElementById('rendimento').value) || 0) / 100; // Expected return
  const sigma         = (parseFloat(document.getElementById('volatilita').value) || 0) / 100; // Volatility std dev
  const anni          = parseInt(document.getElementById('anni').value) || 10;
  let N               = parseInt(document.getElementById('simulazioni').value) || 1000;
  
  if (N > 20000) N = 20000; // Hard limit per non bloccare il browser
  if (anni <= 0) return null;

  // Numero di percentili richiesti
  let numPercentiles = parseInt(document.getElementById('percentili').value) || 5;
  if (numPercentiles < 1) numPercentiles = 1;
  if (numPercentiles > 100) numPercentiles = 100;
  
  let percentilesToTrack = [];
  for (let i = 1; i <= numPercentiles; i++) {
    // Punti equidistanti, formula standard (i - 0.5) / N * 100
    // Risultato per 5: 10, 30, 50, 70, 90
    let p = Math.round(((i - 0.5) / numPercentiles) * 100);
    percentilesToTrack.push(p);
  }

  // Matrice per salvare il progresso anno per anno di tutti i percentili.
  // Struttura: percentileHistory[percentile_index] = array of values over time
  const percentileHistory = percentilesToTrack.map(() => [capIniziale]);

  // Simulazioni al tempo t-1 (inizializzate al capitale iniziale)
  let currentScenarios = new Float32Array(N);
  currentScenarios.fill(capIniziale);

  // Eseguiamo step-by-step per ogni anno
  for (let t = 1; t <= anni; t++) {
    for (let s = 0; s < N; s++) {
      // Rendimento casuale dell'anno t per lo scenario s
      // S_t = S_{t-1} * (1 + rendimento_normale) + versamento
      // Per una lognormale più corretta a lungo termine: yield = exp((mu - (sigma^2)/2) + sigma * Z)
      // ma per finanza personale, tassi discreti = r, possiamo approssimare con normale se r e sigma sono piccoli:
      let R = mu + sigma * randn_bm(); 
      let val = currentScenarios[s] * (1 + R) + versAnnuo;
      if (val < 0) val = 0; // Protezione da debito
      currentScenarios[s] = val;
    }

    // Per ricavare i percentili, copiamo e ordiniamo (la copia serve per non invalidare gli scenari nell'array originale, 
    // anche se l'ordine non importa per gli step futuri in quanto iid, ma Float32Array.sort() è inplace)
    let sortedCurrent = new Float32Array(currentScenarios);
    sortedCurrent.sort(); // Ordinamento crescente

    for (let pIdx = 0; pIdx < percentilesToTrack.length; pIdx++) {
      const perc = percentilesToTrack[pIdx];
      let rank = (perc / 100) * (N - 1);
      let lower = Math.floor(rank);
      let upper = Math.ceil(rank);
      let weight = rank - lower;
      
      let pVal = sortedCurrent[lower] * (1 - weight) + sortedCurrent[upper] * weight;
      percentileHistory[pIdx].push(Math.round(pVal));
    }
  }

  return { anni, percentilesToTrack, percentileHistory };
}

// Colori dinamici in base alla "bontà" dello scenario
// Pessimi (bassi) tendono al rosso/arancione, Mediani al blu, Ottimi al verde/viola
function getColorForPercentile(p) {
  if (p < 25) return '#f87171'; // Rosso
  if (p < 40) return '#f59e0b'; // Arancio
  if (p < 60) return '#3b82f6'; // Blu (Mediana)
  if (p < 85) return '#10b981'; // Verde
  return '#8b5cf6'; // Viola
}

function calcola() {
  const result = runSimulation();
  if (!result) return;

  const { anni, percentilesToTrack, percentileHistory } = result;

  document.getElementById('risultati-container').style.display = 'block';
  document.getElementById('grafico-section').style.display = 'block';

  // 1. Aggiornare Cards (prendendo minimo, 50 se c'è (o mediano tra i scelti) e massimo)
  let pMinIdx = 0;
  let pMaxIdx = percentilesToTrack.length - 1;
  
  // Cerchiamo il più vicino a 50
  let p50Idx = 0;
  let minDiff = 100;
  percentilesToTrack.forEach((p, i) => {
    if (Math.abs(p - 50) < minDiff) {
      minDiff = Math.abs(p - 50);
      p50Idx = i;
    }
  });

  const cardsContainer = document.getElementById('cards-risultati');
  cardsContainer.innerHTML = '';

  const cardData = [
    { title: `Caso Pessimistico (P${percentilesToTrack[pMinIdx]})`, val: percentileHistory[pMinIdx][anni], color: '#f87171' },
    { title: `Caso Atteso (P${percentilesToTrack[p50Idx]})`, val: percentileHistory[p50Idx][anni], color: '#3b82f6', highlight: true },
    { title: `Caso Ottimistico (P${percentilesToTrack[pMaxIdx]})`, val: percentileHistory[pMaxIdx][anni], color: '#10b981' },
  ];

  cardData.forEach(c => {
    let styleExtra = c.highlight ? 'border-top:3px solid #3b82f6; transform:scale(1.03); box-shadow:0 10px 25px rgba(59,130,246,0.15);' : '';
    let glow = c.highlight ? `text-shadow:0 0 15px rgba(59,130,246,0.8);` : '';
    cardsContainer.innerHTML += `
      <div class="card finance" style="padding:20px; text-align:center; ${styleExtra}">
        <h3 style="font-size:0.95rem; color:${c.highlight ? '#bfdbfe' : 'var(--text-secondary)'}; margin-bottom:8px;">${c.title}</h3>
        <p style="font-size:1.6rem; color:#fff; font-family:'Orbitron',sans-serif; ${glow}">${fmt(c.val)}</p>
      </div>`;
  });

  // 2. Disegnare Grafico
  disegnaGrafico(anni, percentilesToTrack, percentileHistory);
  
  // Scorre visuale ai risultati
  document.getElementById('risultati-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function disegnaGrafico(anni, percentilesToTrack, percentileHistory) {
  const labels = Array.from({ length: anni + 1 }, (_, i) => 'Anno ' + i);
  const datasets = [];

  // Configuro i dataset. Dal Pmin al Pmax
  for (let i = 0; i < percentilesToTrack.length; i++) {
    let p = percentilesToTrack[i];
    let color = getColorForPercentile(p);
    let isMedian = (Math.abs(p - 50) <= 2) || (i === Math.floor(percentilesToTrack.length/2));

    let ds = {
      label: `P${p}`,
      data: percentileHistory[i],
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: isMedian ? 3 : 2,
      borderDash: isMedian ? [] : [5, 5],
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 6,
      fill: i > 0 ? '-1' : false // riempie lo spazio con il dataset precedente per creare le fasce
    };

    // Colora la fascia sottostante molto leggera
    if (i > 0) {
      let r, g, b;
      if (color === '#f87171') { r=248; g=113; b=113; }
      else if (color === '#f59e0b') { r=245; g=158; b=11; }
      else if (color === '#3b82f6') { r=59; g=130; b=246; }
      else if (color === '#10b981') { r=16; g=185; b=129; }
      else { r=139; g=92; b=246; }
      ds.backgroundColor = `rgba(${r},${g},${b},0.08)`;
    }

    datasets.push(ds);
  }

  if (montecarloChart) { montecarloChart.destroy(); }

  const canvasCtx = document.getElementById('grafico').getContext('2d');
  
  montecarloChart = new Chart(canvasCtx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)',
          borderColor: 'rgba(59,130,246,0.3)',
          borderWidth: 1,
          titleColor: '#93c5fd',
          bodyColor: '#e2e8f0',
          padding: 12,
          callbacks: {
            title: items => 'Anno ' + items[0].dataIndex,
            label: item => '  ' + item.dataset.label + ':  ' + fmt(item.parsed.y)
          }
        }
      },
      scales: {
        x: { ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, callback: v => fmtShort(v), maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.05)' } }
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
    _fsScrollY = window.scrollY;
    _fsActive  = true;
    backdrop.style.display = 'block';
    section.classList.add('is-fullscreen');
    document.body.style.overflow = 'hidden';
    iconExp.style.display   = 'none';
    iconCompr.style.display = 'block';
    label.textContent       = 'ESCI';

    requestAnimationFrame(() => {
      if (montecarloChart) {
        canvas.style.height = '';
        montecarloChart.resize();
        montecarloChart.update('none');
      }
    });
    document.addEventListener('keydown', _onFsKeydown);
  } else {
    _fsActive = false;
    backdrop.style.display = 'none';
    section.classList.remove('is-fullscreen');
    document.body.style.overflow = '';
    iconExp.style.display   = 'block';
    iconCompr.style.display = 'none';
    label.textContent       = 'FULLSCREEN';

    requestAnimationFrame(() => {
      if (montecarloChart) {
        canvas.style.height = '';
        montecarloChart.resize();
        montecarloChart.update('none');
      }
      window.scrollTo({ top: _fsScrollY, behavior: 'instant' });
    });
    document.removeEventListener('keydown', _onFsKeydown);
  }
}

function _onFsKeydown(e) {
  if (e.key === 'Escape') toggleFullscreen();
}

// Avvia calcolo di base all'avvio
document.addEventListener('DOMContentLoaded', () => { setTimeout(calcola, 300); });
