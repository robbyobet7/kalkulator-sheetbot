import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";

export async function GET() {
  try {
    // Panggil fungsi yang baru saja Anda buat di lib/googleSheets.js
    const items = await getSheetData();

    // Kirim data ke frontend dalam format JSON
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error di API:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
