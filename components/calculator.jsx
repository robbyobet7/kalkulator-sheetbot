"use client";

import { useState, useEffect, useRef } from "react";

export default function Calculator() {
  // --- STATE ---
  const [hargaInput, setHargaInput] = useState(""); // Customer offered price (nego)
  const [margin, setMargin] = useState(0); // Derived margin (%)

  // Sheet data & search
  const [items, setItems] = useState([]); // All items from sheet
  const [searchTerm, setSearchTerm] = useState(""); // User query
  const [filteredItems, setFilteredItems] = useState([]); // Search results
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown
  const [basePrice, setBasePrice] = useState(0); // Hidden product base price
  const searchBoxRef = useRef(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        // Guard shape
        if (Array.isArray(data)) {
          setItems(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data items:", error);
      }
    };
    fetchData();
  }, []);

  // Close dropdown when clicking outside search box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HELPERS ---
  const formatRupiah = (angka) => {
    let numberString = angka.toString().replace(/[^,\d]/g, "");
    let split = numberString.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      let separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }
    return rupiah;
  };

  const getProgressBarColor = (val) => {
    if (val < 50) return "bg-red-500";
    if (val >= 50 && val <= 74) return "bg-orange-400";
    return "bg-[#4ade80]";
  };

  const normalizeNumber = (value, fallback = 0) => {
    if (typeof value === "number") return value;
    if (!value) return fallback;
    // Remove all non-digits so "50.000", "Rp25,000" -> "50000" / "25000"
    const cleaned = String(value).replace(/[^\d]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : fallback;
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatRupiah(rawVal);
    setHargaInput(formatted);

    // Recalculate margin based on hidden base price and customer offer
    const negoPrice = normalizeNumber(rawVal);
    if (basePrice > 0 && negoPrice >= basePrice) {
      const marginPercent = ((negoPrice - basePrice) / basePrice) * 100;
      const safeMargin = Math.min(100, Math.max(0, Math.round(marginPercent)));
      setMargin(safeMargin);
    } else {
      // If offer is below base price or base missing, margin is 0
      setMargin(0);
    }
  };

  // Search input handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 0) {
      const filtered = items.filter((item) =>
        item.nama.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // On select search item
  const handleSelectItem = (item) => {
    setSearchTerm(item.nama); // Fill search box

    // Read and store base price only (hidden from UI)
    const hargaPokok = normalizeNumber(item.hargaPokok);
    setBasePrice(hargaPokok);

    // Reset user input & margin when switching item
    setHargaInput("");
    setMargin(0);

    setShowDropdown(false); // Hide dropdown
  };

  return (
    <div className="bg-white px-10 py-8 rounded-[1vw] shadow-xl w-full max-w-lg relative">
      <h2 className="text-xl font-bold text-gray-800 mb-8">
        Kalkulator Harga CR Store
      </h2>

      {/* --- SECTION INPUT --- */}
      <div className="border border-gray-200 rounded-xl px-6 py-4 mb-6 relative">
        {/* Search Bar */}
        <div className="mb-6 relative" ref={searchBoxRef}>
          <label className="block text-gray-500 text-sm mb-2">
            Cari Barang
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Ketik nama barang..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm && setShowDropdown(true)}
              className="w-full py-3 pl-10 pr-4 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>

          {/* DROPDOWN HASIL PENCARIAN */}
          {showDropdown && filteredItems.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectItem(item)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 border-gray-100 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {item.nama}
                    </p>
                    <p className="text-xs text-gray-400">{item.jenis}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">
                    Rp{" "}
                    {formatRupiah(
                      normalizeNumber(item.hargaPokok).toString() || "0"
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input customer offer (nego) */}
        <div>
          <label className="block text-gray-500 text-sm mb-2">
            Masukkan Harga (Rp)
          </label>
          <input
            type="text"
            value={hargaInput}
            onChange={handleInputChange}
            placeholder="0"
            className="w-full py-3 px-4 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition font-bold text-lg"
          />
        </div>
      </div>

      {/* --- SECTION SLIDER --- */}
      <div className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-end mb-4 relative z-10">
          <span className="text-sm font-medium opacity-90">Margin Profit</span>
          <span className="text-4xl font-bold">{margin}%</span>
        </div>

        <div className="relative w-full h-6 flex items-center">
          {/* Progress Bar Visual */}
          <div
            className={`absolute left-0 h-1.5 rounded-l-lg pointer-events-none z-0 transition-colors duration-300 ${getProgressBarColor(
              margin
            )}`}
            style={{ width: `${margin}%` }}
          ></div>

          <div className="absolute w-full h-1.5 bg-white/30 rounded-lg z-[-1]"></div>

          <input
            type="range"
            min="0"
            max="100"
            value={margin}
            readOnly
            className="w-full h-1.5 bg-transparent appearance-none cursor-default pointer-events-none relative z-10 focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
