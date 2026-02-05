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
        borderWidth: 3,
        tension: 0.25
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: "Anni" } },
        y: { title: { display: true, text: "€" } }
      }
    }
  });
}
