
import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { PieChart as PieIcon, ChevronDown, ChevronUp, Activity } from 'lucide-react';

interface FinancialChartProps {
  transactions: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  
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
    <div 
      key={`${transactions.length}-${isMinimized}`}
      className={`fixed bottom-6 right-6 z-[60] transition-all duration-300 ease-in-out no-print animate-fadeIn ${
        isMinimized ? 'w-12 h-12' : 'w-72'
      }`}
    >
      {isMinimized ? (
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-full h-full bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          title="Buka Statistik"
        >
          <PieIcon size={20} />
        </button>
      ) : (
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/20 ring-1 ring-slate-200/50 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
                <Activity size={16} />
              </div>
              <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Ringkasan Bisnis</h2>
            </div>
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
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
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-slate-400 leading-none">CASH</span>
                <span className="text-xs font-black text-slate-800 tracking-tighter">FLOW</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Pemasukan</span>
                  <span className="text-[10px] font-black text-green-600">{incomePercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${incomePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Pengeluaran</span>
                  <span className="text-[10px] font-black text-red-600">{outcomePercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${outcomePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
             <div>
               <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Total Turn Over</p>
               <p className="text-sm font-black text-slate-800 leading-none">{formatRupiah(totalIncome + totalOutcome)}</p>
             </div>
             <div className="text-right">
               <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${incomePercentage > 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {incomePercentage > 50 ? 'Sehat' : 'Defisit'}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialChart;