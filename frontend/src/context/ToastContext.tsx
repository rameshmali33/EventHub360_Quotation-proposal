import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { addSystemNotification } from '../utils/notifications';

export type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>(null);
  const [timeoutId, setTimeoutId] = useState<any>(null);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    setToast({ show: true, message, type });
    addSystemNotification({
      title: type === 'success' ? 'Action Completed' : type === 'error' ? 'Action Failed' : 'System Update',
      desc: message,
    });
    
    const id = setTimeout(() => {
      setToast(null);
    }, duration);
    
    setTimeoutId(id);
  }, [timeoutId]);

  const hideToast = useCallback(() => {
    setToast(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, [timeoutId]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && toast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
            'bg-blue-50 border-blue-100 text-blue-800'
          }`}>
            {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <div>
              <p className="font-bold text-sm leading-none mb-1">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Action Failed' : 'Info'}
              </p>
              <p className="text-xs font-medium opacity-90">{toast.message}</p>
            </div>
            <button 
              type="button"
              onClick={hideToast}
              className="ml-4 hover:opacity-75 transition-opacity"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

