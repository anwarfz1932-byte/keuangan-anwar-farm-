
import React from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { PieChart as PieIcon } from 'lucide-react';

interface FinancialChartProps {
  transactions: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const totalIncome = transactions.reduce((sum, tx) => sum + tx.income, 0);
  const totalOutcome = transactions.reduce((sum, tx) => sum + tx.outcome, 0);
  const total = totalIncome + totalOutcome;

  if (total === 0) return null;

  const incomePercentage = Math.round((totalIncome / total) * 100);
  const outcomePercentage = 100 - incomePercentage;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const incomeOffset = circumference - (incomePercentage / 100) * circumference;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-72 bg-white p-5 rounded-2xl shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <PieIcon size={16} className="text-blue-600" />
          Statistik Anwar Farm
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#22c55e"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={incomeOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-400">TOTAL</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Pemasukan</span>
            </div>
            <div className="text-xs font-bold text-green-600">
              {incomePercentage}% <span className="text-[9px] text-slate-400 font-normal">({formatRupiah(totalIncome)})</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Pengeluaran</span>
            </div>
            <div className="text-xs font-bold text-red-600">
              {outcomePercentage}% <span className="text-[9px] text-slate-400 font-normal">({formatRupiah(totalOutcome)})</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-50 text-center">
        <p className="text-[9px] text-slate-400 leading-tight">
          Berdasarkan data {transactions.length} transaksi Anwar Farm.
        </p>
      </div>
    </div>
  );
};

export default FinancialChart;
