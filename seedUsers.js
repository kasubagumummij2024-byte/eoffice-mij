const admin = require("firebase-admin");
// Pastikan path ini benar (sesuai setup env atau file json)
let serviceAccount;
if (process.env.FIREBASE_SECRET) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SECRET);
} else {
  serviceAccount = require("./serviceAccountKey.json");
}

// Inisialisasi (Cek biar gak double init)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// --- 1. DATA PEGAWAI (Format Nama Panjang) ---
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

// --- 2. KAMUS PENERJEMAH (MAPPING) ---
// Mengubah Nama Panjang -> Kode Singkat Database
const unitMapping = {
  "Kelompok Bermain": "KB",
  "Raudhatul Athfal": "RA",
  "Madrasah Ibtidaiyah": "MI",
  "Madrasah Tsanawiyah": "MTs",
  "Madrasah Aliyah": "MA",
  "Istiqlal Boarding School": "IBS",
  "Keuangan, Humas, dan Kepegawaian": "KHK",
  "Penjamin Mutu": "PM",
  "Tata Usaha dan Umum": "TUUmum",
  "Direktur": "DIR" // Direktur biasanya dianggap Satker Pusat atau bisa juga "DIR"
};

async function seedUsers() {
  const batch = db.batch();
  
  console.log("🚀 Memulai proses import data pegawai dengan Mapping Otomatis...");

  usersData.forEach((user) => {
    const userRef = db.collection("users").doc(user.nip);
    
    // --- LOGIC MAPPING DI SINI ---
    // Ambil kode singkat dari kamus, kalau tidak ada pakai nama aslinya
    const kodeArea = unitMapping[user.area] || user.area;

    batch.set(userRef, {
      nip: user.nip,
      nama: user.nama,
      area_kerja: kodeArea, // <--- YANG DISIMPAN KE DB ADALAH KODE SINGKAT (MI, MTs, dll)
      nama_unit_lengkap: user.area, // Opsional: Simpan juga nama lengkapnya buat display kalau perlu
      jabatan_asli: user.jabatan,
      role: user.role,
      password: "123", 
      created_at: new Date().toISOString()
    });
  });

  try {
    await batch.commit();
    console.log(`✅ Sukses! ${usersData.length} Pegawai berhasil diupdate.`);
    console.log("Database sekarang menggunakan kode area singkat (Contoh: 'MI' bukan 'Madrasah Ibtidaiyah').");
  } catch (error) {
    console.error("❌ Gagal import data:", error);
  }
}

seedUsers();