"use client";
import { useState } from "react";
import { useRouter}  from "next/navigation";
import Link from "next/link";
import { Wallet, AlertCircle } from "lucide-react";
import api from "../lib/axios"; // Mengimpor instance axios yang telah dikonfigurasi


export default function LoginPage() {
    const router = useRouter();

    const [ email , setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ isLoading, setIsloading ] = useState(false);
    const [ errorMessage , setErrorMessage ] = useState("")

    const handlelogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsloading(true);
        setErrorMessage("");
        try {
            const response = await api.post("/auth/login", {
                email : email, 
                password : password
            });
            const userData = response.data.data.user;
            localStorage.setItem("user", JSON.stringify(userData))
            router.push('/')
        } catch (error:any) {
            if (error.response && error.response.data.message) {
              console.log(error.response)
              setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("fail to connect to the server");
            } 
        }  finally {
                setIsloading(false);
            };
        };
  return (
    // Memaksa halaman ini menutupi seluruh layar (menimpa padding dari layout)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-900 animate-in fade-in duration-500">
      
      {/* Kotak Form Login */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mb-4 shadow-md">
            <Wallet className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            Masukkan email dan password untuk melanjutkan ke FinTrack.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handlelogin} className="space-y-5">
          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-gray-900 dark:text-white transition-all"
              required
            />
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
              <span>Password</span>
              <a href="#" className="text-brand hover:text-brand-light text-xs font-semibold transition-colors">
                Lupa Password?
              </a>
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-gray-900 dark:text-white transition-all"
              required
            />
          </div>

          {/* Tombol Login */}
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 mt-4 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${
              isLoading ? 'bg-brand/70 cursor-not-allowed' : 'bg-brand hover:bg-brand-light hover:shadow-lg'
            }`}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Link ke Register */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Belum punya akun?{' '}
          <Link href="/register" className="text-brand font-bold hover:text-brand-light transition-colors">
            Daftar Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
}