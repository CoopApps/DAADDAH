// MSX binary generator
// Generates .ROM files for MSX systems

use super::super::error::*;

// Embed the official DAAD interpreter for MSX
const MSX_INTERPRETER: &[u8] = include_bytes!("../../../resources/interpreters/msx/DAAD_MSX.DSK");

/// Generate an MSX .ROM file
pub fn generate(ddb_data: &[u8]) -> CompilerResult<Vec<u8>> {
    let mut rom = Vec::new();

    // MSX ROM header
    rom.push(0x41); // 'A'
    rom.push(0x42); // 'B' - ROM signature

    // Start address (0x4000 for 16KB cartridge)
    rom.push(0x00);
    rom.push(0x40);

    // Append DDB data
    rom.extend_from_slice(ddb_data);

    // Pad to 16KB if needed
    while rom.len() < 16384 {
        rom.push(0xFF);
    }

    Ok(rom)
}
