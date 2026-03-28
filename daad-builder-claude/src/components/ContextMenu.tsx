import { useEffect, useRef } from "react";

export type ContextMenuItem =
  | {
      label: string;
      icon?: string;
      onClick: () => void;
      disabled?: boolean;
      danger?: boolean;
      separator?: false;
    }
  | {
      separator: true;
      label?: never;
      icon?: never;
      onClick?: never;
      disabled?: never;
      danger?: never;
    };

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled && !item.separator) {
      item.onClick();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 10000,
        backgroundColor: "var(--bg-medium)",
        border: "1px solid var(--border-color)",
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        minWidth: 180,
        padding: "4px 0",
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={index}
              style={{
                height: 1,
                backgroundColor: "var(--border-color)",
                margin: "4px 0",
              }}
            />
          );
        }

        return (
          <div
            key={index}
            onClick={() => handleItemClick(item)}
            style={{
              padding: "8px 16px",
              cursor: item.disabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
              color: item.disabled
                ? "var(--text-dim)"
                : item.danger
                ? "var(--red-bright)"
                : "var(--text-primary)",
              opacity: item.disabled ? 0.5 : 1,
              backgroundColor: "transparent",
              transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = "var(--bg-dark)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {item.icon && <span style={{ width: 16 }}>{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
