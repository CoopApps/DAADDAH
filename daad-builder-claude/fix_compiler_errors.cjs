const fs = require('fs');

// Fix 1: Make IoError not derive Clone
let errorContent = fs.readFileSync('src-tauri/src/compiler/error.rs', 'utf8');
errorContent = errorContent.replace(
  '#[derive(Debug, Clone)]',
  '#[derive(Debug)]'
);
fs.writeFileSync('src-tauri/src/compiler/error.rs', errorContent, 'utf8');
console.log('✓ Fixed error.rs - removed Clone derive');

// Fix 2: Fix get_condact function to avoid temporary reference
let condactsContent = fs.readFileSync('src-tauri/src/compiler/condacts.rs', 'utf8');
condactsContent = condactsContent.replace(
  `/// Get CondAct definition by name
pub fn get_condact(name: &str) -> Option<&'static CondActDef> {
    CONDACTS.get(&name.to_uppercase().as_str())
}`,
  `/// Get CondAct definition by name
pub fn get_condact(name: &str) -> Option<&'static CondActDef> {
    let upper = name.to_uppercase();
    CONDACTS.get(upper.as_str())
}`
);
fs.writeFileSync('src-tauri/src/compiler/condacts.rs', condactsContent, 'utf8');
console.log('✓ Fixed condacts.rs - get_condact function');

// Fix 3: Fix binary move issue in mod.rs
let modContent = fs.readFileSync('src-tauri/src/compiler/mod.rs', 'utf8');
modContent = modContent.replace(
  `    // Phase 3: Generate platform binary
    let binary = platforms::generate_binary(platform, &bytecode)?;

    // Phase 4: Write output file
    std::fs::write(output_path, binary)?;

    Ok(CompilationResult {
        platform,
        output_path: output_path.to_string(),
        size: binary.len(),
        warnings: vec![],
    })`,
  `    // Phase 3: Generate platform binary
    let binary = platforms::generate_binary(platform, &bytecode)?;

    // Phase 4: Write output file
    let size = binary.len();
    std::fs::write(output_path, binary)?;

    Ok(CompilationResult {
        platform,
        output_path: output_path.to_string(),
        size,
        warnings: vec![],
    })`
);
fs.writeFileSync('src-tauri/src/compiler/mod.rs', modContent, 'utf8');
console.log('✓ Fixed mod.rs - binary move issue');

// Fix 4: Remove unused variable warnings
let spectrumContent = fs.readFileSync('src-tauri/src/compiler/platforms/zx_spectrum.rs', 'utf8');
spectrumContent = spectrumContent.replace(
  /fn create_basic_loader\(platform: Platform\)/g,
  'fn create_basic_loader(_platform: Platform)'
);
spectrumContent = spectrumContent.replace(
  /fn create_code_data\(bytecode: &Bytecode, platform: Platform\)/g,
  'fn create_code_data(bytecode: &Bytecode, _platform: Platform)'
);
fs.writeFileSync('src-tauri/src/compiler/platforms/zx_spectrum.rs', spectrumContent, 'utf8');
console.log('✓ Fixed zx_spectrum.rs - unused variables');

console.log('\n✓ All compilation errors fixed!');
