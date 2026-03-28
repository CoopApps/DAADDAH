import { useState, useEffect } from "react";
import { PanelType } from "../../types/daad";
import "../../styles/help.css";

interface HelpSystemProps {
  currentPanel: PanelType;
}

interface HelpTopic {
  id: string;
  title: string;
  category: string;
  content: string;
  tips?: string[];
  shortcuts?: Array<{ keys: string; description: string }>;
  relatedTopics?: string[];
}

const HELP_TOPICS: Record<string, HelpTopic> = {
  "game-info": {
    id: "game-info",
    title: "Story Information",
    category: "Getting Started",
    content: "This panel contains basic information about your adventure game. Fill in the title, author, version, and description to give your game identity. The intro text is shown when players start the game.",
    tips: [
      "Keep the title concise and memorable",
      "The intro text sets the mood - make it engaging",
      "Version numbers help track development progress",
    ],
    shortcuts: [
      { keys: "Ctrl+S", description: "Save project" },
      { keys: "Ctrl+N", description: "New project" },
    ],
  },

  locations: {
    id: "locations",
    title: "Room Editor",
    category: "World Building",
    content: "Rooms (or locations) are the places in your adventure. Each room has a name, description, and exits to other rooms. Players navigate between rooms using directional commands like NORTH, SOUTH, EAST, WEST, UP, DOWN, IN, and OUT.",
    tips: [
      "Write vivid descriptions to immerse players",
      "Use consistent naming conventions for easier management",
      "Plan your map on paper first to visualize connections",
      "Exits can be locked/unlocked using flags in rules",
    ],
    shortcuts: [
      { keys: "Ctrl+F", description: "Search rooms" },
      { keys: "Enter", description: "Edit selected room" },
    ],
    relatedTopics: ["objects", "rules"],
  },

  objects: {
    id: "objects",
    title: "Item Editor",
    category: "World Building",
    content: "Items are objects players can interact with. They have a noun (required) and optional adjective for more specific identification. Items can be takeable, wearable, or fixed in place. Set their initial location and write descriptions.",
    tips: [
      "Use adjectives to distinguish similar objects (e.g., 'red key' vs 'blue key')",
      "Mark items as takeable only if players should carry them",
      "Wearable items are for clothing and armor",
      "Weight affects inventory limits (if implemented)",
    ],
    shortcuts: [
      { keys: "Ctrl+F", description: "Search items" },
    ],
    relatedTopics: ["locations", "vocabulary", "rules"],
  },

  characters: {
    id: "characters",
    title: "Character Editor",
    category: "World Building",
    content: "Characters (PSI objects) are NPCs that can move around and interact with the player. They're special objects marked as 'isPSI'. Use rules to control their behavior, movement, and dialogue.",
    tips: [
      "Characters can follow the player using PRO2 rules",
      "Use flags to track relationship states",
      "Give characters meaningful names and descriptions",
      "Characters can give or receive items through rules",
    ],
    relatedTopics: ["objects", "rules", "flags"],
  },

  rules: {
    id: "rules",
    title: "Response Editor",
    category: "Game Logic",
    content: "Rules define how your game responds to player actions. Each rule has conditions (what must be true) and actions (what happens). Rules run in order, so placement matters. Use process tables (PRO0, PRO1, PRO2) to control when rules execute.",
    tips: [
      "PRO0: Main command processing",
      "PRO1: Intercept/override default behavior",
      "PRO2: Automatic actions after each turn",
      "Drag rules to reorder them (priority matters!)",
      "Use templates for common patterns",
      "Test rules thoroughly in Play Test",
    ],
    shortcuts: [
      { keys: "Ctrl+↑", description: "Move rule up" },
      { keys: "Ctrl+↓", description: "Move rule down" },
      { keys: "Ctrl+F", description: "Search rules" },
    ],
    relatedTopics: ["flags", "vocabulary", "messages"],
  },

  vocabulary: {
    id: "vocabulary",
    title: "Word Dictionary",
    category: "Game Logic",
    content: "The vocabulary defines which words players can use. Add verbs (actions like TAKE, USE), nouns (objects like KEY, DOOR), adverbs (modifiers like CAREFULLY), and adjectives (descriptors like RED, OLD). The parser matches player input against this dictionary.",
    tips: [
      "Add synonyms for common verbs (GET = TAKE = GRAB)",
      "Include adjectives for all object adjectives",
      "Verbs should match your rules",
      "Keep vocabulary focused on what's actually used",
    ],
    relatedTopics: ["rules", "objects"],
  },

  flags: {
    id: "flags",
    title: "Variable Manager",
    category: "Game Logic",
    content: "Flags (variables) store game state. Use them to track progress, puzzle solutions, inventory limits, health, score, and more. Flags are numbers (0-255) that can be checked and modified by rules.",
    tips: [
      "Flag 0-37 have special meanings in DAAD",
      "Give flags meaningful names for easier tracking",
      "Use initial values for starting state",
      "Check the Debug Tools to monitor flag values during testing",
    ],
    shortcuts: [],
    relatedTopics: ["rules", "debug"],
  },

  messages: {
    id: "messages",
    title: "Text Editor",
    category: "Content",
    content: "Messages are text displayed to the player. System messages (0-52) have special purposes. Custom messages (53+) are used by your rules to show descriptions, feedback, and dialogue. Use \\n for line breaks.",
    tips: [
      "System messages control default responses",
      "Keep messages concise but descriptive",
      "Use consistent tone and style",
      "Test message flow in Play Test",
    ],
    relatedTopics: ["rules"],
  },

  music: {
    id: "music",
    title: "Music Editor",
    category: "Content",
    content: "Add audio files to enhance your game's atmosphere. Assign music to specific locations or trigger sounds through rules. Supported formats depend on the target platform.",
    tips: [
      "Keep file sizes reasonable for retro platforms",
      "Match music to location mood",
      "Use sound effects sparingly for impact",
    ],
  },

  preview: {
    id: "preview",
    title: "Play Test",
    category: "Testing",
    content: "Test your game in real-time! Select a target platform to see how it will look on different systems. The interpreter runs your rules and responds to commands. Use Auto Walkthrough to test predefined sequences.",
    tips: [
      "Test on multiple platforms for compatibility",
      "Use SAVE and LOAD to test specific scenarios",
      "Type HELP for available commands",
      "Watch the Debug Tools while testing",
    ],
    shortcuts: [
      { keys: "Enter", description: "Submit command" },
    ],
    relatedTopics: ["debug", "graphics"],
  },

  graphics: {
    id: "graphics",
    title: "Graphics Preview",
    category: "Testing",
    content: "Preview how your graphics will appear on different platforms. Each platform has unique color palettes and restrictions. Use this to ensure your images look good on target systems.",
    tips: [
      "ZX Spectrum has attribute clash (2 colors per 8x8 block)",
      "MS-DOS VGA has the most colors (256)",
      "Test with grid overlay to see color block boundaries",
      "Simpler graphics work better on limited platforms",
    ],
    relatedTopics: ["preview", "locations"],
  },

  validation: {
    id: "validation",
    title: "Validate Game",
    category: "Testing",
    content: "Check your game for common issues like broken exits, unreachable locations, undefined vocabulary, and missing objects. Fix warnings before exporting to ensure a smooth player experience.",
    tips: [
      "Validate frequently during development",
      "Yellow warnings should be reviewed",
      "Red errors must be fixed",
      "Click warnings to jump to the problem",
    ],
  },

  statistics: {
    id: "statistics",
    title: "Statistics",
    category: "Analysis",
    content: "View detailed statistics about your game including room count, object count, rule complexity, and vocabulary size. Use this to track project scope and identify potential issues.",
  },

  export: {
    id: "export",
    title: "Export Game",
    category: "Publishing",
    content: "Export your game to DAAD format for compilation. The exporter validates your game first and shows warnings if issues are detected. You can choose to export anyway or fix issues first.",
    tips: [
      "Validate before exporting",
      "Save a backup before major exports",
      "Test exported games thoroughly",
    ],
  },

  compile: {
    id: "compile",
    title: "Compile Game",
    category: "Publishing",
    content: "Compile your game for specific platforms. This creates playable files for retro systems or emulators. Select your target platform and follow compilation settings.",
  },

  merge: {
    id: "merge",
    title: "Merge Data",
    category: "Advanced",
    content: "Import data from other DAAD projects or external sources. Useful for combining work from multiple developers or importing community resources.",
    tips: [
      "Backup before merging",
      "Review merged content carefully",
      "ID conflicts will be resolved automatically",
    ],
  },

  debug: {
    id: "debug",
    title: "Debug Tools",
    category: "Testing",
    content: "Advanced debugging tools including Flag Inspector (monitor variable values), Rule Logger (track rule execution), and Breakpoints (pause execution at specific rules).",
    tips: [
      "Use Flag Inspector to watch game state in real-time",
      "Rule Logger shows which rules fire and when",
      "Set breakpoints on problematic rules",
      "Export logs for detailed analysis",
    ],
    relatedTopics: ["preview", "rules", "flags"],
  },
};

