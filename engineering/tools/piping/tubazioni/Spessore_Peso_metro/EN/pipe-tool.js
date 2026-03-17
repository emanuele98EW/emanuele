const pipeData = {
  "DN 15": { OD: 21.3, thicknesses: { "3.20": 1.43, "3.60": 1.57, "4.00": 1.71, "4.50": 1.87, "5.00": 2.01, "5.60": 2.17, "6.30": 2.34, "7.10": 2.49 } },
  "DN 20": { OD: 26.7, thicknesses: { "3.20": 1.85, "3.60": 2.05, "4.00": 2.24, "4.50": 2.46, "5.00": 2.67, "5.60": 2.91, "6.30": 3.16, "7.10": 3.43 } },
  "DN 25": { OD: 33.7, thicknesses: { "3.20": 2.41, "3.60": 2.67, "4.00": 2.93, "4.50": 3.24, "5.00": 3.54, "5.60": 3.88, "6.30": 4.26, "7.10": 4.66, "8.00": 5.07, "8.80": 5.40, "10.00": 5.84 } },
  "DN 32": { OD: 42.4, thicknesses: { "3.20": 3.09, "3.60": 3.44, "4.00": 3.79, "4.50": 4.21, "5.00": 4.61, "5.60": 5.08, "6.30": 5.61, "7.10": 6.18, "8.00": 6.79, "8.80": 7.29, "10.00": 7.99 } },
  "DN 40": { OD: 48.3, thicknesses: { "3.20": 3.56, "3.60": 3.97, "4.00": 4.37, "4.50": 4.86, "5.00": 5.34, "5.60": 5.90, "6.30": 6.53, "7.10": 7.21, "8.00": 7.95, "8.80": 8.57, "10.00": 9.45, "11.00": 10.10 } },
  "DN 50": { OD: 60.3, thicknesses: { "3.20": 4.51, "3.60": 5.03, "4.00": 5.55, "4.50": 6.19, "5.00": 6.82, "5.60": 7.55, "6.30": 8.39, "7.10": 9.31, "8.00": 10.30, "8.80": 11.20, "10.00": 12.40, "11.00": 13.40, "12.50": 14.70, "14.20": 16.10, "16.00": 17.50 } },
  "DN 65": { OD: 76.1, thicknesses: { "3.20": 5.75, "3.60": 6.44, "4.00": 7.11, "4.50": 7.95, "5.00": 8.77, "5.60": 9.74, "6.30": 10.80, "7.10": 12.10, "8.00": 13.40, "8.80": 14.60, "10.00": 16.30, "11.00": 17.70, "12.50": 19.60, "14.20": 21.70, "16.00": 23.70 } },
  "DN 80": { OD: 88.9, thicknesses: { "3.20": 6.76, "3.60": 7.57, "4.00": 8.37, "4.50": 9.37, "5.00": 10.30, "5.60": 11.50, "6.30": 12.80, "7.10": 14.30, "8.00": 16.00, "8.80": 17.40, "10.00": 19.50, "11.00": 21.10, "12.50": 23.60, "14.20": 26.20, "16.00": 28.80 } },
  "DN 100": { OD: 114.3, thicknesses: { "3.20": 8.77, "3.60": 9.83, "4.00": 10.90, "4.50": 12.20, "5.00": 13.50, "5.60": 15.00, "6.30": 16.80, "7.10": 18.80, "8.00": 21.00, "8.80": 22.90, "10.00": 25.70, "11.00": 28.00, "12.50": 31.40, "14.20": 35.10, "16.00": 38.80 } },
  "DN 150": { OD: 168.3, thicknesses: { "3.20": 13.00, "3.60": 14.60, "4.00": 16.20, "4.50": 18.20, "5.00": 20.10, "5.60": 22.50, "6.30": 25.20, "7.10": 28.20, "8.00": 31.60, "8.80": 34.60, "10.00": 39.00, "11.00": 42.70, "12.50": 48.00, "14.20": 54.00, "16.00": 60.10 } },
  "DN 200": { OD: 219.1, thicknesses: { "6.30": 33.10, "7.10": 37.10, "8.00": 41.60, "8.80": 45.60, "10.00": 51.60, "11.00": 56.50, "12.50": 63.70, "14.20": 71.80, "16.00": 80.10 } },
  "DN 250": { OD: 273.0, thicknesses: { "6.30": 41.40, "7.10": 46.60, "8.00": 52.30, "8.80": 57.30, "10.00": 64.90, "11.00": 71.10, "12.50": 80.30, "14.20": 90.60, "16.00": 101.00 } },
  "DN 300": { OD: 323.9, thicknesses: { "8.00": 62.30, "8.80": 68.40, "10.00": 77.40, "11.00": 84.80, "12.50": 96.00, "14.20": 109.00, "16.00": 121.00 } }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = pipeData;
}

/* Riferimenti globali – valorizzati da initPipeTool */
let canvas, ctx, dnSelect, schSelect;

function initPipeTool() {
  canvas    = document.getElementById("pipeCanvas");
  ctx       = canvas.getContext("2d");
  dnSelect  = document.getElementById("dnSelect");
  schSelect = document.getElementById("schSelect");

  // Popola DN
  Object.keys(pipeData).forEach(dn => {
    const opt = document.createElement("option");
    opt.value = dn;
    opt.textContent = dn;
    dnSelect.appendChild(opt);
  });

  dnSelect.addEventListener("change", () => {
    schSelect.innerHTML = '<option value="">-- Seleziona Spessore (mm) --</option>';
    clearValues();

    const dn = dnSelect.value;
    if (!dn) return;

    // Popola Spessori (Thicknesses)
    Object.keys(pipeData[dn].thicknesses).forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t + " mm";
      schSelect.appendChild(opt);
    });
  });

  schSelect.addEventListener("change", updateValues);
}

