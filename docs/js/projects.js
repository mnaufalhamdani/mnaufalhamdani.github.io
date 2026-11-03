import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const FIREBASE_VERSION = "10.14.1";
const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

async function fetchFromFirestore() {
  const { initializeApp } = await import(`${CDN}/firebase-app.js`);
  const { getFirestore, collection, getDocs, query, orderBy } = await import(
    `${CDN}/firebase-firestore.js`
  );
  const db = getFirestore(initializeApp(firebaseConfig));
  const snap = await getDocs(query(collection(db, "projects"), orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function fetchFromLocal() {
  const res = await fetch("data/projects.json");
  if (!res.ok) throw new Error("Gagal memuat data/projects.json");
  return res.json();
}

/** Firestore bila sudah dikonfigurasi, jika gagal atau belum, pakai data lokal. */
export async function loadProjects() {
  if (isFirebaseConfigured) {
    try {
      const items = await fetchFromFirestore();
      if (items.length) return items;
    } catch (err) {
      console.warn("Firestore gagal, memakai data lokal:", err);
    }
  }
  return fetchFromLocal();
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Hanya path relatif di dalam situs yang dipakai sebagai gambar.
const safeImage = (p) => (p && /^[\w\-./]+$/.test(p) && !p.startsWith("/") && !p.includes("..") ? p : "");

function mediaHtml(p) {
  const imgs = (Array.isArray(p.images) ? p.images : []).map(safeImage).filter(Boolean);
  if (imgs.length === 0) return `<div class="project-placeholder"><i class="bi bi-phone"></i></div>`;
  const alt = (i) => `Tampilan ${esc(p.title)}${imgs.length > 1 ? ` (${i + 1} dari ${imgs.length})` : ""}`;
  if (imgs.length === 1) return `<img src="${esc(imgs[0])}" alt="${alt(0)}" loading="lazy" />`;

  const slides = imgs
    .map((src, i) => `<div class="carousel-slide"><img src="${esc(src)}" alt="${alt(i)}" ${i ? 'loading="lazy"' : ""} draggable="false" /></div>`)
    .join("");
  const dots = imgs
    .map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Gambar ${i + 1}"></button>`)
    .join("");
  return `
    <div class="carousel" role="group" aria-roledescription="carousel" aria-label="Gambar ${esc(p.title)}" tabindex="0">
      <div class="carousel-track">${slides}</div>
      <button type="button" class="carousel-btn prev" data-dir="-1" aria-label="Gambar sebelumnya"><i class="bi bi-chevron-left"></i></button>
      <button type="button" class="carousel-btn next" data-dir="1" aria-label="Gambar berikutnya"><i class="bi bi-chevron-right"></i></button>
      <div class="carousel-dots">${dots}</div>
    </div>`;
}

function card(p) {
  const media = mediaHtml(p);
  const tags = (p.techStack || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  return `
    <article class="card project reveal${p.featured ? " featured" : ""}" data-category="${esc(p.category)}">
      <div class="project-media">${media}${p.featured ? '<span class="badge">Unggulan</span>' : ""}</div>
      <div class="project-body">
        <div class="project-meta"><span>${esc(p.category)}</span>${p.period ? `<span>${esc(p.period)}</span>` : ""}</div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="tags">${tags}</div>
      </div>
    </article>`;
}

/** Carousel vanilla: geser lewat scroll-snap native (swipe di mobile), tombol/titik/keyboard di desktop. */
function initCarousels(grid) {
  const go = (carousel, index) => {
    const track = carousel.querySelector(".carousel-track");
    const n = track.children.length;
    const i = (index + n) % n; // berputar di ujung
    track.scrollTo({ left: i * track.clientWidth });
  };
  const current = (carousel) => {
    const track = carousel.querySelector(".carousel-track");
    return Math.round(track.scrollLeft / track.clientWidth);
  };

  grid.addEventListener("click", (e) => {
    const carousel = e.target.closest(".carousel");
    if (!carousel) return;
    const btn = e.target.closest(".carousel-btn");
    const dot = e.target.closest(".carousel-dot");
    if (btn) go(carousel, current(carousel) + Number(btn.dataset.dir));
    else if (dot) go(carousel, Number(dot.dataset.index));
  });

  grid.addEventListener("keydown", (e) => {
    const carousel = e.target.closest?.(".carousel");
    if (!carousel || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    go(carousel, current(carousel) + (e.key === "ArrowRight" ? 1 : -1));
  });

  // Event scroll tidak bubble, jadi pakai capture untuk menyinkronkan titik indikator.
  grid.addEventListener(
    "scroll",
    (e) => {
      const track = e.target;
      if (!track.classList?.contains("carousel-track")) return;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      track.parentElement.querySelectorAll(".carousel-dot").forEach((d, k) => d.classList.toggle("active", k === i));
    },
    true
  );
}

export function renderProjects(items, grid, filters) {
  const categories = ["Semua", ...new Set(items.map((p) => p.category))];
  filters.innerHTML = categories
    .map((c, i) => `<button class="chip${i === 0 ? " active" : ""}" data-filter="${esc(c)}">${esc(c)}</button>`)
    .join("");
  grid.innerHTML = items.map(card).join("");
  grid.setAttribute("aria-busy", "false");

  initCarousels(grid);

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filters.querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    grid.querySelectorAll(".project").forEach((el) => {
      el.hidden = f !== "Semua" && el.dataset.category !== f;
    });
  });
}
