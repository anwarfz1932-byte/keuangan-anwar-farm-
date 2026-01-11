
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
    <div className="fixed bottom-4 right-4 z-40 w-64 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 no-print animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
          <PieIcon size={14} />
        </div>
        <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Statistik Bisnis</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9" // slate-100
              strokeWidth="14"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="14"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#22c55e"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={incomeOffset}
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-medium">Masuk</span>
            <span className="text-[10px] font-bold text-green-600">{incomePercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${incomePercentage}%` }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-medium">Keluar</span>
            <span className="text-[10px] font-bold text-red-600">{outcomePercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: `${outcomePercentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;
