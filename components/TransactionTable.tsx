
import React from 'react';
import { Transaction } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Pencil, Trash2, History, SearchX, FileDown, Printer } from 'lucide-react';

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

  const handleExportCSV = async () => {
    if (transactions.length === 0) return;
    
    const headers = ['Tanggal', 'Keterangan', 'Uang Masuk', 'Uang Keluar', 'Saldo'];
    const rows = [...sortedTransactions].reverse().map(tx => [
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.income,
      tx.outcome,
      balancesMap[tx.id]
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const fileName = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`;

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'CSV File',
            accept: { 'text/csv': ['.csv'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(csvContent);
        await writable.close();
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.warn("showSaveFilePicker failed, falling back to traditional download", err);
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <History size={18} className="text-slate-500" />
          {isSearching ? 'Hasil Penyaringan' : 'Seluruh Transaksi'}
        </h2>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 mr-1">
            {transactions.length} baris
          </span>
          {transactions.length > 0 && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-all shadow-sm no-print"
              >
                <Printer size={14} />
                Cetak PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-bold transition-all shadow-sm no-print"
              >
                <FileDown size={14} />
                Simpan CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-bold">Tanggal</th>
              <th className="px-6 py-3 font-bold">Keterangan</th>
              <th className="px-6 py-3 font-bold text-green-600">Masuk</th>
              <th className="px-6 py-3 font-bold text-red-600">Keluar</th>
              <th className="px-6 py-3 font-bold">Saldo</th>
              {isAdmin && <th className="px-6 py-3 font-bold text-center no-print">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <SearchX size={32} className="text-slate-200" />
                    <span className="text-sm">Tidak ada data untuk filter saat ini.</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    {tx.income > 0 ? formatRupiah(tx.income) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                    {tx.outcome > 0 ? formatRupiah(tx.outcome) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                    {formatRupiah(balancesMap[tx.id])}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-center no-print">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Hapus transaksi ini?')) onDelete(tx.id);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
