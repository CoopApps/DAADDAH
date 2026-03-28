import { DaadGame } from "../types/daad";

interface CondactParameterEditorProps {
  paramName: string;
  paramValue: unknown;
  paramType: "object" | "location" | "flag" | "message" | "verb" | "noun" | "adjective" | "number" | "text";
  game: DaadGame;
  onChange: (value: unknown) => void;
}

export default function CondactParameterEditor({
  paramName,
  paramValue,
  paramType,
  game,
  onChange,
}: CondactParameterEditorProps) {
  const isValid = () => {
    if (paramValue === undefined || paramValue === null || paramValue === "") {
      return true; // Allow empty values
    }

    const numValue = Number(paramValue);

    switch (paramType) {
      case "object":
        return game.objects.some((o) => o.id === numValue);
      case "location":
        return game.locations.some((l) => l.id === numValue);
      case "flag":
        return game.flags.some((f) => f.id === numValue);
      case "message":
        return numValue >= 0 && numValue < game.messages.length;
      case "verb":
        return game.vocabulary.some((v) => v.wordType === "verb" && v.id === numValue);
      case "noun":
        return game.vocabulary.some((v) => v.wordType === "noun" && v.id === numValue);
      case "adjective":
        return game.vocabulary.some((v) => v.wordType === "adjective" && v.id === numValue);
      case "number":
        return !isNaN(numValue);
      case "text":
        return true;
      default:
        return true;
    }
  };

  const getOptions = () => {
    switch (paramType) {
      case "object":
        return game.objects.map((o) => ({
          value: o.id,
          label: `#${o.id}: ${o.adjective ? o.adjective + " " : ""}${o.noun}`,
        }));
      case "location":
        return game.locations.map((l) => ({
          value: l.id,
          label: `#${l.id}: ${l.name}`,
        }));
      case "flag":
        return game.flags.map((f) => ({
          value: f.id,
          label: `#${f.id}: ${f.name}`,
        }));
      case "message":
        return game.messages.map((m, i) => ({
          value: i,
          label: `#${i}: ${m.substring(0, 40)}${m.length > 40 ? "..." : ""}`,
        }));
      case "verb":
        return game.vocabulary
          .filter((v) => v.wordType === "verb")
          .map((v) => ({
            value: v.id,
            label: `#${v.id}: ${v.word}`,
          }));
      case "noun":
        return game.vocabulary
          .filter((v) => v.wordType === "noun")
          .map((v) => ({
            value: v.id,
            label: `#${v.id}: ${v.word}`,
          }));
      case "adjective":
        return game.vocabulary
          .filter((v) => v.wordType === "adjective")
          .map((v) => ({
            value: v.id,
            label: `#${v.id}: ${v.word}`,
          }));
      default:
        return [];
    }
  };

  const valid = isValid();
  const options = getOptions();

  if (paramType === "text") {
    return (
      <input
        type="text"
        className="input"
        value={String(paramValue || "")}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: 12 }}
      />
    );
  }

  if (options.length > 0) {
    return (
      <div style={{ position: "relative" }}>
        <select
          className="input"
          value={String(paramValue !== undefined && paramValue !== null ? paramValue : "")}
          onChange={(e) => {
            const value = e.target.value;
            onChange(value === "" ? undefined : Number(value));
          }}
          style={{
            fontSize: 12,
            borderColor: !valid ? "var(--red-bright)" : undefined,
          }}
        >
          <option value="">-- Select {paramType} --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {!valid && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              fontSize: 10,
              color: "var(--red-bright)",
              backgroundColor: "var(--bg-dark)",
              padding: "2px 6px",
              borderRadius: 2,
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            ⚠️ Invalid {paramType} reference
          </div>
        )}
      </div>
    );
  }

  // Number input
  return (
    <div style={{ position: "relative" }}>
      <input
        type="number"
        className="input"
        value={String(paramValue || "")}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{
          fontSize: 12,
          borderColor: !valid ? "var(--red-bright)" : undefined,
        }}
      />
      {!valid && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            fontSize: 10,
            color: "var(--red-bright)",
            backgroundColor: "var(--bg-dark)",
            padding: "2px 6px",
            borderRadius: 2,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          ⚠️ Invalid number
        </div>
      )}
    </div>
  );
}
