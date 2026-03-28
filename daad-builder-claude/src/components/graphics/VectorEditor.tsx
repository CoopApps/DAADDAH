import { useState, useRef, useEffect } from "react";
import "../../styles/vector.css";

interface VectorEditorProps {
  onClose: () => void;
  onSave: (imageData: string) => void;
  initialData?: string;
}

type Tool = "select" | "line" | "rect" | "circle" | "fill";
type VectorShape = {
  id: string;
  type: "line" | "rect" | "circle";
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  filled: boolean;
};

const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 192;
const COLORS = [
  "#000000", // Black
  "#0000D7", // Blue
  "#D70000", // Red
  "#D700D7", // Magenta
  "#00D700", // Green
  "#00D7D7", // Cyan
  "#D7D700", // Yellow
  "#D7D7D7", // White
];

export default function VectorEditor({ onClose, onSave, initialData }: VectorEditorProps) {
  const [tool, setTool] = useState<Tool>("line");
  const [selectedColor, setSelectedColor] = useState("#D7D7D7");
  const [shapes, setShapes] = useState<VectorShape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<VectorShape | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw shapes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw all shapes
    [...shapes, currentShape].filter(Boolean).forEach((shape) => {
      if (!shape) return;

      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineWidth = 1;

      switch (shape.type) {
        case "line":
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x2!, shape.y2!);
          ctx.stroke();
          break;

        case "rect":
          if (shape.filled) {
            ctx.fillRect(shape.x, shape.y, shape.width!, shape.height!);
          } else {
            ctx.strokeRect(shape.x, shape.y, shape.width!, shape.height!);
          }
          break;

        case "circle":
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius!, 0, Math.PI * 2);
          if (shape.filled) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
          break;
      }
    });

    // Highlight selected shape
    if (selectedShapeId) {
      const selectedShape = shapes.find((s) => s.id === selectedShapeId);
      if (selectedShape) {
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        switch (selectedShape.type) {
          case "line":
            const padding = 5;
            const minX = Math.min(selectedShape.x, selectedShape.x2!) - padding;
            const minY = Math.min(selectedShape.y, selectedShape.y2!) - padding;
            const maxX = Math.max(selectedShape.x, selectedShape.x2!) + padding;
            const maxY = Math.max(selectedShape.y, selectedShape.y2!) + padding;
            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
            break;

          case "rect":
            ctx.strokeRect(
              selectedShape.x - 2,
              selectedShape.y - 2,
              selectedShape.width! + 4,
              selectedShape.height! + 4
            );
            break;

          case "circle":
            ctx.beginPath();
            ctx.arc(selectedShape.x, selectedShape.y, selectedShape.radius! + 3, 0, Math.PI * 2);
            ctx.stroke();
            break;
        }

        ctx.setLineDash([]);
      }
    }
  }, [shapes, currentShape, selectedShapeId]);

  // Update preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const preview = previewCanvasRef.current;
    if (!canvas || !preview) return;

    const ctx = preview.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, preview.width, preview.height);
    ctx.drawImage(canvas, 0, 0);
  }, [shapes, currentShape]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);

    return { x: Math.max(0, Math.min(CANVAS_WIDTH - 1, x)), y: Math.max(0, Math.min(CANVAS_HEIGHT - 1, y)) };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    if (tool === "select") {
      // Check if clicking on existing shape
      const clickedShape = shapes.find((shape) => {
        switch (shape.type) {
          case "rect":
            return (
              coords.x >= shape.x &&
              coords.x <= shape.x + shape.width! &&
              coords.y >= shape.y &&
              coords.y <= shape.y + shape.height!
            );
          case "circle":
            const dx = coords.x - shape.x;
            const dy = coords.y - shape.y;
            return Math.sqrt(dx * dx + dy * dy) <= shape.radius!;
          case "line":
            // Simple line hit detection
            const lineDistance = 5;
            const A = coords.x - shape.x;
            const B = coords.y - shape.y;
            const C = shape.x2! - shape.x;
            const D = shape.y2! - shape.y;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const param = lenSq !== 0 ? dot / lenSq : -1;
            let xx, yy;
            if (param < 0) {
              xx = shape.x;
              yy = shape.y;
            } else if (param > 1) {
              xx = shape.x2!;
              yy = shape.y2!;
            } else {
              xx = shape.x + param * C;
              yy = shape.y + param * D;
            }
            const dx2 = coords.x - xx;
            const dy2 = coords.y - yy;
            return Math.sqrt(dx2 * dx2 + dy2 * dy2) <= lineDistance;
        }
        return false;
      });

      setSelectedShapeId(clickedShape?.id || null);
      return;
    }

    setIsDrawing(true);
    setStartPoint(coords);
    setSelectedShapeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || tool === "select") return;

    const coords = getCanvasCoordinates(e);

    let shape: VectorShape | null = null;

    switch (tool) {
      case "line":
        shape = {
          id: "temp",
          type: "line",
          x: startPoint.x,
          y: startPoint.y,
          x2: coords.x,
          y2: coords.y,
          color: selectedColor,
          filled: false,
        };
        break;

      case "rect":
        const width = coords.x - startPoint.x;
        const height = coords.y - startPoint.y;
        shape = {
          id: "temp",
          type: "rect",
          x: width >= 0 ? startPoint.x : coords.x,
          y: height >= 0 ? startPoint.y : coords.y,
          width: Math.abs(width),
          height: Math.abs(height),
          color: selectedColor,
          filled: false,
        };
        break;

      case "circle":
        const dx = coords.x - startPoint.x;
        const dy = coords.y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        shape = {
          id: "temp",
          type: "circle",
          x: startPoint.x,
          y: startPoint.y,
          radius,
          color: selectedColor,
          filled: false,
        };
        break;
    }

    setCurrentShape(shape);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentShape && tool !== "select") {
      setShapes([...shapes, { ...currentShape, id: `shape-${Date.now()}` }]);
      setCurrentShape(null);
    }
    setIsDrawing(false);
    setStartPoint(null);
  };

  const deleteSelected = () => {
    if (selectedShapeId) {
      setShapes(shapes.filter((s) => s.id !== selectedShapeId));
      setSelectedShapeId(null);
    }
  };

  const clearCanvas = () => {
    if (confirm("Clear all shapes?")) {
      setShapes([]);
      setSelectedShapeId(null);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");
    onSave(imageData);
  };

  const toggleFill = () => {
    if (selectedShapeId) {
      setShapes(
        shapes.map((s) =>
          s.id === selectedShapeId ? { ...s, filled: !s.filled } : s
        )
      );
    }
  };

  return (
    <div className="vector-editor-overlay" onClick={onClose}>
      <div className="vector-editor" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vector-editor-header">
          <h2>Vector Graphics Editor</h2>
          <button className="vector-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="vector-editor-content">
          {/* Toolbar */}
          <div className="vector-toolbar">
            <div className="vector-tool-group">
              <h4>Tools</h4>
              <button
                className={`vector-tool-btn ${tool === "select" ? "active" : ""}`}
                onClick={() => setTool("select")}
                title="Select (V)"
              >
                ↖
              </button>
              <button
                className={`vector-tool-btn ${tool === "line" ? "active" : ""}`}
                onClick={() => setTool("line")}
                title="Line (L)"
              >
                /
              </button>
              <button
                className={`vector-tool-btn ${tool === "rect" ? "active" : ""}`}
                onClick={() => setTool("rect")}
                title="Rectangle (R)"
              >
                ▢
              </button>
              <button
                className={`vector-tool-btn ${tool === "circle" ? "active" : ""}`}
                onClick={() => setTool("circle")}
                title="Circle (C)"
              >
                ○
              </button>
            </div>

            <div className="vector-tool-group">
              <h4>Colors</h4>
              <div className="vector-color-palette">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`vector-color-btn ${selectedColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="vector-tool-group">
              <h4>Actions</h4>
              <button
                className="vector-action-btn"
                onClick={toggleFill}
                disabled={!selectedShapeId || shapes.find((s) => s.id === selectedShapeId)?.type === "line"}
              >
                Fill/Outline
              </button>
              <button
                className="vector-action-btn"
                onClick={deleteSelected}
                disabled={!selectedShapeId}
              >
                Delete
              </button>
              <button className="vector-action-btn" onClick={clearCanvas}>
                Clear All
              </button>
            </div>

            <div className="vector-tool-group">
              <h4>Zoom</h4>
              <select
                className="vector-zoom-select"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              >
                <option value="1">100%</option>
                <option value="2">200%</option>
                <option value="3">300%</option>
                <option value="4">400%</option>
              </select>
            </div>

            <div className="vector-tool-group">
              <h4>Info</h4>
              <div className="vector-info">
                <div>{CANVAS_WIDTH}×{CANVAS_HEIGHT}</div>
                <div>{shapes.length} shapes</div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="vector-canvas-area">
            <div className="vector-canvas-container">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="vector-canvas"
                style={{
                  width: CANVAS_WIDTH * zoom,
                  height: CANVAS_HEIGHT * zoom,
                  imageRendering: "pixelated",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {/* Preview */}
            <div className="vector-preview">
              <h4>Preview (1:1)</h4>
              <canvas
                ref={previewCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="vector-preview-canvas"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="vector-editor-footer">
          <div className="vector-help-text">
            Click and drag to draw • Select tool to move/edit shapes • {shapes.length} shapes on canvas
          </div>
          <div className="vector-footer-actions">
            <button className="vector-footer-btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="vector-footer-btn save" onClick={handleSave}>
              Save Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
