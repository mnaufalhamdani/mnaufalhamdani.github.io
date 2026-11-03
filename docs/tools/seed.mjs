// Mengisi Firestore dari file JSON lokal (dijalankan lokal, bukan di situs):
//   - data/projects.json     -> collection `projects` (satu dokumen per proyek)
//   - data/site-content.json -> collection `site-content` (satu dokumen per section)
// Pemakaian:
//   npm i firebase-admin
//   set GOOGLE_APPLICATION_CREDENTIALS=path\ke\service-account.json   (jangan di-commit!)
//   node tools/seed.mjs
import { readFileSync } from "node:fs";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const read = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const db = getFirestore(initializeApp({ credential: applicationDefault() }));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const projects = read("projects.json");
const content = read("site-content.json");

const batch = db.batch();
for (const p of projects) batch.set(db.collection("projects").doc(slug(p.title)), p);
for (const [id, data] of Object.entries(content)) batch.set(db.collection("site-content").doc(id), data);
await batch.commit();
console.log(`Seeded ${projects.length} projects dan ${Object.keys(content).length} dokumen site-content.`);
