/* ============================================================
   Target Savings – script.js
   ============================================================ */

'use strict';

let savingsChart = null;

function fmt(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(n);
}

function calcola() {
  const fv = parseFloat(document.getElementById('obiettivo').value) || 0;
  const pv = parseFloat(document.getElementById('capitale').value) || 0;
  const r_annuo = parseFloat(document.getElementById('rendimento').value) || 0;
  const anni = parseInt(document.getElementById('anni').value) || 0;

  if (fv <= 0 || anni <= 0) return;

  // Calcoli finanziari base
  const n_mesi = anni * 12;
  const r_mese = (r_annuo / 100) / 12; // Nominal rate diviso 12 (standard per mutui/PMT banche)

  let pmt = 0;
  let pv_fv = 0; // future value del capitale iniziale

  if (r_mese === 0) {
    // Zero interessi
    pv_fv = pv;
    pmt = (fv - pv) / n_mesi;
    if (pmt < 0) pmt = 0;
  } else {
    // Formula Future Value PMT: FV = PV(1+r)^n + PMT[((1+r)^n - 1) / r]
    // Inversione per trovare PMT
    let compoundFactor = Math.pow(1 + r_mese, n_mesi);
    pv_fv = pv * compoundFactor;
    
    // Se il capitale iniziale cresce già oltre l'obiettivo
    if (pv_fv >= fv) {
      pmt = 0;
    } else {
      let fv_to_fund = fv - pv_fv;
      let pmtFactor = (compoundFactor - 1) / r_mese;
      pmt = fv_to_fund / pmtFactor;
    }
  }

  const totaleVersatoNuovo = pmt * n_mesi;
  const totaleInvestito = pv + totaleVersatoNuovo;
  let totaleInteressi = fv - totaleInvestito;

  if (totaleInteressi < 0) totaleInteressi = 0;

  // Mostra div
  document.getElementById('risultati-container').style.display = 'block';
  document.getElementById('grafico-section').style.display = 'block';

  // Popola cards
  const cardsContainer = document.getElementById('cards-risultati');
  cardsContainer.innerHTML = `
    <div class="card finance" style="padding:20px; text-align:center; border-top:3px solid #3b82f6; transform:scale(1.03); box-shadow:0 10px 25px rgba(59,130,246,0.15);">
      <h3 style="font-size:0.95rem; color:#bfdbfe; margin-bottom:8px;">Risparmio Mensile Necessario</h3>
      <p style="font-size:1.8rem; color:#fff; font-family:'Orbitron',sans-serif; text-shadow:0 0 15px rgba(59,130,246,0.8);">${fmt(pmt)}/m</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:8px;">Capitale Totale Versato</h3>
      <p style="font-size:1.4rem; color:#fff; font-family:'Orbitron',sans-serif;">${fmt(totaleInvestito)}</p>
      <p style="font-size:0.75rem; color:#9ca3af; margin-top:4px;">(Incluso capitale iniziale)</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:8px;">Interessi Generati</h3>
      <p style="font-size:1.4rem; color:#10b981; font-family:'Orbitron',sans-serif;">+ ${fmt(totaleInteressi)}</p>
      <p style="font-size:0.75rem; color:#9ca3af; margin-top:4px;">Effetto composto in ${anni} anni</p>
    </div>
  `;

  document.getElementById('risultati-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

  disegnaGrafico(pv, totaleVersatoNuovo, totaleInteressi);
}

function disegnaGrafico(pv, versamenti, interessi) {
  if (savingsChart) { savingsChart.destroy(); }

  const canvasCtx = document.getElementById('grafico').getContext('2d');
  
  savingsChart = new Chart(canvasCtx, {
    type: 'doughnut',
    data: {
      labels: ['Capitale Iniziale', 'Nuovi Versamenti', 'Interessi Composti'],
      datasets: [{
        data: [pv, versamenti, interessi],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // Arancio
          'rgba(59, 130, 246, 0.8)', // Blu
          'rgba(16, 185, 129, 0.8)'  // Verde
        ],
        borderColor: '#050a18',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#ccc', font: { family: "'Orbitron', sans-serif", size: 12 }, usePointStyle: true, padding: 20 }
        },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)',
          borderColor: 'rgba(59,130,246,0.3)',
          borderWidth: 1,
          titleColor: '#93c5fd',
          bodyColor: '#e2e8f0',
          padding: 12,
          callbacks: {
            label: function(context) {
              let value = context.parsed;
              let total = context.dataset.data.reduce((a, b) => a + b, 0);
              let percentage = ((value / total) * 100).toFixed(1) + '%';
              return ` ${context.label}: ${fmt(value)} (${percentage})`;
            }
          }
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
    _fsScrollY = window.scrollY;
    _fsActive  = true;
    backdrop.style.display = 'block';
    section.classList.add('is-fullscreen');
    document.body.style.overflow = 'hidden';
    iconExp.style.display   = 'none';
    iconCompr.style.display = 'block';
    label.textContent       = 'ESCI';

    requestAnimationFrame(() => {
      if (savingsChart) {
        savingsChart.resize();
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
      if (savingsChart) {
        savingsChart.resize();
      }
      window.scrollTo({ top: _fsScrollY, behavior: 'instant' });
    });
    document.removeEventListener('keydown', _onFsKeydown);
  }
}

function _onFsKeydown(e) {
  if (e.key === 'Escape') toggleFullscreen();
}

document.addEventListener('DOMContentLoaded', () => { setTimeout(calcola, 300); });
