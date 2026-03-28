import { useEscapeKey } from "../hooks/useEscapeKey";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "info" | "warning" | "danger";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  type = "info",
}: ConfirmDialogProps) {
  // Close on Escape key
  useEscapeKey(onCancel, isOpen);

  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          border: "var(--red-bright)",
          confirmBg: "var(--red-bright)",
          icon: "⚠️",
        };
      case "warning":
        return {
          border: "var(--amber-bright)",
          confirmBg: "var(--amber-bright)",
          icon: "⚠️",
        };
      default:
        return {
          border: "var(--blue-bright)",
          confirmBg: "var(--blue-bright)",
          icon: "ℹ️",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "confirm-dialog-title" : undefined}
      aria-describedby="confirm-dialog-message"
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 450,
          padding: 24,
          border: `2px solid ${colors.border}`,
        }}
      >
        {/* Title */}
        {title && (
          <h3
            id="confirm-dialog-title"
            style={{
              margin: "0 0 16px 0",
              color: colors.border,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span aria-hidden="true">{colors.icon}</span>
            {title}
          </h3>
        )}

        {/* Message */}
        <p
          id="confirm-dialog-message"
          style={{
            margin: "0 0 24px 0",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            style={{
              backgroundColor: colors.confirmBg,
              borderColor: colors.confirmBg,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
