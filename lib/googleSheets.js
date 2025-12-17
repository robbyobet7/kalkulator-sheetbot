// lib/googleSheets.js
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Load sheet data
export const getSheetData = async () => {
  try {
    // 1. Setup service account auth
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Fix key format
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // 2. Load document
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth
    );

    await doc.loadInfo(); // Load doc props

    // 3. Get first sheet (index 0)
    const sheet = doc.sheetsByIndex[0];

    // 4. Get all rows
    const rows = await sheet.getRows();

    // 5. Normalize for frontend; headers must match sheet
    const data = rows.map((row) => ({
      nama: row.get("Nama Barang"),
      jenis: row.get("Jenis Barang"),
      hargaPokok: row.get("Harga Pokok"),
      hargaJual: row.get("Harga Jual"),
    }));

    return data;
  } catch (error) {
    console.error("Gagal mengambil data sheet:", error);
    return [];
  }
};
