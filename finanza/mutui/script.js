/* ============================================================
   Calcolatore Mutui – script.js
   ============================================================ */

'use strict';

let mutuoChart = null;

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

function calcola() {
  const capitale = parseItaNumber(document.getElementById('importo').value) || 0;
  const anni = Math.round(parseItaNumber(document.getElementById('anni').value)) || 0;
  const tassoAnnuo = parseItaNumber(document.getElementById('tasso').value) || 0;

  if (capitale <= 0 || anni <= 0) return;

  const N = anni * 12; // numero di rate
  const rMonth = (tassoAnnuo / 100) / 12; // tasso mensile

  let PMT = 0;
  let totaleRimborsato = 0;
  let interessiTotali = 0;

  let balanceData = [];
  let labels = [];

  if (rMonth === 0) {
    PMT = capitale / N;
    totaleRimborsato = capitale;
    interessiTotali = 0;

    // Lineare
    for (let m = 0; m <= N; m++) {
      if (m % 12 === 0 || m === N) {
        labels.push('Anno ' + (m / 12).toFixed(0));
        balanceData.push(capitale - (PMT * m));
      }
    }
  } else {
    // Formula Ammortamento Francese: PMT = P * r(1+r)^N / [(1+r)^N - 1]
    const comp = Math.pow(1 + rMonth, N);
    PMT = capitale * (rMonth * comp) / (comp - 1);

    totaleRimborsato = PMT * N;
    interessiTotali = totaleRimborsato - capitale;

    // Calcolo bilancio anno su anno per il grafico
    let currentBalance = capitale;
    balanceData.push(currentBalance);
    labels.push('Avvio');

    for (let a = 1; a <= anni; a++) {
      for (let m = 0; m < 12; m++) {
        let interesseMese = currentBalance * rMonth;
        let quotaCapitale = PMT - interesseMese;
        currentBalance -= quotaCapitale;
      }
      if (currentBalance < 0) currentBalance = 0;
      balanceData.push(currentBalance);
      labels.push('Anno ' + a);
    }
  }

  // Aggiorna Interfaccia
  document.getElementById('risultati-container').style.display = 'block';
  document.getElementById('grafico-section').style.display = 'block';

  document.getElementById('cards-risultati').innerHTML = `
    <div class="card finance" style="padding:20px; text-align:center; border-top:3px solid #3b82f6; transform:scale(1.03); box-shadow:0 10px 25px rgba(59,130,246,0.15);">
      <h3 style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:8px;">Rata Mensile</h3>
      <p style="font-size:1.8rem; color:var(--text-primary); font-family:'Orbitron',sans-serif; text-shadow:0 0 15px rgba(59,130,246,0.5);">${fmt(PMT)}/m</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:8px;">Interessi Totali (Costo del Credito)</h3>
      <p style="font-size:1.4rem; color:#ef4444; font-family:'Orbitron',sans-serif;">${fmt(interessiTotali)}</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:8px;">Importo Totale da Restituire</h3>
      <p style="font-size:1.4rem; color:var(--color-finance); font-family:'Orbitron',sans-serif;">${fmt(totaleRimborsato)}</p>
    </div>
  `;

  document.getElementById('risultati-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

  disegnaGrafico(labels, balanceData);
}

function disegnaGrafico(labels, data) {
  if (mutuoChart) mutuoChart.destroy();

  const ctx = document.getElementById('grafico').getContext('2d');

  let gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  mutuoChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Debito Residuo',
        data: data,
        borderColor: '#38bdf8',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc', font: { family: "'Orbitron', sans-serif" } } },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)', borderColor: 'rgba(56,189,248,0.3)', borderWidth: 1,
          titleColor: '#e0f2fe', bodyColor: '#bae6fd', padding: 12,
          callbacks: { label: item => ' ' + item.dataset.label + ': ' + fmt(item.parsed.y) }
        }
      },
      scales: {
        x: { ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, callback: v => fmtShort(v) }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
      }
    }
  });
}

// ── Fullscreen grafico ─────────────────────────────────────────
let _fsActive = false;
let _fsScrollY = 0;

function toggleFullscreen() {
  const section = document.getElementById('grafico-section');
  const backdrop = document.getElementById('fs-backdrop');
  const iconExp = document.getElementById('fs-icon-expand');
  const iconCompr = document.getElementById('fs-icon-compress');
  const label = document.getElementById('fs-label');
  const canvas = document.getElementById('grafico');

  if (!_fsActive) {
    _fsScrollY = window.scrollY;
    _fsActive = true;
    backdrop.style.display = 'block';
    section.classList.add('is-fullscreen');
    document.body.style.overflow = 'hidden';
    iconExp.style.display = 'none';
    iconCompr.style.display = 'block';
    label.textContent = 'ESCI';

    if (mutuoChart) {
      canvas.style.width = '0px';
      canvas.style.height = '0px';
      setTimeout(() => {
        canvas.style.width = '';
        canvas.style.height = '';
        mutuoChart.resize();
        mutuoChart.update('none');
      }, 10);
    }
    document.addEventListener('keydown', _onFsKeydown);
  } else {
    _fsActive = false;
    backdrop.style.display = 'none';
    section.classList.remove('is-fullscreen');
    document.body.style.overflow = '';
    iconExp.style.display = 'block';
    iconCompr.style.display = 'none';
    label.textContent = 'FULLSCREEN';

    if (mutuoChart) {
      canvas.style.width = '0px';
      canvas.style.height = '0px';
      setTimeout(() => {
        canvas.style.width = '';
        canvas.style.height = '';
        mutuoChart.resize();
        mutuoChart.update('none');
        window.scrollTo({ top: _fsScrollY, behavior: 'instant' });
      }, 10);
    }
    document.removeEventListener('keydown', _onFsKeydown);
  }
}
function _onFsKeydown(e) { if (e.key === 'Escape') toggleFullscreen(); }

document.addEventListener('DOMContentLoaded', () => { setTimeout(calcola, 300); });
