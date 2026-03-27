/* ============================================================
   Rent vs Buy – script.js
   ============================================================ */

'use strict';

let rbChart = null;

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
  const anticipo = parseItaNumber(document.getElementById('anticipo').value) || 0;

  // Buyer
  const prezzo_casa = parseItaNumber(document.getElementById('prezzo_casa').value) || 0;
  const anni_mutuo = Math.round(parseItaNumber(document.getElementById('mutuo_anni').value)) || 30;
  const tasso_mutuo = parseItaNumber(document.getElementById('mutuo_tasso').value) || 0;
  const tasse_manutenzione_perc = parseItaNumber(document.getElementById('tasse_prop').value) || 0;
  const crescita_casa_perc = parseItaNumber(document.getElementById('crescita_casa').value) || 0;

  // Tenant
  const affitto_partenza = parseItaNumber(document.getElementById('affitto_mensile').value) || 0;
  const crescita_affitto_perc = parseItaNumber(document.getElementById('crescita_affitto').value) || 0;
  const r_mercato_perc = parseItaNumber(document.getElementById('rendimento_mercato').value) || 0;

  if (prezzo_casa <= 0) return;

  const N_mutuo = anni_mutuo * 12;
  const r_mutuo_mese = (tasso_mutuo / 100) / 12;

  const mutuo_iniziale = Math.max(0, prezzo_casa - anticipo);

  let PMT = 0;
  if (mutuo_iniziale > 0 && N_mutuo > 0) {
    if (r_mutuo_mese === 0) PMT = mutuo_iniziale / N_mutuo;
    else {
      let comp = Math.pow(1 + r_mutuo_mese, N_mutuo);
      PMT = mutuo_iniziale * (r_mutuo_mese * comp) / (comp - 1);
    }
  }

  let r_mercato_mese = (r_mercato_perc / 100) / 12;
  let r_casa_mese = (crescita_casa_perc / 100) / 12;
  let r_affitto_mese = (crescita_affitto_perc / 100) / 12;
  let tasse_manutenzione_annue = (tasse_manutenzione_perc / 100);

  let buyer_net_worth = [];
  let tenant_net_worth = [];
  let labels = [];

  let current_home_value = prezzo_casa;
  let current_loan_balance = mutuo_iniziale;
  let current_investments = anticipo;
  let current_rent = affitto_partenza;

  // Trackers
  let break_even_year = -1;
  let best_choice = "Tie";

  const anni_simulazione = Math.max(30, anni_mutuo); // Simuliamo per almeno 30 anni

  // Anno 0
  buyer_net_worth.push(current_home_value - current_loan_balance);
  tenant_net_worth.push(current_investments);
  labels.push('Oggi');

  for (let y = 1; y <= anni_simulazione; y++) {
    for (let m = 0; m < 12; m++) {
      // 1. Dati mensili acquirente
      let qInt = 0, qCap = 0;
      let rata_mutuo = 0;
      if (current_loan_balance > 0) {
        rata_mutuo = PMT;
        qInt = current_loan_balance * r_mutuo_mese;
        qCap = rata_mutuo - qInt;
        current_loan_balance -= qCap;
        if (current_loan_balance < 0) {
          qCap += current_loan_balance; // correction
          current_loan_balance = 0;
          rata_mutuo = qCap + qInt;
        }
      }

      let casa_manutenzione_mese = (current_home_value * tasse_manutenzione_annue) / 12;
      let costo_tot_buyer = rata_mutuo + casa_manutenzione_mese;

      current_home_value = current_home_value * (1 + r_casa_mese);

      // 2. Dati mensili affittuario
      let costo_tot_tenant = current_rent;

      // La differenza nel cash flow:
      // Se il buyer spende 1500 e il tenant spende 1000, il tenant investe 500
      // Se il buyer spende 1000 e il tenant spende 1500, il tenant deve PRELEVARE 500 dai suoi investimenti per mantenere lo stesso tenore di vita
      let diff_investibile = costo_tot_buyer - costo_tot_tenant;

      current_investments = current_investments * (1 + r_mercato_mese) + diff_investibile;
      if (current_investments < 0) current_investments = 0; // Bancarotta affittuario

      // Aumento affitto
      current_rent = current_rent * (1 + r_affitto_mese);
    }

    let nw_b = current_home_value - current_loan_balance;
    let nw_t = current_investments;

    buyer_net_worth.push(nw_b);
    tenant_net_worth.push(nw_t);
    labels.push('Anno ' + y);

    // Controlla break-even
    if (break_even_year === -1) {
      // Inizialmente chi sta sotto?
      // Solitamente all'anno 0 sono uguali (Anticipo == Anticipo).
      // Se nw_b > nw_t
      if (nw_b > nw_t && y > 1 && buyer_net_worth[y - 1] <= tenant_net_worth[y - 1]) {
        break_even_year = y; // Comprare diventa meglio nell'anno Y
      } else if (nw_t > nw_b && y > 1 && tenant_net_worth[y - 1] <= buyer_net_worth[y - 1]) {
        break_even_year = y; // Affittare diventa meglio nell'anno Y
      }
    }
  }

  let final_buyer = buyer_net_worth[anni_simulazione];
  let final_tenant = tenant_net_worth[anni_simulazione];

  if (final_buyer > final_tenant) best_choice = "BUY";
  else if (final_tenant > final_buyer) best_choice = "RENT";

  // Aggiorna Interfaccia
  document.getElementById('risultati-container').style.display = 'block';
  document.getElementById('grafico-section').style.display = 'block';

  let diffResult = Math.abs(final_buyer - final_tenant);
  let vinceText = best_choice === "BUY" ? "Conviene COMPRARE" : "Conviene AFFITTARE";
  let vinceColor = best_choice === "BUY" ? "#10b981" : "#f59e0b"; // Verde per acquisto, Arancio per affitto

  let breakEvenText = break_even_year === -1 ? "Nessun incrocio" : `${break_even_year} Anni`;

  document.getElementById('cards-risultati').innerHTML = `
    <div class="card finance" style="padding:20px; text-align:center; border-top:3px solid ${vinceColor}; transform:scale(1.03); box-shadow:0 10px 25px rgba(255,255,255,0.05);">
      <h3 style="font-size:0.95rem; color:${vinceColor}; margin-bottom:8px;">${vinceText}</h3>
      <p style="font-size:1.6rem; color:var(--text-primary); font-family:'Orbitron',sans-serif;">+ ${fmt(diffResult)}</p>
      <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">di patrimonio netto dopo ${anni_simulazione} anni</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:#3b82f6; margin-bottom:8px;">Punto di Pareggio</h3>
      <p style="font-size:1.4rem; color:var(--text-primary); font-family:'Orbitron',sans-serif;">${breakEvenText}</p>
      <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Per superare l'affitto</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:var(--color-finance); margin-bottom:8px;">Net Worth Acquisto</h3>
      <p style="font-size:1.4rem; color:var(--text-primary); font-family:'Orbitron',sans-serif;">${fmt(final_buyer)}</p>
    </div>
    <div class="card finance" style="padding:20px; text-align:center;">
      <h3 style="font-size:0.95rem; color:#f59e0b; margin-bottom:8px;">Net Worth Affitto</h3>
      <p style="font-size:1.4rem; color:var(--text-primary); font-family:'Orbitron',sans-serif;">${fmt(final_tenant)}</p>
    </div>
  `;

  document.getElementById('risultati-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

  disegnaGrafico(labels, buyer_net_worth, tenant_net_worth);
}

