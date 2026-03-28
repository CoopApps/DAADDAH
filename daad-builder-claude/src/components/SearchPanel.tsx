import { useState, useEffect, useRef } from "react";
import { DaadGame, PanelType } from "../types/daad";

interface SearchResult {
  type: "location" | "object" | "rule" | "flag" | "message" | "vocab";
  id: number | string;
  title: string;
  subtitle: string;
  panel: PanelType;
}

interface SearchPanelProps {
  game: DaadGame;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (panel: PanelType, id?: number) => void;
}

export default function SearchPanel({ game, isOpen, onClose, onNavigate }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search locations
    game.locations.forEach(loc => {
      if (
        loc.name.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        loc.id.toString().includes(q)
      ) {
        searchResults.push({
          type: "location",
          id: loc.id,
          title: loc.name,
          subtitle: `Location #${loc.id} - ${loc.description.substring(0, 60)}...`,
          panel: "locations",
        });
      }
    });

    // Search objects
    game.objects.forEach(obj => {
      const fullName = `${obj.adjective} ${obj.noun}`.trim();
      if (
        fullName.toLowerCase().includes(q) ||
        obj.description.toLowerCase().includes(q) ||
        obj.id.toString().includes(q)
      ) {
        searchResults.push({
          type: "object",
          id: obj.id,
          title: fullName,
          subtitle: `Object #${obj.id} - ${obj.description}`,
          panel: "objects",
        });
      }
    });

    // Search rules
    game.rules.forEach(rule => {
      if (
        rule.name.toLowerCase().includes(q) ||
        rule.id.toString().includes(q) ||
        rule.process.toLowerCase().includes(q)
      ) {
        searchResults.push({
          type: "rule",
          id: rule.id,
          title: rule.name,
          subtitle: `${rule.process} - ${rule.conditions.length}C ${rule.actions.length}A`,
          panel: "rules",
        });
      }
    });

    // Search flags
    game.flags.forEach(flag => {
      if (
        flag.name.toLowerCase().includes(q) ||
        flag.description.toLowerCase().includes(q) ||
        flag.id.toString().includes(q)
      ) {
        searchResults.push({
          type: "flag",
          id: flag.id,
          title: flag.name,
          subtitle: `Flag #${flag.id} - ${flag.description}`,
          panel: "flags",
        });
      }
    });

    // Search messages
    game.messages.forEach((msg, idx) => {
      if (msg.toLowerCase().includes(q) || idx.toString().includes(q)) {
        searchResults.push({
          type: "message",
          id: idx,
          title: msg.substring(0, 50) + (msg.length > 50 ? "..." : ""),
          subtitle: `Message #${idx}`,
          panel: "messages",
        });
      }
    });

    // Search vocabulary
    game.vocabulary.forEach(vocab => {
      if (
        vocab.word.toLowerCase().includes(q) ||
        vocab.id.toString().includes(q) ||
        vocab.wordType.toLowerCase().includes(q)
      ) {
        searchResults.push({
          type: "vocab",
          id: vocab.id,
          title: vocab.word,
          subtitle: `${vocab.wordType.toUpperCase()} #${vocab.id}`,
          panel: "vocabulary",
        });
      }
    });

    setResults(searchResults.slice(0, 50)); // Limit to 50 results
    setSelectedIndex(0);
  }, [query, game]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      const result = results[selectedIndex];
      onNavigate(result.panel, typeof result.id === "number" ? result.id : undefined);
      onClose();
    }
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "location": return "📍";
      case "object": return "📦";
      case "rule": return "📋";
      case "flag": return "🚩";
      case "message": return "💬";
      case "vocab": return "📖";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "20vh",
        zIndex: 1000,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div
        style={{
          width: "90%",
          maxWidth: 600,
          backgroundColor: "var(--bg-darker)",
          borderRadius: 8,
          border: "2px solid var(--cyan-bright)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="Search locations, objects, rules, flags, messages, vocabulary..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search query"
            aria-describedby="search-instructions"
            aria-controls="search-results"
            style={{
              fontSize: 16,
              padding: 12,
              border: "none",
              backgroundColor: "var(--bg-dark)",
            }}
          />
          <div id="search-instructions" style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
            {results.length > 0 ? `${results.length} results` : query ? "No results" : "Type to search..."}
            {" • "}↑↓ to navigate • Enter to open • Esc to close
          </div>
        </div>

        {/* Results List */}
        <div
          id="search-results"
          role="listbox"
          aria-label="Search results"
          style={{
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => {
                onNavigate(result.panel, typeof result.id === "number" ? result.id : undefined);
                onClose();
              }}
              style={{
                padding: 12,
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                backgroundColor: index === selectedIndex ? "var(--bg-dark)" : "transparent",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 24 }} aria-hidden="true">{getResultIcon(result.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 2 }}>
                    {result.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                    {result.subtitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
