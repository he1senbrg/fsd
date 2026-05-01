'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

const ICONS = {
  success: { icon: 'check_circle', color: 'text-emerald-500' },
  error: { icon: 'cancel', color: 'text-red-500' },
  info: { icon: 'info', color: 'text-blue-500' },
  warning: { icon: 'warning', color: 'text-amber-500' },
};

function ToastItem({ id, message, type = 'info', onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(id), 300);
    }, 4000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [id, onDismiss]);

  const { icon, color } = ICONS[type] || ICONS.info;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 w-full max-w-sm bg-white border border-stone-200 rounded-xl shadow-lg px-4 py-3 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <span className={`material-symbols-outlined text-xl mt-0.5 flex-shrink-0 ${color}`}>
        {icon}
      </span>
      <p className="text-sm text-stone-700 font-medium flex-1">{message}</p>
      <Button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(id), 300);
        }}
        className="ml-1 text-stone-400 hover:text-stone-600 flex-shrink-0"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </Button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
