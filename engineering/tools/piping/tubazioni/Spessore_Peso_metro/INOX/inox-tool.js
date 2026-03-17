/* ============================================================
   inox-tool.js  –  Tubazioni acciaio inox
   Dati: EN 10217-7 (saldati) / EN 10216-5 (senza saldatura)
   Densità inox: 7960 kg/m³  (AISI 304 / 316)
   Struttura: OD in mm, thicknesses: { "t_mm": kgm }
   Il peso kg/m è calcolato dalla formula:
     kgm = π × (OD - t) × t × 7.96  [kg/m, con OD e t in mm]
   ============================================================ */

'use strict';

const INOX_DENSITY = 7960; // kg/m³

/* Calcola kg/m dalla formula analitica */
function inoxKgm(OD, t) {
  return Math.PI * (OD - t) * t * INOX_DENSITY / 1e6;
}

/* Helper: costruisce l'oggetto thicknesses per un dato OD */
function buildThicknesses(OD, tList) {
  const obj = {};
  tList.forEach(t => {
    const key = t.toFixed(2).replace(/\.?0+$/, ''); // "1.6", "2", "3.2" ecc.
    obj[key] = parseFloat(inoxKgm(OD, t).toFixed(3));
  });
  return obj;
}

/*
  Spessori tipici inox per ogni DN (mm):
  Serie leggera (1.6, 2.0), media (2.6, 3.2), pesante (4.0, 5.0, 6.3…)
  secondo EN 10217-7 tabelle A.1–A.4 e cataloghi Sandvik / Böhler
*/
const inoxPipeData = {

  "DN 6":  { OD: 10.2,  thicknesses: buildThicknesses(10.2,  [1.6, 2.0, 2.3]) },
  "DN 8":  { OD: 13.5,  thicknesses: buildThicknesses(13.5,  [1.6, 2.0, 2.3, 2.6]) },
  "DN 10": { OD: 17.2,  thicknesses: buildThicknesses(17.2,  [1.6, 2.0, 2.3, 2.6, 3.2]) },
  "DN 15": { OD: 21.3,  thicknesses: buildThicknesses(21.3,  [1.6, 2.0, 2.3, 2.6, 3.2, 4.0]) },
  "DN 20": { OD: 26.9,  thicknesses: buildThicknesses(26.9,  [1.6, 2.0, 2.3, 2.6, 3.2, 4.0]) },
  "DN 25": { OD: 33.7,  thicknesses: buildThicknesses(33.7,  [1.6, 2.0, 2.6, 3.2, 4.0, 5.0]) },
  "DN 32": { OD: 42.4,  thicknesses: buildThicknesses(42.4,  [1.6, 2.0, 2.6, 3.2, 4.0, 5.0]) },
  "DN 40": { OD: 48.3,  thicknesses: buildThicknesses(48.3,  [1.6, 2.0, 2.6, 3.2, 4.0, 5.0]) },
  "DN 50": { OD: 60.3,  thicknesses: buildThicknesses(60.3,  [1.6, 2.0, 2.6, 3.2, 4.0, 5.0, 6.3]) },
  "DN 65": { OD: 76.1,  thicknesses: buildThicknesses(76.1,  [2.0, 2.6, 3.2, 4.0, 5.0, 6.3]) },
  "DN 80": { OD: 88.9,  thicknesses: buildThicknesses(88.9,  [2.0, 2.6, 3.2, 4.0, 5.0, 6.3]) },
  "DN 100":{ OD: 114.3, thicknesses: buildThicknesses(114.3, [2.0, 2.6, 3.2, 4.0, 5.0, 6.3, 8.0]) },
  "DN 125":{ OD: 139.7, thicknesses: buildThicknesses(139.7, [2.0, 2.6, 3.2, 4.0, 5.0, 6.3, 8.0]) },
  "DN 150":{ OD: 168.3, thicknesses: buildThicknesses(168.3, [2.0, 2.6, 3.2, 4.0, 5.0, 6.3, 8.0, 10.0]) },
  "DN 200":{ OD: 219.1, thicknesses: buildThicknesses(219.1, [2.6, 3.2, 4.0, 5.0, 6.3, 8.0, 10.0, 12.5]) },
  "DN 250":{ OD: 273.0, thicknesses: buildThicknesses(273.0, [3.2, 4.0, 5.0, 6.3, 8.0, 10.0, 12.5]) },
  "DN 300":{ OD: 323.9, thicknesses: buildThicknesses(323.9, [4.0, 5.0, 6.3, 8.0, 10.0, 12.5, 16.0]) },
  "DN 350":{ OD: 355.6, thicknesses: buildThicknesses(355.6, [4.0, 5.0, 6.3, 8.0, 10.0, 12.5, 16.0]) },
  "DN 400":{ OD: 406.4, thicknesses: buildThicknesses(406.4, [5.0, 6.3, 8.0, 10.0, 12.5, 16.0]) },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { inoxPipeData, inoxKgm, INOX_DENSITY };
}

