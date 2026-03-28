// Test the full compilation pipeline
const { invoke } = require('@tauri-apps/api/core');

// Create a minimal test game
const testGame = {
  title: "Test Adventure",
  author: "Test Author",
  version: "1.0",
  part: 1,
  
  locations: [
    {
      id: 0,
      name: "Start Room",
      description: "You are in a test room.",
      connections: [],
      image: null,
      flags: { isDark: false }
    }
  ],
  
  objects: [
    {
      id: 0,
      name: "key",
      description: "a rusty key",
      location: { type: "Location", value: 0 },
      attributes: {
        weight: 5,
        isContainer: false,
        isWearable: false,
        customFlags: Array(16).fill(false)
      },
      vocabulary: { noun: "KEY", adjective: null }
    }
  ],
  
  vocabulary: [
    { word: "GET", id: 10, type: "verb" },
    { word: "KEY", id: 100, type: "noun" },
    { word: "NORTH", id: 1, type: "noun" }
  ],
  
  messages: [
    "OK",
    "I don't understand.",
    "You can't do that."
  ],
  
  systemMessages: Array(55).fill(""),
  characters: [],
  flags: [],
  rules: [],
  music: []
};

console.log("Testing DAAD compilation...");
console.log("Game:", JSON.stringify(testGame, null, 2));
