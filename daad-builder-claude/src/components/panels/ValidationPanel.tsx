import { useMemo } from "react";
import { DaadGame } from "../../types/daad";
import { validateGame, ValidationIssue, autoFixIssue } from "../../utils/validation";

interface ValidationPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  onNavigate?: (panel: string, itemId?: number) => void;
}

export default function ValidationPanel({ game, setGame, onNavigate }: ValidationPanelProps) {
  const issues = useMemo(() => validateGame(game), [game]);

  const errorCount = issues.filter(i => i.severity === "error").length;
  const warningCount = issues.filter(i => i.severity === "warning").length;
  const infoCount = issues.filter(i => i.severity === "info").length;

  const handleFix = (issue: ValidationIssue) => {
    const fixedGame = autoFixIssue(game, issue);
    setGame(fixedGame);
  };

  const handleNavigate = (issue: ValidationIssue) => {
    if (onNavigate && issue.itemId !== undefined) {
      onNavigate(issue.panel, issue.itemId);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error": return "❌";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
      default: return "•";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "var(--red-bright)";
      case "warning": return "var(--amber-bright)";
      case "info": return "var(--blue-bright)";
      default: return "var(--text)";
    }
  };

  return (
    <div className="panel-content">
      {/* Summary */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px 0", color: "var(--green-bright)" }}>
          Validation Summary
        </h3>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <span style={{ color: "var(--red-bright)", fontWeight: 600 }}>{errorCount}</span>
            <span style={{ color: "var(--text-dim)", marginLeft: 4 }}>Errors</span>
          </div>
          <div>
            <span style={{ color: "var(--amber-bright)", fontWeight: 600 }}>{warningCount}</span>
            <span style={{ color: "var(--text-dim)", marginLeft: 4 }}>Warnings</span>
          </div>
          <div>
            <span style={{ color: "var(--blue-bright)", fontWeight: 600 }}>{infoCount}</span>
            <span style={{ color: "var(--text-dim)", marginLeft: 4 }}>Info</span>
          </div>
        </div>

        {issues.length === 0 && (
          <div style={{ marginTop: 16, padding: 16, background: "var(--bg-hover)", borderRadius: 4, color: "var(--green-bright)" }}>
            ✓ No issues found! Your game looks good.
          </div>
        )}
      </div>

      {/* Issues List */}
      {issues.length > 0 && (
        <div>
          {["error", "warning", "info"].map(severity => {
            const severityIssues = issues.filter(i => i.severity === severity);
            if (severityIssues.length === 0) return null;

            return (
              <div key={severity} style={{ marginBottom: 24 }}>
                <h4 style={{ color: getSeverityColor(severity), marginBottom: 12 }}>
                  {getSeverityIcon(severity)} {severity.charAt(0).toUpperCase() + severity.slice(1)}s ({severityIssues.length})
                </h4>

                {severityIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      marginBottom: 8,
                      borderLeft: `3px solid ${getSeverityColor(severity)}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>
                          {issue.category}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          {issue.message}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                          Panel: {issue.panel}
                          {issue.itemId !== undefined && ` • Item ID: ${issue.itemId}`}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        {issue.itemId !== undefined && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleNavigate(issue)}
                            style={{ fontSize: 11, padding: "4px 8px" }}
                          >
                            Go To
                          </button>
                        )}
                        {issue.fixable && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleFix(issue)}
                            style={{ fontSize: 11, padding: "4px 8px" }}
                          >
                            Auto-Fix
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Help Text */}
      <div className="card" style={{ marginTop: 24, background: "var(--bg-panel)" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "var(--green-bright)" }}>About Validation</h4>
        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0 }}>
          This tool checks your game for common issues like broken references, unreachable locations,
          and unused content. Errors should be fixed before exporting. Warnings and info items are
          suggestions for improvement.
        </p>
      </div>
    </div>
  );
}
