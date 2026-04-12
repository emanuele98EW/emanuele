/* ============================================================
   Piani di Ammortamento – script.js
   ============================================================ */

'use strict';

let ammChart = null;

function fmt(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 2
  }).format(n);
}

function calcola() {
  const capitale = parseItaNumber(document.getElementById('importo').value) || 0;
  const anni = Math.round(parseItaNumber(document.getElementById('anni').value)) || 0;
  const tassoAnnuo = parseItaNumber(document.getElementById('tasso').value) || 0;

  const tipo = document.querySelector('input[name="tipo_amm"]:checked').value;

  if (capitale <= 0 || anni <= 0) return;

  const N = anni * 12; // numero di mensilità
  const rMonth = (tassoAnnuo / 100) / 12;

  let residuo = capitale;

  let history_capitale = [];
  let history_interessi = [];
  let history_labels = [];

  let tbodyHtml = '';

  if (tipo === 'francese') {
    let PMT = 0;
    if (rMonth === 0) {
      PMT = capitale / N;
    } else {
      const comp = Math.pow(1 + rMonth, N);
      PMT = capitale * (rMonth * comp) / (comp - 1);
    }

    for (let i = 1; i <= N; i++) {
      let qInt = residuo * rMonth;
      let qCap = PMT - qInt;

      // Ultima rata adjustment
      if (i === N) {
        qCap = residuo;
        PMT = qCap + qInt;
      }

      residuo -= qCap;
      if (residuo < 0) residuo = 0;

      // Salviamo i dati raggruppati per anno o semestri se troppi,
      // ma per Chart.js è meglio mostrare tutto con downsampling automatico o yearly.
      if (i % 12 === 0 || i === 1) { // Raggruppiamo la label all'anno
        history_labels.push(i === 1 ? 'Start' : 'Mese ' + i);
        history_capitale.push(qCap);
        history_interessi.push(qInt);
      } else if (N <= 60) {
        // Se meno di 5 anni, stampa tutti i mesi
        history_labels.push('M ' + i);
        history_capitale.push(qCap);
        history_interessi.push(qInt);
      } else if (i % 6 === 0) {
        history_labels.push('Mese ' + i);
        history_capitale.push(qCap);
        history_interessi.push(qInt);
      }

      tbodyHtml += `
        <tr>
          <td>${i}</td>
          <td style="color:var(--color-finance); font-weight:500;">${fmt(qCap)}</td>
          <td style="color:#ef4444; font-weight:500;">${fmt(qInt)}</td>
          <td>${fmt(PMT)}</td>
          <td>${fmt(residuo)}</td>
        </tr>
      `;
    }
  } else if (tipo === 'italiana') {
    let qCap = capitale / N;

    for (let i = 1; i <= N; i++) {
      let qInt = residuo * rMonth;
      let rata = qCap + qInt;

      residuo -= qCap;
      if (residuo < 0.01) residuo = 0; // Floating point fix

      if (i % 12 === 0 || i === 1) {
        history_labels.push(i === 1 ? 'Start' : 'Mese ' + i);
        history_capitale.push(qCap);
        history_interessi.push(qInt);
      } else if (N <= 60) {
        history_labels.push('M ' + i);
        history_capitale.push(qCap);
        history_interessi.push(qInt);
      } else if (i % 6 === 0) {
        history_labels.push('Mese ' + i);
        history_capitale.push(qCap);
        history_interessi.push(qInt);
      }

      tbodyHtml += `
        <tr>
          <td>${i}</td>
          <td style="color:var(--color-finance); font-weight:500;">${fmt(qCap)}</td>
          <td style="color:#ef4444; font-weight:500;">${fmt(qInt)}</td>
          <td>${fmt(rata)}</td>
          <td>${fmt(residuo)}</td>
        </tr>
      `;
    }
  }

  // Aggiorna Interfaccia
  document.getElementById('tabella-container').style.display = 'block';
  document.getElementById('grafico-section').style.display = 'block';
  document.querySelector('#piano-table tbody').innerHTML = tbodyHtml;

  document.getElementById('grafico-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

  disegnaGrafico(history_labels, history_capitale, history_interessi);
}

function disegnaGrafico(labels, capData, intData) {
  if (ammChart) ammChart.destroy();

  const ctx = document.getElementById('grafico').getContext('2d');

  ammChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Quota Capitale',
          data: capData,
          backgroundColor: 'rgba(56, 189, 248, 0.9)',
          borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
        },
        {
          label: 'Quota Interessi',
          data: intData,
          backgroundColor: 'rgba(248, 113, 113, 0.9)',
          borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc', font: { family: "'Orbitron', sans-serif" } } },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
          titleColor: '#e0f2fe', bodyColor: '#bae6fd', padding: 12,
          callbacks: {
            stacked: true,
            label: item => ' ' + item.dataset.label + ': ' + fmt(item.parsed.y)
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, maxTicksLimit: 20 }, grid: { display: false } },
        y: { stacked: true, ticks: { color: '#666', font: { family: "'Orbitron', sans-serif", size: 9 }, callback: v => (v >= 1000 ? (v / 1000).toFixed(0) + 'k €' : v + ' €') }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
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

  if (!_fsActive) {
    _fsScrollY = window.scrollY;
    _fsActive = true;
    backdrop.style.display = 'block';
    section.classList.add('is-fullscreen');
    document.body.style.overflow = 'hidden';
    iconExp.style.display = 'none';
    iconCompr.style.display = 'block';
    if(label) label.textContent = 'ESCI';

    if (ammChart) {
      setTimeout(() => {
        ammChart.resize();
        ammChart.update('none');
      }, 150);
    }
    document.addEventListener('keydown', _onFsKeydown);
  } else {
    _fsActive = false;
    backdrop.style.display = 'none';
    section.classList.remove('is-fullscreen');
    document.body.style.overflow = '';
    iconExp.style.display = 'block';
    iconCompr.style.display = 'none';
    if(label) label.textContent = 'FULLSCREEN';

    if (ammChart) {
      setTimeout(() => {
        ammChart.resize();
        ammChart.update('none');
        window.scrollTo({ top: _fsScrollY, behavior: 'instant' });
      }, 150);
    }
    document.removeEventListener('keydown', _onFsKeydown);
  }
}
function _onFsKeydown(e) { if (e.key === 'Escape') toggleFullscreen(); }
