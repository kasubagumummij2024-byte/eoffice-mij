// utils/numberGenerator.js

// Helper untuk ubah Angka Bulan ke Romawi
const getRomawi = (bulan) => {
  const romawi = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romawi[bulan];
};

/**
 * Fungsi Utama Generate Nomor
 * @param {Firestore} db - Koneksi Database
 * @param {String} tipe - "LEMBAGA", "SATDIK", atau "PANITIA"
 * @param {String} kodeUnit - Kode (misal: "MTs", "MA", "PPDB") - Kosongkan jika LEMBAGA
 */
const generateNomorSurat = async (db, tipe, kodeUnit = "") => {
  const today = new Date();
  const tahun = today.getFullYear(); // 2025
  const bulan = today.getMonth() + 1; // 1-12
  const bulanRomawi = getRomawi(bulan);

  // Tentukan ID Counter di Database
  // Contoh ID: "counter_LEMBAGA_2025", "counter_MTs_2025", "counter_PPDB_2025"
  let counterId = "";
  let formatSurat = "";

  if (tipe === "LEMBAGA") {
    counterId = `counter_LEMBAGA_${tahun}`;
    // Format: 001/MIJ/XI/2025
    formatSurat = `/MIJ/${bulanRomawi}/${tahun}`;
  } else if (tipe === "SATDIK") {
    counterId = `counter_${kodeUnit}_${tahun}`;
    // Format: 001/MTs/MIJ/XI/2025
    formatSurat = `/${kodeUnit}/MIJ/${bulanRomawi}/${tahun}`;
  } else if (tipe === "PANITIA") {
    counterId = `counter_${kodeUnit}_${tahun}`;
    // Format: 001/PPDB/MIJ/XI/2025
    formatSurat = `/${kodeUnit}/MIJ/${bulanRomawi}/${tahun}`;
  } else {
    throw new Error("Tipe surat tidak dikenali!");
  }

  const counterRef = db.collection("counters").doc(counterId);

  // JALANKAN TRANSAKSI (Supaya Aman & Tidak Ganda)
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(counterRef);
    
    let newCount = 1;

    if (doc.exists) {
      // Jika sudah ada, ambil nomor terakhir + 1
      newCount = doc.data().last_number + 1;
    }

    // Update database dengan nomor baru
    transaction.set(counterRef, { last_number: newCount });

    // Format angka jadi 3 digit (001, 010, 100)
    const noUrut = newCount.toString().padStart(3, "0");

    // Gabungkan semua string
    return `${noUrut}${formatSurat}`;
  });
};

module.exports = { generateNomorSurat };