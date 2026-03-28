// Amstrad CPC binary generator
//
// Generates .DSK files for Amstrad CPC

use super::super::error::*;

/// Generate an Amstrad CPC .DSK file
pub fn generate(ddb_data: &[u8]) -> CompilerResult<Vec<u8>> {
    let mut dsk = Vec::new();

    // DSK format is more complex - it's a disk image format
    // For now, just use the DDB data directly

    // Append DDB data
    dsk.extend_from_slice(ddb_data);

    Ok(dsk)
}
