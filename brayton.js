function calcola() {
  const T1 = Number(document.getElementById("T1").value);
  const beta = Number(document.getElementById("beta").value);
  const k = 1.4;

  const T2s = T1 * Math.pow(beta, (k - 1) / k);

  document.getElementById("output").innerText =
    `T2s = ${T2s.toFixed(1)} K`;
}
