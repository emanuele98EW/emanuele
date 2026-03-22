// =============================================
// FOOTER COMPONENT – Generazione dinamica
// =============================================
// Inietta un footer condiviso alla fine di ogni pagina.
// Va caricato dopo main.js.

(function () {
  // Calcola basePath usando lo stesso metodo di navbar.js
  const pathname = window.location.pathname.replace(/\\/g, '/');
  const parts = pathname.split('/').filter(p => p.length > 0);
  parts.pop();

  const rootMarkers = ['engineering', 'finanza', 'personale', 'css', 'js', 'assets', 'components'];
  let rootIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (rootMarkers.includes(parts[i].toLowerCase())) {
      rootIndex = i;
      break;
    }
  }

  let depth = rootIndex >= 0 ? parts.length - rootIndex : 0;
  const basePath = depth > 0 ? '../'.repeat(depth) : '';

  const currentYear = new Date().getFullYear();

const footerHTML = `
    <div class="footer-inner">

      <div class="footer-brand">
        <a href="${basePath}index.html" class="footer-logo-link">
          <img src="${basePath}assets/logo.png" alt="Logo" class="footer-logo-img">
        </a>
        <div class="footer-brand-text">
          <span class="footer-name">EMANUELE ZANELLA ·</span>
          <span class="footer-sub">Energy Engineer · Bologna, Italy</span>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-contacts">
        <a href="mailto:emanuele.zanella@outlook.it" class="footer-contact-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          emanuele.zanella@outlook.it
        </a>

      <span style="margin: 0 35px; color: #666;"> </span>

        <a href="https://linkedin.com/in/emanuele-zanella-299ba01a9" target="_blank" rel="noopener noreferrer"
          class="footer-contact-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
          </svg>
          LinkedIn
        </a>
      </div>

      <div class="footer-bottom">
        <span class="footer-copy">© ${currentYear} Emanuele Zanella · Tutti i diritti riservati</span>
        <span class="footer-sep">·</span>
        <span class="footer-built">Costruito con passione per l'ingegneria</span>
      </div>

    </div>`;

  // Crea e inietta il footer
  const footer = document.createElement('footer');
  footer.id = 'site-footer';
  footer.className = 'site-footer';
  footer.innerHTML = footerHTML;

  // Inserisci alla fine del body
  document.body.appendChild(footer);
})();
