const fs = require('fs');

const codegenPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/codegen.rs';
let content = fs.readFileSync(codegenPath, 'utf8');

// Replace the generate_objects function to add attribute export section
content = content.replace(
  /\/\/ Object weights table\s+code\.push_str\("\/OBW ; Object Weights\\n"\);[\s\S]*?code\.push\('\n'\);/,
  `// Object weights table
        code.push_str("/OBW ; Object Weights\\n");
        for obj in objects {
            code.push_str(&format!("{}  ; {} {}\\n", obj.weight, obj.adjective, obj.noun));
        }
        code.push('\\n');

        // Object attributes
        code.push_str("/OTA ; Object Attributes\\n\\n");

        // Container objects
        let containers: Vec<_> = objects.iter().filter(|o| o.is_container).collect();
        if !containers.is_empty() {
            code.push_str("; Containers\\n");
            for obj in &containers {
                code.push_str(&format!("CONTAINER {}  ; {} {}\\n", obj.id, obj.adjective, obj.noun));
            }
            code.push('\\n');
        }

        // Wearable objects
        let wearables: Vec<_> = objects.iter().filter(|o| o.is_wearable).collect();
        if !wearables.is_empty() {
            code.push_str("; Wearable items\\n");
            for obj in &wearables {
                code.push_str(&format!("WEARABLE {}  ; {} {}\\n", obj.id, obj.adjective, obj.noun));
            }
            code.push('\\n');
        }

        // Non-takeable objects (scenery)
        let scenery: Vec<_> = objects.iter().filter(|o| !o.is_takeable).collect();
        if !scenery.is_empty() {
            code.push_str("; Scenery (not takeable)\\n");
            for obj in &scenery {
                code.push_str(&format!("SCENERY {}  ; {} {}\\n", obj.id, obj.adjective, obj.noun));
            }
            code.push('\\n');
        }

        code.push('\\n');`
);

fs.writeFileSync(codegenPath, content);
console.log('Enhanced object attributes export in codegen.rs');
