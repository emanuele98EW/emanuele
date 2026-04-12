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
  // ── Input ──────────────────────────────────────────────────
  const costi_iniziali        = parseItaNumber(document.getElementById('costi_iniziali').value)  || 0;
  const anticipo              = parseItaNumber(document.getElementById('anticipo').value)         || 0;
  const prezzo_casa           = parseItaNumber(document.getElementById('prezzo_casa').value)      || 0;
  const anni_mutuo            = Math.round(parseItaNumber(document.getElementById('mutuo_anni').value)) || 30;
  const tasso_mutuo           = parseItaNumber(document.getElementById('mutuo_tasso').value)      || 0;
  const tasse_manutenzione_p  = parseItaNumber(document.getElementById('tasse_prop').value)       || 0;
  const crescita_casa_p       = parseItaNumber(document.getElementById('crescita_casa').value)    || 0;
  const affitto_partenza      = parseItaNumber(document.getElementById('affitto_mensile').value)  || 0;
  const crescita_affitto_p    = parseItaNumber(document.getElementById('crescita_affitto').value) || 0;
  const r_mercato_p           = parseItaNumber(document.getElementById('rendimento_mercato').value)|| 0;

  if (prezzo_casa <= 0) return;

  // ── Mutuo (ammortamento alla francese) ────────────────────
  const N_mutuo        = anni_mutuo * 12;
  const r_mutuo_mese   = (tasso_mutuo / 100) / 12;
  const mutuo_iniziale = Math.max(0, prezzo_casa - anticipo);

  let PMT = 0;
  if (mutuo_iniziale > 0 && N_mutuo > 0) {
    if (r_mutuo_mese === 0) PMT = mutuo_iniziale / N_mutuo;
    else {
      const comp = Math.pow(1 + r_mutuo_mese, N_mutuo);
      PMT = mutuo_iniziale * (r_mutuo_mese * comp) / (comp - 1);
    }
  }

  // ── Tassi mensili ─────────────────────────────────────────
  const r_mercato_mese  = (r_mercato_p         / 100) / 12;
  const r_casa_mese     = (crescita_casa_p      / 100) / 12;
  const r_affitto_mese  = (crescita_affitto_p   / 100) / 12;
  const tasse_man_annue = tasse_manutenzione_p  / 100;

  // ── Stato ─────────────────────────────────────────────────
  let home_value   = prezzo_casa;
  let loan_balance = mutuo_iniziale;
  let rent         = affitto_partenza;
  // Tenant investe subito anticipo + costi iniziali (soldi che il buyer ha sunk)
  let investments  = anticipo + costi_iniziali;

  const anni_sim = Math.max(30, anni_mutuo);
  const buyer_nw = [], tenant_nw = [], labels = [];
  const annual_data = [];

  // Anno 0
  // Buyer NW: equity casa - costi iniziali sunk (non recuperabili alla vendita immediata)
  buyer_nw.push(home_value - loan_balance - costi_iniziali);
  tenant_nw.push(investments);
  labels.push('Oggi');

  let be_first = -1;

  for (let y = 1; y <= anni_sim; y++) {
    let costo_buyer_anno = 0;
    let costo_affitto_anno = 0;

    for (let m = 0; m < 12; m++) {
      // Rata mutuo
      let rata = 0;
      if (loan_balance > 0) {
        const qInt = loan_balance * r_mutuo_mese;
        let   qCap = PMT - qInt;
        if (loan_balance < qCap) qCap = loan_balance;
        loan_balance -= qCap;
        if (loan_balance < 0) loan_balance = 0;
        rata = qInt + qCap;
      }
      // Tasse & manutenzione
      const man_mese    = (home_value * tasse_man_annue) / 12;
      const costo_buyer = rata + man_mese;

      costo_buyer_anno += costo_buyer;
      costo_affitto_anno += rent;

      // Rivalutazione immobile
      home_value *= (1 + r_casa_mese);

      // Tenant: investe il differenziale (o preleva se affitto > costi buyer)
      const diff = costo_buyer - rent;
      investments = investments * (1 + r_mercato_mese) + diff;

      // Aumento affitto mensile composto
      rent *= (1 + r_affitto_mese);
    }

    // NW Buyer: costi_iniziali rimangono sunk cost, non recuperati finché non si vende
    // (alla vendita si recuperano come parte del prezzo, ma durante il possesso non sono equity)
    const nw_b = home_value - loan_balance - costi_iniziali;
    const nw_t = investments;

    buyer_nw.push(nw_b);
    tenant_nw.push(nw_t);
    labels.push('Anno ' + y);

    annual_data.push({
      anno: y,
      spesa_acquisto: costo_buyer_anno,
      spesa_affitto: costo_affitto_anno,
      differenza: costo_buyer_anno - costo_affitto_anno,
      nw_b: nw_b,
      nw_t: nw_t
    });

    if (be_first === -1 && nw_b > nw_t && buyer_nw[y - 1] <= tenant_nw[y - 1]) {
      be_first = y;
    }
  }

  // Break-even stabile: dal punto in cui buyer non torna più sotto
  let be_stable = -1;
  let ultimo_sotto = -1;
  for (let y = 1; y <= anni_sim; y++) {
    if (buyer_nw[y] <= tenant_nw[y]) ultimo_sotto = y;
  }
  if (ultimo_sotto === -1 && be_first !== -1) {
    be_stable = be_first; // non è mai tornato sotto dopo il primo sorpasso
  } else if (ultimo_sotto >= 0 && ultimo_sotto < anni_sim) {
    for (let y = ultimo_sotto + 1; y <= anni_sim; y++) {
      if (buyer_nw[y] > tenant_nw[y]) { be_stable = y; break; }
    }
  }

  // ── Risultati ─────────────────────────────────────────────
  const final_buyer  = buyer_nw[anni_sim];
  const final_tenant = tenant_nw[anni_sim];
  const best = final_buyer > final_tenant ? 'BUY' : final_tenant > final_buyer ? 'RENT' : 'TIE';

  document.getElementById('risultati-container').style.display = 'block';
  document.getElementById('grafico-section').style.display     = 'block';
  
  const tableSection = document.getElementById('table-section');
  if (tableSection) tableSection.style.display = 'block';

  const diffResult = Math.abs(final_buyer - final_tenant);
  const vinceText  = best === 'BUY' ? '🏠 Conviene COMPRARE' : best === 'RENT' ? '📈 Conviene AFFITTARE' : '⚖️ Parità';
  const vinceColor = best === 'BUY' ? '#10b981' : '#f59e0b';

  const beFirstText  = be_first  === -1 ? 'Mai' : `Anno ${be_first}`;
  const beStableText = be_stable === -1 ? 'Mai' : `Anno ${be_stable}`;

  const titolo = document.getElementById('risultati-titolo');
  if (titolo) titolo.textContent = `Simulazione Patrimoniale a ${anni_sim} Anni`;

  document.getElementById('cards-risultati').innerHTML = `
    <div class="card finance result-winner" style="padding:20px;text-align:center;border-top:3px solid ${vinceColor};transform:scale(1.03);box-shadow:0 10px 25px rgba(255,255,255,0.05);">
      <h3 style="font-size:0.95rem;color:${vinceColor};margin-bottom:8px;">${vinceText}</h3>
      <p style="font-size:1.6rem;color:var(--text-primary);font-family:'Orbitron',sans-serif;">+ ${fmt(diffResult)}</p>
      <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">di patrimonio netto dopo ${anni_sim} anni</p>
    </div>
    <div class="card finance" style="padding:20px;text-align:center;">
      <h3 style="font-size:0.85rem;color:#3b82f6;margin-bottom:6px;">📍 Primo Sorpasso</h3>
      <p style="font-size:1.4rem;color:var(--text-primary);font-family:'Orbitron',sans-serif;">${beFirstText}</p>
      <p style="font-size:0.72rem;color:var(--text-secondary);margin-top:4px;">Prima volta che NW acquisto > NW affitto</p>
    </div>
    <div class="card finance" style="padding:20px;text-align:center;">
      <h3 style="font-size:0.85rem;color:#818cf8;margin-bottom:6px;">🔒 Sorpasso Definitivo</h3>
      <p style="font-size:1.4rem;color:var(--text-primary);font-family:'Orbitron',sans-serif;">${beStableText}</p>
      <p style="font-size:0.72rem;color:var(--text-secondary);margin-top:4px;">Da quando il mutuo rimane sempre avanti</p>
    </div>
    <div class="card finance" style="padding:20px;text-align:center;">
      <h3 style="font-size:0.85rem;color:#10b981;margin-bottom:6px;">🏠 NW Acquisto</h3>
      <p style="font-size:1.4rem;color:var(--text-primary);font-family:'Orbitron',sans-serif;">${fmt(final_buyer)}</p>
    </div>
    <div class="card finance" style="padding:20px;text-align:center;">
      <h3 style="font-size:0.85rem;color:#f59e0b;margin-bottom:6px;">📈 NW Affitto+Inv.</h3>
      <p style="font-size:1.4rem;color:var(--text-primary);font-family:'Orbitron',sans-serif;">${fmt(final_tenant)}</p>
    </div>
  `;

  const tbody = document.getElementById('dettaglio-tbody');
  if (tbody) {
    let rowsHTML = '';
    annual_data.forEach(d => {
      const diffColor = d.differenza >= 0 ? '#10b981' : '#f43f5e';
      const diffText = d.differenza >= 0 ? `+${fmt(d.differenza)}` : `${fmt(d.differenza)}`;
      rowsHTML += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
          <td style="padding:10px; text-align:center; color:var(--text-secondary);">${d.anno}</td>
          <td style="padding:10px;">${fmt(d.spesa_acquisto)}</td>
          <td style="padding:10px;">${fmt(d.spesa_affitto)}</td>
          <td style="padding:10px; color:${diffColor}; font-weight:500;">${diffText}</td>
          <td style="padding:10px; color:var(--text-secondary);">${fmtShort(d.nw_b)}</td>
          <td style="padding:10px; color:var(--text-secondary);">${fmtShort(d.nw_t)}</td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHTML;
  }

  document.getElementById('risultati-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  disegnaGrafico(labels, buyer_nw, tenant_nw, be_first, be_stable);
}

function disegnaGrafico(labels, buyerData, tenantData, beFirst, beStable) {
  if (rbChart) rbChart.destroy();
  const ctx = document.getElementById('grafico').getContext('2d');

  const bePlotPlugin = {
    id: 'bePlot',
    afterDraw(chart) {
      const { ctx, scales: { x, y } } = chart;
      const drawLine = (idx, color, txt) => {
        if (idx < 1 || idx >= labels.length) return;
        const xp = x.getPixelForValue(idx);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.65;
        ctx.beginPath(); ctx.moveTo(xp, y.top); ctx.lineTo(xp, y.bottom); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.font = "600 9px 'Orbitron',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(txt, xp, y.top + 13);
        ctx.restore();
      };
      drawLine(beFirst,  '#3b82f6', '1° sorpasso');
      if (beStable !== beFirst) drawLine(beStable, '#818cf8', 'definitivo');
    }
  };

  rbChart = new Chart(ctx, {
    type: 'line',
    plugins: [bePlotPlugin],
    data: {
      labels,
      datasets: [
        {
          label: '🏠 Acquisto',
          data: buyerData,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          tension: 0.3
        },
        {
          label: '📈 Affitto + Investimenti',
          data: tenantData,
          borderColor: '#f59e0b',
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
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', font: { family: "'Orbitron',sans-serif", size: 10 }, usePointStyle: true, padding: 18 }
        },
        tooltip: {
          backgroundColor: 'rgba(10,10,25,0.92)',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          titleColor: '#e0f2fe',
          bodyColor: '#bae6fd',
          padding: 12,
          callbacks: { label: item => '  ' + item.dataset.label + ': ' + fmt(item.parsed.y) }
        }
      },
      scales: {
        x: { ticks: { color: '#555', font: { family: "'Orbitron',sans-serif", size: 9 }, maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#555', font: { family: "'Orbitron',sans-serif", size: 9 }, callback: v => fmtShort(v) }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => { setTimeout(calcola, 300); });
