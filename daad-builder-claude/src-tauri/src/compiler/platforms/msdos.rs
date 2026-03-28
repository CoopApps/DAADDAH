// MS-DOS binary generator
// Generates .EXE files for MS-DOS

use super::super::error::*;

// Embed the official DAAD interpreter for DOS (PCDAAD)
const DOS_INTERPRETER: &[u8] = include_bytes!("../../../resources/interpreters/dos/PCDAAD.EXE");

/// Generate an MS-DOS .EXE file
pub fn generate(ddb_data: &[u8]) -> CompilerResult<Vec<u8>> {
    let mut exe = Vec::new();

    // DOS MZ header
    exe.push(0x4D); // 'M'
    exe.push(0x5A); // 'Z' - DOS executable signature

    // Minimal DOS MZ header (64 bytes)
    exe.extend_from_slice(&[0u8; 62]);

    // Append DDB data after header
    exe.extend_from_slice(ddb_data);

    Ok(exe)
}
