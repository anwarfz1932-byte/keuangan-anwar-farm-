
import React from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ChickenIcon } from '../App';

interface FinancialSummaryProps {
  transactions: Transaction[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ transactions }) => {
  const totalIncome = transactions.reduce((sum, tx) => sum + tx.income, 0);
  const totalOutcome = transactions.reduce((sum, tx) => sum + tx.outcome, 0);
  const netBalance = totalIncome - totalOutcome;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <ChickenIcon size={24} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">Total Saldo Peternakan</span>
        </div>
        <div className="text-2xl font-bold mb-1">
          {formatRupiah(netBalance)}
        </div>
        <div className="text-xs opacity-70">Saldo tersedia di kas Anwar Farm</div>
      </div>

      {/* Income Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-green-100 p-2 rounded-lg text-green-600">
            <TrendingUp size={24} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Pemasukan</span>
        </div>
        <div className="text-2xl font-bold text-green-600 mb-1">
          {formatRupiah(totalIncome)}
        </div>
        <div className="text-xs text-slate-400">Penjualan ternak, telur, dll</div>
      </div>

      {/* Outcome Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <TrendingDown size={24} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Pengeluaran</span>
        </div>
        <div className="text-2xl font-bold text-red-600 mb-1">
          {formatRupiah(totalOutcome)}
        </div>
        <div className="text-xs text-slate-400">Pembelian pakan, obat, operasional</div>
      </div>
    </div>
  );
};

export default FinancialSummary;
