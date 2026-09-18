"use client"; // Wajib ditambahkan agar Next.js bisa membaca URL Browser

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Hook untuk mengecek URL
import { Home, ListOrdered, ArrowLeftRight, LogOut} from 'lucide-react';
import api from "../lib/axios"; // Mengimpor instance axios yang telah dikonfigurasi
import { useState, useEffect} from 'react'

export default function Sidebar() {
  const pathname = usePathname(); // Mengambil URL yang sedang aktif (misal: '/categories')
  const router = useRouter();


  const [user, setUser] = useState({ name: 'Loading...', email: '...' });

  // 3. Ambil data dari localStorage saat Sidebar pertama kali dirender
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log(storedUser)
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Ubah kembali dari string jadi Objek
    } else {
      setUser({ name: 'Guest', email: 'Belum Login' });
    }
  }, []);

  // Kita buat daftarnya di sini agar lebih rapi
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Kategori', path: '/categories', icon: ListOrdered },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // Memanggil endpoint logout di backend

      localStorage.removeItem('user');

      router.push('/login');
      router.refresh()
    } catch (error){
      console.error("Logout Failed:", error);
      alert("Something Went Wrong");
    }
  }

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300">
      
      {/* --- Bagian Logo/Header --- */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center mr-3 shadow-md">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
          FinTrack
        </h1>
      </div>

      {/* --- Bagian Menu Navigasi Dinamis --- */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          // Mengecek apakah URL saat ini sama dengan path menu ini
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive 
                  ? 'text-brand-dark dark:text-gray-200 bg-brand/10 dark:bg-brand/20 shadow-sm' // Style jika AKTIF
                  : 'text-gray-600 dark:text-gray-400 hover:text-brand dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800' // Style jika INAKTIF
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* --- Bagian Bawah: Profil & Tombol Logout --- */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {/* Mengambil huruf pertama dari nama untuk dijadikan inisial avatar */}
            <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 truncate">
            {/* Memanggil nama dan email dari state */}
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        {/* Tombol Keluar */}
        <button 
          onClick={handleLogout}
          className="cursor-pointer mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
      
    </aside>
  );
}