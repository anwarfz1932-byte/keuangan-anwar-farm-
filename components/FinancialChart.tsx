
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

  // Memproses data untuk Grafik Tren
  const trendData = useMemo(() => {
    const grouped: Record<string, { income: number; outcome: number }> = {};
    
    // Urutkan transaksi berdasarkan tanggal
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(tx => {
      if (!grouped[tx.date]) grouped[tx.date] = { income: 0, outcome: 0 };
      grouped[tx.date].income += tx.income;
      grouped[tx.date].outcome += tx.outcome;
    });

    const dates = Object.keys(grouped);
    // Batasi ke 7 titik terakhir untuk kejelasan di widget kecil
    const lastDates = dates.slice(-7);
    
    return lastDates.map(date => ({
      date,
      label: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      ...grouped[date]
    }));
  }, [transactions]);

  if (total === 0) return null;

  const incomePercentage = Math.round((totalIncome / total) * 100);
  const outcomePercentage = 100 - incomePercentage;

  // Konstanta untuk Donut Chart
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const incomeOffset = circumference - (incomePercentage / 100) * circumference;

  // Kalkulasi Titik untuk Line Chart (SVG)
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
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 group-hover:animate-float">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Live Insights</h2>
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 mt-1">
                  <button 
                    onClick={() => setView('overview')}
                    className={`p-1 rounded-md transition-all ${view === 'overview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid size={12} />
                  </button>
                  <button 
                    onClick={() => setView('trends')}
                    className={`p-1 rounded-md transition-all ${view === 'trends' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LineIcon size={12} />
                  </button>
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

          {view === 'overview' ? (
            /* Overview View (Donut Chart) */
            <div className="flex items-center gap-6 mb-6 animate-fadeIn">
              <div className="relative w-24 h-24 flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full"></div>
                <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r={radius} fill="transparent"
                    stroke={hoveredSegment === 'outcome' ? '#dc2626' : '#ef4444'}
                    strokeWidth={hoveredSegment === 'outcome' ? '14' : '10'}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredSegment('outcome')}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                  <circle
                    cx="50" cy="50" r={radius} fill="transparent"
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
                <div className={`space-y-1.5 transition-all duration-300 ${hoveredSegment === 'income' ? 'scale-105' : hoveredSegment === 'outcome' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Inflow</span>
                      <span className="text-[9px] font-bold text-green-600/80 leading-none mt-0.5">{formatRupiah(totalIncome)}</span>
                    </div>
                    <span className="text-[11px] font-black text-green-600">{incomePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                    <div className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${incomePercentage}%` }}></div>
                  </div>
                </div>
                
                <div className={`space-y-1.5 transition-all duration-300 ${hoveredSegment === 'outcome' ? 'scale-105' : hoveredSegment === 'income' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Outflow</span>
                      <span className="text-[9px] font-bold text-red-600/80 leading-none mt-0.5">{formatRupiah(totalOutcome)}</span>
                    </div>
                    <span className="text-[11px] font-black text-red-600">{outcomePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                    <div className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${outcomePercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Trends View (Line Chart) */
            <div className="mb-6 animate-fadeIn">
              <div className="h-32 relative flex items-end justify-center mb-2">
                {trendData.length < 2 ? (
                  <div className="text-[10px] text-slate-400 font-bold uppercase italic">Butuh lebih banyak data untuk tren...</div>
                ) : (
                  <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                    {/* Grids */}
                    <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1={chartHeight/2} x2={chartWidth} y2={chartHeight/2} stroke="#f1f5f9" strokeWidth="1" />
                    
                    {/* Outcome Line */}
                    <polyline
                      fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      points={getPoints('outcome')} className="opacity-40"
                    />
                    {/* Income Line */}
                    <polyline
                      fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      points={getPoints('income')}
                    />

                    {/* Interaction Points */}
                    {trendData.map((d, i) => {
                      const x = (i / (trendData.length - 1)) * chartWidth;
                      const yInc = chartHeight - (d.income / maxVal) * chartHeight;
                      const yOut = chartHeight - (d.outcome / maxVal) * chartHeight;
                      return (
                        <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                          <circle cx={x} cy={yInc} r={hoveredPoint === i ? "5" : "3"} fill="#22c55e" className="transition-all duration-200 cursor-pointer" />
                          <circle cx={x} cy={yOut} r={hoveredPoint === i ? "4" : "2"} fill="#ef4444" fillOpacity="0.5" className="transition-all duration-200 cursor-pointer" />
                          {hoveredPoint === i && (
                            <line x1={x} y1="0" x2={x} y2={chartHeight} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                          )}
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
              
              {/* Tooltip Dinamis untuk Tren */}
              <div className="h-10 flex items-center justify-between px-2 bg-slate-50/50 rounded-xl border border-slate-100">
                {hoveredPoint !== null ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase leading-none">{trendData[hoveredPoint].label}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-black text-green-600">+{formatRupiah(trendData[hoveredPoint].income)}</span>
                        <span className="text-[10px] font-black text-red-600">-{formatRupiah(trendData[hoveredPoint].outcome)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase">In</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 opacity-50"></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase">Out</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 italic">Geser titik untuk detail</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Stats */}
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Volume</span>
              <div className="group/info relative">
                <Info size={12} className="text-slate-300 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-[70] shadow-xl">
                  {view === 'overview' ? 'Proporsi aliran uang masuk & keluar.' : 'Visualisasi tren harian bisnis Anda.'}
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
