const fs = require('fs');
const content = `import { PanelType } from "../types/daad";

interface SidebarProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

interface NavItem {
  id: PanelType;
  icon: string;
  label: string;
}

const navItems: { section: string; items: NavItem[] }[] = [
  {
    section: "World",
    items: [
      { id: "game-info", icon: "scroll", label: "Story Info" },
      { id: "locations", icon: "map", label: "Rooms" },
      { id: "objects", icon: "gem", label: "Items" },
    ],
  },
  {
    section: "Logic",
    items: [
      { id: "rules", icon: "cog", label: "Responses" },
      { id: "flags", icon: "flag", label: "Variables" },
      { id: "messages", icon: "comment", label: "Text" },
    ],
  },
  {
    section: "Test",
    items: [
      { id: "preview", icon: "play", label: "Play Test" },
      { id: "export", icon: "download", label: "Export" },
    ],
  },
];

// Simple icon mapping using emoji/text for prototype
const getIcon = (iconName: string): string => {
  const icons: Record<string, string> = {
    scroll: "[i]",
    map: "[R]",
    gem: "[I]",
    cog: "[E]",
    flag: "[V]",
    comment: "[T]",
    play: "[>]",
    download: "[D]",
  };
  return icons[iconName] || "[?]";
};

export default function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  return (
    <nav className="sidebar">
      {navItems.map((section) => (
        <div key={section.section} className="nav-section">
          <div className="nav-section-title">{section.section}</div>
          {section.items.map((item) => (
            <div
              key={item.id}
              className={\`nav-item \${activePanel === item.id ? "active" : ""}\`}
              onClick={() => onPanelChange(item.id)}
            >
              <span className="nav-icon">{getIcon(item.icon)}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
`;
fs.writeFileSync('D:/projects/daadah/daad-builder-ui/src/components/Sidebar.tsx', content);
console.log('Sidebar.tsx written');
