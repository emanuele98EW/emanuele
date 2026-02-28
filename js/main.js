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
  toggle.addEventListener("click", (e) => {
    // Chiudi gli altri
    document.querySelectorAll('.menu-group').forEach(group => {
      if(group !== toggle.parentElement) {
        group.classList.remove('open');
      }
    });
    toggle.parentElement.classList.toggle("open");
    e.stopPropagation();
  });
});

// Chiudi cliccando fuori
document.addEventListener('click', () => {
  document.querySelectorAll('.menu-group').forEach(group => {
    group.classList.remove('open');
  });
});

// ==============================
// 3D MOUSE EFFECT SUL LOGO CENTRALE
// ==============================
const heroContainer = document.getElementById('hero-container');
const heroLogo = document.getElementById('hero-logo');

if(heroContainer && heroLogo) {
  // Disabilita l'animazione CSS continua se vogliamo l'effetto on-hover interattivo
  // heroLogo.style.animation = 'none'; // Opzionale: scommenta per fermare la rotazione CSS

  document.addEventListener('mousemove', (e) => {
    let xAxis = (window.innerWidth / 2 - e.pageX) / 25; // aggiusta la sensibilità
    let yAxis = (window.innerHeight / 2 - e.pageY) / 25;

    // Aggiungi la rotazione calcolata dal mouse (e mantieni un po' di rotazione automatica se vuoi combinare le cose)
    // Tweakiamo il drop shadow in base alla posizione
    heroLogo.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    heroLogo.style.filter = `drop-shadow(${xAxis}px ${yAxis}px 20px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 150, 255, 0.4))`;
  });

  // Al mouseleave torna in posizione
  document.addEventListener('mouseleave', () => {
    heroLogo.style.transform = `rotateY(0deg) rotateX(10deg)`; // Reset vicino alla keyframe 0%
    heroLogo.style.filter = `drop-shadow(0 0 20px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 150, 255, 0.4))`;
  });
}