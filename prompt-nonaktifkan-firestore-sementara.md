# Prompt: Nonaktifkan Sementara Koneksi Firestore, Paksa Pakai Fallback JSON

Konteks dan instruksi di bawah ini disusun untuk ditempel langsung ke chat AI (Claude/lainnya).

---

## Konteks

Situs portofolio saya (`mnaufalhamdani.github.io`, folder `docs/`) saat ini mengambil data
(proyek, dan kemungkinan juga About/Skills/Experience dari `site-content.json`) dari Firestore
dengan fallback ke file JSON lokal (`docs/data/projects.json`, `docs/data/site-content.json`)
kalau Firestore gagal diakses atau `isFirebaseConfigured` bernilai `false`.

Untuk sementara, saya ingin **menonaktifkan koneksi ke Firestore sepenuhnya**, supaya situs
**selalu** pakai data dari file JSON lokal, tanpa mencoba fetch ke Firestore sama sekali —
bukan karena Firestore error, tapi memang saya sengaja ingin matikan dulu untuk sementara
waktu (alasan: pengujian, atau sementara belum mau sinkron data).

## Yang Saya Minta

1. Jelaskan dulu ke saya **cara paling sederhana dan paling mudah dibalik nanti** untuk
   mencapai ini — beberapa kemungkinan pendekatan yang bisa dipertimbangkan:
   - Ubah nilai di `firebase-config.js` supaya `isFirebaseConfigured` selalu `false`
     (misal lewat flag manual terpisah, bukan merusak config aslinya)
   - Tambah flag terpisah (misal `const FORCE_JSON_FALLBACK = true`) yang dicek lebih dulu
     sebelum logic fetch Firestore dijalankan
   - Pendekatan lain yang lebih sesuai dengan struktur kode yang sudah ada
2. **Jangan hapus atau rusak** config Firestore yang sudah ada (`firebaseConfig` tetap utuh
   dengan nilai aslinya) — karena saya akan **mengaktifkannya kembali nanti**, cukup dengan
   mengubah satu flag/nilai balik, bukan menulis ulang config dari awal
3. Terapkan perubahan ini secara konsisten ke **semua** tempat yang fetch dari Firestore
   (proyek maupun data lain seperti site-content, kalau keduanya pakai pola terpisah)
4. Setelah perubahan, situs harus **selalu** membaca dari file JSON (`projects.json`,
   `site-content.json`, dst), walaupun config Firebase sebenarnya valid dan Firestore bisa
   diakses

## Yang Saya Minta Dijelaskan Juga

- Cara **membalikkan** perubahan ini nanti (mengaktifkan Firestore lagi) — satu langkah
  sederhana apa yang perlu saya lakukan ke depannya
- Apakah pendekatan ini butuh saya hapus data di Firestore juga, atau cukup di sisi kode saja
  (saya asumsikan cukup di kode, Firestore tetap boleh ada datanya, cuma situs tidak
  mengaksesnya untuk sementara — tapi tolong konfirmasi/koreksi kalau asumsi ini salah)

## Batasan

- Tidak pakai framework, tidak ada build step (sesuai situs yang sudah dibangun vanilla JS)
- Jangan ubah struktur data atau isi file JSON itu sendiri — ini murni soal mematikan
  pemanggilan Firestore, bukan mengubah data

## Yang Akan Saya Lampirkan di Chat

- Isi `docs/js/firebase-config.js` saat ini
- Isi file JS yang melakukan fetch ke Firestore (untuk proyek, dan untuk site-content kalau
  ada file terpisah)
