// DAAD Compiler - Native Rust implementation
//
// This is a complete port of the DRC (DAAD Ready Compiler) to Rust,
// enabling native compilation of DAAD games to all retro platforms
// without external dependencies.

pub mod ast;
pub mod error;
pub mod parser;
pub mod condacts;
pub mod codegen;
pub mod platforms;
pub mod compression;
pub mod ddb_format;

pub use ast::*;
pub use error::*;
pub use parser::*;
pub use codegen::*;

/// Compile a DSF file to a platform-specific binary
pub fn compile_dsf_to_binary(
    dsf_path: &str,
    platform: Platform,
    output_path: &str,
) -> Result<CompilationResult, CompilerError> {
    // Phase 1: Parse DSF file
    let game_data = parser::parse_dsf_file(dsf_path)?;

    // Phase 2: Generate DDB binary with proper format
    let ddb_builder = ddb_format::DdbBuilder::new(platform);
    let ddb_data = ddb_builder.build(&game_data)?;

    // Phase 3: Generate platform binary (add platform-specific headers/wrappers)
    let binary = platforms::generate_binary(platform, &ddb_data)?;

    // Phase 4: Write output file
    let size = binary.len();
    std::fs::write(output_path, binary)?;

    Ok(CompilationResult {
        platform,
        output_path: output_path.to_string(),
        size,
        warnings: vec![],
    })
}

#[derive(Debug, Clone)]
pub struct CompilationResult {
    pub platform: Platform,
    pub output_path: String,
    pub size: usize,
    pub warnings: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compile_minimal_game() {
        // Test compilation of minimal test game
        let result = compile_dsf_to_binary(
            "minimal_test.dsf",
            Platform::ZXSpectrum48K,
            "test_output.tap"
        );

        assert!(result.is_ok());
    }
}
