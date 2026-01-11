
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionFormData } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';
import FinancialSummary from './components/FinancialSummary';
import FinancialChart from './components/FinancialChart';
import LoginModal from './components/LoginModal';
import { PieChart, Search, LogIn, LogOut, User, ShieldCheck, Lock, Filter, Globe, GlobeLock } from 'lucide-react';

// Custom Chicken Icon untuk branding Anwar Farm
export const ChickenIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M11 3c0-1 1-1.5 2-1.5s2 0.5 2 1.5" />
    <circle cx="12" cy="7" r="3" />
    <path d="M15 7l2 1l-2 1" />
    <path d="M6 15c0-4 3-7 6-7s6 3 6 7v2H6v-2z" />
    <path d="M10 19v2" />
    <path d="M14 19v2" />
  </svg>
);

const STORAGE_KEY = 'anwarfarm_transactions_v1';
const ADMIN_KEY = 'anwarfarm_is_admin';
const ADMIN_PASSWORD = 'anwar09'; 

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'outcome'>('all');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedTx = localStorage.getItem(STORAGE_KEY);
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch (e) {
        console.error("Failed to load transactions", e);
      }
    }
    
    const savedAdmin = sessionStorage.getItem(ADMIN_KEY);
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const handleLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_KEY);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = (formData: TransactionFormData) => {
    if (!isAdmin) return;
    
    if (editingTransaction) {
      setTransactions(prev => prev.map(tx => 
        tx.id === editingTransaction.id 
          ? { ...tx, ...formData } 
          : tx
      ));
      setEditingTransaction(null);
    } else {
      const newTransaction: Transaction = {
        ...formData,
        id: crypto.randomUUID(),
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (!isAdmin) return;
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTransaction = (id: string) => {
    if (!isAdmin) return;
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'income' && tx.income > 0) || 
      (filterType === 'outcome' && tx.outcome > 0);
    
    const txDate = new Date(tx.date);
    const matchesStartDate = !startDate || txDate >= new Date(startDate);
    const matchesEndDate = !endDate || txDate <= new Date(endDate);
    
    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setFilterType('all');
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm no-print">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <ChickenIcon size={24} />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Anwar<span className="text-blue-600">Farm</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`}></span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-green-600' : 'text-slate-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                  <ShieldCheck size={14} />
                  ADMIN
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                  <User size={14} />
                  GUEST
                </div>
                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {!isOnline && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 animate-in fade-in slide-in-from-top-2">
            <GlobeLock size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">Anda sedang offline. Data yang Anda masukkan akan disimpan secara lokal di perangkat ini.</p>
          </div>
        )}

        <FinancialSummary transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 no-print">
            {isAdmin ? (
              <TransactionForm 
                onSave={handleSaveTransaction} 
                editingTransaction={editingTransaction}
                onCancelEdit={() => setEditingTransaction(null)}
              />
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Lock size={32} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Akses Terbatas</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Login sebagai admin untuk mengelola transaksi peternakan.
                  </p>
                </div>
                <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors">
                  Login Admin
                </button>
              </div>
            )}
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hidden lg:block">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <PieChart size={18} />
                Tips Anwar Farm
              </h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Catat setiap pembelian pakan dan penjualan hasil ternak secara rutin untuk analisis keuntungan yang akurat.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4 no-print">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Filter size={16} />
                  Penyaringan Data
                </h3>
                {(searchTerm || startDate || endDate || filterType !== 'all') && (
                  <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">Reset Filter</button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari keterangan..."
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-400">s/d</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['all', 'income', 'outcome'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                      filterType === type 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </button>
                ))}
              </div>
            </div>

            <TransactionTable 
              transactions={filteredTransactions} 
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              isSearching={searchTerm.length > 0 || startDate !== '' || endDate !== '' || filterType !== 'all'}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </main>

      <FinancialChart transactions={transactions} />

      <footer className="mt-16 text-center text-slate-400 text-sm no-print">
        &copy; {new Date().getFullYear()} Anwar Farm - Sistem Pengelolaan Keuangan Peternakan
      </footer>
    </div>
  );
};

export default App;
