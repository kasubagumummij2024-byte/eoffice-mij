const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Inisialisasi Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// DATA PEGAWAI (Sesuai Gambar)
// Password default kita set: "123456" (Nanti bisa fitur ganti password)
// Role mapping:
// - Direktur -> 'DIRECTOR'
// - Kamad -> 'KAMAD'
// - Kabag -> 'KABAG'
// - Staf TU -> 'STAFF_TU'
// - Staf Administrasi Umum -> 'ADMIN_UMUM'

const usersData = [
  { nip: "20040801026", nama: "Taufik, S.H.I", area: "IBS", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20230426397", nama: "Muhammad Ra'uf Akbar, S.Kom", area: "IBS", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20101101091", nama: "Ema Mardiah, S.Pd", area: "KB", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20200701361", nama: "Achmad Sawaludin, S.Ak", area: "KB", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20131101148", nama: "Asep Marpu, S.Pd.I", area: "MA", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20090401060", nama: "Ade Muhamad Yusuf, M.Pd", area: "MI", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20191101349", nama: "Luthfiyah Nuur Janah, S.Kom", area: "MI", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20181001312", nama: "Syahril Sidik, S.Ag", area: "MTs", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20181101163", nama: "Nuryanti, SE, M.Pd", area: "RA", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20211101375", nama: "H. Mochammad Taufiqurrahman, SQ, MA.", area: "Satker", jabatan: "Direktur", role: "DIRECTOR" },
  { nip: "20070402046", nama: "Zatiah Lesyani, M.Pd", area: "Satker", jabatan: "Kabag KHK", role: "KABAG" },
  { nip: "20070402048", nama: "Dr. Muhamad Alwi, M.Pd", area: "Satker", jabatan: "Kabag PM", role: "KABAG" },
  { nip: "20110501100", nama: "Mohamat Ibrahim, S.Pd", area: "Satker", jabatan: "Kabag TU & Umum", role: "KABAG" },
  { nip: "20150701214", nama: "Sarif Hidayat, S.Pd., M.Si", area: "MA", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20090401065", nama: "Mulana, A.Md.Kom", area: "MTs", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20010920011", nama: "Siti Sundari", area: "RA", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20250201448", nama: "Hilman Alfarobi, S.A.P", area: "Satker", jabatan: "Staf Administrasi Umum", role: "ADMIN_UMUM" }
];

async function seedUsers() {
  const batch = db.batch();
  
  console.log("🚀 Memulai proses import data pegawai...");

  usersData.forEach((user) => {
    // Kita gunakan NIP sebagai Document ID agar mudah dicari
    const userRef = db.collection("users").doc(user.nip);
    
    batch.set(userRef, {
      nip: user.nip,
      nama: user.nama,
      area_kerja: user.area,
      jabatan_asli: user.jabatan,
      role: user.role,
      password: "Admin123#", // Password default sederhana (JANGAN GUNAKAN DI PRODUCTION TANPA HASHING/GANTI PASS)
      created_at: new Date().toISOString()
    });
  });

  try {
    await batch.commit();
    console.log(`✅ Sukses! ${usersData.length} Pegawai berhasil diimport ke Firestore.`);
  } catch (error) {
    console.error("❌ Gagal import data:", error);
  }
}

seedUsers();