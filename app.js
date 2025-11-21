const { generateNomorSurat } = require("./utils/numberGenerator");
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
// const serviceAccount = require("./serviceAccountKey.json"); // <-- HAPUS ATAU KOMENTARI BARIS LAMA INI

// --- KODE BARU: LOGIKA KUNCI GANDA (Laptop vs Railway) ---
let serviceAccount;
if (process.env.FIREBASE_SECRET) {
  // Jika di Railway (Production), baca dari Variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SECRET);
} else {
  // Jika di Laptop (Local), baca dari File
  serviceAccount = require("./serviceAccountKey.json");
}
// ----------------------------------------------------------

// Inisialisasi (Tetap sama)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
// ... sisa kode ke bawah tidak berubah ...

// Cek jika firebase belum di-init (karena tadi sudah di seedUsers, tapi app.js butuh sendiri)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const app = express();

// --- SETTING CORS MANUAL (HARDCORE) ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Izinkan semua domain
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === 'OPTIONS') {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(express.json());

// --- ROUTE TEST SEDERHANA ---
app.get("/", (req, res) => {
  res.send("Server E-Office Madrasah Istiqlal Berjalan! 🚀");
});

// --- ROUTE LOGIN (Simulasi) ---
app.post("/api/login", async (req, res) => {
  const { nip, password } = req.body;

  try {
    // 1. Cari User berdasarkan ID (NIP)
    const userDoc = await db.collection("users").doc(nip).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "NIP tidak ditemukan." });
    }

    const userData = userDoc.data();

    // 2. Cek Password (Sederhana dulu)
    if (password !== userData.password) {
      return res.status(401).json({ message: "Password salah." });
    }

    // 3. Login Sukses
    res.json({
      message: "Login Berhasil",
      user: {
        nama: userData.nama,
        role: userData.role,
        area: userData.area_kerja
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;

// --- ROUTE TEST GENERATE NOMOR ---
// Nanti ini akan dipanggil saat user klik "Buat Surat"
app.post("/api/surat/test-generate", async (req, res) => {
  const { tipe, kode_unit } = req.body; 
  // Contoh body: { "tipe": "SATDIK", "kode_unit": "MTs" }

  try {
    const nomorSurat = await generateNomorSurat(db, tipe, kode_unit);

    res.json({
      message: "Nomor berhasil dibuat!",
      nomor_final: nomorSurat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROUTE PENGAJUAN SURAT BARU ---
app.post("/api/surat/ajukan", async (req, res) => {
  try {
    const { nip_pengaju, tipe_surat, kode_unit, perihal, tujuan, isi_ringkas } = req.body;

    // 1. Validasi User Pengaju
    const userDoc = await db.collection("users").doc(nip_pengaju).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Pegawai tidak ditemukan!" });
    }
    const userData = userDoc.data();

    // 2. Tentukan Siapa yang Harus Approve (Logic Hierarki)
    let nextApproverRole = "";
    
    if (tipe_surat === "LEMBAGA") {
      // Surat Lembaga (keluar) wajib Direktur
      nextApproverRole = "DIRECTOR";
    } else if (tipe_surat === "SATDIK") {
      // Surat Satdik cukup Kamad
      nextApproverRole = "KAMAD"; 
    } else {
      // Default (misal Panitia) bisa ke Kamad atau Direktur, kita set Direktur dulu untuk aman
      nextApproverRole = "DIRECTOR"; 
    }

    // 3. Simpan ke Database 'letters'
    const newLetter = {
      created_by: {
        nip: userData.nip,
        nama: userData.nama,
        jabatan: userData.jabatan_asli
      },
      tipe_surat: tipe_surat, // LEMBAGA / SATDIK
      kode_unit: kode_unit || "MIJ", // MTs / MA / MIJ
      konten: {
        perihal: perihal,
        tujuan: tujuan,
        isi: isi_ringkas
      },
      status: "PENDING_APPROVAL", // Status awal
      nomor_surat: null, // Belum ada nomor!
      approval_target: nextApproverRole, // Surat ini menunggu siapa?
      created_at: new Date().toISOString(),
      history: [
        {
          action: "CREATED",
          by: userData.nama,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const resDb = await db.collection("letters").add(newLetter);

    res.status(201).json({
      message: "Surat berhasil diajukan! Menunggu persetujuan pimpinan.",
      id_surat: resDb.id,
      status: "PENDING_APPROVAL",
      menunggu: nextApproverRole
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROUTE PROSES APPROVAL (PIMPINAN) ---
app.post("/api/surat/proses-approval", async (req, res) => {
  try {
    const { id_surat, nip_approver, aksi, catatan_revisi } = req.body; 
    // aksi: "APPROVE" atau "REJECT"

    // 1. Ambil Data Surat
    const letterRef = db.collection("letters").doc(id_surat);
    const letterSnap = await letterRef.get();

    if (!letterSnap.exists) {
      return res.status(404).json({ message: "Surat tidak ditemukan!" });
    }
    const letterData = letterSnap.data();

    // 2. Cek Apakah Surat Memang Sedang Menunggu Approval
    if (letterData.status !== "PENDING_APPROVAL") {
      return res.status(400).json({ message: `Surat ini tidak butuh approval (Status: ${letterData.status})` });
    }

    // 3. Cek Hak Akses Approver (Security Check)
    const userDoc = await db.collection("users").doc(nip_approver).get();
    if (!userDoc.exists) return res.status(404).json({message: "User tidak ditemukan"});
    
    const approverData = userDoc.data();
    
    // A. Validasi Role (Apakah Jabatannya Sesuai?)
    if (letterData.approval_target !== approverData.role) {
      return res.status(403).json({ 
        message: `Salah Jabatan! Surat ini menunggu ${letterData.approval_target}, anda adalah ${approverData.role}` 
      });
    }

    // B. VALIDASI WILAYAH (Agar Kamad MTs tidak bisa approve surat MI) -> INI YANG BARU
    // Jika Surat Level SATDIK, pastikan Area Kerja User == Kode Unit Surat
    if (letterData.tipe_surat === "SATDIK" && letterData.approval_target === "KAMAD") {
      if (approverData.area_kerja !== letterData.kode_unit) {
        return res.status(403).json({ 
          message: `Pelanggaran Wilayah! Anda Kamad unit ${approverData.area_kerja}, tidak berhak menyetujui surat unit ${letterData.kode_unit}.` 
        });
      }
    }

    // 4. Logika UTAMA: APPROVE vs REJECT
    let updateData = {};

    if (aksi === "APPROVE") {
      // --- THE MAGIC HAPPENS HERE ---
      // Generate Nomor Surat Otomatis
      const nomorBaru = await generateNomorSurat(db, letterData.tipe_surat, letterData.kode_unit);
      
      updateData = {
        status: "APPROVED",
        nomor_surat: nomorBaru,
        approved_by: {
          nip: approverData.nip,
          nama: approverData.nama,
          jabatan: approverData.jabatan_asli
        },
        approved_at: new Date().toISOString()
      };

    } else if (aksi === "REJECT") {
      updateData = {
        status: "REJECTED",
        catatan_revisi: catatan_revisi || "Perbaiki draft",
        rejected_by: approverData.nama,
        rejected_at: new Date().toISOString()
      };
    }

    // 5. Simpan Perubahan ke Database
    await letterRef.update(updateData);

    res.json({
      message: aksi === "APPROVE" ? "Surat Disetujui & Nomor Terbit!" : "Surat Ditolak.",
      data_final: updateData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});