export default function HelpSystem({ currentPanel }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Auto-select topic based on current panel
  useEffect(() => {
    if (isOpen && HELP_TOPICS[currentPanel]) {
      setSelectedTopic(currentPanel);
    }
  }, [currentPanel, isOpen]);

  // Keyboard shortcut to toggle help (F1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const topic = selectedTopic ? HELP_TOPICS[selectedTopic] : null;

  if (!isOpen) {
    return (
      <button
        className="help-fab"
        onClick={() => setIsOpen(true)}
        title="Help (F1)"
      >
        ?
      </button>
    );
  }

  return (
    <>
      <div className="help-overlay" onClick={() => setIsOpen(false)} />
      <div className="help-panel">
        {/* Header */}
        <div className="help-header">
          <h2>📖 Help & Documentation</h2>
          <button className="help-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {/* Content */}
        <div className="help-content">
          {/* Topic List */}
          <div className="help-topics">
            <div className="help-topics-header">Topics</div>
            {Object.values(HELP_TOPICS).map((t) => (
              <button
                key={t.id}
                className={`help-topic-item ${selectedTopic === t.id ? "active" : ""}`}
                onClick={() => setSelectedTopic(t.id)}
              >
                <div className="help-topic-title">{t.title}</div>
                <div className="help-topic-category">{t.category}</div>
              </button>
            ))}
          </div>

          {/* Topic Details */}
          {topic && (
            <div className="help-details">
              <div className="help-details-header">
                <h3>{topic.title}</h3>
                <span className="help-category-badge">{topic.category}</span>
              </div>

              <div className="help-details-body">
                <p className="help-description">{topic.content}</p>

                {topic.tips && topic.tips.length > 0 && (
                  <div className="help-section">
                    <h4>💡 Tips</h4>
                    <ul className="help-tips-list">
                      {topic.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {topic.shortcuts && topic.shortcuts.length > 0 && (
                  <div className="help-section">
                    <h4>⌨️ Keyboard Shortcuts</h4>
                    <div className="help-shortcuts">
                      {topic.shortcuts.map((sc, idx) => (
                        <div key={idx} className="help-shortcut">
                          <kbd>{sc.keys}</kbd>
                          <span>{sc.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {topic.relatedTopics && topic.relatedTopics.length > 0 && (
                  <div className="help-section">
                    <h4>🔗 Related Topics</h4>
                    <div className="help-related">
                      {topic.relatedTopics.map((relId) => {
                        const relTopic = HELP_TOPICS[relId];
                        if (!relTopic) return null;
                        return (
                          <button
                            key={relId}
                            className="help-related-btn"
                            onClick={() => setSelectedTopic(relId)}
                          >
                            {relTopic.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!topic && (
            <div className="help-placeholder">
              <h3>Welcome to DAAD Builder Help</h3>
              <p>Select a topic from the list to learn more about that feature.</p>
              <p className="help-tip">💡 Press <kbd>F1</kbd> anytime to open help for the current panel</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="help-footer">
          <span>Press <kbd>F1</kbd> to toggle help • <kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </>
  );
}
