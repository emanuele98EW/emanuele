// =============================================
// NAVBAR COMPONENT – Generazione dinamica
// =============================================
// Questo script genera la navbar completa e la inietta
// nel placeholder <header id="main-navbar"></header>.
// Calcola automaticamente i percorsi relativi e
// posiziona l'uccellino animato sulla sezione corretta.

(function () {
  // 1. Calcola il basePath in base alla profondità della pagina
  //    Confronta il pathname con la root del sito.
  //    Es. /engineering/tools/index.html → profondità 2 → basePath = "../../"
  //    Es. /index.html → profondità 0 → basePath = ""
  const pathname = window.location.pathname.replace(/\\/g, '/');

  // Trova le directory tra la root e il file corrente
  // Rimuoviamo il filename (l'ultima parte dopo /) per contare solo le directory
  const parts = pathname.split('/').filter(p => p.length > 0);
  // Rimuovi il filename (ultimo elemento)
  parts.pop();

  // Conta le directory significative (ignora la prima se è un disco Windows come "c:")
  // e ignora directory che fanno parte del path di progetto locale
  // Per un sito su GitHub Pages, il path sarà tipo /finanza/index.html
  // Per locale, potrebbe essere /DOCUMENTI/.../emanuele - 2026-03-11 v00/finanza/index.html

  // Troviamo l'indice della root del progetto cercando le directory chiave
  let rootIndex = -1;
  const rootMarkers = ['engineering', 'finanza', 'personale', 'css', 'js', 'assets', 'components'];

  for (let i = 0; i < parts.length; i++) {
    if (rootMarkers.includes(parts[i].toLowerCase())) {
      rootIndex = i;
      break;
    }
  }

  let depth = 0;
  if (rootIndex >= 0) {
    // Le directory dal rootIndex in poi sono quelle del sito
    depth = parts.length - rootIndex;
  } else {
    // Se il file è alla root (index.html), depth = 0
    // Controlliamo se l'ultimo path component contiene un marker
    depth = 0;
  }

  const basePath = depth > 0 ? '../'.repeat(depth) : '';

  // 2. Determina quale sezione è attiva
  const lowerPath = pathname.toLowerCase();
  let activeSection = 'home';
  if (lowerPath.includes('/finanza/') || lowerPath.includes('/finanza\\')) {
    activeSection = 'finanza';
  } else if (lowerPath.includes('/engineering/') || lowerPath.includes('/engineering\\')) {
    activeSection = 'engineering';
  } else if (lowerPath.includes('/personale/') || lowerPath.includes('/personale\\')) {
    activeSection = 'personale';
  }

  // 3. Helper per creare la bird animation
  function birdVideo() {
    return `<video autoplay loop muted playsinline style="width: 35px; height: 35px; background: transparent; pointer-events: none;">
              <source src="${basePath}assets/Cute%20Bird%20Flapping%20Animation.webm" type="video/webm">
            </video>`;
  }

  // 4. Costruisci l'HTML della navbar
  // Home link – con uccellino se è la sezione attiva
  const homeLink = activeSection === 'home'
    ? `<a href="${basePath}index.html" class="menu-link" style="display: flex; align-items: center; gap: 8px;">
         ${birdVideo()} Home
       </a>`
    : `<a href="${basePath}index.html" class="menu-link">Home</a>`;

  // Finanza menu group
  const finanzaToggle = activeSection === 'finanza'
    ? `<a href="${basePath}finanza/index.html" class="menu-toggle" style="display: flex; align-items: center; gap: 8px;">
         ${birdVideo()} Finanza <span class="arrow">▼</span>
       </a>`
    : `<a href="${basePath}finanza/index.html" class="menu-toggle">
         Finanza <span class="arrow">▼</span>
       </a>`;

  const finanzaGroup = `
    <div class="menu-group">
      ${finanzaToggle}
      <div class="menu-content">
        <a href="${basePath}finanza/interesse/index.html" class="menu-link finance">Interesse Composto</a>
        <a href="${basePath}finanza/portafoglio/index.html" class="menu-link finance">Portafoglio</a>
        <a href="${basePath}finanza/mutuo/index.html" class="menu-link finance">Mutui</a>
      </div>
    </div>`;

  // Engineering menu group
  const engineeringToggle = activeSection === 'engineering'
    ? `<a href="${basePath}engineering/index.html" class="menu-toggle" style="display: flex; align-items: center; gap: 8px;">
         ${birdVideo()} Ingegneria <span class="arrow">▼</span>
       </a>`
    : `<a href="${basePath}engineering/index.html" class="menu-toggle">
         Ingegneria <span class="arrow">▼</span>
       </a>`;

  const engineeringGroup = `
    <div class="menu-group">
      ${engineeringToggle}
      <div class="menu-content">
        <a href="${basePath}engineering/appunti/index.html" class="menu-link engineering">Appunti</a>
        <a href="${basePath}engineering/tools/index.html" class="menu-link engineering">Tools</a>
      </div>
    </div>`;

  // Personale menu group
  const personaleToggle = activeSection === 'personale'
    ? `<a href="${basePath}personale/index.html" class="menu-toggle" style="display: flex; align-items: center; gap: 8px;">
         ${birdVideo()} Personale <span class="arrow">▼</span>
       </a>`
    : `<a href="${basePath}personale/index.html" class="menu-toggle">
         Personale <span class="arrow">▼</span>
       </a>`;

  const personaleGroup = `
    <div class="menu-group">
      ${personaleToggle}
      <div class="menu-content">
        <a href="${basePath}personale/index.html" class="menu-link personal">Chi Sono</a>
        <a href="${basePath}personale/accademico/index.html" class="menu-link personal">Percorso Accademico</a>
        <a href="${basePath}personale/progetti/index.html" class="menu-link personal">Progetti Personali</a>
      </div>
    </div>`;

  // Navbar completa
  const navbarHTML = `
    <div class="navbar-logo">
      <img src="${basePath}assets/logo.png" alt="Logo Emanuele Zanella" style="width: 45px; height: 45px; object-fit: contain;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <h1 style="margin: 0;"><a href="${basePath}personale/index.html" style="text-decoration: none; color: inherit;">Emanuele Zanella</a></h1>
        <div id="theme-toggle" class="theme-toggle-btn" title="Cambia Tema" style="cursor: pointer; display: flex; align-items: center; padding: 5px;">
          <video id="theme-video" muted playsinline style="width: 38px; height: 38px; pointer-events: none; border-radius: 50%;">
            <source src="${basePath}assets/theme_moon.svg.webm" type="video/webm">
          </video>
        </div>
      </div>
    </div>

    <!-- Hamburger Menu Button (Mobile Only) -->
    <div class="hamburger-menu" id="hamburger-menu">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <nav class="menu" id="main-menu">
      ${homeLink}
      ${finanzaGroup}
      ${engineeringGroup}
      ${personaleGroup}
      <span id="clock" class="digital-clock"></span>
    </nav>`;

  // 5. Inietta la navbar nel placeholder
  const placeholder = document.getElementById('main-navbar');
  if (placeholder) {
    placeholder.className = 'navbar';
    placeholder.innerHTML = navbarHTML;
  }

  // 6. Inietta il favicon se non presente
  if (!document.querySelector('link[rel="icon"]')) {
    // Favicon 48px (ritagliato, solo cerchio EZ)
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.sizes = '48x48';
    favicon.href = basePath + 'assets/favicon.png';
    document.head.appendChild(favicon);

    // Favicon 32px per browser che preferiscono 32
    const favicon32 = document.createElement('link');
    favicon32.rel = 'icon';
    favicon32.type = 'image/png';
    favicon32.sizes = '32x32';
    favicon32.href = basePath + 'assets/favicon-32.png';
    document.head.appendChild(favicon32);

    // Apple Touch Icon
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.sizes = '180x180';
    appleIcon.href = basePath + 'assets/favicon-180.png';
    document.head.appendChild(appleIcon);
  }
})();
