const pipeData = {
  "DN 6": {
    NPS: "1/8\"",
    OD: 10.3,
    schedules: {
      "SCH 40": { t: 1.73, kgm: 0.357 },
      "SCH 80": { t: 2.41, kgm: 0.462 }
    }
  },
  "DN 8": {
    NPS: "1/4\"",
    OD: 13.7,
    schedules: {
      "SCH 40": { t: 2.24, kgm: 0.626 },
      "SCH 80": { t: 3.02, kgm: 0.804 }
    }
  },
  "DN 10": {
    NPS: "3/8\"",
    OD: 17.1,
    schedules: {
      "SCH 40": { t: 2.31, kgm: 0.849 },
      "SCH 80": { t: 3.20, kgm: 1.100 }
    }
  },
  "DN 15": {
    NPS: "1/2\"",
    OD: 21.3,
    schedules: {
      "SCH 40": { t: 2.77, kgm: 1.270 },
      "SCH 80": { t: 3.73, kgm: 1.620 },
      "SCH 160": { t: 4.78, kgm: 1.950 }
    }
  },
  "DN 20": {
    NPS: "3/4\"",
    OD: 26.7,
    schedules: {
      "SCH 40": { t: 2.87, kgm: 1.680 },
      "SCH 80": { t: 3.91, kgm: 2.190 },
      "SCH 160": { t: 5.56, kgm: 2.890 }
    }
  },
  "DN 25": {
    NPS: "1\"",
    OD: 33.4,
    schedules: {
      "SCH 40": { t: 3.38, kgm: 2.500 },
      "SCH 80": { t: 4.55, kgm: 3.230 },
      "SCH 160": { t: 6.35, kgm: 4.230 }
    }
  },
  "DN 32": {
    NPS: "1 1/4\"",
    OD: 42.2,
    schedules: {
      "SCH 40": { t: 3.56, kgm: 3.380 },
      "SCH 80": { t: 4.85, kgm: 4.470 },
      "SCH 160": { t: 6.35, kgm: 5.600 }
    }
  },
  "DN 40": {
    NPS: "1 1/2\"",
    OD: 48.3,
    schedules: {
      "SCH 40": { t: 3.68, kgm: 4.050 },
      "SCH 80": { t: 5.08, kgm: 5.410 },
      "SCH 160": { t: 7.14, kgm: 7.240 }
    }
  },
  "DN 50": {
    NPS: "2\"",
    OD: 60.3,
    schedules: {
      "SCH 40": { t: 3.91, kgm: 5.440 },
      "SCH 80": { t: 5.54, kgm: 7.480 },
      "SCH 160": { t: 8.74, kgm: 11.110 },
      "XXS": { t: 11.07, kgm: 13.450 }
    }
  },
  "DN 65": {
    NPS: "2 1/2\"",
    OD: 73.0,
    schedules: {
      "SCH 40": { t: 5.16, kgm: 8.620 },
      "SCH 80": { t: 7.01, kgm: 11.410 },
      "SCH 160": { t: 9.52, kgm: 14.910 },
      "XXS": { t: 14.02, kgm: 20.410 }
    }
  },
  "DN 80": {
    NPS: "3\"",
    OD: 88.9,
    schedules: {
      "SCH 40": { t: 5.49, kgm: 11.290 },
      "SCH 80": { t: 7.62, kgm: 15.270 },
      "SCH 160": { t: 11.13, kgm: 21.330 },
      "XXS": { t: 15.24, kgm: 27.670 }
    }
  },
  "DN 90": {
    NPS: "3 1/2\"",
    OD: 101.6,
    schedules: {
      "SCH 40": { t: 5.74, kgm: 13.570 },
      "SCH 80": { t: 8.08, kgm: 18.630 }
    }
  },
  "DN 100": {
    NPS: "4\"",
    OD: 114.3,
    schedules: {
      "SCH 40": { t: 6.02, kgm: 16.070 },
      "SCH 80": { t: 8.56, kgm: 22.310 },
      "SCH 120": { t: 11.13, kgm: 28.300 },
      "SCH 160": { t: 13.49, kgm: 33.530 },
      "XXS": { t: 17.12, kgm: 41.020 }
    }
  },
  "DN 125": {
    NPS: "5\"",
    OD: 141.3,
    schedules: {
      "SCH 40": { t: 6.55, kgm: 21.780 },
      "SCH 80": { t: 9.52, kgm: 30.950 },
      "SCH 120": { t: 12.70, kgm: 40.280 },
      "SCH 160": { t: 15.88, kgm: 49.090 },
      "XXS": { t: 19.05, kgm: 57.420 }
    }
  },
  "DN 150": {
    NPS: "6\"",
    OD: 168.3,
    schedules: {
      "SCH 40": { t: 7.11, kgm: 28.260 },
      "SCH 80": { t: 10.97, kgm: 42.560 },
      "SCH 120": { t: 14.27, kgm: 54.200 },
      "SCH 160": { t: 18.26, kgm: 67.550 },
      "XXS": { t: 21.95, kgm: 79.180 }
    }
  },
  "DN 200": {
    NPS: "8\"",
    OD: 219.1,
    schedules: {
      "SCH 20": { t: 6.35, kgm: 33.310 },
      "SCH 30": { t: 7.04, kgm: 36.790 },
      "SCH 40": { t: 8.18, kgm: 42.530 },
      "SCH 60": { t: 10.31, kgm: 53.090 },
      "SCH 80": { t: 12.70, kgm: 64.630 }
    }
  },
  "DN 250": {
    NPS: "10\"",
    OD: 273.0,
    schedules: {
      "SCH 20": { t: 6.35, kgm: 41.770 },
      "SCH 30": { t: 7.80, kgm: 51.000 },
      "SCH 40": { t: 9.27, kgm: 60.290 },
      "SCH 60": { t: 12.70, kgm: 81.540 },
      "SCH 80": { t: 15.09, kgm: 95.970 },
      "SCH 100": { t: 18.26, kgm: 114.740 }
    }
  },
  "DN 300": {
    NPS: "12\"",
    OD: 323.9,
    schedules: {
      "SCH 20": { t: 6.35, kgm: 49.720 },
      "SCH 30": { t: 8.38, kgm: 65.200 },
      "SCH 40": { t: 9.52, kgm: 73.820 },
      "SCH 60": { t: 14.27, kgm: 108.960 },
      "SCH 80": { t: 17.48, kgm: 132.010 },
      "XS": { t: 12.70, kgm: 97.440 }
    }
  },
  "DN 350": {
    NPS: "14\"",
    OD: 355.6,
    schedules: {
      "SCH 10": { t: 5.33, kgm: 46.070 },
      "SCH 20": { t: 7.92, kgm: 67.940 },
      "SCH 30": { t: 9.52, kgm: 81.280 },
      "SCH 60": { t: 15.09, kgm: 126.680 },
      "SCH 79": { t: 19.05, kgm: 158.080 },
      "SCH 100": { t: 23.83, kgm: 194.900 },
      "XS": { t: 12.70, kgm: 107.380 }
    }
  },
  "DN 400": {
    NPS: "16\"",
    OD: 406.4,
    schedules: {
      "SCH 10": { t: 6.35, kgm: 62.630 },
      "SCH 20": { t: 7.92, kgm: 77.860 },
      "SCH 30": { t: 9.52, kgm: 93.210 },
      "SCH 40": { t: 12.70, kgm: 123.290 },
      "SCH 60": { t: 16.66, kgm: 160.120 },
      "SCH 80": { t: 21.44, kgm: 203.480 }
    }
  },
  "DN 450": {
    NPS: "18\"",
    OD: 457.2,
    schedules: {
      "SCH 10": { t: 6.35, kgm: 70.590 },
      "SCH 20": { t: 7.92, kgm: 87.790 },
      "SCH 30": { t: 11.13, kgm: 122.360 },
      "SCH 40": { t: 14.27, kgm: 155.910 },
      "SCH 60": { t: 19.05, kgm: 205.800 },
      "SCH 80": { t: 23.83, kgm: 254.590 },
      "STD": { t: 9.52, kgm: 105.140 },
      "XS": { t: 12.70, kgm: 139.190 }
    }
  },
  "DN 500": {
    NPS: "20\"",
    OD: 508.0,
    schedules: {
      "SCH 10": { t: 6.35, kgm: 78.540 },
      "SCH 20": { t: 9.52, kgm: 117.070 },
      "SCH 30": { t: 12.70, kgm: 155.100 },
      "SCH 40": { t: 15.09, kgm: 183.370 },
      "SCH 60": { t: 20.62, kgm: 247.850 },
      "SCH 80": { t: 26.19, kgm: 311.110 }
    }
  },
  "DN 550": {
    NPS: "22\"",
    OD: 558.8,
    schedules: {
      "SCH 10": { t: 6.35, kgm: 86.500 },
      "SCH 20": { t: 9.52, kgm: 129.010 },
      "SCH 30": { t: 12.70, kgm: 171.010 },
      "SCH 60": { t: 22.22, kgm: 294.040 }
    }
  },
  "DN 600": {
    NPS: "24\"",
    OD: 609.6,
    schedules: {
      "SCH 10": { t: 6.35, kgm: 94.450 },
      "SCH 20": { t: 9.52, kgm: 140.940 },
      "SCH 30": { t: 14.27, kgm: 209.540 },
      "SCH 40": { t: 17.48, kgm: 255.140 },
      "SCH 60": { t: 24.61, kgm: 355.020 },
      "XS": { t: 12.70, kgm: 186.920 }
    }
  },
  "DN 650": {
    NPS: "26\"",
    OD: 660.4,
    schedules: {
      "SCH 10": { t: 7.92, kgm: 127.500 },
      "SCH 20": { t: 12.70, kgm: 202.830 },
      "STD": { t: 9.52, kgm: 152.870 }
    }
  },
  "DN 700": {
    NPS: "28\"",
    OD: 711.2,
    schedules: {
      "SCH 10": { t: 7.92, kgm: 137.420 },
      "SCH 20": { t: 12.70, kgm: 218.730 },
      "SCH 30": { t: 15.88, kgm: 272.180 },
      "STD": { t: 9.52, kgm: 164.800 }
    }
  },
  "DN 750": {
    NPS: "30\"",
    OD: 762.0,
    schedules: {
      "SCH 10": { t: 7.92, kgm: 147.360 },
      "SCH 20": { t: 12.70, kgm: 234.640 },
      "SCH 30": { t: 15.88, kgm: 292.060 },
      "STD": { t: 9.52, kgm: 176.730 }
    }
  },
  "DN 800": {
    NPS: "32\"",
    OD: 812.8,
    schedules: {
      "SCH 10": { t: 7.92, kgm: 157.280 },
      "SCH 20": { t: 12.70, kgm: 250.550 },
      "SCH 30": { t: 15.88, kgm: 311.950 },
      "SCH 40": { t: 17.48, kgm: 342.700 },
      "STD": { t: 9.52, kgm: 188.660 }
    }
  },
  "DN 850": {
    NPS: "34\"",
    OD: 863.5,
    schedules: {
      "SCH 10": { t: 8.74, kgm: 184.180 },
      "SCH 20": { t: 12.70, kgm: 266.460 },
      "SCH 30": { t: 15.88, kgm: 331.830 },
      "SCH 40": { t: 17.48, kgm: 364.580 },
      "STD": { t: 9.52, kgm: 200.590 }
    }
  },
  "DN 900": {
    NPS: "36\"",
    OD: 914.4,
    schedules: {
      "SCH 10": { t: 7.92, kgm: 177.130 },
      "SCH 20": { t: 12.70, kgm: 282.360 },
      "SCH 30": { t: 15.88, kgm: 351.720 },
      "SCH 40": { t: 19.05, kgm: 420.560 },
      "STD": { t: 9.52, kgm: 212.520 }
    }
  }
};

