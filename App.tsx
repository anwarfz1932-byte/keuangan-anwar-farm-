
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFormData } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';
import FinancialSummary from './components/FinancialSummary';
import FinancialChart from './components/FinancialChart';
import LoginModal from './components/LoginModal';
import { 
  Search, LogIn, LogOut, ShieldCheck, 
  Lock, Share2, CloudSync, 
  Loader2
} from 'lucide-react';

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
const CLOUD_BIN_ID = '9798055620958189c424'; 
const CLOUD_API_URL = `https://api.npoint.io/${CLOUD_BIN_ID}`;

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'outcome'>('all');

  const fetchDataFromCloud = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const response = await fetch(CLOUD_API_URL);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Migrasi data lama jika tidak punya createdAt
          const migratedData = data.map((tx, index) => ({
            ...tx,
            createdAt: tx.createdAt || (Date.now() - (data.length - index) * 1000)
          }));
          setTransactions(migratedData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
        }
      }
    } catch (error) {
      console.error("Failed to sync from cloud", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveDataToCloud = async (newData: Transaction[]) => {
    if (!isAdmin || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      await fetch(CLOUD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (error) {
      console.error("Failed to push to cloud", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedTx = localStorage.getItem(STORAGE_KEY);
    if (savedTx) {
      try {
        const parsed = JSON.parse(savedTx);
        // Migrasi data local
        const migrated = parsed.map((tx: any, index: number) => ({
          ...tx,
          createdAt: tx.createdAt || (Date.now() - (parsed.length - index) * 1000)
        }));
        setTransactions(migrated);
      } catch (e) { console.error(e); }
    }

    fetchDataFromCloud();
    
    if (sessionStorage.getItem(ADMIN_KEY) === 'true') {
      setIsAdmin(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchDataFromCloud]);

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

  const handleSaveTransaction = async (formData: TransactionFormData) => {
    if (!isAdmin) return;
    let updatedTransactions: Transaction[];
    if (editingTransaction) {
      updatedTransactions = transactions.map(tx => 
        tx.id === editingTransaction.id ? { ...tx, ...formData } : tx
      );
      setEditingTransaction(null);
    } else {
      updatedTransactions = [...transactions, { 
        ...formData, 
        id: crypto.randomUUID(), 
        createdAt: Date.now() 
      }];
    }
    setTransactions(updatedTransactions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    await saveDataToCloud(updatedTransactions);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (!isAdmin) return;
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!isAdmin) return;
    const updatedTransactions = transactions.filter(tx => tx.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    await saveDataToCloud(updatedTransactions);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || (filterType === 'income' && tx.income > 0) || (filterType === 'outcome' && tx.outcome > 0);
    const txDate = new Date(tx.date);
    const matchesStartDate = !startDate || txDate >= new Date(startDate);
    const matchesEndDate = !endDate || txDate <= new Date(endDate);
    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="min-h-screen pb-32 bg-slate-50">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <ChickenIcon size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-slate-800 leading-none">Anwar<span className="text-blue-600">Farm</span></h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                {isSyncing ? <Loader2 size={10} className="animate-spin" /> : <CloudSync size={10} />}
                Cloud Sync Active
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link dashboard berhasil disalin!');
              }}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              title="Bagikan Dashboard"
            >
              <Share2 size={18} />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            {isAdmin ? (
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                <LogOut size={14} /> KELUAR
              </button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all">
                <LogIn size={14} /> LOGIN ADMIN
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        <FinancialSummary transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-6 no-print">
            {isAdmin ? (
              <TransactionForm onSave={handleSaveTransaction} editingTransaction={editingTransaction} onCancelEdit={() => setEditingTransaction(null)} />
            ) : (
              <div className="bg-slate-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Lock size={80} /></div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-400" /> Mode Tamu</h3>
                <p className="text-sm text-slate-400 mb-4">Anda hanya dapat melihat data. Login sebagai Admin untuk mencatat transaksi baru.</p>
                <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-all text-sm">Login Admin</button>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div className="flex items-center bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                {(['all', 'income', 'outcome'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${
                      filterType === type 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {type === 'all' ? 'Semua' : type === 'income' ? 'Masuk' : 'Keluar'}
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
    </div>
  );
};

export default App;
