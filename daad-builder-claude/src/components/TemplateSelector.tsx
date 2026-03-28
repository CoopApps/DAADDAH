import { useState } from "react";
import { GAME_TEMPLATES, GameTemplate } from "../data/templates";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: GameTemplate) => void;
}

export default function TemplateSelector({
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>("blank");

  // Close on Escape key
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const selectedTemplate = GAME_TEMPLATES.find((t) => t.id === selectedId);

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  const getCategoryName = (category: string): string => {
    switch (category) {
      case "blank":
        return "Blank Templates";
      case "starter":
        return "Starter Templates";
      case "example":
        return "Example Games";
      default:
        return "Templates";
    }
  };

  const groupedTemplates = GAME_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, GameTemplate[]>);

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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
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
          width: "90vw",
          maxWidth: 1200,
          maxHeight: "90vh",
          overflow: "hidden",
          padding: 32,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "var(--green-bright)", fontSize: 28 }}>
          Choose a Template
        </h3>

        <p style={{ marginBottom: 24, fontSize: 20, color: "var(--text-dim)" }}>
          Select a template to start your adventure. You can customize everything
          later.
        </p>

        <div style={{ display: "flex", gap: 24, flex: 1, overflow: "hidden" }}>
          {/* Template List */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category} style={{ marginBottom: 24 }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 20,
                    color: "var(--amber-bright)",
                    textTransform: "uppercase",
                  }}
                >
                  {getCategoryName(category)}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="card"
                      onClick={() => setSelectedId(template.id)}
                      style={{
                        cursor: "pointer",
                        borderColor:
                          selectedId === template.id
                            ? "var(--green-bright)"
                            : undefined,
                        backgroundColor:
                          selectedId === template.id
                            ? "rgba(72, 187, 120, 0.1)"
                            : undefined,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 22 }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: 18, color: "var(--text-dim)" }}>
                        {template.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: "var(--bg-medium)",
              borderRadius: 4,
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                color: "var(--amber-bright)",
                fontSize: 22,
              }}
            >
              Template Details
            </h4>
            {selectedTemplate && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 24 }}>
                    {selectedTemplate.name}
                  </div>
                  <p style={{ fontSize: 19, color: "var(--text-dim)" }}>
                    {selectedTemplate.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    fontSize: 19,
                  }}
                >
                  <div>
                    <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>
                      Locations
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {selectedTemplate.game.locations.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>
                      Objects
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {selectedTemplate.game.objects.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>
                      Rules
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {selectedTemplate.game.rules.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>
                      Vocabulary
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {selectedTemplate.game.vocabulary.length} words
                    </div>
                  </div>
                </div>

                {selectedTemplate.game.introText && (
                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        color: "var(--text-dim)",
                        marginBottom: 4,
                        fontSize: 18,
                      }}
                    >
                      Intro Text
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontStyle: "italic",
                        padding: 8,
                        backgroundColor: "var(--bg-dark)",
                        borderRadius: 4,
                      }}
                    >
                      "{selectedTemplate.game.introText}"
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 24,
            justifyContent: "flex-end",
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Create from Template
          </button>
        </div>
      </div>
    </div>
  );
}