function updateValues() {
  const dn   = dnSelect.value;
  const tStr = schSelect.value;
  if (!dn || !tStr) return;

  const OD  = pipeData[dn].OD;
  const t   = parseFloat(tStr);
  const ID  = (OD - 2 * t).toFixed(2);
  const kgm = pipeData[dn].thicknesses[tStr];

  const areaInt_m2  = Math.PI * Math.pow(parseFloat(ID) / 2000, 2);
  const areaInt_cm2 = areaInt_m2 * 1e4;

  document.getElementById("od").textContent  = `${OD} mm`;
  document.getElementById("id").textContent  = `${ID} mm`;
  document.getElementById("thk").textContent = `${t} mm`;
  document.getElementById("kgm").textContent = `${kgm.toFixed(2)} kg/m`;

  const areaEl = document.getElementById("area-int");
  if (areaEl) areaEl.textContent = `${areaInt_cm2.toFixed(3)} cm²`;

  const dtEl = document.getElementById("dt-ratio");
  if (dtEl) dtEl.textContent = (OD / t).toFixed(1);

  const densityInput    = document.getElementById("fluid-density");
  const fluidWeightSpan = document.getElementById("fluid-weight");
  const totalWeightSpan = document.getElementById("total-weight");
  if (densityInput && fluidWeightSpan && totalWeightSpan) {
    const rho       = parseFloat(densityInput.value) || 0;
    const fluid_kgm = areaInt_m2 * rho;
    const total_kgm = kgm + fluid_kgm;
    fluidWeightSpan.textContent = `${fluid_kgm.toFixed(2)} kg/m`;
    totalWeightSpan.textContent = `${total_kgm.toFixed(2)} kg/m`;
  }

  drawPipe(OD, parseFloat(ID), t);
}

function clearValues() {
  ["od","id","thk","kgm","area-int","dt-ratio","fluid-weight","total-weight"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "–";
    });
  if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// listener per l'input densita
document.addEventListener("DOMContentLoaded", () => {
  const densityInput = document.getElementById("fluid-density");
  if (densityInput) {
    densityInput.addEventListener("input", updateValues);
  }
});

/* ============================================================
   DISEGNO – stile coerente con Inox / PE / ASME
   ============================================================ */

function drawPipe(OD, ID, t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx   = canvas.width  / 2;
  const cy   = canvas.height / 2;
  const Rext = 82;
  const Rint = Math.max(10, Math.round(Rext * (ID / OD)));

  const enColor = "#38bdf8";
  const enGlow  = "#7dd3fc";

  /* ── Foro interno ──────────────────────────────────────── */
  ctx.fillStyle = "#0b1120";
  ctx.beginPath();
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2);
  ctx.fill();

  /* ── Corona (gradiente radiale) ────────────────────────── */
  const grad = ctx.createRadialGradient(
    cx - Rext * 0.3, cy - Rext * 0.3, Rint * 0.5,
    cx, cy, Rext
  );
  grad.addColorStop(0,   "rgba(56,189,248,0.20)");
  grad.addColorStop(0.5, "rgba(56,189,248,0.10)");
  grad.addColorStop(1,   "rgba(14,165,233,0.05)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, Rext, 0, Math.PI * 2);
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2, true);
  ctx.fill();

  /* ── Contorni luminosi ──────────────────────────────────── */
  ctx.strokeStyle = enGlow;
  ctx.lineWidth   = 2;
  ctx.shadowColor = enColor;
  ctx.shadowBlur  = 12;
  ctx.beginPath(); ctx.arc(cx, cy, Rext, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, Rint, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur  = 0;

  /* ── Highlight speculare ────────────────────────────────── */
  const hiGrad = ctx.createLinearGradient(cx - Rext, cy - Rext, cx + Rext * 0.3, cy);
  hiGrad.addColorStop(0,   "rgba(255,255,255,0.15)");
  hiGrad.addColorStop(0.4, "rgba(255,255,255,0.05)");
  hiGrad.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = hiGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, Rext - 1, Math.PI, 0);
  ctx.arc(cx, cy, Rint + 1, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  /* ── Linee di richiamo CAD ──────────────────────────────── */
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "rgba(148,163,184,0.45)";
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

  /* ── Asse centro ────────────────────────────────────────── */
  ctx.strokeStyle = "rgba(148,163,184,0.25)";
  ctx.setLineDash([8, 4, 2, 4]);
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - Rext - 20, cy); ctx.lineTo(cx + Rint, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - Rext - 6); ctx.lineTo(cx, cy + Rext + 6); ctx.stroke();
  ctx.setLineDash([]);

  /* ── Quote ───────────────────────────────────────────────── */
  ctx.font      = "bold 12px 'Orbitron', system-ui";
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";

  _enDblArrow(cx - Rext, cy - Rext - 13, cx + Rext, cy - Rext - 13, enGlow, 1.5);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(`OD: ${OD} mm`, cx, cy - Rext - 23);

  _enDblArrow(cx - Rint, cy + Rext + 18, cx + Rint, cy + Rext + 18, enGlow, 1.5);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(`ID: ${ID} mm`, cx, cy + Rext + 34);

  const tColor = "#fb923c";
  _enDblArrow(cx + Rint + 4, cy, cx + Rext - 4, cy, tColor, 2);
  ctx.fillStyle  = tColor;
  ctx.textAlign  = "left";
  ctx.font       = "bold 11px 'Orbitron', system-ui";
  ctx.fillText(`t: ${t} mm`, cx + Rext + 14, cy + 4);
}

function _enDblArrow(x1, y1, x2, y2, color, width) {
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
