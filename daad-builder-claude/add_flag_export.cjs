const fs = require('fs');

const codegenPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/codegen.rs';
let content = fs.readFileSync(codegenPath, 'utf8');

// Add flags export after vocabulary and before processes
content = content.replace(
  /(\/\/ Vocabulary[\s\S]*?code\.push_str\(&Self::generate_vocabulary\(&game\.vocabulary\)\);)/,
  `$1

        // Flags
        code.push_str(&Self::generate_flags(&game.flags));`
);

// Add generate_flags function before generate_processes
content = content.replace(
  /fn generate_processes\(game: &DaadGame\) -> String \{/,
  `fn generate_flags(flags: &[Flag]) -> String {
        let mut code = String::from("/INIT ; Initialize Flags\\n\\n");

        if flags.is_empty() {
            code.push_str("; No flags defined\\n\\n");
            return code;
        }

        // Export all non-zero flags
        for flag in flags {
            if flag.initial_value != 0 {
                code.push_str(&format!(
                    "LET {} {}  ; {}\\n",
                    flag.id,
                    flag.initial_value,
                    flag.description
                ));
            }
        }

        code.push_str("\\n");
        code
    }

    fn generate_processes(game: &DaadGame) -> String {`
);

fs.writeFileSync(codegenPath, content);
console.log('✓ Added flag export to codegen.rs');
