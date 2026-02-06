document.querySelectorAll(".menu-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const group = toggle.parentElement;
    group.classList.toggle("open");
  });
});

// Orologio (opzionale)
function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();
  clock.textContent = now.toLocaleTimeString("it-IT");
}
setInterval(updateClock, 1000);
updateClock();


