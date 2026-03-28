const fs = require('fs');

const gamePath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/game.rs';
let content = fs.readFileSync(gamePath, 'utf8');

// Add image: None to the default location
content = content.replace(
  `            locations: vec![Location {
                id: 0,
                name: "Start Room".to_string(),
                description: "You are in a small room. There is a door to the north.".to_string(),
                is_dark: false,
                connections: vec![],
                editor_x: 400.0,
                editor_y: 300.0,
            }],`,
  `            locations: vec![Location {
                id: 0,
                name: "Start Room".to_string(),
                description: "You are in a small room. There is a door to the north.".to_string(),
                is_dark: false,
                connections: vec![],
                editor_x: 400.0,
                editor_y: 300.0,
                image: None,
            }],`
);

fs.writeFileSync(gamePath, content);
console.log('Fixed game.rs default location to include image field');
