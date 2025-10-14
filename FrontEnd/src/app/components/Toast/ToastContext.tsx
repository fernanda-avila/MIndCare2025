"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

type Toast = { id: string; message: string };

const ToastContext = createContext<{ showToast: (msg: string) => void } | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: '#111827', color: 'white', padding: '10px 14px', borderRadius: 8, marginTop: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
