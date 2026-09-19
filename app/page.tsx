"use client"

import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";  
import Link from "next/link";
import api from "./lib/axios"; // Mengimpor instance axios yang telah dikonfigurasi


export default function Home() {

  interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    description?: string;
    category?: string;
    date: string;
    amount: number;
  }
  //  State Data 
  const [ summary , setSummary ] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [ recentTransactions , setRecentTransactions ] = useState<Transaction[]>([]);
  const [ isLoading , setIsLoading ] = useState(false);
  const [ errorMessage , setErrorMessage ] = useState<string | null>(null);

  // Fungsi untuk mengambil data ringkasan dan transaksi terbaru dari API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, trxRes] = await Promise.all([
        api.get('/transaction/summary'),
        api.get('/transaction/')
      ]);
      setSummary({
        balance: summaryRes.data.data.balance,
        totalIncome: summaryRes.data.data.totalIncome,
        totalExpense: summaryRes.data.data.totalExpense
      });

      const allTransactions = trxRes.data.data || trxRes.data;
      setRecentTransactions(allTransactions.slice(0, 5));
      
      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []); 

  // Fungsi pembantu untuk merapikan angka menjadi Rupiah (Rp)
const formatIDR = (amount:number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateString:string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-40 text-gray-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-lg">Menyiapkan dashboard...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-5xl mx-auto text-center py-40 text-red-500 animate-in fade-in">
        <p className="text-lg">{errorMessage}</p>
        <button onClick={fetchData} className="mt-4 text-brand underline cursor-pointer">
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Ringkasan arus kas dan performa keuanganmu saat ini.
        </p>
      </div>

      {/* --- KARTU RINGKASAN (SUMMARY CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kartu 1: Total Saldo */}
        <div className="bg-brand text-white p-6 rounded-2xl shadow-md border border-brand-light flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-brand-light font-medium text-white/80">Total Saldo</p>
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet size={20} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-4 tracking-tight truncate" title={formatIDR(summary.balance)}>
            {formatIDR(summary.balance)}
          </h2>
        </div>

        {/* Kartu 2: Pemasukan */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Total Pemasukan</p>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white truncate" title={formatIDR(summary.totalIncome)}>
            {formatIDR(summary.totalIncome)}
          </h2>
        </div>

        {/* Kartu 3: Pengeluaran */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Total Pengeluaran</p>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white truncate" title={formatIDR(summary.totalExpense)}>
            {formatIDR(summary.totalExpense)}
          </h2>
        </div>

      </div>

      {/* --- RIWAYAT TRANSAKSI TERAKHIR --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaksi Terakhir</h3>
          {/* Asumsi route halaman transaksimu adalah /transactions */}
          <Link href="/transactions" className="text-sm font-medium text-brand hover:text-brand-dark transition-colors cursor-pointer">
            Lihat Semua
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Belum ada transaksi tercatat.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentTransactions.map((trx) => (
              <div key={trx.id} className="group px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
                
                <div className="flex items-center gap-4">
                  {/* Ikon panah */}
                  <div className={`p-3 rounded-full flex-shrink-0 ${trx.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                    {trx.type === 'INCOME' ? (
                      <ArrowUpRight size={18} className="text-green-600 dark:text-green-500" />
                    ) : (
                      <ArrowDownRight size={18} className="text-red-600 dark:text-red-500" />
                    )}
                  </div>
                  
                  {/* Deskripsi, Kategori & Tanggal */}
                  <div>
                    <p className="group-hover:text-brand font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {trx.description || '-'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {trx.category ? (
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {trx.category}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 border border-yellow-200/50 rounded italic">
                          Tidak Berkategori
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(trx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Nominal Uang */}
                <div className={`font-bold whitespace-nowrap pl-4 ${trx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {trx.type === 'INCOME' ? '+' : '-'}{formatIDR(trx.amount)}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}