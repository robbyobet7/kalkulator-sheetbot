// src/app/page.js
import Calculator from "../components/calculator.jsx";

export default function Home() {
  return (
    <main className="bg-gray-100 flex items-center justify-center min-h-screen font-sans">
      <Calculator />
    </main>
  );
}
