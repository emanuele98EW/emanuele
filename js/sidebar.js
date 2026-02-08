document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebar");
  if (!sidebarContainer) return;

  // calcola automaticamente la root
  const root = location.pathname.split("/").includes("engineering")
    ? "../../../../"
    : "./";

  fetch(root + "components/sidebar.html")
    .then(res => {
      if (!res.ok) throw new Error("Sidebar non trovata");
      return res.text();
    })
    .then(html => {
      sidebarContainer.innerHTML = html;
      highlightActive();
    })
    .catch(err => {
      console.error(err);
      sidebarContainer.innerHTML = "<p style='color:white;padding:10px'>Sidebar error</p>";
    });
});

function highlightActive() {
  const links = document.querySelectorAll(".menu-link");
  const current = window.location.pathname;

  links.forEach(link => {
    if (current.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
}
                                                                                                       
