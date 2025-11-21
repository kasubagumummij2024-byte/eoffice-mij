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
  { nip: "20040801026", nama: "Taufik, S.H.I", area: "Istiqlal Boarding School", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20230426397", nama: "Muhammad Ra'uf Akbar, S.Kom", area: "Istiqlal Boarding School", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20101101091", nama: "Ema Mardiah, S.Pd", area: "Kelompok Bermain", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20200701361", nama: "Achmad Sawaludin, S.Ak", area: "Kelompok Bermain", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20131101148", nama: "Asep Marpu, S.Pd.I", area: "Madrasah Aliyah", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20090401060", nama: "Ade Muhamad Yusuf, M.Pd", area: "Madrasah Ibtidaiyah", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20191101349", nama: "Luthfiyah Nuur Janah, S.Kom", area: "Madrasah Ibtidaiyah", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20181001312", nama: "Syahril Sidik, S.Ag", area: "Madrasah Tsanawiyah", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20181101163", nama: "Nuryanti, SE, M.Pd", area: "Raudhatul Athfal", jabatan: "Kamad", role: "KAMAD" },
  { nip: "20211101375", nama: "H. Mochammad Taufiqurrahman, SQ, MA.", area: "Direktur", jabatan: "Direktur", role: "DIRECTOR" },
  { nip: "20070402046", nama: "Zatiah Lesyani, M.Pd", area: "Keuangan, Humas, dan Kepegawaian", jabatan: "Kabag KHK", role: "KABAG" },
  { nip: "20070402048", nama: "Dr. Muhamad Alwi, M.Pd", area: "Penjamin Mutu", jabatan: "Kabag PM", role: "KABAG" },
  { nip: "20110501100", nama: "Mohamat Ibrahim, S.Pd", area: "Tata Usaha dan Umum", jabatan: "Kabag TU & Umum", role: "KABAG" },
  { nip: "20150701214", nama: "Sarif Hidayat, S.Pd., M.Si", area: "Madrasah Aliyah", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20090401065", nama: "Mulana, A.Md.Kom", area: "Madrasah Tsanawiyah", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20010920011", nama: "Siti Sundari", area: "Raudhatul Athfal", jabatan: "Staf TU", role: "STAFF_TU" },
  { nip: "20250201448", nama: "Hilman Alfarobi, S.A.P", area: "Tata Usaha dan Umum", jabatan: "Staf Administrasi Umum", role: "ADMIN_UMUM" }
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