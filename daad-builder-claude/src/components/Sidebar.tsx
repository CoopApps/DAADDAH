import { useRef, useCallback } from "react";
import { PanelType } from "../types/daad";

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
      { id: "characters", icon: "users", label: "Characters" },
    ],
  },
  {
    section: "Logic",
    items: [
      { id: "rules", icon: "cog", label: "Responses" },
      { id: "vocabulary", icon: "book", label: "Words" },
      { id: "flags", icon: "flag", label: "Variables" },
      { id: "messages", icon: "comment", label: "Text" },
      { id: "music", icon: "music", label: "Music" },
    ],
  },
  {
    section: "Build",
    items: [
      { id: "preview", icon: "play", label: "Play Test" },
      { id: "graphics", icon: "image", label: "Graphics" },
      { id: "validation", icon: "check", label: "Validate" },
      { id: "statistics", icon: "stats", label: "Statistics" },
      { id: "export", icon: "download", label: "Export" },
      { id: "compile", icon: "hammer", label: "Compile" },
      { id: "merge", icon: "merge", label: "Merge Data" },
    ],
  },
  {
    section: "Debug",
    items: [
      { id: "debug", icon: "bug", label: "Debug Tools" },
    ],
  },
];

// Simple icon mapping using emoji/text for prototype
const getIcon = (iconName: string): string => {
  const icons: Record<string, string> = {
    scroll: "[i]",
    map: "[R]",
    gem: "[I]",
    users: "[C]",
    cog: "[E]",
    book: "[W]",
    flag: "[V]",
    comment: "[T]",
    music: "[M]",
    play: "[>]",
    image: "[G]",
    check: "[✓]",
    stats: "[#]",
    download: "[D]",
    hammer: "[H]",
    merge: "[+]",
    bug: "[!]",
  };
  return icons[iconName] || "[?]";
};

export default function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  const navRef = useRef<HTMLElement>(null);

  // Get flat list of all panel IDs for keyboard navigation
  const allPanelIds = navItems.flatMap(section => section.items.map(item => item.id));

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentPanel: PanelType) => {
    const currentIndex = allPanelIds.indexOf(currentPanel);
    if (currentIndex === -1) return;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % allPanelIds.length;
      onPanelChange(allPanelIds[nextIndex]);
      // Focus the next button
      setTimeout(() => {
        const buttons = navRef.current?.querySelectorAll("button.nav-item");
        (buttons?.[nextIndex] as HTMLButtonElement)?.focus();
      }, 0);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + allPanelIds.length) % allPanelIds.length;
      onPanelChange(allPanelIds[prevIndex]);
      // Focus the previous button
      setTimeout(() => {
        const buttons = navRef.current?.querySelectorAll("button.nav-item");
        (buttons?.[prevIndex] as HTMLButtonElement)?.focus();
      }, 0);
    } else if (e.key === "Home") {
      e.preventDefault();
      onPanelChange(allPanelIds[0]);
      setTimeout(() => {
        const buttons = navRef.current?.querySelectorAll("button.nav-item");
        (buttons?.[0] as HTMLButtonElement)?.focus();
      }, 0);
    } else if (e.key === "End") {
      e.preventDefault();
      const lastIndex = allPanelIds.length - 1;
      onPanelChange(allPanelIds[lastIndex]);
      setTimeout(() => {
        const buttons = navRef.current?.querySelectorAll("button.nav-item");
        (buttons?.[lastIndex] as HTMLButtonElement)?.focus();
      }, 0);
    }
  }, [allPanelIds, onPanelChange]);

  return (
    <nav className="sidebar" aria-label="Main navigation" ref={navRef}>
      {navItems.map((section) => (
        <div key={section.section} className="nav-section" role="group" aria-label={section.section}>
          <div className="nav-section-title" id={`nav-section-${section.section.toLowerCase()}`}>
            {section.section}
          </div>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePanel === item.id ? "active" : ""}`}
              onClick={() => onPanelChange(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              aria-current={activePanel === item.id ? "page" : undefined}
              aria-label={`${item.label} panel`}
              type="button"
              tabIndex={activePanel === item.id ? 0 : -1}
            >
              <span className="nav-icon" aria-hidden="true">{getIcon(item.icon)}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