/* ============================================================
   INIT TOOL
   ============================================================ */
function initInoxTool() {
  const dnSelect  = document.getElementById("dnSelect");
  const schSelect = document.getElementById("schSelect");

  /* Popola DN */
  Object.keys(inoxPipeData).forEach(dn => {
    const opt = document.createElement("option");
    opt.value = dn;
    opt.textContent = dn;
    dnSelect.appendChild(opt);
  });

  /* DN → Spessori */
  dnSelect.addEventListener("change", () => {
    schSelect.innerHTML = '<option value="">— Seleziona Spessore —</option>';
    clearInoxValues();
    const dn = dnSelect.value;
    if (!dn) return;

    Object.keys(inoxPipeData[dn].thicknesses).forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t + " mm";
      schSelect.appendChild(opt);
    });
  });

  schSelect.addEventListener("change", updateInoxValues);

  /* Densità fluido */
  const densityInput = document.getElementById("fluid-density");
  if (densityInput) densityInput.addEventListener("input", updateInoxValues);

  /* Grado acciaio */
  const gradeSelect = document.getElementById("steel-grade");
  if (gradeSelect) gradeSelect.addEventListener("change", updateInoxValues);
}

/* ============================================================
   AGGIORNA VALORI
   ============================================================ */
function updateInoxValues() {
  const dn   = document.getElementById("dnSelect").value;
  const tStr = document.getElementById("schSelect").value;
  if (!dn || !tStr) return;

  const OD  = inoxPipeData[dn].OD;
  const t   = parseFloat(tStr);
  const ID  = parseFloat((OD - 2 * t).toFixed(3));

  /* Sezione interna */
  const areaInt_m2  = Math.PI * Math.pow(ID / 2000, 2);
  const areaInt_cm2 = areaInt_m2 * 1e4;

  /* Peso tubo – usa densità del grado selezionato */
  const grade       = document.getElementById("steel-grade")?.value || "304";
  const rhoSteel    = grade === "316L" ? 7980 : 7960; // kg/m³
  const kgm         = parseFloat((Math.PI * (OD - t) * t * rhoSteel / 1e6).toFixed(3));

  /* Aggiorna spans principali */
  document.getElementById("od").textContent  = `${OD} mm`;
  document.getElementById("id").textContent  = `${ID} mm`;
  document.getElementById("thk").textContent = `${t} mm`;
  document.getElementById("kgm").textContent = `${kgm.toFixed(3)} kg/m`;

  /* Sezione interna */
  const areaSpan = document.getElementById("area-int");
  if (areaSpan) areaSpan.textContent = `${areaInt_cm2.toFixed(3)} cm²`;

  /* Peso fluido + totale */
  const densityInput    = document.getElementById("fluid-density");
  const fluidWeightSpan = document.getElementById("fluid-weight");
  const totalWeightSpan = document.getElementById("total-weight");

  if (densityInput && fluidWeightSpan && totalWeightSpan) {
    const rho        = parseFloat(densityInput.value) || 0;
    const fluid_kgm  = areaInt_m2 * rho;
    const total_kgm  = kgm + fluid_kgm;
    fluidWeightSpan.textContent = `${fluid_kgm.toFixed(3)} kg/m`;
    totalWeightSpan.textContent = `${total_kgm.toFixed(3)} kg/m`;
  }

  /* Rapporto D/t (indice snellezza) */
  const dtSpan = document.getElementById("dt-ratio");
  if (dtSpan) {
    const dt = (OD / t).toFixed(1);
    dtSpan.textContent = dt;
  }

  /* Canvas */
  drawInoxPipe(OD, ID, t);
}

/* ============================================================
   CLEAR
   ============================================================ */
