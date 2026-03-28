const fs = require('fs');

const sidebarPath = 'D:/projects/daadah/daad-builder-ui/src/components/Sidebar.tsx';
let content = fs.readFileSync(sidebarPath, 'utf8');

// Add vocabulary to Logic section
content = content.replace(
  `{
    section: "Logic",
    items: [
      { id: "rules", icon: "cog", label: "Responses" },
      { id: "flags", icon: "flag", label: "Variables" },
      { id: "messages", icon: "comment", label: "Text" },
    ],
  },`,
  `{
    section: "Logic",
    items: [
      { id: "rules", icon: "cog", label: "Responses" },
      { id: "vocabulary", icon: "book", label: "Words" },
      { id: "flags", icon: "flag", label: "Variables" },
      { id: "messages", icon: "comment", label: "Text" },
    ],
  },`
);

// Add book icon
content = content.replace(
  `const getIcon = (iconName: string): string => {
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
};`,
  `const getIcon = (iconName: string): string => {
  const icons: Record<string, string> = {
    scroll: "[i]",
    map: "[R]",
    gem: "[I]",
    cog: "[E]",
    book: "[W]",
    flag: "[V]",
    comment: "[T]",
    play: "[>]",
    download: "[D]",
  };
  return icons[iconName] || "[?]";
};`
);

fs.writeFileSync(sidebarPath, content);
console.log('Added vocabulary to Sidebar');