// Export per uso in Node.js o come modulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pipeData;
}

function initPipeTool() {
  const dnSelect = document.getElementById("dnSelect");
  const schSelect = document.getElementById("schSelect");

  Object.keys(pipeData).forEach(dn => {
    const opt = document.createElement("option");
    opt.value = dn;
    opt.textContent = dn;
    dnSelect.appendChild(opt);
  });

  dnSelect.addEventListener("change", () => {
    schSelect.innerHTML = '<option value="">-- Seleziona Schedule --</option>';
    clearValues();

    const dn = dnSelect.value;
    if (!dn) return;

    Object.keys(pipeData[dn].schedules).forEach(sch => {
      const opt = document.createElement("option");
      opt.value = sch;
      opt.textContent = sch;
      schSelect.appendChild(opt);
    });
  });

  schSelect.addEventListener("change", updateValues);
}

function updateValues() {
  const dn = dnSelect.value;
  const sch = schSelect.value;
  if (!dn || !sch) return;

  const OD = pipeData[dn].OD;
  const t = pipeData[dn].schedules[sch].t;
  const ID = (OD - 2 * t).toFixed(2);
  const kgm = pipeData[dn].schedules[sch].kgm;

  od.textContent = `${OD} mm`;
  id.textContent = `${ID} mm`;
  thk.textContent = `${t} mm`;
  kgmSpan.textContent = `${kgm} kg/m`;

  drawPipe(OD, ID, t);
}

