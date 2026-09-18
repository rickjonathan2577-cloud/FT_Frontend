import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar"; // Mengimpor komponen Sidebar kita

// Menggunakan font Inter untuk kesan modern dan bersih
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrack - Catat Keuangan",
  description: "Aplikasi pencatat keuangan minimalis modern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        {/* Sidebar diletakkan di luar konten halaman agar tetap ada saat pindah halaman */}
        <Sidebar />
        
        {/* Area Utama Konten (children adalah isi dari page.tsx) */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}