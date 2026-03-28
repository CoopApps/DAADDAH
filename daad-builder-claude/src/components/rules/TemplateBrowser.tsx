import { useState, useMemo } from "react";
import {
  RULE_TEMPLATES,
  RULE_TEMPLATE_CATEGORIES,
  RuleTemplate,
  getTemplatesByCategory,
  searchTemplates,
} from "../../data/ruleTemplates";
import "../../styles/templates.css";

interface TemplateBrowserProps {
  onSelectTemplate: (template: RuleTemplate) => void;
  onClose: () => void;
}

export default function TemplateBrowser({ onSelectTemplate, onClose }: TemplateBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<RuleTemplate | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = RULE_TEMPLATES;

    // Apply search
    if (searchTerm) {
      templates = searchTemplates(searchTerm);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      templates = templates.filter(t => t.difficulty === selectedDifficulty);
    }

    return templates;
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  // Get template count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    RULE_TEMPLATE_CATEGORIES.forEach(cat => {
      counts[cat] = getTemplatesByCategory(cat).length;
    });
    return counts;
  }, []);

  const handleUseTemplate = (template: RuleTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "var(--green-bright)";
      case "intermediate": return "var(--amber)";
      case "advanced": return "#ff0041";
      default: return "var(--text-dim)";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "●";
      case "intermediate": return "●●";
      case "advanced": return "●●●";
      default: return "●";
    }
  };

  return (
    <div className="template-browser-overlay" onClick={onClose}>
      <div className="template-browser" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="template-browser-header">
          <h2>Rule Template Library</h2>
          <button className="template-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Filters */}
        <div className="template-filters">
          <input
            type="text"
            className="template-search"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="template-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({RULE_TEMPLATES.length})</option>
            {RULE_TEMPLATE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({categoryCounts[cat]})
              </option>
            ))}
          </select>

          <select
            className="template-filter-select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="beginner">● Beginner</option>
            <option value="intermediate">●● Intermediate</option>
            <option value="advanced">●●● Advanced</option>
          </select>
        </div>

        {/* Content */}
        <div className="template-content">
          {/* Template List */}
          <div className="template-list">
            {filteredTemplates.length === 0 ? (
              <div className="template-empty">
                No templates found matching your criteria
              </div>
            ) : (
              filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`template-card ${previewTemplate?.id === template.id ? "selected" : ""}`}
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div className="template-card-header">
                    <h3>{template.name}</h3>
                    <span
                      className="template-difficulty"
                      style={{ color: getDifficultyColor(template.difficulty) }}
                      title={template.difficulty}
                    >
                      {getDifficultyIcon(template.difficulty)}
                    </span>
                  </div>
                  <div className="template-card-category">{template.category}</div>
                  <p className="template-card-description">{template.description}</p>
                  <div className="template-card-tags">
                    {template.tags.map(tag => (
                      <span key={tag} className="template-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Panel */}
          {previewTemplate && (
            <div className="template-preview">
              <div className="template-preview-header">
                <div>
                  <h3>{previewTemplate.name}</h3>
                  <div className="template-preview-meta">
                    <span className="template-preview-category">{previewTemplate.category}</span>
                    <span
                      className="template-preview-difficulty"
                      style={{ color: getDifficultyColor(previewTemplate.difficulty) }}
                    >
                      {getDifficultyIcon(previewTemplate.difficulty)} {previewTemplate.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  className="template-use-btn"
                  onClick={() => handleUseTemplate(previewTemplate)}
                >
                  Use Template
                </button>
              </div>

              <div className="template-preview-body">
                <div className="template-preview-section">
                  <strong>Description:</strong>
                  <p>{previewTemplate.description}</p>
                </div>

                {previewTemplate.instructions && (
                  <div className="template-preview-section template-instructions">
                    <strong>📝 Instructions:</strong>
                    <p>{previewTemplate.instructions}</p>
                  </div>
                )}

                <div className="template-preview-section">
                  <strong>Rule Structure:</strong>
                  <div className="template-code-block">
                    <div className="template-code-line">
                      <span className="template-code-label">Name:</span> {previewTemplate.rule.name}
                    </div>
                    <div className="template-code-line">
                      <span className="template-code-label">Process:</span> {previewTemplate.rule.process}
                    </div>
                    <div className="template-code-line">
                      <span className="template-code-label">Conditions:</span>
                      {previewTemplate.rule.conditions.length > 0 ? (
                        <ul className="template-code-list">
                          {previewTemplate.rule.conditions.map((cond, idx) => (
                            <li key={idx}>{cond}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="template-code-empty"> None</span>
                      )}
                    </div>
                    <div className="template-code-line">
                      <span className="template-code-label">Actions:</span>
                      {previewTemplate.rule.actions.length > 0 ? (
                        <ul className="template-code-list">
                          {previewTemplate.rule.actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="template-code-empty"> None</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="template-preview-section">
                  <strong>Tags:</strong>
                  <div className="template-preview-tags">
                    {previewTemplate.tags.map(tag => (
                      <span key={tag} className="template-tag-large">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="template-browser-footer">
          <div className="template-stats">
            Showing {filteredTemplates.length} of {RULE_TEMPLATES.length} templates
          </div>
          <button className="template-cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
