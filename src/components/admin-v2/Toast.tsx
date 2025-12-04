import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      gradient: 'from-[#10b981] to-[#059669]',
      bg: 'bg-[#10b981]',
    },
    error: {
      icon: XCircle,
      gradient: 'from-[#E74C3C] to-[#C0392B]',
      bg: 'bg-[#E74C3C]',
    },
    info: {
      icon: Info,
      gradient: 'from-[#B6F500] to-[#A4DD00]',
      bg: 'bg-[#B6F500]',
    },
  };

  const { icon: Icon, gradient } = config[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300`}>
      <div className={`bg-gradient-to-r ${gradient} text-white rounded-xl shadow-2xl p-4 pr-12 max-w-md`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Container Hook
export function useToast() {
  const [toast, setToast] = React.useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
  };

  const ToastContainer = toast ? (
    <Toast
      type={toast.type}
      message={toast.message}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastContainer };
}
