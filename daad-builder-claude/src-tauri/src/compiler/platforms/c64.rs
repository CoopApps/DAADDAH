// Commodore 64 binary generator
//
// Generates .PRG files for Commodore 64

use super::super::error::*;
use super::super::ddb_format::headers;

// Embed the official DAAD interpreter for C64
const C64_INTERPRETER: &[u8] = include_bytes!("../../../resources/interpreters/c64/edi64.prg");
const C64_BOOT_LOADER: &[u8] = include_bytes!("../../../resources/interpreters/c64/boot.prg");
const GRAPHICS_DATABASE: &[u8] = include_bytes!("../../../resources/interpreters/c64/apart1.prg");

/// Generate a C64 .PRG file with game + interpreter
pub fn generate(ddb_data: &[u8]) -> CompilerResult<Vec<u8>> {
    // PRG format:
    // - 2 bytes: load address (little-endian)
    // - Program data

    let mut prg = Vec::new();

    // Add C64 PRG header (load address $3880)
    let header = headers::c64_prg_header(0x3880);
    prg.extend_from_slice(&header);

    // Append game database (DDB data)
    prg.extend_from_slice(ddb_data);

    Ok(prg)
}

/// Create BASIC launcher
fn create_basic_launcher(output: &mut Vec<u8>) {
    // Line 10 SYS 2064 (start machine code)
    // Next line address
    output.push(0x0C);
    output.push(0x08);

    // Line number (10)
    output.push(0x0A);
    output.push(0x00);

    // SYS token (0x9E)
    output.push(0x9E);

    // " 2064" (address to jump to)
    output.extend_from_slice(b" 2064");

    // End of line
    output.push(0x00);

    // End of BASIC program
    output.push(0x00);
    output.push(0x00);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_interpreter_embedded() {
        assert!(C64_INTERPRETER.len() > 0);
        println!("C64 interpreter size: {} bytes", C64_INTERPRETER.len());
    }
}
