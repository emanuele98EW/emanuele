function calcola() {

  const C0 = Number(document.getElementById("capitale").value);
  const vers = Number(document.getElementById("versamento").value);
  const r = Number(document.getElementById("tasso").value) / 100;
  const n = Number(document.getElementById("anni").value);

  let capitale = C0;
  let dati = [capitale];

  for (let i = 1; i <= n; i++) {
    capitale = capitale * (1 + r) + vers;
    dati.push(capitale);
  }

  const totaleVersato = C0 + vers * n;
  const interessi = capitale - totaleVersato;

  document.getElementById("finale").innerText =
    capitale.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

  document.getElementById("interessi").innerText =
    interessi.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

  // --- MILESTONE CALCULATION ---
  const goals = [100000, 1000000];
  const goalIds = ["anni100k", "anni1M"];
  const goalLabels = ["100.000 €", "1.000.000 €"];

  goals.forEach((goal, idx) => {
    // If we already start above the goal
    if (C0 >= goal) {
      document.getElementById(goalIds[idx]).innerText = "Hai già raggiunto questo obiettivo! 🎯";
      return;
    }
    // If rate is 0 and versamento is 0, growth is impossible
    if (r === 0 && vers === 0) {
      document.getElementById(goalIds[idx]).innerText = "Impossibile (tasso 0% e nessun versamento)";
      return;
    }

    let cap = C0;
    let year = 0;
    const MAX_YEARS = 10000;
    while (cap < goal && year < MAX_YEARS) {
      cap = cap * (1 + r) + vers;
      year++;
    }

    if (cap >= goal) {
      document.getElementById(goalIds[idx]).innerText =
        year === 1 ? "1 anno" : year + " anni";
    } else {
      document.getElementById(goalIds[idx]).innerText =
        "Non raggiungibile con i parametri attuali";
    }
  });

  disegnaGrafico(dati);
}

let chart;

function disegnaGrafico(dati) {

  const ctx = document.getElementById("grafico");
  const isLight = document.body.classList.contains('light-mode');

  // Colori adattivi per il tema
  const tickColor = isLight ? '#1e293b' : '#cbd5e1';
  const titleColor = isLight ? '#334155' : '#64748b';
  const gridColor = isLight ? 'rgba(30, 41, 59, 0.12)' : 'rgba(100, 116, 139, 0.1)';
  const pointBg = isLight ? '#ffffff' : '#0f172a';

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dati.map((_, i) => i),
      datasets: [{
        label: "Capitale (€)",
        data: dati,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
        borderWidth: 4,
        tension: 0.3,
        pointBackgroundColor: pointBg,
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#93c5fd",
          bodyColor: "#f8fafc",
          borderColor: "rgba(59, 130, 246, 0.3)",
          borderWidth: 1
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Anni", color: titleColor, font: { weight: 'bold' } },
          grid: { color: gridColor },
          ticks: { color: tickColor, font: { weight: '600' } }
        },
        y: {
          title: { display: true, text: "€", color: titleColor, font: { weight: 'bold' } },
          grid: { color: gridColor },
          ticks: { color: tickColor, font: { weight: '600' } }
        }
      }
    }
  });
}
