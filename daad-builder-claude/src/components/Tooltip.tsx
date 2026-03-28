import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      let x = rect.left;
      let y = rect.top;

      switch (position) {
        case "top":
          x = rect.left + rect.width / 2;
          y = rect.top - 8;
          break;
        case "bottom":
          x = rect.left + rect.width / 2;
          y = rect.bottom + 8;
          break;
        case "left":
          x = rect.left - 8;
          y = rect.top + rect.height / 2;
          break;
        case "right":
          x = rect.right + 8;
          y = rect.top + rect.height / 2;
          break;
      }

      setTooltipPosition({ x, y });
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: "inline-block" }}
      >
        {children}
      </div>

      {isVisible && (
        <div
          style={{
            position: "fixed",
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: position === "top" || position === "bottom"
              ? "translateX(-50%)"
              : position === "left"
              ? "translateX(-100%)"
              : undefined,
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--green-bright)",
            borderRadius: 4,
            padding: "8px 12px",
            fontSize: 11,
            maxWidth: 300,
            zIndex: 10000,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
