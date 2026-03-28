import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "rgba(72, 187, 120, 0.2)",
          border: "var(--green-bright)",
          icon: "✓",
        };
      case "error":
        return {
          bg: "rgba(245, 101, 101, 0.2)",
          border: "var(--red-bright)",
          icon: "✕",
        };
      case "warning":
        return {
          bg: "rgba(251, 191, 36, 0.2)",
          border: "var(--amber-bright)",
          icon: "⚠",
        };
      case "info":
        return {
          bg: "rgba(66, 153, 225, 0.2)",
          border: "var(--blue-bright)",
          icon: "ℹ",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      style={{
        position: "fixed",
        top: 80,
        right: 20,
        zIndex: 10000,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 4,
        padding: "12px 16px",
        minWidth: 300,
        maxWidth: 500,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: "slideIn 0.2s ease-out",
      }}
    >
      <span style={{ fontSize: 18 }} aria-hidden="true">{colors.icon}</span>
      <span style={{ flex: 1, fontSize: 13 }}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: "none",
          color: "var(--text-dim)",
          cursor: "pointer",
          fontSize: 16,
          padding: 0,
          width: 20,
          height: 20,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
