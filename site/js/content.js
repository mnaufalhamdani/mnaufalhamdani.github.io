import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const FIREBASE_VERSION = "10.14.1";
const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

async function fetchFromFirestore() {
  const { initializeApp, getApps, getApp } = await import(`${CDN}/firebase-app.js`);
  const { getFirestore, collection, getDocs } = await import(`${CDN}/firebase-firestore.js`);
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const snap = await getDocs(collection(getFirestore(app), "site-content"));
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
}

async function fetchFromLocal() {
  const res = await fetch("data/site-content.json");
  if (!res.ok) throw new Error("Gagal memuat data/site-content.json");
  return res.json();
}

/** Firestore bila dikonfigurasi; dokumen yang tidak ada atau gagal dimuat diisi dari data lokal. */
export async function loadSiteContent() {
  const local = await fetchFromLocal();
  if (!isFirebaseConfigured) return local;
  try {
    return { ...local, ...(await fetchFromFirestore()) };
  } catch (err) {
    console.warn("Firestore gagal, memakai data lokal:", err);
    return local;
  }
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (id) => document.getElementById(id);
const httpsUrl = (u) => (/^https:\/\//.test(u || "") ? u : "#");
const mailHref = (e) => (/^[^\s@<>"']+@[^\s@<>"']+$/.test(e || "") ? `mailto:${e}` : "#");
const relPath = (p) => (/^[\w\-./]+$/.test(p || "") && !String(p).startsWith("/") && !String(p).includes("..") ? p : "#");
const secHref = (h) => (/^#[\w-]+$/.test(h || "") ? h : "#");
const iconClass = (i) => (/^bi-[\w-]+$/.test(i || "") ? i : "bi-dot");

const renderers = {
  hero(d) {
    $("hero-eyebrow").textContent = d.eyebrow;
    $("hero-name").textContent = d.name;
    $("hero-tagline").innerHTML = `${esc(d.taglineRole)} <span class="sep">|</span> ${esc(d.taglineSegment)}`;
    $("hero-lead").textContent = d.lead;
    const cv = $("hero-cv");
    cv.innerHTML = `<i class="bi bi-download"></i> ${esc(d.cvLabel)}`;
    cv.href = relPath(d.cvPath);
    const cta = $("hero-cta2");
    cta.textContent = d.secondaryLabel;
    cta.href = secHref(d.secondaryHref);
  },
  about(d) {
    $("about-paragraphs").innerHTML = (d.paragraphs || []).map((p) => `<p class="reveal">${esc(p)}</p>`).join("");
    $("about-stats").innerHTML = (d.stats || [])
      .map((s) => `<div class="card stat reveal"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`)
      .join("");
  },
  skills(d) {
    $("skills-grid").innerHTML = (d.groups || [])
      .map(
        (g) => `<div class="card reveal"><h3><i class="bi ${iconClass(g.icon)}"></i> ${esc(g.title)}</h3><div class="tags">${(g.items || [])
          .map((i) => `<span class="tag">${esc(i)}</span>`)
          .join("")}</div></div>`
      )
      .join("");
  },
  experience(d) {
    $("experience-list").innerHTML = (d.items || [])
      .map(
        (e) => `<li class="card reveal">
            <div class="when">${esc(e.period)}</div>
            <h3>${esc(e.role)}</h3><div class="org">${esc(e.company)}</div>
            <ul>${(e.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          </li>`
      )
      .join("");
  },
  education(d) {
    $("education-list").innerHTML = (d.items || [])
      .map((e) => `<li><strong>${esc(e.degree)}</strong><br />${esc(e.school)}<br /><span class="muted">${esc(e.period)}</span></li>`)
      .join("");
  },
  certificates(d) {
    $("certificates-list").innerHTML = (d.items || []).map((c) => `<li>${esc(c)}</li>`).join("");
  },
  contact(d) {
    $("contact-intro").textContent = d.intro;
    $("contact-links").innerHTML = `
          <a class="btn primary" href="${esc(mailHref(d.email))}"><i class="bi bi-envelope"></i> ${esc(d.email)}</a>
          <a class="btn" href="${esc(httpsUrl(d.linkedin))}" target="_blank" rel="noopener"><i class="bi bi-linkedin"></i> LinkedIn</a>
          <a class="btn" href="${esc(httpsUrl(d.github))}" target="_blank" rel="noopener"><i class="bi bi-github"></i> GitHub</a>`;
    $("hero-socials").innerHTML = `
          <a href="${esc(mailHref(d.email))}" aria-label="Email"><i class="bi bi-envelope"></i></a>
          <a href="${esc(httpsUrl(d.linkedin))}" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
          <a href="${esc(httpsUrl(d.github))}" target="_blank" rel="noopener" aria-label="GitHub"><i class="bi bi-github"></i></a>`;
  },
};

/** Tiap section dirender terpisah; kegagalan satu section tidak menghentikan yang lain (HTML awal tetap tampil). */
export function renderSiteContent(content) {
  for (const [id, render] of Object.entries(renderers)) {
    if (!content[id]) continue;
    try {
      render(content[id]);
    } catch (err) {
      console.error(`Gagal render section "${id}":`, err);
    }
  }
}
