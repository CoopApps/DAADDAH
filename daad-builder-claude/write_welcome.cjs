const fs = require('fs');
const content = `import { DaadGame } from "../types/daad";

interface WelcomeScreenProps {
  onNewProject: () => void;
  onLoadProject: () => void;
}

export default function WelcomeScreen({ onNewProject, onLoadProject }: WelcomeScreenProps) {
  return (
    <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
      <div style={{ maxWidth: 800, width: "100%", padding: 40 }}>
        {/* Logo/Title */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <pre style={{ 
            fontSize: 12, 
            color: "var(--green-bright)", 
            textShadow: "0 0 20px var(--green-glow)",
            lineHeight: 1.2,
            marginBottom: 20
          }}>
{${'`'}
 ██████╗  █████╗  █████╗ ██████╗ 
 ██╔══██╗██╔══██╗██╔══██╗██╔══██╗
 ██║  ██║███████║███████║██║  ██║
 ██║  ██║██╔══██║██╔══██║██║  ██║
 ██████╔╝██║  ██║██║  ██║██████╔╝
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
                    BUILDER
${'`'}}
          </pre>
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 20 }}>
            Classic Text Adventure Game Creator
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: 12 }}>
            v0.1.0 - ALPHA
          </p>
        </div>

        {/* Main Menu Options */}
        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <button 
              className="btn btn-primary" 
              style={{ 
                fontSize: 18, 
                padding: "20px 30px",
                justifyContent: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 15
              }}
              onClick={onNewProject}
            >
              <span style={{ fontSize: 24 }}>[+]</span>
              <div style={{ textAlign: "left" }}>
                <div>Create New Adventure</div>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: "normal" }}>Start from scratch</div>
              </div>
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ 
                fontSize: 18, 
                padding: "20px 30px",
                justifyContent: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 15
              }}
              onClick={onLoadProject}
            >
              <span style={{ fontSize: 24 }}>[↑]</span>
              <div style={{ textAlign: "left" }}>
                <div>Open Existing Project</div>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: "normal" }}>Load .daad.json file</div>
              </div>
            </button>

            <div style={{ borderTop: "1px solid var(--border)", margin: "20px 0" }}></div>

            <button 
              className="btn btn-secondary" 
              style={{ 
                fontSize: 16, 
                padding: "15px 30px",
                justifyContent: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 15
              }}
              disabled
            >
              <span style={{ fontSize: 20 }}>[?]</span>
              <div style={{ textAlign: "left" }}>
                <div>Tutorial / Quick Start</div>
                <div style={{ fontSize: 11, opacity: 0.5, fontWeight: "normal" }}>Coming soon</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: 40, textAlign: "center", color: "var(--text-dim)", fontSize: 12 }}>
          <p>DAAD (Diseñador de Aventuras AD) is a classic text adventure creation system</p>
          <p style={{ marginTop: 8 }}>
            Press <kbd style={{ 
              background: "var(--border)", 
              padding: "2px 6px", 
              borderRadius: 3,
              fontSize: 11
            }}>Ctrl+N</kbd> for new project or{" "}
            <kbd style={{ 
              background: "var(--border)", 
              padding: "2px 6px", 
              borderRadius: 3,
              fontSize: 11
            }}>Ctrl+O</kbd> to open
          </p>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('D:/projects/daadah/daad-builder-ui/src/components/WelcomeScreen.tsx', content);
console.log('WelcomeScreen.tsx written');
