const fs = require('fs');

// Update TypeScript DaadGame interface
const tsTypesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let tsContent = fs.readFileSync(tsTypesPath, 'utf8');

// Add partNumber to DaadGame interface
tsContent = tsContent.replace(
  /export interface DaadGame \{[\s\S]*?title: string;/,
  `export interface DaadGame {
  partNumber: number;
  title: string;`
);

// Add partNumber to createDefaultGame
tsContent = tsContent.replace(
  /export function createDefaultGame\(\): DaadGame \{[\s\S]*?return \{/,
  `export function createDefaultGame(): DaadGame {
  return {
    partNumber: 1,`
);

fs.writeFileSync(tsTypesPath, tsContent);
console.log('✓ Updated TypeScript DaadGame type with partNumber');
