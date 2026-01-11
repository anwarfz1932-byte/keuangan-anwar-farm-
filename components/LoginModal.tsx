
import React, { useState } from 'react';
import { X, Lock, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (success) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-transparent">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            Login Admin
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-500">
            Hanya admin yang dapat menambah, mengedit, atau menghapus transaksi. Guest hanya dapat melihat riwayat.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Masukkan password..."
              className={`w-full px-4 py-2 border rounded-lg outline-none transition-all bg-white text-slate-900 ${
                error 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">Password salah. Silakan coba lagi.</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <LogIn size={18} />
            Masuk Sekarang
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
