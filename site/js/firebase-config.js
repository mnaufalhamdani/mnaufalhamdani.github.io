// Isi dengan config web app dari Firebase Console > Project settings > Your apps.
// Nilai ini boleh publik. Keamanan data diatur oleh firestore.rules, bukan dengan menyembunyikan config.
export const firebaseConfig = {
  apiKey: "AIzaSyDr8C3Q-NoCftqQBO9yJgXqtjtK_EwV_QA",
  authDomain: "portfolio-e7e8d.firebaseapp.com",
  projectId: "portfolio-e7e8d",
  storageBucket: "portfolio-e7e8d.firebasestorage.app",
  messagingSenderId: "643546012565",
  appId: "1:643546012565:web:929e693b22a85b6560b49c"
};

export const isFirebaseConfigured = !Object.values(firebaseConfig).some((v) =>
  String(v).startsWith("YOUR_")
);
