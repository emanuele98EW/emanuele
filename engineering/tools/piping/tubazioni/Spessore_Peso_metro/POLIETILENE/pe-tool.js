/* ============================================================
   pe-tool.js  –  Tubazioni polietilene PE80 / PE100
   Dati: EN 12201 / ISO 4427 / EN 13244
   Densità PE: 950 kg/m³ (PE80) / 959 kg/m³ (PE100)
   Serie SDR: 6, 7.4, 9, 11, 13.6, 17, 21, 26, 33
   Struttura: OD in mm, SDR series con spessore e kgm calcolati
   ============================================================ */

'use strict';

const PE_DENSITY = { PE80: 950, PE100: 959 }; // kg/m³

/* Spessore nominale dalla serie SDR: t = OD / SDR, arrotondato a 0.1 mm */
function sdrThickness(OD, SDR) {
  return Math.round((OD / SDR) * 10) / 10;
}

/* kg/m calcolato analiticamente */
function peKgm(OD, t, grade) {
  const rho = PE_DENSITY[grade] || 950;
  return Math.PI * (OD - t) * t * rho / 1e6;
}

/*
  Pressioni nominali PN (bar) per SDR e grado secondo ISO 4427:
  PN = 2 × MRS / (SDR - 1) / C
  MRS: PE80 = 8 MPa, PE100 = 10 MPa   C = 1.25 (coefficiente sicurezza)
*/
function calcPN(SDR, grade) {
  const MRS = grade === 'PE100' ? 10 : 8;
  const C = 1.25;
  const pn = (2 * MRS) / ((SDR - 1) * C);
  return parseFloat(pn.toFixed(2));
}

/*
  SDR disponibili per norma EN 12201 / ISO 4427
  Non tutti gli SDR sono disponibili per tutti i DN —
  per semplicità esponiamo quelli commercialmente più diffusi
*/
const SDR_SERIES = [6, 7.4, 9, 11, 13.6, 17, 21, 26, 33];

/*
  OD nominali per tubazioni PE secondo EN 12201 (d20…d1200)
  Lista completa fino a DN 630
*/
const PE_OD_LIST = [
  20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160,
  180, 200, 225, 250, 280, 315, 355, 400, 450, 500,
  560, 630
];

/* Costruisce il dataset completo */
function buildPeData() {
  const data = {};

  PE_OD_LIST.forEach(OD => {
    const dnKey = `DN ${OD}`;
    data[dnKey] = { OD, sdrs: {} };

    SDR_SERIES.forEach(SDR => {
      const t = sdrThickness(OD, SDR);
      const ID_raw = OD - 2 * t;

      // Esclude combinazioni non fisiche (parete troppo spessa o ID < 4mm)
      if (t < 1.0 || ID_raw < 4) return;

      // Spessore minimo per alcuni OD piccoli secondo norma
      if (OD <= 32 && t < 2.0 && SDR > 17) return;

      data[dnKey].sdrs[`SDR ${SDR}`] = {
        t:    t,
        ID:   parseFloat(ID_raw.toFixed(2)),
      };
    });

    // Rimuovi DN senza SDR validi
    if (Object.keys(data[dnKey].sdrs).length === 0) delete data[dnKey];
  });

  return data;
}

const pePipeData = buildPeData();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { pePipeData, peKgm, calcPN, PE_DENSITY, SDR_SERIES };
}

/* ============================================================
   INIT TOOL
   ============================================================ */
function initPeTool() {
  const dnSelect  = document.getElementById('dnSelect');
  const sdrSelect = document.getElementById('sdrSelect');

  /* Popola DN */
  Object.keys(pePipeData).forEach(dn => {
    const opt = document.createElement('option');
    opt.value = dn;
    opt.textContent = dn + '  (OD ' + pePipeData[dn].OD + ' mm)';
    dnSelect.appendChild(opt);
  });

  /* DN → SDR */
  dnSelect.addEventListener('change', () => {
    sdrSelect.innerHTML = '<option value="">— Seleziona SDR —</option>';
    clearPeValues();
    const dn = dnSelect.value;
    if (!dn) return;

    Object.keys(pePipeData[dn].sdrs).forEach(sdr => {
      const entry = pePipeData[dn].sdrs[sdr];
      const opt = document.createElement('option');
      opt.value = sdr;
      opt.textContent = sdr + '  (t = ' + entry.t + ' mm)';
      sdrSelect.appendChild(opt);
    });

    updateRefTable();
  });

  sdrSelect.addEventListener('change', () => {
    updatePeValues();
    highlightRefTable();
  });

  /* Densità fluido */
  const densityInput = document.getElementById('fluid-density');
  if (densityInput) densityInput.addEventListener('input', updatePeValues);

  /* Grado PE */
  const gradeSelect = document.getElementById('pe-grade');
  if (gradeSelect) {
    gradeSelect.addEventListener('change', () => {
      updateGradeInfo();
      updatePeValues();
      updateRefTable();
    });
  }
}

/* ============================================================
   AGGIORNA VALORI
   ============================================================ */
