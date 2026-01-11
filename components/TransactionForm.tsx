
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

    if (incomeVal < 0 || outcomeVal < 0) {
      alert('Nilai uang tidak boleh negatif.');
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

  const inputContainerClasses = "relative flex items-center";
  const iconClasses = "absolute left-3 text-slate-400 pointer-events-none";
  const baseInputClasses = "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 outline-none transition-all duration-200 hover:border-slate-300";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transform transition-all">
      <div className={`h-1.5 w-full ${editingTransaction ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${editingTransaction ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              {editingTransaction ? <Save size={22} /> : <PlusCircle size={22} />}
            </div>
            {editingTransaction ? 'Edit Transaksi' : 'Transaksi Baru'}
          </h2>
          {editingTransaction && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-md">
              Mode Edit
            </span>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">
                Tanggal Transaksi
              </label>
              <div className={inputContainerClasses}>
                <Calendar size={18} className={iconClasses} />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`${baseInputClasses} focus:ring-blue-500/20 focus:border-blue-500`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">
                Keterangan / Deskripsi
              </label>
              <div className={inputContainerClasses}>
                <FileText size={18} className={iconClasses} />
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Contoh: Belanja Stok Barang"
                  className={`${baseInputClasses} focus:ring-blue-500/20 focus:border-blue-500`}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-green-600 uppercase tracking-tight ml-1">
                Uang Masuk
              </label>
              <div className={inputContainerClasses}>
                <ArrowUpCircle size={18} className="absolute left-3 text-green-500 pointer-events-none" />
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  placeholder="0"
                  className={`${baseInputClasses} pl-10 focus:ring-green-500/20 focus:border-green-500 border-green-100`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-red-600 uppercase tracking-tight ml-1">
                Uang Keluar
              </label>
              <div className={inputContainerClasses}>
                <ArrowDownCircle size={18} className="absolute left-3 text-red-500 pointer-events-none" />
                <input
                  type="number"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  placeholder="0"
                  className={`${baseInputClasses} pl-10 focus:ring-red-500/20 focus:border-red-500 border-red-100`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={`flex-1 ${editingTransaction ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-[0.98]`}
            >
              {editingTransaction ? <Save size={18} /> : <PlusCircle size={18} />}
              {editingTransaction ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </button>
            
            {editingTransaction && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center gap-2 font-semibold active:scale-[0.98]"
              >
                <XCircle size={18} />
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
      
      {!editingTransaction && (
        <div className="px-6 py-3 bg-blue-50/50 border-t border-blue-50">
          <p className="text-[10px] text-blue-500 font-medium text-center">
            Tips: Kosongkan salah satu kolom nilai jika tidak diperlukan.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionForm;
