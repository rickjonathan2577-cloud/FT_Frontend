"use client"

import { Search, Plus, Filter, Edit, Trash2, ArrowUpRight, ArrowDownRight, Loader2 , X , Download} from "lucide-react";
import { useState , useEffect } from 'react'
import api from "../lib/axios"; // Mengimpor instance axios yang telah dikonfigurasi

export default function TransactionsPage() {

  interface Category {
    id: string;
    name: string;
    type: string;
  }

  interface Transaction {
    id: string;
    amount: number;
    description: string;
    categoryId: string;
    category?: string; // Tanda tanya berarti opsional
    date: string;
    type: string;
  }
  // State DATA
  const [ transactions , setTransactions ] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ errorMessage , setErrorMessage ] = useState<string | null>(null)

  
  // --- STATE PENCARIAN & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

// --- STATE MODAL FORM (CREATE & EDIT) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);// null = mode tambah, ada ID = mode edit
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // --- STATE MODAL DELETE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const [txResponse, catResponse] = await Promise.all([
        api.get('/transaction/'),
        api.get('/category/')
      ]);
      setTransactions(txResponse.data.data || txResponse.data);
      setCategories(catResponse.data.data || catResponse.data);
      setErrorMessage(null);
    } catch (error) { 
      setErrorMessage("Something Went Wrong ")
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((trx) => {
    // 1. Cek apakah deskripsi cocok dengan kata kunci pencarian
    const matchesSearch = trx.description
      ? trx.description.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    
    // 2. Cek apakah tipe transaksi cocok dengan filter yang dipilih
    const matchesType = filterType === "ALL" || trx.type === filterType;

    // Transaksi hanya ditampilkan jika lolos kedua pengecekan di atas
    return matchesSearch && matchesType;
  });

  const handleOpenModal = () => {
      setIsModalOpen(true);
      setAmount("");
      setDescription("");
      setCategoryId("");
      setDate(new Date().toISOString().split('T')[0]);
      setSubmitError("");
    };

  const handleEditClick = (trx: Transaction) => {
    setEditingId(trx.id);
    setAmount(String(trx.amount));
    setDescription(trx.description || "");
    setCategoryId(trx.categoryId || ""); // Mengambil ID dari relasi prisma
    // Mengambil tanggal dengan format YYYY-MM-DD
    setDate(new Date(trx.date).toISOString().split('T')[0]); 
    setSubmitError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) {
      setSubmitError("Jumlah nominal dan kategori wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      
      const payload = {
        amount: Number(amount),
        categoryId: categoryId,
        description: description,
        date: date
      };

      if (editingId) {
        await api.put(`/transaction/update/${editingId}`, payload);
      } else {
        await api.post('/transaction/create', payload);
      }

      setIsModalOpen(false);
      fetchTransactions(); 
    } catch (error : any) {
      setSubmitError(error.response?.data?.message || "Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS UNTUK HAPUS ---
  const handleDeleteClick = (trx: Transaction) => {
    setTransactionToDelete(trx);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      setIsDeleting(true);
      // Asumsi endpoint delete adalah DELETE /api/transaction/:id
      await api.delete(`/transaction/delete/${transactionToDelete.id}`);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
      fetchTransactions();
    } catch (error : any) {
      console.error("Error deleting transaction:", error);
      alert(error.response?.data?.message || "Gagal menghapus transaksi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    // 1. Tentukan header kolom
    const headers = ["Tanggal", "Keterangan", "Kategori", "Tipe", "Jumlah (Rp)"];

    // 2. Lakukan mapping data ke format baris CSV
    const csvRows = filteredTransactions.map(trx => {
      const date = new Date(trx.date).toISOString().split('T')[0];
      
      // Bungkus keterangan dan kategori dengan tanda kutip untuk mencegah error 
      // jika ada karakter koma di dalam teks (misal: "Gaji, Bonus, dll")
      const description = `"${trx.description ? trx.description.replace(/"/g, '""') : '-'}"`;
      const category = `"${trx.category || 'Tidak Berkategori'}"`;
      
      const type = trx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran';
      const amount = trx.amount;

      return [date, description, category, type, amount].join(',');
    });
    // 3. Gabungkan header dan data dengan baris baru (\n)
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 4. Buat objek Blob dan URL unduhan
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 5. Buat elemen <a> virtual untuk memicu proses unduh
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Data_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // 6. Bersihkan memori
    document.body.removeChild(link);
  }

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateString : string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

 return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Filter bagian atas tetap sama persis seperti sebelumnya */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Semua Transaksi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola dan pantau seluruh riwayat keuanganmu.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Tombol Ekspor CSV */}
          <button 
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            <Download size={20} />
            <span>Ekspor CSV</span>
          </button>

          {/* Tombol Tambah Transaksi */}
          <button 
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-light text-white font-medium rounded-xl transition-colors shadow-sm cursor-pointer flex-1 sm:flex-none"
          >
            <Plus size={20} />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400" /></div>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari keterangan transaksi..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-gray-900 dark:text-white transition-all" />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter size={18} className="text-gray-500" /></div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full sm:w-auto pl-10 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-brand/50 appearance-none">
            <option value="ALL">Semua Tipe</option>
            <option value="INCOME">Pemasukan Saja</option>
            <option value="EXPENSE">Pengeluaran Saja</option>
          </select>
        </div>
      </div>

      {/* --- TABEL TRANSAKSI --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500"><Loader2 className="animate-spin mb-4" size={32} /><p>Memuat data...</p></div>
        ) : errorMessage ? (
          <div className="text-center py-20 text-red-500"><p>{errorMessage}</p><button onClick={fetchTransactions} className="mt-4 text-brand underline cursor-pointer">Coba lagi</button></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400"><p>Belum ada transaksi yang dicatat.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-right">Jumlah</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Tidak ada transaksi yang cocok.</td></tr>
                ) : (
                  filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(trx.date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${trx.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                            {trx.type === 'INCOME' ? <ArrowUpRight size={16} className="text-green-600 dark:text-green-500" /> : <ArrowDownRight size={16} className="text-red-600 dark:text-red-500" />}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-brand transition-colors line-clamp-2">{trx.description || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {trx.category ? (
                          <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">{trx.category}</span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 border border-yellow-200/50 rounded-lg italic">Tidak Berkategori</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${trx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {trx.type === 'INCOME' ? '+' : '-'}{formatIDR(trx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* TOMBOL EDIT DIHUBUNGKAN */}
                          <button onClick={() => handleEditClick(trx)} className="cursor-pointer p-2 text-gray-400 hover:text-brand bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"><Edit size={16} /></button>
                          {/* TOMBOL DELETE DIHUBUNGKAN */}
                          <button onClick={() => handleDeleteClick(trx)} className="cursor-pointer p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL FORM (TAMBAH & EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg cursor-pointer"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominal (Rp)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Contoh: 50000" min="1" disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand outline-none transition-all disabled:opacity-70" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand outline-none transition-all disabled:opacity-70 cursor-pointer">
                  <option value="" disabled className="bg-white dark:bg-gray-900 text-gray-500">-- Pilih Kategori --</option>
                  {expenseCategories.length > 0 && (
                    <optgroup label="🔴 Pengeluaran" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
                      {expenseCategories.map(cat => <option key={cat.id} value={cat.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-normal">{cat.name}</option>)}
                    </optgroup>
                  )}
                  {incomeCategories.length > 0 && (
                    <optgroup label="🟢 Pemasukan" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
                      {incomeCategories.map(cat => <option key={cat.id} value={cat.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-normal">{cat.name}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand outline-none transition-all disabled:opacity-70 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan (Opsional)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beli kopi, gaji bulanan..." disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand outline-none transition-all disabled:opacity-70" />
              </div>

              {submitError && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">{submitError}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-medium text-white bg-brand hover:bg-brand-light transition-colors flex justify-center items-center gap-2 cursor-pointer">
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : (editingId ? "Simpan Perubahan" : "Simpan Transaksi")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {isDeleteModalOpen && transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hapus Transaksi?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Apakah kamu yakin ingin menghapus transaksi <span className="font-semibold text-gray-800 dark:text-gray-200">"{transactionToDelete.description || 'Tanpa Keterangan'}"</span> sebesar {formatIDR(transactionToDelete.amount)}? 
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer">Batal</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 cursor-pointer">
                {isDeleting ? <><Loader2 size={18} className="animate-spin" /> Menghapus...</> : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}