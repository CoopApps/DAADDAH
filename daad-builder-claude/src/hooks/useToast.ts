import { useState, useCallback } from "react";
import { ToastType } from "../components/Toast";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastData = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return showToast(message, "success", duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    return showToast(message, "error", duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    return showToast(message, "warning", duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    return showToast(message, "info", duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
}
