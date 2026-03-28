const fs = require('fs');

const gamePath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/game.rs';
let content = fs.readFileSync(gamePath, 'utf8');

// Add Flag 37 and Flag 52 to default flags initialization
content = content.replace(
  /flags: vec!\[Flag \{[\s\S]*?initial_value: 0,\s*\}\],/,
  `flags: vec![
                Flag {
                    id: 0,
                    name: "score".to_string(),
                    description: "Player score".to_string(),
                    initial_value: 0,
                },
                Flag {
                    id: 37,
                    name: "max_carry_objects".to_string(),
                    description: "Maximum number of objects player can carry".to_string(),
                    initial_value: 6,
                },
                Flag {
                    id: 52,
                    name: "max_carry_weight".to_string(),
                    description: "Maximum weight player can carry".to_string(),
                    initial_value: 100,
                },
            ],`
);

fs.writeFileSync(gamePath, content);
console.log('✓ Added Flag 37 and Flag 52 to default game initialization');
