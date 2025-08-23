'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import ToastNotification, { ToastProps } from '@/components/ToastNotification';

interface Toast extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (message: string, icon?: string) => void;
  showError: (message: string, icon?: string) => void;
  showInfo: (message: string, icon?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration (with fallback)
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 4000);
  }, [removeToast]);

  const showSuccess = useCallback((message: string, icon: string = '🎉') => {
    showToast({
      message,
      type: 'success',
      icon,
      duration: 4000,
    });
  }, [showToast]);

  const showError = useCallback((message: string, icon: string = '❌') => {
    showToast({
      message,
      type: 'error',
      icon,
      duration: 5000,
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, icon: string = 'ℹ️') => {
    showToast({
      message,
      type: 'info',
      icon,
      duration: 3000,
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastNotification
                {...toast}
                onClose={removeToast}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};