function clearInoxValues() {
  ["od","id","thk","kgm","area-int","fluid-weight","total-weight","dt-ratio"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "–";
    });

  const canvas = document.getElementById("pipeCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ============================================================
   CANVAS – disegno sezione trasversale stile CAD
   (colori inox: argento/grigio-azzurro invece di cyan)
   ============================================================ */
function drawInoxPipe(OD, ID, t) {
  const canvas = document.getElementById("pipeCanvas");
  if (!canvas) return;
  const ctx    = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  /* Radii visuali – scalati proporzionalmente al rapporto ID/OD */
  const Rext = 82;
  const Rint = Math.max(18, Math.round(Rext * (ID / OD)));

  /* ── Foro interno ──────────────────────────────────────── */
  ctx.fillStyle = "#0b1120";
  ctx.beginPath();
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2);
  ctx.fill();

  /* ── Corpo inox (gradiente radiale argento) ─────────────── */
  const grad = ctx.createRadialGradient(cx - Rext * 0.3, cy - Rext * 0.3, Rint * 0.5, cx, cy, Rext);
  grad.addColorStop(0,   "rgba(220, 230, 240, 0.22)");
  grad.addColorStop(0.5, "rgba(148, 163, 184, 0.14)");
  grad.addColorStop(1,   "rgba(100, 116, 139, 0.10)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, Rext, 0, Math.PI * 2);
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2, true);
  ctx.fill();

  /* ── Contorni luminosi argento/inox ─────────────────────── */
  const inoxColor = "#94a3b8";   // argento-acciaio
  const inoxGlow  = "#cbd5e1";

  ctx.strokeStyle = inoxGlow;
  ctx.lineWidth   = 2;
  ctx.shadowColor = inoxColor;
  ctx.shadowBlur  = 12;
  ctx.beginPath(); ctx.arc(cx, cy, Rext, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, Rint, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur  = 0;

  /* ── Highlight speculare (riflesso superiore) ────────────── */
  const hiGrad = ctx.createLinearGradient(cx - Rext, cy - Rext, cx + Rext * 0.3, cy);
  hiGrad.addColorStop(0,   "rgba(255,255,255,0.18)");
  hiGrad.addColorStop(0.4, "rgba(255,255,255,0.06)");
  hiGrad.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = hiGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, Rext - 1, Math.PI, 0);   // solo semicerchio superiore
  ctx.arc(cx, cy, Rint + 1, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  /* ── Linee di richiamo CAD ──────────────────────────────── */
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
  ctx.lineWidth   = 0.8;

  // OD – extension lines verso l'alto
  [[cx - Rext, cy - Rext - 18], [cx + Rext, cy - Rext - 18]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(ex, cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  });

  // ID – extension lines verso il basso
  [[cx - Rint, cy + Rext + 22], [cx + Rint, cy + Rext + 22]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(ex, cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  });

  // spessore – piccoli tratti sul lato destro
  [[cx + Rint, cy - 10, cx + Rint, cy + 10],
   [cx + Rext, cy - 10, cx + Rext, cy + 10]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });

  /* ── Asse centro (tratto-punto) ──────────────────────────── */
  ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
  ctx.setLineDash([8, 4, 2, 4]);
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - Rext - 20, cy); ctx.lineTo(cx + Rint, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - Rext - 6); ctx.lineTo(cx, cy + Rext + 6); ctx.stroke();
  ctx.setLineDash([]);

  /* ── Quote ───────────────────────────────────────────────── */
  ctx.font      = "bold 12px 'Orbitron', system-ui";
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";

  // OD
  _drawDoubleArrow(ctx, cx - Rext, cy - Rext - 13, cx + Rext, cy - Rext - 13, inoxGlow, 1.5);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(`OD: ${OD} mm`, cx, cy - Rext - 23);

  // ID
  _drawDoubleArrow(ctx, cx - Rint, cy + Rext + 18, cx + Rint, cy + Rext + 18, inoxGlow, 1.5);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(`ID: ${ID} mm`, cx, cy + Rext + 34);

  // Spessore
  const tColor = "#fb923c";  // arancio caldo per il tubo inox
  _drawDoubleArrow(ctx, cx + Rint + 4, cy, cx + Rext - 4, cy, tColor, 2);
  ctx.fillStyle  = tColor;
  ctx.textAlign  = "left";
  ctx.font       = "bold 11px 'Orbitron', system-ui";
  ctx.fillText(`t: ${t} mm`, cx + Rext + 14, cy + 4);
}

/* Freccia doppia interna al canvas */
function _drawDoubleArrow(ctx, x1, y1, x2, y2, color, width) {
  const head = 6;
  const ang  = Math.atan2(y2 - y1, x2 - x1);

  ctx.strokeStyle = color;
  ctx.lineWidth   = width;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

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
