const fs = require('fs');

const codegenPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/codegen.rs';
let content = fs.readFileSync(codegenPath, 'utf8');

// Find the section with "Object weights table" and add attributes section after it
const searchPattern = `        code.push('\\n');

        code
    }

    fn generate_messages`;

const replacement = `        code.push('\\n');

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

        code
    }

    fn generate_messages`;

if (content.includes(searchPattern)) {
    content = content.replace(searchPattern, replacement);
    fs.writeFileSync(codegenPath, content);
    console.log('✓ Added object attributes export to codegen.rs');
} else {
    console.log('✗ Pattern not found - file may have already been modified or structure changed');
}
