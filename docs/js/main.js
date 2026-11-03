import { loadProjects, renderProjects } from "./projects.js";
import { loadSiteContent, renderSiteContent } from "./content.js";

// Tema gelap/terang
const root = document.documentElement;
const themeIcon = document.getElementById("theme-icon");
function applyTheme(mode) {
  root.dataset.theme = mode;
  themeIcon.className = mode === "dark" ? "bi bi-moon" : "bi bi-sun";
  localStorage.setItem("color-mode", mode);
}
applyTheme(
  localStorage.getItem("color-mode") ||
    (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
);
document.getElementById("theme-toggle").addEventListener("click", () =>
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark")
);

// Navbar mobile
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menu-btn");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.firstElementChild.className = open ? "bi bi-x" : "bi bi-list";
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.firstElementChild.className = "bi bi-list";
  }
});

// Animasi reveal saat scroll
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    }),
  { threshold: 0.12 }
);
const observeReveals = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
observeReveals();

// Konten situs (hero, about, skills, experience, education, certificates, contact)
loadSiteContent()
  .then((content) => {
    renderSiteContent(content);
    observeReveals();
  })
  .catch((err) => console.error("Konten situs memakai HTML awal:", err));

// Proyek
const grid = document.getElementById("project-grid");
loadProjects()
  .then((items) => {
    renderProjects(items, grid, document.getElementById("project-filters"));
    observeReveals();
  })
  .catch((err) => {
    console.error(err);
    grid.innerHTML = '<p class="muted">Proyek belum dapat dimuat. Coba muat ulang halaman.</p>';
    grid.setAttribute("aria-busy", "false");
  });

document.getElementById("year").textContent = new Date().getFullYear();
