
import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { PieChart as PieIcon, ChevronDown, Activity, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface FinancialChartProps {
  transactions: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<'income' | 'outcome' | null>(null);
  
  const totalIncome = transactions.reduce((sum, tx) => sum + tx.income, 0);
  const totalOutcome = transactions.reduce((sum, tx) => sum + tx.outcome, 0);
  const total = totalIncome + totalOutcome;

  if (total === 0) return null;

  const incomePercentage = Math.round((totalIncome / total) * 100);
  const outcomePercentage = 100 - incomePercentage;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const incomeOffset = circumference - (incomePercentage / 100) * circumference;

  return (
    <div 
      key={`${transactions.length}-${isMinimized}`}
      className={`fixed bottom-6 right-6 z-[60] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] no-print animate-fadeIn ${
        isMinimized ? 'w-14 h-14' : 'w-80'
      }`}
    >
      {isMinimized ? (
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-full h-full bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-pulseSoft"
          title="Buka Statistik"
        >
          <PieIcon size={24} />
        </button>
      ) : (
        <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white ring-1 ring-slate-200/50 overflow-hidden group hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 group-hover:animate-float">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Live Insights</h2>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Updating Real-time</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-90"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Chart Section */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full"></div>
              
              <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                {/* Outcome Segment (Base) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={hoveredSegment === 'outcome' ? '#dc2626' : '#ef4444'}
                  strokeWidth={hoveredSegment === 'outcome' ? '14' : '10'}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSegment('outcome')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
                {/* Income Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={hoveredSegment === 'income' ? '#16a34a' : '#22c55e'}
                  strokeWidth={hoveredSegment === 'income' ? '14' : '10'}
                  strokeDasharray={circumference}
                  strokeDashoffset={incomeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out cursor-pointer"
                  onMouseEnter={() => setHoveredSegment('income')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                <span className={`text-[10px] font-black transition-colors duration-300 ${hoveredSegment === 'income' ? 'text-green-600' : hoveredSegment === 'outcome' ? 'text-red-600' : 'text-slate-400'}`}>
                  {hoveredSegment ? (hoveredSegment === 'income' ? incomePercentage : outcomePercentage) + '%' : 'HEALTH'}
                </span>
                <span className="text-xs font-black text-slate-800 tracking-tighter">SCORE</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {/* Progress Bar Income */}
              <div 
                className={`space-y-1.5 transition-all duration-300 ${hoveredSegment === 'income' ? 'scale-105' : hoveredSegment === 'outcome' ? 'opacity-50 grayscale' : ''}`}
                onMouseEnter={() => setHoveredSegment('income')}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={10} className="text-green-500" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Inflow</span>
                  </div>
                  <span className="text-[10px] font-black text-green-600">{incomePercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                    style={{ width: `${incomePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Progress Bar Outcome */}
              <div 
                className={`space-y-1.5 transition-all duration-300 ${hoveredSegment === 'outcome' ? 'scale-105' : hoveredSegment === 'income' ? 'opacity-50 grayscale' : ''}`}
                onMouseEnter={() => setHoveredSegment('outcome')}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={10} className="text-red-500" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Outflow</span>
                  </div>
                  <span className="text-[10px] font-black text-red-600">{outcomePercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                    style={{ width: `${outcomePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Transaction Volume</span>
              <div className="group/info relative">
                <Info size={12} className="text-slate-300 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-[70] shadow-xl">
                  Gabungan seluruh pemasukan dan pengeluaran yang tercatat.
                </div>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
               <p className="text-xl font-black text-slate-900 tracking-tight">{formatRupiah(totalIncome + totalOutcome)}</p>
               <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors ${
                 incomePercentage > 50 
                   ? 'bg-green-500 text-white' 
                   : 'bg-red-500 text-white'
               }`}>
                 {incomePercentage > 50 ? 'Strong' : 'Critical'}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialChart;
