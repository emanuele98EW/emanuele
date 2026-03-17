// ==============================
// PAGE TRANSITIONS (Fade In)
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
});

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
// MENU A TENDINA (toggle) E HAMBURGER MENU
// ==============================
document.querySelectorAll(".menu-toggle").forEach(toggle => {
  toggle.addEventListener("click", (e) => {
    // Chiudi gli altri
    document.querySelectorAll('.menu-group').forEach(group => {
      if (group !== toggle.parentElement) {
        group.classList.remove('open');
      }
    });
    toggle.parentElement.classList.toggle("open");
    e.stopPropagation();
  });
});

// Hamburger Menu Logic
const hamburgerBtn = document.getElementById('hamburger-menu');
const mainMenu = document.getElementById('main-menu');

if (hamburgerBtn && mainMenu) {
  hamburgerBtn.addEventListener('click', (e) => {
    hamburgerBtn.classList.toggle('open');
    mainMenu.classList.toggle('open');
    e.stopPropagation();
  });
}

// Chiudi cliccando fuori
document.addEventListener('click', (e) => {
  // Chiudi i sottomenu
  document.querySelectorAll('.menu-group').forEach(group => {
    group.classList.remove('open');
  });

  // Chiudi l'hamburger menu se si clicca fuori
  if (mainMenu && mainMenu.classList.contains('open') && !mainMenu.contains(e.target) && hamburgerBtn && !hamburgerBtn.contains(e.target)) {
    hamburgerBtn.classList.remove('open');
    mainMenu.classList.remove('open');
  }
});

// ==============================
// 3D MOUSE EFFECT SUL LOGO CENTRALE
// ==============================
const heroContainer = document.getElementById('hero-container');
const heroLogo = document.getElementById('hero-logo');

if (heroContainer && heroLogo) {
  document.addEventListener('mousemove', (e) => {
    let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    let yAxis = (window.innerHeight / 2 - e.pageY) / 25;

    // Use regular string concatenation for the strings that break AST
    heroLogo.style.transform = 'rotateY(' + xAxis + 'deg) rotateX(' + yAxis + 'deg)';
    heroLogo.style.filter = 'drop-shadow(' + xAxis + 'px ' + yAxis + 'px 20px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 150, 255, 0.4))';
  });

  document.addEventListener('mouseleave', () => {
    heroLogo.style.transform = 'rotateY(0deg) rotateX(10deg)';
    heroLogo.style.filter = 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 150, 255, 0.4))';
  });
}

// ==============================
// THEME & DAY/NIGHT TOGGLE
// ==============================
const BOLOGNA_LAT = 44.4949;
const BOLOGNA_LON = 11.3426;

async function getThemeData() {
  const cachedData = localStorage.getItem("themeData");
  const today = new Date().toISOString().split("T")[0];

  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    if (parsed.date === today) {
      return parsed;
    }
  }

  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + BOLOGNA_LAT + "&longitude=" + BOLOGNA_LON + "&daily=sunrise,sunset&timezone=Europe%2FRome";
    const response = await fetch(url);
    const data = await response.json();

    // We expect ISO strings like "2026-03-04T06:45"
    const sunrise = new Date(data.daily.sunrise[0]).getTime();
    const sunset = new Date(data.daily.sunset[0]).getTime();

    const themeData = { date: today, sunrise, sunset };
    localStorage.setItem("themeData", JSON.stringify(themeData));
    return themeData;
  } catch (error) {
    console.warn("Failed to fetch sunset/sunrise times. Using default hours.", error);
    // Fallback: 07:00 to 19:00 current local time
    const now = new Date();
    const sr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0).getTime();
    const ss = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0).getTime();
    return { date: today, sunrise: sr, sunset: ss };
  }
}

function updateThemeVideoFrame(isLightMode) {
  const themeVideo = document.getElementById("theme-video");
  if (!themeVideo) return;

  const duration = themeVideo.duration || 1;
  const nightTime = duration / 2; // Il video e' un loop completo. 

  const fps = 30;
  const step = (duration / 2) / fps;
  let current = themeVideo.currentTime;

  if (themeVideo.scrubInterval) clearInterval(themeVideo.scrubInterval);

  themeVideo.scrubInterval = setInterval(() => {
    if (isLightMode) {
      // Light Mode (Day) = Pallino a Destra (Meta video / 50%)
      current += step;
      if (current >= nightTime) {
        themeVideo.currentTime = nightTime;
        clearInterval(themeVideo.scrubInterval);
      } else {
        themeVideo.currentTime = current;
      }
    } else {
      // Dark Mode (Night) = Pallino a Sinistra (0s)
      current -= step;
      if (current <= 0) {
        themeVideo.currentTime = 0;
        clearInterval(themeVideo.scrubInterval);
      } else {
        themeVideo.currentTime = current;
      }
    }
  }, 1000 / fps);
}

function applyTheme(isLightMode, animateVideo = false) {
  if (isLightMode) {
    document.documentElement.classList.add("light-mode");
    document.body.classList.add("light-mode");
  } else {
    document.documentElement.classList.remove("light-mode");
    document.body.classList.remove("light-mode");
  }

  const themeVideo = document.getElementById("theme-video");
  if (themeVideo) {
    const nightTime = (themeVideo.duration || 1) / 2;

    if (animateVideo) {
      updateThemeVideoFrame(isLightMode);
    } else {
      // Snap immediately to correct frame
      if (themeVideo.readyState >= 1) {
        themeVideo.currentTime = isLightMode ? nightTime : 0;
      } else {
        themeVideo.addEventListener("loadedmetadata", () => {
          themeVideo.currentTime = isLightMode ? (themeVideo.duration / 2) : 0;
        }, { once: true });
      }
    }
  }
}

async function initTheme() {
  const manualPreference = localStorage.getItem("themePref"); // "light" or "dark"
  let isLightMode = false;

  if (manualPreference) {
    isLightMode = manualPreference === "light";
  } else {
    const { sunrise, sunset } = await getThemeData();
    const now = Date.now();
    isLightMode = now >= sunrise && now < sunset;
  }

  applyTheme(isLightMode, false); // Snap on initial load

  // Bind click event
  // Important: We attach event to Document to handle dynamically inserted toggles or ensure we just catch it properly globally
  document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest("#theme-toggle");
    if (!toggleBtn) return;

    isLightMode = !document.body.classList.contains("light-mode");
    localStorage.setItem("themePref", isLightMode ? "light" : "dark");
    applyTheme(isLightMode, true); // Animate on click
  });
}

// Inizializza il tema dopo che il DOM e' pronto
document.addEventListener('DOMContentLoaded', initTheme);
