/* ============================================================
   Calcolatore FIRE – script.js
   ============================================================ */

'use strict';

let fireChart = null;

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
  const pv = parseFloat(document.getElementById('patrimonio').value) || 0;
  const pmt = parseFloat(document.getElementById('risparmio').value) || 0;
  const spese_mensili = parseFloat(document.getElementById('spese').value) || 0;
  const swr = parseFloat(document.getElementById('swr').value) || 4.0;
  const r_annuo = parseFloat(document.getElementById('rendimento').value) || 0;

  if (spese_mensili <= 0 || swr <= 0) return;

  const spese_annue = spese_mensili * 12;
  const fv_target = spese_annue / (swr / 100);
  
  const r_mese = (r_annuo / 100) / 12;
  
  let mesi_al_fire = 0;
  
  if (pv >= fv_target) {
    mesi_al_fire = 0; // Già in FIRE
  } else {
    if (pmt <= 0 && r_mese <= 0) {
      mesi_al_fire = Infinity; // Non ci arriverà mai
    } else if (r_mese === 0) {
      mesi_al_fire = (fv_target - pv) / pmt;
    } else {
      // (1+r)^N = (FV + PMT/r) / (PV + PMT/r)
      // N = ln( ... ) / ln(1+r)
      const a = fv_target + (pmt / r_mese);
      const b = pv + (pmt / r_mese);
      mesi_al_fire = Math.log(a / b) / Math.log(1 + r_mese);
    }
  }

  // Prepara l'array dei percorsi
  const history = [];
  let current_val = pv;
  let N_anni = Math.ceil(mesi_al_fire / 12);
  
  if (N_anni === Infinity || isNaN(N_anni)) {
    N_anni = 80; // limito il grafico
    // Rendi il calcolo come irraggiungibile graficamente, solo proietta per 80 anni
  } else {
    if (N_anni > 80) N_anni = 80;
    if (N_anni === 0) N_anni = 5; // mostra comunque il grafico se ci si arriva subito
  }

  history.push(pv); // Anno 0
  for (let t = 1; t <= N_anni; t++) {
    for (let m = 0; m < 12; m++) {
      current_val = current_val * (1 + r_mese) + pmt;
    }
    history.push(current_val);
  }

  const anniDisplay = mesi_al_fire === Infinity ? "Mai" : (mesi_al_fire / 12).toFixed(1);

  // Mostra UI
  document.getElementById('risultati-container').style.display = 'block';
  document.getElementById('grafico-section').style.display = 'block';

  const cardsContainer = document.getElementById('cards-risultati');
  cardsContainer.innerHTML = `
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:8px;">Target FIRE</h3>
      <p style="font-size:1.6rem; color:#fff; font-family:'Orbitron',sans-serif;">${fmt(fv_target)}</p>
      <p style="font-size:0.75rem; color:#10b981; margin-top:4px;">Copre ${fmt(spese_annue)}/anno</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center; border-top:3px solid #f59e0b; transform:scale(1.03); box-shadow:0 10px 25px rgba(245,158,11,0.15);">
      <h3 style="font-size:0.95rem; color:#fcd34d; margin-bottom:8px;">Tempo Stimato</h3>
      <p style="font-size:1.8rem; color:#fff; font-family:'Orbitron',sans-serif; text-shadow:0 0 15px rgba(245,158,11,0.8);">${anniDisplay} <span style="font-size:1rem;">Anni</span></p>
    </div>
  `;

  document.getElementById('risultati-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

  disegnaGrafico(N_anni, history, fv_target);
}

function disegnaGrafico(anni, history, target) {
  const labels = Array.from({ length: anni + 1 }, (_, i) => 'Anno ' + i);
  const targetLine = Array(anni + 1).fill(target);

  if (fireChart) { fireChart.destroy(); }

  const canvasCtx = document.getElementById('grafico').getContext('2d');
  
  fireChart = new Chart(canvasCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Target FIRE',
          data: targetLine,
          borderColor: '#10b981', // Verde
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          backgroundColor: 'transparent',
          fill: false,
          tension: 0
        },
        {
          label: 'Patrimonio Netto',
          data: history,
          borderColor: '#f59e0b', // Arancione FIRE
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 800, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc', font: { family: "'Orbitron', sans-serif" }, usePointStyle: true } },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)', borderColor: 'rgba(245,158,11,0.3)', borderWidth: 1,
          titleColor: '#fcd34d', bodyColor: '#e2e8f0', padding: 12,
          callbacks: { label: item => '  ' + item.dataset.label + ':  ' + fmt(item.parsed.y) }
        }
      },
      scales: {
        x: { ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, callback: v => fmtShort(v) }, grid: { color: 'rgba(255,255,255,0.05)' } }
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
      if (fireChart) { canvas.style.height = ''; fireChart.resize(); fireChart.update('none'); }
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
      if (fireChart) { canvas.style.height = ''; fireChart.resize(); fireChart.update('none'); }
      window.scrollTo({ top: _fsScrollY, behavior: 'instant' });
    });
    document.removeEventListener('keydown', _onFsKeydown);
  }
}
function _onFsKeydown(e) { if (e.key === 'Escape') toggleFullscreen(); }

document.addEventListener('DOMContentLoaded', () => { setTimeout(calcola, 300); });
