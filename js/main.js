// ==============================
// ORA DIGITALE
// ==============================
function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;

  const now = new Date();
  el.textContent = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

setInterval(updateClock, 1000);
updateClock();


// ==============================
// MENU A TENDINA (toggle)
// ==============================
document.querySelectorAll(".menu-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    toggle.parentElement.classList.toggle("open");
  });
});


// Pagina attiva e menu aperto sono impostati in HTML in ogni index (sidebar)