const fs = require('fs');

// Update TypeScript createDefaultGame to include Flag 37 and Flag 52
const tsTypesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let tsContent = fs.readFileSync(tsTypesPath, 'utf8');

tsContent = tsContent.replace(
  /export function createDefaultGame\(\): DaadGame \{[\s\S]*?flags: \[\],/,
  `export function createDefaultGame(): DaadGame {
  return {
    title: "Untitled Adventure",
    author: "",
    version: "1.0",
    locations: [],
    objects: [],
    rules: [],
    flags: [
      { id: 1, name: "objects_carried", description: "Number of objects currently carried (automatically updated)", initialValue: 0 },
      { id: 37, name: "max_carry_objects", description: "Maximum number of objects player can carry", initialValue: 6 },
      { id: 52, name: "max_carry_weight", description: "Maximum weight player can carry", initialValue: 100 },
    ],`
);

fs.writeFileSync(tsTypesPath, tsContent);
console.log('✓ Updated TypeScript createDefaultGame with Flag 37 and Flag 52');
