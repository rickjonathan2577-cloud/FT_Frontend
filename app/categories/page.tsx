  "use client";

  import axios from 'axios'
  import { Plus, Edit, Trash2, TrendingUp, TrendingDown, LayoutGrid, Loader2, X } from "lucide-react";
  import { useState, useEffect } from 'react'

  axios.defaults.withCredentials = true;
  
  


  export default function CategoriesPage() {

    interface Category {
      id: string;
      name: string;
      type: string;
      count?: number;
    }

    const [categories, setCategories] = useState<Category[]>([]);
    const [ isLoading, setIsloading ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null); // TAMBAHKAN <string | null>

    // modal untuk tambak kategori //
    const [ isModalOpen , setIsModalOpen ] = useState(false);
    const [ categoryName, setCategoryName ] = useState("");
    const [ categoryType, setCategoryType]  = useState("");
    const [ isSubmitting, setIsSubmitting]  = useState(false);
    const [ submitError, setSubmitError   ] = useState("");

    // --- STATE UNTUK DELETE MODAL ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // TAMBAHKAN TIPE DATA UNTUK OBJECT categoryToDelete
    const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null); 
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = async () => {
          try{ 
            setIsloading(true);
            const response = await axios.get('http://localhost:5000/api/category/');

            setCategories(response.data.data)
            console.log(categories)
            setErrorMessage(null);
          } catch (err){
            setErrorMessage("Gagal memuat data")
          } finally {
            setIsloading(false);
          }
        };

    useEffect(() => {
        fetchCategories();
    }, [])

    const OpenModalAdd = () => {
        setIsModalOpen(true);
        setCategoryName("");
        setCategoryType("EXPENSE");
        setSubmitError("");
    };

    const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      // Panggil endpoint delete backend dengan ID dari state
      await axios.delete(`http://localhost:5000/api/category/delete/${categoryToDelete.id}`);
      
      // Sukses: Tutup modal, reset state, dan refresh data grid
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories(); 
      
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
      alert("Gagal menghapus kategori. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman reload saat form disubmit
    
    // Validasi basic di frontend
    if (!categoryName.trim()) {
      setSubmitError("Nama kategori tidak boleh kosong!");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      
      // Hit endpoint create kategori
      await axios.post('http://localhost:5000/api/category/create', {
        name: categoryName,
        type: categoryType
      });

      // Jika sukses: tutup modal dan fetch ulang data
      setIsModalOpen(false);
      fetchCategories();
      
    } catch (error) {
      // Menangkap error dari backend
      if (axios.isAxiosError(error) && error.response) {
        setSubmitError(error.response.data.message || "Gagal menambahkan kategori.");
      } else {
        setSubmitError("Terjadi kesalahan sistem.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
    
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER & TOMBOL TAMBAH --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-brand" size={28} />
            Kategori Transaksi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Atur pos-pos keuangan agar pencatatanmu lebih terstruktur.
          </p>
        </div>
        
        {/* Tombol dimodifikasi untuk membuka Modal */}
        <button 
          onClick={OpenModalAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-light text-white font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* --- KONDISI RENDER GRID (Kode aslimu tetap sama) --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Memuat kategori...</p>
        </div>
      ) : errorMessage ? (
        <div className="text-center py-20 text-red-500">
          <p>{errorMessage}</p>
          <button onClick={fetchCategories} className="mt-4 text-brand underline cursor-pointer">
            Coba lagi
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p>Belum ada kategori. Silakan tambah kategori baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="group relative bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand/30 dark:hover:border-brand/50 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${cat.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {cat.type === 'INCOME' ? (
                    <TrendingUp size={22} className="text-green-600 dark:text-green-500" />
                  ) : (
                    <TrendingDown size={22} className="text-red-600 dark:text-red-500" />
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                  onClick={() => {
                    setCategoryToDelete({ id: cat.id, name: cat.name });
                    setIsDeleteModalOpen(true);
                  }}
                  className="cursor-pointer p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${cat.type === 'INCOME' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                    {cat.type === 'INCOME' ? 'PEMASUKAN' : 'PENGELUARAN'}
                  </span>
                  <span className="text-xs text-gray-400">
                    • {cat.count || 0} Transaksi
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL POP-UP TAMBAH KATEGORI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          {/* Kontainer Modal */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Kategori</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Input Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Kategori
                </label>
                <input 
                  type="text" 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Contoh: Belanja Bulanan"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all disabled:opacity-70"
                />
              </div>

              {/* Pemilihan Tipe (Pemasukan / Pengeluaran) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Transaksi
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryType('EXPENSE')}
                    className={`flex-1 py-3 rounded-xl font-medium border transition-all cursor-pointer ${categoryType === 'EXPENSE' 
                        ? 'bg-red-50 border-red-500 text-red-600 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType('INCOME')}
                    className={`flex-1 py-3 rounded-xl font-medium border transition-all cursor-pointer ${
                      categoryType === 'INCOME' 
                        ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>

              {/* Tampilkan Error dari Backend/Validasi jika ada */}
              {submitError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                  {submitError}
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="flex gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-medium text-white bg-brand hover:bg-brand-light transition-colors flex justify-center items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Hapus Kategori?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Apakah kamu yakin ingin menghapus kategori <span className="font-semibold text-gray-800 dark:text-gray-200">"{categoryToDelete.name}"</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    );
  }