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
    ['finanza/interesse/index.html', 'Interesse Composto', 'finance'],
    ['finanza/portafoglio/index.html', 'Portafoglio', 'finance'],
    ['finanza/mutuo/index.html', 'Mutui', 'finance'],
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
})();
