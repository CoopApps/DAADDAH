const fs = require('fs');

const codegenPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/codegen.rs';
let content = fs.readFileSync(codegenPath, 'utf8');

// Add PSI export after LIGHTSOURCE export in /OTA section
content = content.replace(
  /(\/\/ Light Sources[\s\S]*?code\.push\('\\n'\);)/,
  `$1

        // PSI Characters (NPCs)
        let psi_chars: Vec<_> = objects.iter().filter(|o| o.is_psi).collect();
        if !psi_chars.is_empty() {
            code.push_str("; PSI Characters (Player Similar Individuals)\\n");
            for obj in &psi_chars {
                code.push_str(&format!("PSI {}  ; {} {}\\n", obj.id, obj.adjective, obj.noun));
            }
            code.push('\\n');
        }`
);

fs.writeFileSync(codegenPath, content);
console.log('✓ Added PSI character export to codegen');
