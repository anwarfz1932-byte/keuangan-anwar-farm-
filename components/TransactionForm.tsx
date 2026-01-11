
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionFormData } from '../types';
import { PlusCircle, Save, XCircle, Calendar, FileText, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface TransactionFormProps {
  onSave: (data: TransactionFormData) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
}

interface InternalFormData {
  date: string;
  description: string;
  income: number | string;
  outcome: number | string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, editingTransaction, onCancelEdit }) => {
  const [formData, setFormData] = useState<InternalFormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    income: '',
    outcome: '',
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        date: editingTransaction.date,
        description: editingTransaction.description,
        income: editingTransaction.income === 0 ? '' : editingTransaction.income,
        outcome: editingTransaction.outcome === 0 ? '' : editingTransaction.outcome,
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        income: '',
        outcome: '',
      });
    }
  }, [editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.date) {
      alert('Mohon lengkapi keterangan dan tanggal.');
      return;
    }

    const incomeVal = Number(formData.income) || 0;
    const outcomeVal = Number(formData.outcome) || 0;

    if (incomeVal === 0 && outcomeVal === 0) {
      alert('Masukkan nilai pemasukan atau pengeluaran.');
      return;
    }

    onSave({
      date: formData.date,
      description: formData.description,
      income: incomeVal,
      outcome: outcomeVal,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      income: '',
      outcome: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const inputClasses = "w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm";

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${editingTransaction ? 'border-amber-200' : 'border-blue-100'} overflow-hidden`}>
      <div className={`p-4 ${editingTransaction ? 'bg-amber-50/50' : 'bg-blue-50/30'} border-b border-inherit flex items-center justify-between`}>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          {editingTransaction ? (
            <><Save size={16} className="text-amber-600" /> Perbarui Data</>
          ) : (
            <><PlusCircle size={16} className="text-blue-600" /> Catat Transaksi Baru</>
          )}
        </h2>
        {editingTransaction && (
          <button onClick={onCancelEdit} className="text-slate-400 hover:text-slate-600"><XCircle size={16}/></button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative">
            <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Keterangan (Contoh: Jual Ayam)"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <ArrowUpCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              placeholder="Masuk"
              className={`${inputClasses} border-green-100 focus:border-green-500`}
            />
          </div>
          <div className="relative">
            <ArrowDownCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
            <input
              type="number"
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              placeholder="Keluar"
              className={`${inputClasses} border-red-100 focus:border-red-500`}
            />
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-2.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
            editingTransaction 
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
          } active:scale-[0.98] text-sm`}
        >
          {editingTransaction ? <Save size={16} /> : <PlusCircle size={16} />}
          {editingTransaction ? 'Simpan Perubahan' : 'Catat Sekarang'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
