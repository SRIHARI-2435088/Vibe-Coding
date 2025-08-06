import React, { useState, useCallback } from 'react';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant: 'default' | 'destructive';
  duration: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastCount = 0;
const toastListeners: Array<(state: ToastState) => void> = [];
let toastState: ToastState = { toasts: [] };

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = `toast-${++toastCount}`;
  const newToast: Toast = {
    id,
    variant: 'default',
    duration: 5000,
    ...toast,
  };

  toastState = {
    toasts: [...toastState.toasts, newToast],
  };

  // Auto-remove toast after duration
  setTimeout(() => {
    removeToast(id);
  }, newToast.duration);

  // Notify all listeners
  toastListeners.forEach(listener => listener(toastState));
};

const removeToast = (id: string) => {
  toastState = {
    toasts: toastState.toasts.filter(toast => toast.id !== id),
  };

  // Notify all listeners
  toastListeners.forEach(listener => listener(toastState));
};

export const useToast = () => {
  const [state, setState] = useState<ToastState>(toastState);

  const addListener = useCallback((listener: (state: ToastState) => void) => {
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  // Subscribe to toast state changes
  React.useEffect(() => {
    const unsubscribe = addListener(setState);
    return unsubscribe;
  }, [addListener]);

  const toast = useCallback((options: ToastOptions) => {
    addToast(options);
  }, []);

  const dismiss = useCallback((toastId: string) => {
    removeToast(toastId);
  }, []);

  return {
    toast,
    dismiss,
    toasts: state.toasts,
  };
};

// Convenience methods
export const toast = {
  success: (title: string, description?: string) => {
    addToast({
      title,
      description,
      variant: 'default',
    });
  },
  
  error: (title: string, description?: string) => {
    addToast({
      title,
      description,
      variant: 'destructive',
    });
  },

  info: (title: string, description?: string) => {
    addToast({
      title,
      description,
      variant: 'default',
    });
  },
}; 