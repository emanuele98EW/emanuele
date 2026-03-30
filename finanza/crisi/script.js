/**
 * Historical Data (approximations based on S&P 500, US 10Y Treasuries, Gold)
 * Il primo anno è l'anno di PICCO: la simulazione parte da lì con il capitale iniziale.
 * I rendimenti mostrati sono quelli DALL'ANNO SUCCESSIVO in poi (il crollo).
 */
const STORICO = {
  "1929": {
    annoPicco: 1928,
    anni: [1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945],
    azioni: [-8.3, -25.1, -43.8, -8.6, 54.0, -1.2, 47.7, 33.9, -35.0, 31.1, -0.4, -9.8, -11.6, 20.3, 25.9, 19.8, 36.4],
    obbligazioni: [4.2, 4.5, -2.6, 8.8, 1.8, 8.0, 4.5, 5.0, 1.4, 4.3, 3.2, 3.0, 1.0, 3.2, 2.1, 2.9, 3.8],
    oro: [0, 0, 0, 0, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  "2000": {
    annoPicco: 1999,
    anni: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
    azioni: [-9.1, -11.9, -22.1, 28.7, 10.9, 4.9, 15.8, 5.5, -37.0, 26.5, 15.1],
    obbligazioni: [16.7, 5.6, 15.1, 0.4, 4.3, 2.8, 1.2, 9.9, 20.1, -11.1, 9.0],
    oro: [-6.2, 1.4, 23.9, 19.1, 5.4, 17.1, 23.9, 31.9, 4.3, 25.0, 29.2]
  },
  "2008": {
    annoPicco: 2007,
    anni: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
    azioni: [-37.0, 26.5, 15.1, 2.1, 16.0, 32.4, 13.7, 1.4, 12.0, 21.8, -4.4],
    obbligazioni: [20.1, -11.1, 9.0, 16.0, 2.0, -7.8, 10.7, 1.3, 1.0, 2.8, -0.0],
    oro: [4.3, 25.0, 29.2, 11.6, 6.0, -27.3, -1.7, -10.4, 8.6, 12.8, -1.6]
  }
};

/**
 * Slider Balancing Logic
 */
const sAz = document.getElementById('alloc-azioni');
const sOb = document.getElementById('alloc-obbligazioni');
const sOr = document.getElementById('alloc-oro');

function updateSliderLabels() {
    document.getElementById('val-azioni').innerText = sAz.value + '%';
    document.getElementById('val-obbligazioni').innerText = sOb.value + '%';
    document.getElementById('val-oro').innerText = sOr.value + '%';
}

function handleSliderChange(e) {
    let changed = e.target;
    let az = parseInt(sAz.value);
    let ob = parseInt(sOb.value);
    let or_ = parseInt(sOr.value);
    let tot = az + ob + or_;

    if (tot !== 100) {
        let scarto = tot - 100;
        let altri = [sAz, sOb, sOr].filter(slider => slider !== changed);
        
        if (parseInt(altri[0].value) - scarto >= 0 && parseInt(altri[0].value) - scarto <= 100) {
            altri[0].value = parseInt(altri[0].value) - scarto;
        } else {
            let rimasto = scarto - parseInt(altri[0].value);
            altri[0].value = 0;
            if(altri[1]) altri[1].value = Math.max(0, parseInt(altri[1].value) - rimasto);
        }
    }
    updateSliderLabels();
}

[sAz, sOb, sOr].forEach(el => el.addEventListener('input', handleSliderChange));

/**
 * Formato numeri EUR
 */
function parseCurrencyStr(val) {
    if (!val) return 0;
    return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
}
function formatEur(num) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
}

/**
 * Simulazione
 */
let chartInst = null;

function calcolaCrisi() {
    const capInizialeStr = document.getElementById('capitale').value;
    const pacStr = document.getElementById('pac').value;
    
    const cap = parseCurrencyStr(capInizialeStr);
    const pacM = parseCurrencyStr(pacStr);
    
    const wAz = parseInt(sAz.value) / 100;
    const wOb = parseInt(sOb.value) / 100;
    const wOr = parseInt(sOr.value) / 100;
    
    const crisisKey = document.getElementById('crisi-selector').value;
    const data = STORICO[crisisKey];
    
    let portafoglioHistory = [];
    let versatoHistory = [];
    
    let currentVal = cap;
    let currentInvested = cap;
    let maxDrawdown = 0;
    
    let units = 100;
    let unitPrice = cap / units; 
    let maxUnitPrice = unitPrice;
    let recoveryYear = null;
    
    // Punto di partenza: anno di picco
    portafoglioHistory.push(currentVal);
    versatoHistory.push(currentInvested);
    
    for (let i = 0; i < data.anni.length; i++) {
        const rAz = data.azioni[i] / 100;
        const rOb = data.obbligazioni[i] / 100;
        const rOr = data.oro[i] / 100;
        
        const rendimentoAnnuale = (wAz * rAz) + (wOb * rOb) + (wOr * rOr);
        
        // 1. Unit Price per drawdown puro (indipendente dai versamenti PAC)
        unitPrice = unitPrice * (1 + rendimentoAnnuale);
        if (unitPrice > maxUnitPrice) { maxUnitPrice = unitPrice; }
        let currentDrawdown = (unitPrice - maxUnitPrice) / maxUnitPrice;
        if (currentDrawdown < maxDrawdown) { maxDrawdown = currentDrawdown; }
        
        if (recoveryYear === null && currentDrawdown >= 0 && i > 0 && maxDrawdown < -0.05) {
            recoveryYear = data.anni[i];
        }

        // 2. Calcolo Soldi Reali (con PAC)
        const yearlyPac = pacM * 12;
        currentVal = currentVal * (1 + rendimentoAnnuale) + yearlyPac * (1 + rendimentoAnnuale / 2);
        currentInvested += yearlyPac;
        
        portafoglioHistory.push(currentVal);
        versatoHistory.push(currentInvested);
    }
    
    // Aggiornamento Risultati DOM
    document.getElementById('res-finale').innerText = formatEur(currentVal);
    document.getElementById('res-drawdown').innerText = (maxDrawdown * 100).toFixed(1) + '%';
    
    if (recoveryYear) {
        document.getElementById('res-recovery').innerText = "Nell'anno " + recoveryYear;
    } else if (maxDrawdown < -0.05) {
        document.getElementById('res-recovery').innerText = "Non recuperato (" + data.anni.length + " anni)";
    } else {
        document.getElementById('res-recovery').innerText = "Veloce (<1 anno)";
    }
    
    // CAGR: rendimento annuo composto
    const nAnni = data.anni.length;
    let cagr = 0;
    if (currentInvested > 0 && nAnni > 0) {
        cagr = (Math.pow(currentVal / currentInvested, 1 / nAnni) - 1) * 100;
    }
    const cagrSign = cagr >= 0 ? '+' : '';
    document.getElementById('res-cagr').innerText = cagrSign + cagr.toFixed(2).replace('.', ',') + '% / anno';
    
    // Labels per grafico e tabella
    const labelAnni = data.anni;
    const labelPicco = data.annoPicco;
    
    drawChart(labelPicco, labelAnni, portafoglioHistory, versatoHistory);
    drawTable(labelPicco, labelAnni, portafoglioHistory, versatoHistory);
}

function drawTable(annoPicco, anni, pHist, vHist) {
    const tbody = document.getElementById('crisi-tbody');
    tbody.innerHTML = '';
    
    for (let i = 0; i < pHist.length; i++) {
        let pVal = pHist[i];
        let vVal = vHist[i];
        
        let pnl = pVal - vVal;
        let pct = (vVal > 0) ? (pnl / vVal) * 100 : 0;
        
        let rowClass = "";
        let pnlStr = "";
        let pctStr = "";
        
        if (i === 0) {
            // Riga di partenza
            pnlStr = "—";
            pctStr = "—";
            rowClass = "row-profit";
        } else {
            let sign = pnl > 0 ? "+" : "";
            pnlStr = sign + new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(pnl);
            pctStr = sign + pct.toFixed(2).replace('.', ',') + "%";
            rowClass = (pnl >= 0) ? "row-profit" : "row-loss";
        }
        
        let label = (i === 0) ? `${annoPicco} (Picco)` : anni[i - 1];
        
        let tr = document.createElement('tr');
        tr.className = rowClass;
        
        tr.innerHTML = `
            <td><strong>${label}</strong></td>
            <td>${formatEur(vVal)}</td>
            <td>${formatEur(pVal)}</td>
            <td style="font-weight: bold;">${pnlStr}</td>
            <td style="font-weight: bold;">${pctStr}</td>
        `;
        
        tbody.appendChild(tr);
    }
}

function drawChart(annoPicco, anni, pHist, vHist) {
    const ctx = document.getElementById('grafico').getContext('2d');
    const isLight = document.documentElement.classList.contains('light-mode');
    const tColor = isLight ? '#1e293b' : '#94a3b8';
    const gridC = isLight ? 'rgba(27,46,107,0.1)' : 'rgba(255,255,255,0.06)';

    if (chartInst) { chartInst.destroy(); }

    chartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [annoPicco + " (Picco)", ...anni],
            datasets: [
                {
                    label: 'Valore Portafoglio',
                    data: pHist,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                },
                {
                    label: 'Capitale Versato Cumulato',
                    data: vHist,
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: tColor, font: { family: 'Orbitron', size: 10 } } },
                tooltip: {
                    callbacks: {
                        label: function(ctx) { return ctx.dataset.label + ': ' + formatEur(ctx.parsed.y); }
                    }
                }
            },
            scales: {
                x: { ticks: { color: tColor, maxRotation: 45, minRotation: 0, font:{size:9} }, grid: { color: gridC } },
                y: { 
                    ticks: { color: tColor, callback: val => (val>=1000) ? (val/1000)+'k' : val }, 
                    grid: { color: gridC } 
                }
            }
        }
    });
}

// Avvio automatico al caricamento
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(calcolaCrisi, 100);
});
