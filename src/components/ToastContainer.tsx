import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 border-slate-700 text-white';
        let icon = <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-900/95 border-emerald-600 text-emerald-50';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-900/95 border-rose-600 text-rose-50';
          icon = <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900/95 border-amber-600 text-amber-50';
          icon = <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-right-4 duration-200 ${bg}`}
          >
            <div className="flex items-start space-x-2.5">
              {icon}
              <p className="text-xs sm:text-sm font-serif leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-white/70 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
