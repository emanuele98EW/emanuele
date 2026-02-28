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

  disegnaGrafico(dati);
}

let chart;

function disegnaGrafico(dati) {

  const ctx = document.getElementById("grafico");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dati.map((_, i) => i),
      datasets: [{
        label: "Capitale (€)",
        data: dati,
        borderColor: "#0ff",
        backgroundColor: "rgba(0, 255, 255, 0.1)",
        borderWidth: 3,
        tension: 0.3,
        pointBackgroundColor: "#050814",
        pointBorderColor: "#0ff",
        pointBorderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(2, 6, 23, 0.9)",
          titleColor: "#0ff",
          bodyColor: "#e0f7fa",
          borderColor: "rgba(0, 255, 255, 0.3)",
          borderWidth: 1
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Anni", color: "#a5f3fc" },
          grid: { color: "rgba(0, 255, 255, 0.1)" },
          ticks: { color: "#94a3b8" }
        },
        y: {
          title: { display: true, text: "€", color: "#a5f3fc" },
          grid: { color: "rgba(0, 255, 255, 0.1)" },
          ticks: { color: "#94a3b8" }
        }
      }
    }
  });
}
