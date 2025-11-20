# 🏢 E-Office Madrasah Istiqlal - Backend API

Sistem Informasi Manajemen Persuratan (Backend) untuk Madrasah Istiqlal Jakarta. Sistem ini menangani autentikasi pengguna, pengajuan surat, persetujuan berjenjang (approval), dan penomoran surat otomatis sesuai standar lembaga.

## 🚀 Fitur Utama
- **Manajemen User & Role:** Support untuk Direktur, Kepala Madrasah (Kamad), Kabag, dan Staf TU.
- **Generator Nomor Otomatis:** Format `[No.Urut]/[Unit]/MIJ/[BulanRomawi]/[Tahun]`.
- **Smart Reset:** Counter nomor otomatis reset setiap pergantian tahun.
- **Hierarki Approval:** Validasi hak akses persetujuan surat (Contoh: Kamad MTs tidak bisa menyetujui surat MI).
- **Keamanan:** Validasi NIP dan Password hash (simulasi).

## 🛠️ Teknologi
- **Runtime:** Node.js & Express.js
- **Database:** Google Firebase Firestore
- **Deployment:** Railway

---

## 🔌 Dokumentasi API

Base URL (Production): `https://eoffice-mij-production.up.railway.app`
Base URL (Local): `http://localhost:3000`

### 1. Login User
Mendapatkan data user berdasarkan NIP.

- **Endpoint:** `POST /api/login`
- **Body (JSON):**
  ```json
  {
    "nip": "20191101349",
    "password": "Admin123#"
  }