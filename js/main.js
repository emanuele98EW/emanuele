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

// ==============================
// GLOBAL WOW EFFECTS INJECTION
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Ambient Background Orbs
  const ambientDiv = document.createElement('div');
  ambientDiv.className = 'ambient-bg';
  ambientDiv.innerHTML = `
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  `;
  document.body.prepend(ambientDiv);

  // 2. Custom Hover Magnetic Cursor
  // Abilitiamo il cursore solo sui PC fisici veri (non su telefoni o tablet touch)
  if (window.matchMedia("(pointer: fine)").matches) {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.className = 'custom-cursor';
    cursor.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 2 L2 20 L7 15 L17 12 Z" /></svg>`;

    const follower = document.createElement('div');
    follower.id = 'cursor-follower';
    follower.className = 'cursor-follower';

    // Nascondiamo il cursore prima del primissimo movimento
    cursor.style.opacity = '0';
    follower.style.opacity = '0';

    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let isInitialized = false;
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener('mousemove', (e) => {
      if (!isInitialized) {
        // Al primo movimento: attiviamo il css globale che scarta il true cursore e mostriamo il render
        document.body.classList.add('has-custom-cursor');
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
        followerX = e.clientX;
        followerY = e.clientY;
        isInitialized = true;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Il punto centrale segue esattamente il mouse istantaneamente (senza ritardo, per mantenere precisione)
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    // Anello inseguitore con ritardo (Easing/Spring physics)
    function render() {
      if (isInitialized) {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Gestione Over / Hover su elementi cliccabili tramite Event Delegation
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .fin-tab, .nav-card, .menu-link, .menu-toggle, .theme-toggle-btn, input, select')) {
        cursor.classList.add('active');
        follower.classList.add('active');
      } else {
        cursor.classList.remove('active');
        follower.classList.remove('active');
      }
    });
  }

  // 3. Magnetic Hover Buttons (Fisica stile iPad OS)
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // La calamita sposta il bottone verso il mouse di una frazione della distanza
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      if (btn.children.length > 0) {
        for (let i = 0; i < btn.children.length; i++) {
          btn.children[i].style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`; // Parallasse interno
          btn.children[i].style.transition = 'none';
        }
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Rimbalzo elastico
      if (btn.children.length > 0) {
        for (let i = 0; i < btn.children.length; i++) {
          btn.children[i].style.transform = '';
          btn.children[i].style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }
      }
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s linear';
      if (btn.children.length > 0) {
        for (let i = 0; i < btn.children.length; i++) {
          btn.children[i].style.transition = 'transform 0.1s linear';
        }
      }
    });
  });
});


// ── Funzione Globale di Parsing per i Tool Finanziari ────────────────
window.parseItaNumber = function(valString) {
  if (typeof valString === 'number') return valString;
  if (!valString) return 0;
  // Rimuove i punti e tutti i tipi di spazi (inclusi no-break space standard V8)
  let cleanString = valString.replace(/[\.\s\u202F\u00A0]/g, '');
  // Converte la virgola in punto
  cleanString = cleanString.replace(',', '.');
  const num = parseFloat(cleanString);
  return isNaN(num) ? 0 : num;
};

// Formattazione in tempo reale usando la delegazione eventi per supportare input dinamici
// Formattazione in tempo reale usando la delegazione eventi per supportare input dinamici
document.addEventListener('input', function(e) {
  if (e.target.classList.contains('format-currency')) {
    let raw = e.target.value.replace(/[^0-9,]/g, '');
    let parts = raw.split(',');
    
    // Formatta solo la parte intera
    if (parts[0]) {
      parts[0] = parseInt(parts[0], 10).toLocaleString('it-IT');
    }
    
    // Ricompone con i decimali
    e.target.value = parts.join(',');
  }
});

// ==========================================
// DYNAMIC SECTION BACKGROUNDS (VANTA JS)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.toLowerCase();
  let vantaType = null;
  
  if (path.includes('/finanza')) {
    vantaType = 'finance_chart';
  } else if (path.includes('/engineering') || path.includes('/termodinamica') || path.includes('/termotecnica') || path.includes('/piping') || path.includes('/dimensionamenti') || path.includes('/energia') || path.includes('/fluidodinamica')) {
    vantaType = 'engineering_city';
  }

  // Se la pagina ha un'animazione nativa hardcoded, ignora
  if (vantaType && !document.getElementById('vanta-bg') && !document.getElementById('ambient-particles')) {
    
    // Assicurarsi che '.layout' stia sopra
    const layoutWrapper = document.querySelector('.layout');
    if (layoutWrapper) {
      layoutWrapper.style.position = 'relative';
      layoutWrapper.style.zIndex = '1';
    }

    // Disabilita Glassmorphism e aumenta opacita' card per migliorare la leggibilita'
    const styleOverride = document.createElement("style");
    styleOverride.innerHTML = `
       .card:not(.is-fullscreen):not(#grafico-section), .nav-card, .widget-card, .formula-wrapper, .fin-tab, 
       .dim-list, .accordion-list, .search-wrap .search-box, .search-results,
       .tool-panel, .results-panel, .result-card, .note-block {
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          background: rgba(17, 24, 39, 0.92) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
       }
       /* Chart sections: solid bg, NO blur (prevents canvas rasterization) */
       #grafico-section, .card.is-fullscreen {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          background: rgba(17, 24, 39, 0.96) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
       }
       html.light-mode .card:not(.is-fullscreen):not(#grafico-section), html.light-mode .nav-card, html.light-mode .widget-card, html.light-mode .formula-wrapper, html.light-mode .fin-tab,
       html.light-mode .dim-list, html.light-mode .accordion-list, html.light-mode .search-wrap .search-box, html.light-mode .search-results,
       html.light-mode .tool-panel, html.light-mode .results-panel, html.light-mode .result-card, html.light-mode .note-block {
          background: rgba(255, 255, 255, 0.94) !important;
          box-shadow: 0 10px 30px rgba(44, 62, 80, 0.1) !important;
       }
       html.light-mode #grafico-section, html.light-mode .card.is-fullscreen {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          background: rgba(255, 255, 255, 0.98) !important;
          box-shadow: 0 10px 30px rgba(44, 62, 80, 0.1) !important;
       }
    `;
    document.head.appendChild(styleOverride);

    const vD = document.createElement('div');
    vD.id = 'vanta-bg';
    vD.style.cssText = 'position: fixed; z-index: 0; inset: 0; pointer-events: none; opacity: 0; transition: opacity 1.5s ease;';
    document.body.prepend(vD);

    setTimeout(() => {
      if (!document.body.contains(vD)) return;
      if (vantaType === 'finance_chart') {
        initFinanceChart(vD);
        // Ritardo leggero per permettere il rendering prima del fade-in
        setTimeout(() => vD.style.opacity = '0.9', 50);
      } else if (vantaType === 'engineering_city') {
        initEngineeringCity(vD);
        setTimeout(() => vD.style.opacity = '0.9', 50);
      }
    }, 5000); // Carica dopo 5 secondi esatti
  }
});

function loadScript(src, callback) {
  const s = document.createElement('script');
  s.src = src;
  s.onload = callback;
  document.body.appendChild(s);
}

function initFinanceChart(container) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let w, h;
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const numPoints = 22;
    const points = [];
    for(let i=0; i<numPoints; i++) {
        points.push({
            offset: (Math.random() - 0.5) * 0.25,
            phase: Math.random() * Math.PI * 2,
            speed: 0.003 + Math.random() * 0.006 // Velocità molto morbida e rilassata
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        const lMode = document.documentElement.classList.contains('light-mode');
        
        // Colori tenui che ricordano un grafico finanziario high-tech
        const rgbBase = lMode ? '40, 114, 161' : '16, 185, 129';
        
        const lineColor = `rgba(${rgbBase}, 0.45)`;
        const fillColorTop = `rgba(${rgbBase}, 0.12)`;
        const fillColorBot = `rgba(${rgbBase}, 0.0)`;
        const stemColor = `rgba(${rgbBase}, 0.08)`;
        const dotColor = `rgba(${rgbBase}, 0.8)`;
        const shadowColor = `rgba(${rgbBase}, 0.3)`;

        const stepX = w / (numPoints - 1);
        const screenPoints = [];
        
        for(let i = 0; i < numPoints; i++) {
            const p = points[i];
            const prog = i / (numPoints - 1);
            const trend = Math.pow(prog, 1.4); // Salita morbida verso destra
            
            p.phase += p.speed;
            const wave = Math.sin(p.phase) * 0.12; 
            
            let val = trend + p.offset + wave;
            if (val < 0) val = 0.05;
            if (val > 1) val = 0.95;
            
            const yMax = h * 0.85; 
            const yMin = h * 0.25; 
            
            const py = yMax - val * (yMax - yMin);
            screenPoints.push({ x: i * stepX, y: py });
        }

        // Fill background area
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(screenPoints[0].x, screenPoints[0].y);
        for(let i=1; i<numPoints; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, fillColorTop);
        grad.addColorStop(1, fillColorBot);
        ctx.fillStyle = grad;
        ctx.fill();

        // Vertical Stems
        ctx.lineWidth = 1;
        ctx.strokeStyle = stemColor;
        ctx.beginPath();
        screenPoints.forEach(p => { 
            ctx.moveTo(p.x, p.y); 
            ctx.lineTo(p.x, h); 
        });
        ctx.stroke();

        // Trend Line
        ctx.beginPath();
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        for(let i=1; i<numPoints; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = shadowColor;
        ctx.stroke();

        // Glowing Dots
        ctx.fillStyle = dotColor;
        ctx.shadowBlur = 5;
        screenPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;
        requestAnimationFrame(draw);
    }
    draw();
}

function initEngineeringCity(container) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let w, h;
    let structures = [];

    function createBuilding(bh, bw, speed) {
        let lines = [];
        let dots = [];
        let yTop = h - bh;
        lines.push({x1: 0, y1: h, x2: 0, y2: yTop});
        lines.push({x1: 0, y1: yTop, x2: bw, y2: yTop});
        lines.push({x1: bw, y1: yTop, x2: bw, y2: h});
        dots.push({x: 0, y: yTop});
        dots.push({x: bw, y: yTop});
        
        let floors = Math.floor(bh / 24);
        let bays = Math.floor(bw / 24) || 1;
        let floorH = bh / floors;
        let bayW = bw / bays;
        
        for(let i=0; i<floors; i++) {
           let y1 = h - i*floorH;
           let y2 = h - (i+1)*floorH;
           for(let j=0; j<bays; j++) {
               let x1 = j*bayW;
               let x2 = (j+1)*bayW;
               lines.push({x1: x1, y1: y2, x2: x2, y2: y2});
               if(Math.random() > 0.4) lines.push({x1: x1, y1: y1, x2: x2, y2: y2});
               else if (Math.random() > 0.6) lines.push({x1: x2, y1: y1, x2: x1, y2: y2});
               if(Math.random() > 0.7) dots.push({x: x1, y: y2});
           }
        }
        return {lines, dots, speed, w: bw};
    }

    function createCrane(ch, speed) {
        let lines = [];
        let dots = [];
        let yTop = h - ch;
        let mw = 14; 
        
        lines.push({x1: -mw/2, y1: h, x2: -mw/2, y2: yTop});
        lines.push({x1: mw/2, y1: h, x2: mw/2, y2: yTop});
        for(let y=h; y>yTop; y-=15) lines.push({x1: -mw/2, y1: y, x2: mw/2, y2: y-15});
        
        let jL = 140, jR = 60; 
        lines.push({x1: -jL, y1: yTop, x2: jR, y2: yTop});
        lines.push({x1: -jL, y1: yTop-12, x2: jR, y2: yTop-12});
        dots.push({x: -jL, y: yTop});
        dots.push({x: jR, y: yTop});
        
        for(let x=-jL; x<jR; x+=15) lines.push({x1: x, y1: yTop, x2: x+15, y2: yTop-12});
        
        let pY = yTop - 40;
        lines.push({x1: -mw/2, y1: yTop-12, x2: 0, y2: pY});
        lines.push({x1: mw/2, y1: yTop-12, x2: 0, y2: pY});
        lines.push({x1: 0, y1: pY, x2: -jL*0.8, y2: yTop-12});
        lines.push({x1: 0, y1: pY, x2: jR*0.8, y2: yTop-12});
        
        let hk = -jL*0.6;
        let hy = yTop + 50;
        lines.push({x1: hk, y1: yTop, x2: hk, y2: hy});
        dots.push({x: hk, y: hy});
        
        return {lines, dots, speed, w: jL + jR + 40, rx: jL}; // rx is left offset for positioning
    }

    function buildCity() {
        structures = [];
        let x = -100;
        // Background layer (slower, darker)
        while(x < w + 400) {
            let bw = 50 + Math.random() * 60;
            let extH = h * 0.15 + Math.random() * h * 0.35;
            structures.push({ struct: createBuilding(extH, bw, 0.35), x: x });
            x += bw + Math.random() * 25;
        }
        
        // Foreground layer (faster, brighter)
        x = -50;
        while(x < w + 400) {
            let bw = 80 + Math.random() * 80;
            let extH = h * 0.3 + Math.random() * h * 0.35;
            
            if (Math.random() < 0.25) {
                let crane = createCrane(extH + 120, 1.0);
                structures.push({ struct: crane, x: x + crane.rx });
                x += 40; // Spacing after crane base
            }
            
            structures.push({ struct: createBuilding(extH, bw, 1.0), x: x });
            x += bw + 20 + Math.random() * 40;
        }
    }

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        buildCity();
    }
    window.addEventListener('resize', resize);
    resize();

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, w, h);
        const lMode = document.documentElement.classList.contains('light-mode');
        
        // Colori oro engineering
        const rgbBase = lMode ? '160, 130, 50' : '201, 168, 76';
        const lineGlow = lMode ? 0.08 : 0.12;
        
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        
        t += 1;
        
        structures.forEach(s => {
            // Parallax scroll
            s.x -= 0.15 * s.struct.speed;
            
            // Loop seamlessly
            if (s.x < -s.struct.w - 150) {
                 let maxLayerX = 0;
                 structures.forEach(other => {
                     if (other.struct.speed === s.struct.speed && other.x > maxLayerX) {
                         maxLayerX = other.x + other.struct.w;
                     }
                 });
                 s.x = Math.max(w + 50, maxLayerX + 15 + Math.random() * 30);
            }

            ctx.beginPath();
            s.struct.lines.forEach(l => {
                ctx.moveTo(s.x + l.x1, l.y1);
                ctx.lineTo(s.x + l.x2, l.y2);
            });
            
            // Respirazione luminosa individuale
            let wave = (Math.sin(t * 0.01 + s.x * 0.01) + 1) / 2; 
            let baseAlpha = lMode ? 0.20 : 0.15;
            let alpha = (baseAlpha + wave * 0.2) * s.struct.speed;
            
            ctx.strokeStyle = `rgba(${rgbBase}, ${alpha})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `rgba(${rgbBase}, ${lineGlow})`;
            ctx.stroke();
            
            s.struct.dots.forEach(d => {
                ctx.beginPath();
                ctx.arc(s.x + d.x, d.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgbBase}, ${(0.4 + wave*0.4) * s.struct.speed})`;
                ctx.shadowBlur = 10;
                ctx.fill();
            });
        });
        
        ctx.shadowBlur = 0;
        requestAnimationFrame(draw);
    }
    draw();
}

// ═══════════════════════════════════════════════════════════
// GLOBAL SCROLL REVEAL (Fade-in-up effect)
// ═══════════════════════════════════════════════════════════
const initScrollReveal = () => {
    const revealStyle = document.createElement('style');
    revealStyle.innerHTML = `
        .reveal-hidden {
            opacity: 0;
            transform: translateY(35px);
            transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
            will-change: opacity, transform;
        }
        .reveal-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(revealStyle);

    const revealSelectors = '.card, .tool-panel, .results-panel, .dim-item, .accordion-item, .formula-wrapper, .note-block, .tos-banner, h2, h3, .fin-tab';
    const elements = document.querySelectorAll(revealSelectors);
    
    if(elements.length === 0) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: "0px 0px -20px 0px",
        threshold: 0.05
    });

    const wHeight = window.innerHeight;
    elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top > wHeight - 10) {
            el.classList.add('reveal-hidden');
            // Ritardo a cascata leggerissimo per elementi paralleli
            el.style.transitionDelay = `${(index % 3) * 0.08}s`; 
            revealObserver.observe(el);
        }
    });
};

initScrollReveal();
