// =============================================
// NAVBAR COMPONENT – Generazione dinamica
// =============================================
(function () {
  const pathname = window.location.pathname.replace(/\\/g, '/');
  const parts = pathname.split('/').filter(p => p.length > 0);
  parts.pop();

  const rootMarkers = ['engineering', 'finanza', 'personale', 'css', 'js', 'assets', 'components'];
  let rootIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (rootMarkers.includes(parts[i].toLowerCase())) { rootIndex = i; break; }
  }

  let depth = rootIndex >= 0 ? parts.length - rootIndex : 0;
  const basePath = depth > 0 ? '../'.repeat(depth) : '';

  const lowerPath = pathname.toLowerCase();
  let activeSection = 'home';
  if (lowerPath.includes('/finanza/'))     activeSection = 'finanza';
  else if (lowerPath.includes('/engineering/')) activeSection = 'engineering';
  else if (lowerPath.includes('/personale/'))   activeSection = 'personale';

  function birdVideo() {
    return `<video autoplay loop muted playsinline class="nav-bird">
              <source src="${basePath}assets/Cute%20Bird%20Flapping%20Animation.webm" type="video/webm">
            </video>`;
  }

  function navItem(section, href, label) {
    const isActive = activeSection === section;
    return isActive
      ? `<a href="${href}" class="menu-link nav-active">${birdVideo()} ${label}</a>`
      : `<a href="${href}" class="menu-link">${label}</a>`;
  }

  function navGroup(section, href, label, links) {
    const isActive = activeSection === section;
    const toggleContent = isActive
      ? `<a href="${href}" class="menu-toggle nav-active">${birdVideo()} ${label} <span class="arrow">▼</span></a>`
      : `<a href="${href}" class="menu-toggle">${label} <span class="arrow">▼</span></a>`;
    const items = links.map(([h, l, cls]) =>
      `<a href="${basePath}${h}" class="menu-link ${cls}">${l}</a>`
    ).join('');
    return `<div class="menu-group">${toggleContent}<div class="menu-content">${items}</div></div>`;
  }

  const homeLink = navItem('home', `${basePath}index.html`, 'HOME');

  const finanzaGroup = navGroup('finanza', `${basePath}finanza/index.html`, 'FINANZA', [
    ['finanza/index.html#pianificazione', 'Pianificazione & Proiezioni', 'finance'],
    ['finanza/index.html#portafoglio', 'Portafoglio & Allocation', 'finance'],
    ['finanza/index.html#credito', 'Credito & Finanziamenti', 'finance'],
    ['finanza/index.html#mercato', 'Analisi di Mercato', 'finance'],
  ]);

  const engineeringGroup = navGroup('engineering', `${basePath}engineering/index.html`, 'INGEGNERIA', [
    ['engineering/appunti/index.html', 'Appunti', 'engineering'],
    ['engineering/tools/index.html', 'Tools', 'engineering'],
  ]);

  const personaleGroup = navGroup('personale', `${basePath}personale/index.html`, 'PERSONALE', [
    ['personale/index.html', 'Chi Sono', 'personal'],
    ['personale/accademico/index.html', 'Percorso Accademico', 'personal'],
    ['personale/progetti/index.html', 'Progetti Personali', 'personal'],
  ]);

  const navbarHTML = `
    <div class="navbar-logo">
      <a href="${basePath}index.html" class="navbar-brand">
        <img src="${basePath}assets/logo.png" alt="Logo" class="navbar-logo-img">
        <div class="navbar-brand-text">
          <span class="navbar-name">EMANUELE ZANELLA</span>
        </div>
      </a>
    </div>

    <nav class="menu" id="main-menu">
      ${homeLink}
      ${finanzaGroup}
      ${engineeringGroup}
      ${personaleGroup}
      <div class="nav-right-group">
        <span id="clock" class="digital-clock"></span>
        <button id="global-fs-btn" class="theme-toggle-btn global-fs-btn" title="Schermo Intero" aria-label="Schermo intero">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--color-engineering, #C9A84C)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px; transition: stroke 0.3s;" class="fs-icon-path">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
        <button id="theme-toggle" class="theme-toggle-btn" title="Cambia Tema" aria-label="Cambia tema">
          <video id="theme-video" muted playsinline class="theme-video">
            <source src="${basePath}assets/theme_moon.svg.webm" type="video/webm">
          </video>
        </button>
      </div>
    </nav>

    <div class="hamburger-menu" id="hamburger-menu" aria-label="Menu" role="button" tabindex="0">
      <span></span><span></span><span></span>
    </div>`;

  const placeholder = document.getElementById('main-navbar');
  if (placeholder) {
    placeholder.className = 'navbar';
    placeholder.innerHTML = navbarHTML;
  }

  // Favicon
  if (!document.querySelector('link[rel="icon"]')) {
    const fav = document.createElement('link');
    fav.rel = 'icon'; fav.type = 'image/png'; fav.sizes = '48x48';
    fav.href = basePath + 'assets/favicon.png';
    document.head.appendChild(fav);
    const fav32 = document.createElement('link');
    fav32.rel = 'icon'; fav32.type = 'image/png'; fav32.sizes = '32x32';
    fav32.href = basePath + 'assets/favicon-32.png';
    document.head.appendChild(fav32);
    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon'; apple.sizes = '180x180';
    apple.href = basePath + 'assets/favicon-180.png';
    document.head.appendChild(apple);
  }

  // Global Fullscreen Logic
  const fsBtn = document.getElementById('global-fs-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Fullscreen err:', err.message);
        });
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });

    // Update only the title when state changes
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        fsBtn.title = 'Esci da Schermo Intero';
      } else {
        fsBtn.title = 'Schermo Intero';
      }
    });
    
    // Light mode hook per mantenere il colore dell'icona
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains('light-mode');
      const icons = fsBtn.querySelectorAll('.fs-icon-path');
      icons.forEach(i => i.setAttribute('stroke', isLight ? '#1B2E6B' : '#C9A84C'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  // Splash Screen Transition Logic for entering "Personale" section
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Seleziona click diretti verso "personale" (e bloccalo solo se NON siamo già dentro 'personale')
    // per non tediare l'utente con il video ad ogni sub-pagina.
    if (activeSection !== 'personale' && href.includes('personale/') && !href.startsWith('#')) {
      e.preventDefault(); // Blocca transizione immediata
      
      let overlay = document.getElementById('splash-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'splash-overlay';
        overlay.className = 'splash-overlay';
        overlay.innerHTML = `
          <video id="splash-video" class="splash-video" playsinline>
            <source src="${basePath}assets/VIDEO1.mp4" type="video/mp4">
          </video>
        `;
        document.body.appendChild(overlay);
      }

      const video = document.getElementById('splash-video');
      video.currentTime = 0; // Reset
      
      // Delay brevissimo per permettere al DOM di renderizzare, poi fa il fade-in
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });

      // Appena l'overlay diventa visibile, fai partire il video
      setTimeout(() => {
        video.play().catch(err => {
          console.warn("Autoplay block (iOS/Safari) o errore:", err);
          window.location.href = href; // Fallback di sicurezza
        });
      }, 300);

      // Naviga appena termina
      video.onended = () => {
        window.location.href = href;
      };

      // Failsafe in caso di video rotto / lunghissimo / click dell'utente per saltare
      let triggered = false;
      const goNext = () => {
        if (!triggered) {
          triggered = true;
          window.location.href = href;
        }
      };
      
      overlay.addEventListener('click', goNext);

      video.addEventListener('loadedmetadata', () => {
        setTimeout(goNext, (video.duration * 1000) + 1500);
      });
      setTimeout(goNext, 8500);
    }
  });

  // ==========================================
  // PWA (Progressive Web App) INITIALIZATION
  // ==========================================
  if (!document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = basePath + 'manifest.json';
    document.head.appendChild(manifest);
  }
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Usa basePath per garantire che punti alla root esatta su GitHub Pages
      navigator.serviceWorker.register(basePath + 'sw.js', { scope: basePath || './' })
        .then(() => console.log('PWA Service Worker registered'))
        .catch(err => console.warn('SW registration failed: ', err));
    });
  }

})();
