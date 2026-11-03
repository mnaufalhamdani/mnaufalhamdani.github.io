# mnaufalhamdani.github.io

Situs portofolio pribadi Muhammad Naufal Hamdani.

## Daftar Isi

- [Bagian 1: Gambaran Repo](#bagian-1-gambaran-repo)
  - [Struktur folder](#struktur-folder)
  - [Sumber data](#sumber-data)
  - [Menjalankan situs secara lokal](#menjalankan-situs-secara-lokal)
- [Bagian 2: Setup Tools (Seed Firestore)](#bagian-2-setup-tools-seed-firestore)
  - [1. Prasyarat](#1-prasyarat)
  - [2. Install dependency](#2-install-dependency)
  - [3. Siapkan service account key](#3-siapkan-service-account-key)
  - [4. Set environment variable](#4-set-environment-variable)
  - [5. Jalankan seed](#5-jalankan-seed)
  - [6. Catatan environment variable](#6-catatan-environment-variable)
  - [7. Publish firestore.rules](#7-publish-firestorerules)

---

# Bagian 1: Gambaran Repo

Situs portofolio ini dibangun dengan HTML, CSS, dan JavaScript vanilla. Tidak memakai framework dan tidak ada build step. Situs di-host di GitHub Pages.

## Struktur folder

Seluruh isi website yang dipublish ada di folder `site/`.

```
site/
├── index.html            Halaman utama (satu halaman)
├── favicon.png
├── css/
│   └── style.css         Seluruh styling
├── js/
│   ├── main.js           Tema, navbar, animasi, orkestrasi
│   ├── projects.js       Ambil data proyek (Firestore / fallback), render kartu + filter
│   ├── content.js        Memuat konten section dari Firestore / fallback
│   └── firebase-config.js  Konfigurasi Firebase untuk web
├── images/
│   ├── portfolio/        Screenshot proyek
│   └── profile/          Foto profil
├── files/                File unduhan (CV/resume PDF)
├── data/
│   ├── projects.json     Data proyek: fallback sekaligus sumber seed
│   └── site-content.json Konten section (hero, about, skills, dst.): fallback sekaligus sumber seed
├── tools/
│   └── seed.mjs          Script lokal untuk mengisi Firestore dari file JSON
├── firestore.rules       Security rules Firestore (baca publik, tulis ditutup)
└── README.md             Dokumentasi skema data Firestore
```

Detail skema field koleksi `projects` dan `site-content` ada di [`site/README.md`](site/README.md).

## Sumber data

- **Proyek portofolio** diambil dari Firestore, collection `projects`. Jika Firestore gagal atau belum dikonfigurasi, situs memakai `site/data/projects.json`.
- **Konten section** (hero, about, skills, experience, dll.) diambil dari collection `site-content`, dengan fallback ke `site/data/site-content.json`.

## Menjalankan situs secara lokal

Situs memakai ES module, jadi harus dibuka lewat server HTTP, bukan dengan klik dua kali `index.html`.

```
php -S localhost:8000 -t site
```

Lalu buka `http://localhost:8000`.

Alternatif tanpa PHP:

```
npx serve site
```

---

# Bagian 2: Setup Tools (Seed Firestore)

`site/tools/seed.mjs` adalah script lokal yang mengisi Firestore dari file JSON di `site/data/`. Bagian ini mengasumsikan repo baru saja di-clone dan komputer belum punya `node_modules/` atau kredensial apa pun.

File berikut sengaja **tidak ada di repo** (diatur lewat `.gitignore`) karena hanya dipakai sebagai tools lokal, bukan bagian dari website:

- `package.json` dan `package-lock.json`
- `node_modules/`
- `secrets/` (kredensial)

## 1. Prasyarat

Node.js sudah terinstall. Cek dengan:

```
node -v
npm -v
```

## 2. Install dependency

Jalankan di **root repo**:

```
npm i firebase-admin
```

Karena `package.json` tidak ada di repo, jangan memakai `npm install` tanpa argumen. Perintah itu bergantung pada `package.json` yang tidak ada di hasil clone. Perintah di atas akan membuat `package.json` dan `node_modules/` secara lokal. Keduanya tetap diabaikan git.

## 3. Siapkan service account key

1. Buka [Firebase Console](https://console.firebase.google.com/) dan pilih project.
2. Masuk ke **Project Settings** → tab **Service accounts**.
3. Klik **Generate new private key**, lalu simpan file JSON yang terunduh.
4. Simpan file itu di folder lokal **di luar `site/`** agar tidak ikut ter-deploy ke GitHub Pages. Contoh: folder `secrets/` di root repo.

```
secrets/
└── nama-service-account.json
```

> **PERINGATAN:** file ini **TIDAK BOLEH pernah masuk git atau di-commit**. Isinya kredensial admin penuh ke Firestore. `.gitignore` sudah mengabaikan `secrets/` dan `*.json` (kecuali `site/data/*.json`), tetapi tetap periksa dengan `git status` sebelum commit. Jika key pernah bocor, hapus key itu di Firebase Console dan buat yang baru.

## 4. Set environment variable

Set `GOOGLE_APPLICATION_CREDENTIALS` agar menunjuk ke file kredensial tadi.

**PowerShell**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "D:\path\ke\repo\secrets\nama-service-account.json"
```

**Command Prompt (cmd)**

```
set GOOGLE_APPLICATION_CREDENTIALS=D:\path\ke\repo\secrets\nama-service-account.json
```

## 5. Jalankan seed

Dari root repo:

```
node site/tools/seed.mjs
```

Script ini membaca:

- `site/data/projects.json` lalu menulis ke collection `projects` (satu dokumen per proyek, ID dari slug judul)
- `site/data/site-content.json` lalu menulis ke collection `site-content` (satu dokumen per section)

Penulisan memakai `batch.set()`, yang **menimpa seluruh dokumen** setiap kali dijalankan. Field yang ada di Firestore tetapi tidak ada di JSON akan hilang. Jadi jika Anda mengedit data langsung di Console, pindahkan perubahan itu ke file JSON sebelum menjalankan seed.

Jika berhasil, terminal menampilkan pesan seperti `Seeded N projects dan M dokumen site-content.`

## 6. Catatan environment variable

Variable di langkah 4 hanya berlaku untuk **sesi terminal yang sedang terbuka**. Setiap kali membuka terminal baru, set ulang sebelum menjalankan `node site/tools/seed.mjs`.

## 7. Publish firestore.rules

File `site/firestore.rules` mengatur akses: baca publik, tulis ditutup. Rules ini harus dipublish ke Firebase. Ada dua cara:

**Cara A: Firebase CLI**

```
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Cara ini membutuhkan `firebase.json` yang menunjuk ke file rules, misalnya:

```json
{
  "firestore": { "rules": "site/firestore.rules" }
}
```

dan project terpilih lewat `firebase use <project-id>`. Perhatikan bahwa `*.json` di-gitignore, jadi `firebase.json` tidak akan ikut ter-commit kecuali Anda menambahkan pengecualian.

**Cara B: Manual lewat Console**

1. Buka Firebase Console → **Firestore Database** → tab **Rules**.
2. Salin isi `site/firestore.rules` ke editor.
3. Klik **Publish**.

Admin SDK yang dipakai `seed.mjs` tidak terikat rules, jadi seed tetap bisa menulis walaupun rules menutup tulis dari klien.
