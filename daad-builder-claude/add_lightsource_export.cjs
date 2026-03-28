const fs = require('fs');

const codegenPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/codegen.rs';
let content = fs.readFileSync(codegenPath, 'utf8');

// Add LIGHTSOURCE export after SCENERY in the /OTA section
content = content.replace(
  /\/\/ Non-takeable objects \(scenery\)[\s\S]*?code\.push\('\\n'\);\s*\}\s*code\.push\('\\n'\);/,
  `// Non-takeable objects (scenery)
        let scenery: Vec<_> = objects.iter().filter(|o| !o.is_takeable).collect();
        if !scenery.is_empty() {
            code.push_str("; Scenery (not takeable)\\n");
            for obj in &scenery {
                code.push_str(&format!("SCENERY {}  ; {} {}\\n", obj.id, obj.adjective, obj.noun));
            }
            code.push('\\n');
        }

        // Light sources
        let light_sources: Vec<_> = objects.iter().filter(|o| o.is_light_source).collect();
        if !light_sources.is_empty() {
            code.push_str("; Light Sources\\n");
            for obj in &light_sources {
                code.push_str(&format!("LIGHTSOURCE {}  ; {} {}\\n", obj.id, obj.adjective, obj.noun));
            }
            code.push('\\n');
        }

        code.push('\\n');`
);

fs.writeFileSync(codegenPath, content);
console.log('✓ Added LIGHTSOURCE export to codegen.rs');
