
import React from 'react';
import { Transaction } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Pencil, Trash2, History, SearchX, Printer, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isSearching?: boolean;
  isAdmin: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onEdit, onDelete, isSearching, isAdmin }) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const chronological = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let currentBalance = 0;
  const balancesMap: Record<string, number> = {};
  
  chronological.forEach(tx => {
    currentBalance += (tx.income - tx.outcome);
    balancesMap[tx.id] = currentBalance;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
          <History size={16} className="text-blue-500" />
          {isSearching ? 'Hasil Filter' : 'Riwayat Transaksi'}
        </h2>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-200">
            {transactions.length} Data
          </span>
          {transactions.length > 0 && (
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all no-print"
              title="Cetak PDF"
            >
              <Printer size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-6 py-3 border-b border-slate-100">Keterangan & Tanggal</th>
              <th className="px-6 py-3 border-b border-slate-100 text-right">Pemasukan</th>
              <th className="px-6 py-3 border-b border-slate-100 text-right">Pengeluaran</th>
              <th className="px-6 py-3 border-b border-slate-100 text-right">Saldo Akhir</th>
              {isAdmin && <th className="px-6 py-3 border-b border-slate-100 text-center no-print w-20">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-full">
                      <SearchX size={32} className="text-slate-200" />
                    </div>
                    <span className="text-sm font-medium">Belum ada transaksi ditemukan</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedTransactions.map((tx) => {
                const isIncome = tx.income > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 leading-none mb-1">{tx.description}</div>
                          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{formatDate(tx.date)}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${isIncome ? 'text-green-600' : 'text-slate-300'}`}>
                      {isIncome ? formatRupiah(tx.income) : '-'}
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${!isIncome ? 'text-red-600' : 'text-slate-300'}`}>
                      {!isIncome ? formatRupiah(tx.outcome) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-black text-slate-900">{formatRupiah(balancesMap[tx.id])}</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus transaksi ini?')) onDelete(tx.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
