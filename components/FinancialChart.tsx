
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { PieChart as PieIcon, ChevronDown, Activity, TrendingUp, TrendingDown, Info, LineChart as LineIcon, LayoutGrid } from 'lucide-react';

interface FinancialChartProps {
  transactions: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState<'overview' | 'trends'>('overview');
  const [hoveredSegment, setHoveredSegment] = useState<'income' | 'outcome' | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const totalIncome = transactions.reduce((sum, tx) => sum + tx.income, 0);
  const totalOutcome = transactions.reduce((sum, tx) => sum + tx.outcome, 0);
  const total = totalIncome + totalOutcome;

  // Memproses data untuk Grafik Tren (7 hari terakhir dari data yang ada)
  const trendData = useMemo(() => {
    const grouped: Record<string, { income: number; outcome: number }> = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(tx => {
      if (!grouped[tx.date]) grouped[tx.date] = { income: 0, outcome: 0 };
      grouped[tx.date].income += tx.income;
      grouped[tx.date].outcome += tx.outcome;
    });

    const dates = Object.keys(grouped);
    const lastDates = dates.slice(-7);
    
    return lastDates.map(date => ({
      date,
      label: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      ...grouped[date]
    }));
  }, [transactions]);

  // Hitung total khusus untuk data yang tampil di grafik tren
  const trendTotals = useMemo(() => {
    return trendData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      outcome: acc.outcome + curr.outcome
    }), { income: 0, outcome: 0 });
  }, [trendData]);

  if (total === 0) return null;

  const incomePercentage = Math.round((totalIncome / total) * 100);
  const outcomePercentage = 100 - incomePercentage;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const incomeOffset = circumference - (incomePercentage / 100) * circumference;

  const chartWidth = 240;
  const chartHeight = 80;
  const maxVal = Math.max(...trendData.map(d => Math.max(d.income, d.outcome)), 1000);
  
  const getPoints = (type: 'income' | 'outcome') => {
    if (trendData.length < 2) return "";
    return trendData.map((d, i) => {
      const x = (i / (trendData.length - 1)) * chartWidth;
      const y = chartHeight - (d[type] / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div 
      key={`${transactions.length}-${isMinimized}-${view}`}
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
          {view === 'overview' ? <PieIcon size={24} /> : <LineIcon size={24} />}
        </button>
      ) : (
        <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white ring-1 ring-slate-200/50 overflow-hidden group hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Live Insights</h2>
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 mt-1">
                  <button onClick={() => setView('overview')} className={`p-1 rounded-md transition-all ${view === 'overview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <LayoutGrid size={12} />
                  </button>
                  <button onClick={() => setView('trends')} className={`p-1 rounded-md transition-all ${view === 'trends' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <LineIcon size={12} />
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all active:scale-90">
              <ChevronDown size={20} />
            </button>
          </div>

          {view === 'overview' ? (
            <div className="flex flex-col gap-6 mb-6 animate-fadeIn">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#ef4444" strokeWidth={hoveredSegment === 'outcome' ? '14' : '10'} onMouseEnter={() => setHoveredSegment('outcome')} onMouseLeave={() => setHoveredSegment(null)} className="transition-all duration-300 cursor-pointer" />
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#22c55e" strokeWidth={hoveredSegment === 'income' ? '14' : '10'} strokeDasharray={circumference} strokeDashoffset={incomeOffset} strokeLinecap="round" onMouseEnter={() => setHoveredSegment('income')} onMouseLeave={() => setHoveredSegment(null)} className="transition-all duration-1000 ease-out cursor-pointer" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-400">HEALTH</span>
                    <span className="text-xs font-black text-slate-800 tracking-tighter">SCORE</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className={`transition-all duration-300 ${hoveredSegment === 'income' ? 'scale-105' : hoveredSegment === 'outcome' ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Masuk</span>
                      <span className="text-[10px] font-black text-green-600">{incomePercentage}%</span>
                    </div>
                    <div className="text-xs font-black text-green-600 leading-none">{formatRupiah(totalIncome)}</div>
                  </div>
                  
                  <div className={`transition-all duration-300 ${hoveredSegment === 'outcome' ? 'scale-105' : hoveredSegment === 'income' ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Keluar</span>
                      <span className="text-[10px] font-black text-red-600">{outcomePercentage}%</span>
                    </div>
                    <div className="text-xs font-black text-red-600 leading-none">{formatRupiah(totalOutcome)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 animate-fadeIn">
              <div className="h-32 relative flex items-end justify-center mb-4">
                {trendData.length < 2 ? (
                  <div className="text-[10px] text-slate-400 font-bold uppercase italic">Butuh lebih banyak data...</div>
                ) : (
                  <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                    <polyline fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={getPoints('outcome')} className="opacity-30" />
                    <polyline fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={getPoints('income')} />
                    {trendData.map((d, i) => {
                      const x = (i / (trendData.length - 1)) * chartWidth;
                      const yInc = chartHeight - (d.income / maxVal) * chartHeight;
                      const yOut = chartHeight - (d.outcome / maxVal) * chartHeight;
                      return (
                        <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                          <circle cx={x} cy={yInc} r={hoveredPoint === i ? "5" : "3"} fill="#22c55e" className="transition-all duration-200 cursor-pointer" />
                          <circle cx={x} cy={yOut} r={hoveredPoint === i ? "4" : "2"} fill="#ef4444" fillOpacity="0.5" className="transition-all duration-200 cursor-pointer" />
                          {hoveredPoint === i && <line x1={x} y1="0" x2={x} y2={chartHeight} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />}
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
              
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                {hoveredPoint !== null ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{trendData[hoveredPoint].date}</span>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={12} className="text-green-500" />
                        <span className="text-[11px] font-black text-green-600">{formatRupiah(trendData[hoveredPoint].income)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown size={12} className="text-red-500" />
                        <span className="text-[11px] font-black text-red-600">{formatRupiah(trendData[hoveredPoint].outcome)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-black text-slate-400 uppercase">Avg Inflow</span>
                      </div>
                      <div className="text-[10px] font-black text-slate-700 leading-none">{formatRupiah(trendTotals.income)}</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="text-[8px] font-black text-slate-400 uppercase">Avg Outflow</span>
                      </div>
                      <div className="text-[10px] font-black text-slate-700 leading-none">{formatRupiah(trendTotals.outcome)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Turn Over</span>
              <Info size={12} className="text-slate-300" />
            </div>
            <div className="flex items-baseline justify-between">
               <p className="text-xl font-black text-slate-900 tracking-tight">{formatRupiah(totalIncome + totalOutcome)}</p>
               <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${incomePercentage > 50 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
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