function clearValues() {
  od.textContent = id.textContent = thk.textContent = kgmSpan.textContent = "–";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* ================================
   DISEGNO
   ================================ */

function drawPipe(OD, ID, t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const Rext = 80;
  const Rint = 55;

  // foro interno bluastro scuro
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2);
  ctx.fill();

  // corona azzurra traslucida
  ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
  ctx.beginPath();
  ctx.arc(cx, cy, Rext, 0, Math.PI * 2);
  ctx.arc(cx, cy, Rint, 0, Math.PI * 2, true);
  ctx.fill();

  // contorni luminosi
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(cx, cy, Rext, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, Rint, 0, Math.PI * 2); ctx.stroke();

  // reset shadow
  ctx.shadowBlur = 0;

  // ===== LINEE DI RICHIAMO CAD (extension / witness lines) =====
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
  ctx.lineWidth = 0.8;

  // Extension lines OD
  ctx.beginPath();
  ctx.moveTo(cx - Rext, cy);
  ctx.lineTo(cx - Rext, cy - Rext - 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + Rext, cy);
  ctx.lineTo(cx + Rext, cy - Rext - 16);
  ctx.stroke();

  // Extension lines ID
  ctx.beginPath();
  ctx.moveTo(cx - Rint, cy);
  ctx.lineTo(cx - Rint, cy + Rext + 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + Rint, cy);
  ctx.lineTo(cx + Rint, cy + Rext + 20);
  ctx.stroke();

  // Extension lines spessore
  ctx.beginPath();
  ctx.moveTo(cx + Rint, cy + 10);
  ctx.lineTo(cx + Rint, cy - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + Rext, cy + 10);
  ctx.lineTo(cx + Rext, cy - 10);
  ctx.stroke();

  // Linea d'asse centrale tratteggiata (stile CAD classico)
  ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
  ctx.setLineDash([8, 4, 2, 4]);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - Rext - 20, cy);
  ctx.lineTo(cx + Rint, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - Rext - 5);
  ctx.lineTo(cx, cy + Rext + 5);
  ctx.stroke();

  ctx.setLineDash([]);
  // ===== FINE LINEE CAD =====

  ctx.font = "bold 13px system-ui";
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";

  // OD
  drawDoubleArrow(cx - Rext, cy - Rext - 12, cx + Rext, cy - Rext - 12, "#38bdf8", 1.5);
  ctx.fillText(`OD: ${OD} mm`, cx, cy - Rext - 22);

  // ID
  drawDoubleArrow(cx - Rint, cy + Rext + 16, cx + Rint, cy + Rext + 16, "#38bdf8", 1.5);
  ctx.fillText(`ID: ${ID} mm`, cx, cy + Rext + 32);

  // spessore
  drawDoubleArrow(cx + Rint + 4, cy, cx + Rext - 4, cy, "#f43f5e", 2);
  ctx.fillStyle = "#f43f5e";
  ctx.textAlign = "left";
  ctx.fillText(`t: ${t} mm`, cx + Rext + 18, cy + 4);
}

function drawDoubleArrow(x1, y1, x2, y2, color = "#e2e8f0", width = 1) {
  const head = 6;
  const ang = Math.atan2(y2 - y1, x2 - x1);

  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.shadowColor = color;
  ctx.shadowBlur = 5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  [x1, x2].forEach((x, i) => {
    const y = i === 0 ? y1 : y2;
    const dir = i === 0 ? 1 : -1;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + dir * head * Math.cos(ang - Math.PI / 6),
      y + dir * head * Math.sin(ang - Math.PI / 6)
    );
    ctx.lineTo(
      x + dir * head * Math.cos(ang + Math.PI / 6),
      y + dir * head * Math.sin(ang + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.shadowBlur = 0;
}