function updatePeValues() {
  const dn    = document.getElementById('dnSelect').value;
  const sdrKey = document.getElementById('sdrSelect').value;
  if (!dn || !sdrKey) return;

  const grade  = document.getElementById('pe-grade')?.value || 'PE100';
  const entry  = pePipeData[dn].sdrs[sdrKey];
  const OD     = pePipeData[dn].OD;
  const t      = entry.t;
  const ID     = entry.ID;
  const SDR    = parseFloat(sdrKey.replace('SDR ', ''));

  /* Aree */
  const areaInt_m2  = Math.PI * Math.pow(ID / 2000, 2);
  const areaInt_cm2 = areaInt_m2 * 1e4;

  /* Peso tubo */
  const kgm = peKgm(OD, t, grade);

  /* PN */
  const pn = calcPN(SDR, grade);

  /* Aggiorna spans principali */
  setText('od',      `${OD} mm`);
  setText('id',      `${ID} mm`);
  setText('thk',     `${t} mm`);
  setText('sdr-val', `SDR ${SDR}`);
  setText('pn-val',  `${pn} bar`);
  setText('kgm',     `${kgm.toFixed(3)} kg/m`);
  setText('area-int',`${areaInt_cm2.toFixed(3)} cm²`);
  setText('dt-ratio',`${(OD / t).toFixed(1)}`);

  /* Peso fluido + totale */
  const densityInput    = document.getElementById('fluid-density');
  const rho             = parseFloat(densityInput?.value) || 0;
  const fluid_kgm       = areaInt_m2 * rho;
  const total_kgm       = kgm + fluid_kgm;
  setText('fluid-weight', `${fluid_kgm.toFixed(3)} kg/m`);
  setText('total-weight', `${total_kgm.toFixed(3)} kg/m`);

  /* PN badge colore */
  const pnBadge = document.getElementById('pn-badge');
  if (pnBadge) {
    let cls = 'pn-low';
    if (pn >= 16)     cls = 'pn-high';
    else if (pn >= 10) cls = 'pn-mid';
    pnBadge.className = 'pn-badge ' + cls;
    pnBadge.textContent = `PN ${pn} bar`;
  }

  drawPePipe(OD, ID, t, grade);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ============================================================
   CLEAR
   ============================================================ */
function clearPeValues() {
  ['od','id','thk','sdr-val','pn-val','kgm','area-int',
   'dt-ratio','fluid-weight','total-weight'].forEach(id => setText(id, '–'));

  const pnBadge = document.getElementById('pn-badge');
  if (pnBadge) { pnBadge.className = 'pn-badge'; pnBadge.textContent = '–'; }

  const canvas = document.getElementById('pipeCanvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/* ============================================================
   GRADE INFO
   ============================================================ */
const GRADE_INFO = {
  PE80: {
    label:   'PE 80 / MRS 8',
    rho:     950,
    note:    'Polietilene media densità. Usato per acqua potabile e gas a bassa pressione. MRS = 8 MPa.',
    color:   '#facc15',
  },
  PE100: {
    label:   'PE 100 / MRS 10',
    rho:     959,
    note:    'Polietilene alta densità. Standard attuale per reti idriche e gas. MRS = 10 MPa. Maggiore resistenza a creep e lenta propagazione delle cricche.',
    color:   '#34d399',
  },
  'PE100-RC': {
    label:   'PE 100-RC',
    rho:     959,
    note:    'PE 100 Resistance to Crack. Eccellente resistenza alla propagazione lenta delle cricche. Adatto per posa senza letto di sabbia.',
    color:   '#60a5fa',
  },
};

function updateGradeInfo() {
  const grade = document.getElementById('pe-grade')?.value || 'PE100';
  const g     = GRADE_INFO[grade] || GRADE_INFO['PE100'];
  const el    = document.getElementById('grade-info');
  if (el) {
    el.innerHTML = `<strong style="color:${g.color}">${g.label}</strong> · ρ = ${g.rho} kg/m³<br>${g.note}`;
  }
}

/* ============================================================
   TABELLA RAPIDA
   ============================================================ */
function updateRefTable() {
  const dn    = document.getElementById('dnSelect').value;
  const grade = document.getElementById('pe-grade')?.value || 'PE100';
  const tbody = document.getElementById('ref-tbody');
  if (!dn || !pePipeData[dn]) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:#444;padding:14px;text-align:center;">Seleziona un DN</td></tr>';
    return;
  }

  const OD = pePipeData[dn].OD;
  let rows = '';
  Object.keys(pePipeData[dn].sdrs).forEach(sdrKey => {
    const e   = pePipeData[dn].sdrs[sdrKey];
    const SDR = parseFloat(sdrKey.replace('SDR ', ''));
    const pn  = calcPN(SDR, grade);
    const kgm = peKgm(OD, e.t, grade);
    const A   = (Math.PI * Math.pow(e.ID / 2000, 2) * 1e4).toFixed(3);
    rows += `<tr data-sdr="${sdrKey}">
      <td>${sdrKey}</td>
      <td>${e.t}</td>
      <td>${e.ID}</td>
      <td class="t-num">${A}</td>
      <td class="t-num">${kgm.toFixed(3)}</td>
      <td class="t-num">${pn}</td>
    </tr>`;
  });
  tbody.innerHTML = rows;
  highlightRefTable();
}

function highlightRefTable() {
  const sdrKey = document.getElementById('sdrSelect').value;
  document.querySelectorAll('#ref-tbody tr').forEach(tr => {
    tr.classList.toggle('active-row', tr.dataset.sdr === sdrKey);
  });
}

/* ============================================================
   CANVAS – sezione trasversale PE (colori verde/giallo)
   ============================================================ */
function drawPePipe(OD, ID, t, grade) {
  const canvas = document.getElementById('pipeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx   = canvas.width  / 2;
  const cy   = canvas.height / 2;
  const Rext = 82;
  const Rint = Math.max(10, Math.round(Rext * (ID / OD)));

  /* Colore per grado */
  const gradeColor = {
    PE80:       { main: '#facc15', glow: '#fde68a', fill: 'rgba(250,204,21,0.13)' },
    PE100:      { main: '#34d399', glow: '#6ee7b7', fill: 'rgba(52,211,153,0.12)' },
    'PE100-RC': { main: '#60a5fa', glow: '#93c5fd', fill: 'rgba(96,165,250,0.12)' },
  };
  const gc = gradeColor[grade] || gradeColor['PE100'];

  /* Foro interno */
  ctx.fillStyle = '#0b1120';
  ctx.beginPath();
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2);
  ctx.fill();

  /* Corpo PE – gradiente radiale */
  const grad = ctx.createRadialGradient(
    cx - Rext * 0.3, cy - Rext * 0.3, Rint * 0.4,
    cx, cy, Rext
  );
  grad.addColorStop(0,   gc.fill.replace('0.12', '0.22'));
  grad.addColorStop(0.6, gc.fill);
  grad.addColorStop(1,   'rgba(0,0,0,0.05)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, Rext, 0, Math.PI * 2);
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2, true);
  ctx.fill();

  /* Contorni luminosi */
  ctx.strokeStyle = gc.glow;
  ctx.lineWidth   = 2;
  ctx.shadowColor = gc.main;
  ctx.shadowBlur  = 14;
  ctx.beginPath(); ctx.arc(cx, cy, Rext, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, Rint, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur  = 0;

  /* Highlight speculare */
  const hiGrad = ctx.createLinearGradient(cx - Rext, cy - Rext, cx, cy);
  hiGrad.addColorStop(0,   'rgba(255,255,255,0.15)');
  hiGrad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
  hiGrad.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = hiGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, Rext - 1, Math.PI, 0);
  ctx.arc(cx, cy, Rint + 1, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  /* Linee di richiamo CAD */
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = 'rgba(148,163,184,0.4)';
  ctx.lineWidth   = 0.8;

  [[cx - Rext, cy - Rext - 18], [cx + Rext, cy - Rext - 18]].forEach(([ex, ey]) => {
    ctx.beginPath(); ctx.moveTo(ex, cy); ctx.lineTo(ex, ey); ctx.stroke();
  });
  [[cx - Rint, cy + Rext + 22], [cx + Rint, cy + Rext + 22]].forEach(([ex, ey]) => {
    ctx.beginPath(); ctx.moveTo(ex, cy); ctx.lineTo(ex, ey); ctx.stroke();
  });
  [[cx + Rint, cy - 10, cx + Rint, cy + 10],
   [cx + Rext, cy - 10, cx + Rext, cy + 10]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });

  /* Asse centro */
  ctx.strokeStyle = 'rgba(148,163,184,0.25)';
  ctx.setLineDash([8, 4, 2, 4]);
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - Rext - 20, cy); ctx.lineTo(cx + Rint, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - Rext - 6); ctx.lineTo(cx, cy + Rext + 6); ctx.stroke();
  ctx.setLineDash([]);

  /* Quote */
  ctx.font      = "bold 12px 'Orbitron', system-ui";
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';

  _peDblArrow(ctx, cx - Rext, cy - Rext - 13, cx + Rext, cy - Rext - 13, gc.glow, 1.5);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(`OD: ${OD} mm`, cx, cy - Rext - 23);

  _peDblArrow(ctx, cx - Rint, cy + Rext + 18, cx + Rint, cy + Rext + 18, gc.glow, 1.5);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(`ID: ${ID} mm`, cx, cy + Rext + 34);

  const tColor = '#fb923c';
  _peDblArrow(ctx, cx + Rint + 4, cy, cx + Rext - 4, cy, tColor, 2);
  ctx.fillStyle  = tColor;
  ctx.textAlign  = 'left';
  ctx.font       = "bold 11px 'Orbitron', system-ui";
  ctx.fillText(`t: ${t} mm`, cx + Rext + 14, cy + 4);
}

function _peDblArrow(ctx, x1, y1, x2, y2, color, width) {
  const head = 6;
  const ang  = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.lineWidth   = width;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  [[x1, y1, 1], [x2, y2, -1]].forEach(([x, y, dir]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * head * Math.cos(ang - Math.PI / 6),
               y + dir * head * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(x + dir * head * Math.cos(ang + Math.PI / 6),
               y + dir * head * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}
