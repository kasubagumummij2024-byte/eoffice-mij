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

- **Base URL (Production):** `https://mij-eoffice-production.up.railway.app`
- **Base URL (Local):** `http://localhost:3000`

### 1. Login User
Mendapatkan data user berdasarkan NIP.

- **Endpoint:** `POST /api/login`
- **Body (JSON):**
```json
{
  "nip": "20191101349",
  "password": "Admin123#"
}
````

### 2\. Pengajuan Surat (Drafting)

Membuat draft surat baru. Status awal adalah `PENDING_APPROVAL`.

  - **Endpoint:** `POST /api/surat/ajukan`
  - **Body (JSON):**

<!-- end list -->

```json
{
  "nip_pengaju": "20191101349",
  "tipe_surat": "SATDIK", 
  "kode_unit": "MI",
  "perihal": "Undangan Rapat Wali Murid",
  "tujuan": "Orang Tua Siswa",
  "isi_ringkas": "Mengharap kehadiran..."
}
```

*Catatan: `tipe_surat` bisa berisi "SATDIK", "LEMBAGA", atau "PANITIA".*

### 3\. Proses Approval (Pimpinan)

Pimpinan menyetujui atau menolak surat. Jika disetujui, nomor surat akan terbit otomatis.

  - **Endpoint:** `POST /api/surat/proses-approval`
  - **Body (JSON):**

<!-- end list -->

```json
{
  "id_surat": "KODE_UNIK_DARI_DATABASE",
  "nip_approver": "20090401060",
  "aksi": "APPROVE"
}
```

*Catatan: Isi `aksi` dengan "REJECT" jika ingin menolak.*

-----

## 💻 Cara Menjalankan di Lokal (Laptop)

**1. Clone Repository**

```bash
git clone [https://github.com/kasubagumummij2024-byte/eoffice-mij.git](https://github.com/kasubagumummij2024-byte/eoffice-mij.git)
cd eoffice-mij
```

**2. Install Dependencies**

```bash
npm install
```

**3. Konfigurasi Firebase**

  - Pastikan anda memiliki file `serviceAccountKey.json` dari Firebase Console.
  - Letakkan file tersebut di *root folder* proyek.
  - **PENTING:** Jangan pernah upload file ini ke GitHub\!

**4. Jalankan Server**

```bash
node app.js
```

Server akan berjalan di `http://localhost:3000`.

-----

## 📂 Struktur Database (Firestore)

  - **`users`**: Menyimpan data pegawai (NIP sebagai Document ID).
  - **`letters`**: Menyimpan data surat, status, dan history.
  - **`counters`**: Menyimpan nomor urut terakhir untuk setiap unit & tahun.