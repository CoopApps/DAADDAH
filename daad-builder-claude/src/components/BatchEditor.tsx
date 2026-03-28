import { useState } from "react";
import { DaadGame, GameObject, Flag, Location } from "../types/daad";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface BatchEditorProps {
  isOpen: boolean;
  onClose: () => void;
  game: DaadGame;
  setGame: (game: DaadGame) => void;
  targetType: "objects" | "flags" | "locations" | "messages";
  selectedIds: number[];
}

export default function BatchEditor({
  isOpen,
  onClose,
  game,
  setGame,
  targetType,
  selectedIds,
}: BatchEditorProps) {
  // Close on Escape key
  useEscapeKey(onClose, isOpen);

  const [operation, setOperation] = useState<string>("update-property");
  const [propertyName, setPropertyName] = useState<string>("");
  const [propertyValue, setPropertyValue] = useState<string>("");

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedIds.length === 0) {
      alert("No items selected");
      return;
    }

    let updatedGame = { ...game };

    if (operation === "update-property") {
      // Update property for selected items
      if (targetType === "objects") {
        updatedGame.objects = game.objects.map((obj) => {
          if (selectedIds.includes(obj.id)) {
            return updateObjectProperty(obj, propertyName, propertyValue);
          }
          return obj;
        });
      } else if (targetType === "flags") {
        updatedGame.flags = game.flags.map((flag) => {
          if (selectedIds.includes(flag.id)) {
            return updateFlagProperty(flag, propertyName, propertyValue);
          }
          return flag;
        });
      } else if (targetType === "locations") {
        updatedGame.locations = game.locations.map((loc) => {
          if (selectedIds.includes(loc.id)) {
            return updateLocationProperty(loc, propertyName, propertyValue);
          }
          return loc;
        });
      } else if (targetType === "messages") {
        updatedGame.messages = game.messages.map((msg, idx) => {
          if (selectedIds.includes(idx)) {
            return performMessageOperation(msg, propertyName, propertyValue);
          }
          return msg;
        });
      }
    } else if (operation === "delete") {
      // Delete selected items
      if (targetType === "objects") {
        updatedGame.objects = game.objects.filter(
          (obj) => !selectedIds.includes(obj.id)
        );
      } else if (targetType === "flags") {
        updatedGame.flags = game.flags.filter(
          (flag) => !selectedIds.includes(flag.id)
        );
      } else if (targetType === "locations") {
        updatedGame.locations = game.locations.filter(
          (loc) => !selectedIds.includes(loc.id)
        );
      } else if (targetType === "messages") {
        updatedGame.messages = game.messages.filter(
          (_, idx) => !selectedIds.includes(idx)
        );
      }
    }

    setGame(updatedGame);
    onClose();
  };

  const updateObjectProperty = (
    obj: GameObject,
    prop: string,
    value: string
  ): GameObject => {
    switch (prop) {
      case "isTakeable":
      case "isContainer":
      case "isWearable":
      case "isLightSource":
      case "isPSI":
        return { ...obj, [prop]: value === "true" };
      case "weight":
        return { ...obj, weight: parseInt(value) || 0 };
      case "adjective":
      case "noun":
      case "description":
      case "icon":
        return { ...obj, [prop]: value };
      default:
        return obj;
    }
  };

  const updateFlagProperty = (flag: Flag, prop: string, value: string): Flag => {
    switch (prop) {
      case "initialValue":
        return { ...flag, initialValue: parseInt(value) || 0 };
      case "name":
      case "description":
        return { ...flag, [prop]: value };
      default:
        return flag;
    }
  };

  const updateLocationProperty = (
    loc: Location,
    prop: string,
    value: string
  ): Location => {
    switch (prop) {
      case "isDark":
        return { ...loc, isDark: value === "true" };
      case "name":
      case "description":
        return { ...loc, [prop]: value };
      default:
        return loc;
    }
  };

  const performMessageOperation = (
    msg: string,
    operation: string,
    value: string
  ): string => {
    switch (operation) {
      case "find-replace":
        const [find, replace] = value.split("|");
        return msg.replace(new RegExp(find, "g"), replace || "");
      case "append":
        return msg + value;
      case "prepend":
        return value + msg;
      default:
        return msg;
    }
  };

  const getPropertyOptions = () => {
    if (targetType === "objects") {
      return [
        { value: "adjective", label: "Adjective" },
        { value: "noun", label: "Noun" },
        { value: "description", label: "Description" },
        { value: "icon", label: "Icon" },
        { value: "weight", label: "Weight" },
        { value: "isTakeable", label: "Is Takeable" },
        { value: "isContainer", label: "Is Container" },
        { value: "isWearable", label: "Is Wearable" },
        { value: "isLightSource", label: "Is Light Source" },
        { value: "isPSI", label: "Is PSI/Character" },
      ];
    } else if (targetType === "flags") {
      return [
        { value: "name", label: "Name" },
        { value: "description", label: "Description" },
        { value: "initialValue", label: "Initial Value" },
      ];
    } else if (targetType === "locations") {
      return [
        { value: "name", label: "Name" },
        { value: "description", label: "Description" },
        { value: "isDark", label: "Is Dark" },
      ];
    } else if (targetType === "messages") {
      return [
        { value: "find-replace", label: "Find & Replace" },
        { value: "append", label: "Append Text" },
        { value: "prepend", label: "Prepend Text" },
      ];
    }
    return [];
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
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
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 500,
          maxHeight: "80vh",
          overflow: "auto",
          padding: 24,
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "var(--green-bright)" }}>
          Batch Edit {selectedIds.length} {targetType}
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 12,
              color: "var(--text-dim)",
            }}
          >
            Operation
          </label>
          <select
            className="input"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="update-property">Update Property</option>
            <option value="delete">Delete All</option>
          </select>
        </div>

        {operation === "update-property" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 12,
                  color: "var(--text-dim)",
                }}
              >
                Property
              </label>
              <select
                className="input"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              >
                <option value="">-- Select Property --</option>
                {getPropertyOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 12,
                  color: "var(--text-dim)",
                }}
              >
                {targetType === "messages" && propertyName === "find-replace"
                  ? "Find|Replace (use | as separator)"
                  : "New Value"}
              </label>
              {propertyName.startsWith("is") ? (
                <select
                  className="input"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="input"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  placeholder={
                    targetType === "messages" && propertyName === "find-replace"
                      ? "old text|new text"
                      : "Enter new value"
                  }
                />
              )}
            </div>
          </>
        )}

        {operation === "delete" && (
          <div
            style={{
              padding: 12,
              backgroundColor: "var(--error-bg)",
              border: "1px solid var(--error)",
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "var(--error)" }}>
              ⚠️ Warning: This will permanently delete {selectedIds.length}{" "}
              {targetType}. This action cannot be undone.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleApply}
            disabled={
              operation === "update-property" &&
              (!propertyName || !propertyValue)
            }
          >
            {operation === "delete" ? "Delete All" : "Apply Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
