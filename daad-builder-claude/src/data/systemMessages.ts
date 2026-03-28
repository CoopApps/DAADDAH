// DAAD System Messages (0-52)
// These are pre-defined messages used by the DAAD system for common responses

export interface SystemMessage {
  id: number;
  name: string;
  defaultText: string;
  description: string;
  category: "responses" | "errors" | "descriptions" | "prompts";
}

export const SYSTEM_MESSAGES: SystemMessage[] = [
  // Response Messages (0-9)
  { id: 0, name: "OK", defaultText: "OK", description: "Generic success response", category: "responses" },
  { id: 1, name: "I don't understand", defaultText: "I don't understand", description: "Parser doesn't recognize command", category: "errors" },
  { id: 2, name: "Can't do that", defaultText: "I can't do that", description: "Action not possible", category: "errors" },
  { id: 3, name: "No way", defaultText: "I can't go that way", description: "No exit in that direction", category: "errors" },
  { id: 4, name: "Already have it", defaultText: "You already have it", description: "Object already carried", category: "responses" },
  { id: 5, name: "Already wearing it", defaultText: "You're already wearing it", description: "Object already worn", category: "responses" },
  { id: 6, name: "Not carrying it", defaultText: "You're not carrying it", description: "Don't have object", category: "errors" },
  { id: 7, name: "Not wearing it", defaultText: "You're not wearing it", description: "Not wearing object", category: "errors" },
  { id: 8, name: "Too heavy", defaultText: "It's too heavy", description: "Weight limit exceeded", category: "errors" },
  { id: 9, name: "Carrying too much", defaultText: "You're carrying too much", description: "Object limit exceeded", category: "errors" },

  // Object State Messages (10-19)
  { id: 10, name: "Not here", defaultText: "It's not here", description: "Object not present", category: "errors" },
  { id: 11, name: "Can't take it", defaultText: "You can't take that", description: "Object not takeable", category: "errors" },
  { id: 12, name: "Can't wear it", defaultText: "You can't wear that", description: "Object not wearable", category: "errors" },
  { id: 13, name: "Can't remove it", defaultText: "You can't remove that", description: "Can't remove object", category: "errors" },
  { id: 14, name: "Can't put it", defaultText: "You can't put that there", description: "Can't place object", category: "errors" },
  { id: 15, name: "Taken", defaultText: "Taken", description: "Object successfully taken", category: "responses" },
  { id: 16, name: "Dropped", defaultText: "Dropped", description: "Object successfully dropped", category: "responses" },
  { id: 17, name: "Worn", defaultText: "You're now wearing it", description: "Object successfully worn", category: "responses" },
  { id: 18, name: "Removed", defaultText: "Removed", description: "Object successfully removed", category: "responses" },
  { id: 19, name: "Put down", defaultText: "You put it down", description: "Object placed", category: "responses" },

  // Dark Room Messages (20-24)
  { id: 20, name: "Too dark", defaultText: "It's too dark to see", description: "Dark room without light", category: "descriptions" },
  { id: 21, name: "Can't see", defaultText: "You can't see anything", description: "Can't examine in dark", category: "errors" },
  { id: 22, name: "Light needed", defaultText: "You need a light source", description: "Light required", category: "errors" },
  { id: 23, name: "Light on", defaultText: "The light is now on", description: "Light source activated", category: "responses" },
  { id: 24, name: "Light off", defaultText: "The light is now off", description: "Light source deactivated", category: "responses" },

  // Container Messages (25-29)
  { id: 25, name: "Not a container", defaultText: "That's not a container", description: "Object isn't a container", category: "errors" },
  { id: 26, name: "Container empty", defaultText: "It's empty", description: "Nothing in container", category: "descriptions" },
  { id: 27, name: "Container full", defaultText: "It's full", description: "Container at capacity", category: "errors" },
  { id: 28, name: "Put in", defaultText: "You put it inside", description: "Object placed in container", category: "responses" },
  { id: 29, name: "Taken out", defaultText: "You take it out", description: "Object removed from container", category: "responses" },

  // Save/Load Messages (30-34)
  { id: 30, name: "Save prompt", defaultText: "Save game (Y/N)?", description: "Confirm save game", category: "prompts" },
  { id: 31, name: "Load prompt", defaultText: "Load game (Y/N)?", description: "Confirm load game", category: "prompts" },
  { id: 32, name: "Saved", defaultText: "Game saved", description: "Save successful", category: "responses" },
  { id: 33, name: "Loaded", defaultText: "Game loaded", description: "Load successful", category: "responses" },
  { id: 34, name: "Save/Load failed", defaultText: "Operation failed", description: "Save/Load error", category: "errors" },

  // Inventory Messages (35-39)
  { id: 35, name: "Carrying", defaultText: "You are carrying:", description: "Inventory list header", category: "descriptions" },
  { id: 36, name: "Wearing", defaultText: "You are wearing:", description: "Wearing list header", category: "descriptions" },
  { id: 37, name: "Nothing", defaultText: "Nothing", description: "Empty inventory", category: "descriptions" },
  { id: 38, name: "And", defaultText: "and", description: "List conjunction", category: "descriptions" },
  { id: 39, name: "Comma", defaultText: ",", description: "List separator", category: "descriptions" },

  // Exit Messages (40-44)
  { id: 40, name: "Exits", defaultText: "Obvious exits:", description: "Exit list header", category: "descriptions" },
  { id: 41, name: "North", defaultText: "North", description: "North direction", category: "descriptions" },
  { id: 42, name: "South", defaultText: "South", description: "South direction", category: "descriptions" },
  { id: 43, name: "East", defaultText: "East", description: "East direction", category: "descriptions" },
  { id: 44, name: "West", defaultText: "West", description: "West direction", category: "descriptions" },

  // Misc Messages (45-52)
  { id: 45, name: "You can see", defaultText: "You can see:", description: "Objects present header", category: "descriptions" },
  { id: 46, name: "Prompt", defaultText: ">", description: "Input prompt", category: "prompts" },
  { id: 47, name: "Wait", defaultText: "Time passes...", description: "Wait action response", category: "responses" },
  { id: 48, name: "Again", defaultText: "Repeat last command (Y/N)?", description: "Repeat command prompt", category: "prompts" },
  { id: 49, name: "Restart", defaultText: "Restart game (Y/N)?", description: "Restart confirmation", category: "prompts" },
  { id: 50, name: "Quit", defaultText: "Are you sure you want to quit (Y/N)?", description: "Quit confirmation", category: "prompts" },
  { id: 51, name: "Score", defaultText: "Score:", description: "Score display", category: "descriptions" },
  { id: 52, name: "Turns", defaultText: "Turns:", description: "Turn counter display", category: "descriptions" },
];

// Helper function to get system message by ID
export function getSystemMessage(id: number): SystemMessage | undefined {
  return SYSTEM_MESSAGES.find(msg => msg.id === id);
}

// Helper function to get system messages by category
export function getSystemMessagesByCategory(category: SystemMessage['category']): SystemMessage[] {
  return SYSTEM_MESSAGES.filter(msg => msg.category === category);
}

// Helper function to check if a message ID is a system message
export function isSystemMessage(id: number): boolean {
  return id >= 0 && id <= 52;
}
