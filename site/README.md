# Portofolio (GitHub Pages)

HTML + CSS + JS vanilla. Proyek dimuat dari Firestore; bila Firebase belum diisi atau gagal, memakai `data/projects.json`.

## Struktur
```
index.html
css/style.css
js/main.js            tema, navbar, animasi, orkestrasi
js/projects.js        fetch Firestore + render kartu + filter
js/firebase-config.js config Firebase (isi placeholder)
data/projects.json    data fallback sekaligus sumber seed
images/portfolio/     screenshot proyek (path disimpan di field `images`)
files/                CV
firestore.rules       read publik, write ditutup
tools/seed.mjs        seed Firestore dari projects.json (lokal, Admin SDK)
```

## Skema Firestore: koleksi `projects`
| Field | Tipe | Keterangan |
|---|---|---|
| title | string | nama proyek |
| description | string | deskripsi |
| techStack | array<string> | teknologi |
| images | array<string> | path relatif, mis. `["images/portfolio/a-1.png", "images/portfolio/a-2.png"]`. 2+ item = carousel, 1 item = gambar statis, `[]` = placeholder |
| category | string | `Enterprise`, `Personal Project`, `Academic` |
| period | string | mis. `2020 - 2023`; boleh kosong |
| featured | boolean | tampil besar di atas |
| order | number | urutan tampil (query `orderBy("order")`, tanpa composite index) |

## Skema Firestore: koleksi `site-content` (satu dokumen per section)
Sumber lokal sekaligus fallback: `data/site-content.json` (key = ID dokumen). Dokumen yang tidak ada di Firestore diisi dari file lokal; HTML awal di `index.html` tetap menjadi tampilan awal.

| Dokumen | Field |
|---|---|
| hero | eyebrow, name, taglineRole, taglineSegment, lead, cvLabel, cvPath, secondaryLabel, secondaryHref |
| about | paragraphs[string], stats[{value, label}] |
| skills | groups[{title, icon (class Bootstrap Icons), items[string]}] |
| experience | items[{role, company, period, bullets[string]}] |
| education | items[{degree, school, period}] |
| certificates | items[string] |
| contact | intro, email, linkedin, github |

## Menjalankan lokal
Modul ES butuh server HTTP: `npx serve site` atau `php -S localhost:8000 -t site`.

## Mengaktifkan Firestore
1. Firebase Console: buat project, tambah Web app, aktifkan Firestore.
2. Isi `js/firebase-config.js`.
3. Publish `firestore.rules`.
4. Isi data: `node tools/seed.mjs` atau tambah dokumen manual di Console.
