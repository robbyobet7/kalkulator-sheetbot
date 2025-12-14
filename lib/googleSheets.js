// lib/googleSheets.js
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Fungsi untuk load data
export const getSheetData = async () => {
  try {
    // 1. Setup Auth menggunakan Service Account
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Fix formatting key
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // 2. Load Dokumen
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth
    );

    await doc.loadInfo(); // Load properti dokumen

    // 3. Ambil Sheet Pertama (Index 0)
    const sheet = doc.sheetsByIndex[0];

    // 4. Ambil semua baris (Rows)
    const rows = await sheet.getRows();

    // 5. Rapikan data agar mudah dibaca frontend
    // Pastikan header di Sheet kamu: 'Nama Barang', 'Harga Pokok', dll.
    const data = rows.map((row) => ({
      nama: row.get("Nama Barang"), // Sesuaikan string ini dengan HEADER di sheet kamu
      jenis: row.get("Jenis Barang"),
      hargaPokok: row.get("Harga Pokok"),
      hargaNego: row.get("Harga Negosiasi"),
    }));

    return data;
  } catch (error) {
    console.error("Gagal mengambil data sheet:", error);
    return [];
  }
};
