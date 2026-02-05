// ORA DIGITALE
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// MENU A TENDINA
document.querySelectorAll(".menu-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    toggle.parentElement.classList.toggle("open");
  });
});