function disegnaGrafico(labels, buyerData, tenantData) {
  if (rbChart) rbChart.destroy();

  const ctx = document.getElementById('grafico').getContext('2d');

  rbChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Acquisto (Net Worth)',
          data: buyerData,
          borderColor: '#10b981', // Verde
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          tension: 0.3
        },
        {
          label: 'Affitto + Investimenti (Net Worth)',
          data: tenantData,
          borderColor: '#f59e0b', // Arancio
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc', font: { family: "'Orbitron', sans-serif" }, usePointStyle: true } },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1,
          titleColor: '#e0f2fe', bodyColor: '#bae6fd', padding: 12,
          callbacks: { label: item => ' ' + item.dataset.label + ': ' + fmt(item.parsed.y) }
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

    if (rbChart) {
      canvas.style.width = '0px';
      canvas.style.height = '0px';
      setTimeout(() => {
        canvas.style.width = '';
        canvas.style.height = '';
        rbChart.resize();
        rbChart.update('none');
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

    if (rbChart) {
      canvas.style.width = '0px';
      canvas.style.height = '0px';
      setTimeout(() => {
        canvas.style.width = '';
        canvas.style.height = '';
        rbChart.resize();
        rbChart.update('none');
        window.scrollTo({ top: _fsScrollY, behavior: 'instant' });
      }, 10);
    }
    document.removeEventListener('keydown', _onFsKeydown);
  }
}
function _onFsKeydown(e) { if (e.key === 'Escape') toggleFullscreen(); }

document.addEventListener('DOMContentLoaded', () => { setTimeout(calcola, 300); });
