// ZX Spectrum binary generator
//
// Generates .TAP files for ZX Spectrum 48K and 128K

use super::super::ast::Platform;
use super::super::error::*;

// Embed the official DAAD interpreter for ZX Spectrum
const SPECTRUM_INTERPRETER: &[u8] = include_bytes!("../../../resources/interpreters/spectrum/DS48IE.P3F");
const GRAPHICS_DATABASE: &[u8] = include_bytes!("../../../resources/interpreters/spectrum/PART1.SDG");

/// Generate a ZX Spectrum .TAP file with embedded interpreter
pub fn generate(ddb_data: &[u8], _platform: Platform) -> CompilerResult<Vec<u8>> {
    let mut tap = Vec::new();

    // DAAD TAP structure:
    // 1. BASIC loader
    // 2. Game database (.DDB format)
    // 3. Interpreter code
    // 4. Graphics database

    // Block 1: BASIC loader header
    write_tap_block(&mut tap, &create_basic_header());

    // Block 2: BASIC loader data
    write_tap_block(&mut tap, &create_basic_loader());

    // Block 3: Game database header
    write_tap_block(&mut tap, &create_code_header("PART1", ddb_data.len() as u16, 0x8000));

    // Block 4: Game database data
    write_tap_block(&mut tap, &create_data_block(ddb_data));

    // Block 5: Interpreter header
    write_tap_block(&mut tap, &create_code_header("DAAD", SPECTRUM_INTERPRETER.len() as u16, 0xC000));

    // Block 6: Interpreter data
    write_tap_block(&mut tap, &create_data_block(SPECTRUM_INTERPRETER));

    Ok(tap)
}

/// Write a TAP block (length + data)
fn write_tap_block(output: &mut Vec<u8>, data: &[u8]) {
    let len = data.len() as u16;
    output.push((len & 0xFF) as u8);
    output.push((len >> 8) as u8);
    output.extend_from_slice(data);
}

/// Create BASIC program header
fn create_basic_header() -> Vec<u8> {
    let mut header = Vec::new();
    header.push(0x00); // Flag: header

    // Header data
    header.push(0x00); // Type: BASIC
    let name = b"Loader    ";
    header.extend_from_slice(name);
    
    let basic_length = 26u16; // Length of BASIC program
    header.push((basic_length & 0xFF) as u8);
    header.push((basic_length >> 8) as u8);
    
    // Auto-start line 10
    header.push(0x0A);
    header.push(0x00);
    
    // Program length
    header.push((basic_length & 0xFF) as u8);
    header.push((basic_length >> 8) as u8);

    let checksum = calculate_checksum(&header);
    header.push(checksum);
    header
}

/// Create BASIC loader program
fn create_basic_loader() -> Vec<u8> {
    let mut basic = Vec::new();
    basic.push(0xFF); // Flag: data

    // Line 10: CLEAR 32767: LOAD "" CODE: RANDOMIZE USR 49152
    basic.push(0x00); // Line number high
    basic.push(0x0A); // Line number low (10)
    basic.push(0x13); // Line length
    basic.push(0x00);

    // CLEAR 32767
    basic.push(0xFD); // CLEAR token
    basic.extend_from_slice(b" 32767:");
    
    // LOAD "" CODE
    basic.push(0xEF); // LOAD token
    basic.extend_from_slice(b" \"\"");
    basic.push(0xAF); // CODE token
    basic.push(0x0D); // Enter

    let checksum = calculate_checksum(&basic);
    basic.push(checksum);
    basic
}

/// Create CODE block header
fn create_code_header(name: &str, length: u16, start_addr: u16) -> Vec<u8> {
    let mut header = Vec::new();
    header.push(0x00); // Flag: header
    header.push(0x03); // Type: CODE

    // Filename (10 bytes, padded with spaces)
    let mut name_bytes = [b' '; 10];
    let name_len = name.len().min(10);
    name_bytes[..name_len].copy_from_slice(&name.as_bytes()[..name_len]);
    header.extend_from_slice(&name_bytes);

    // Data length
    header.push((length & 0xFF) as u8);
    header.push((length >> 8) as u8);

    // Start address
    header.push((start_addr & 0xFF) as u8);
    header.push((start_addr >> 8) as u8);

    // Unused param2
    header.push(0x00);
    header.push(0x00);

    let checksum = calculate_checksum(&header);
    header.push(checksum);
    header
}

/// Create data block
fn create_data_block(data: &[u8]) -> Vec<u8> {
    let mut block = Vec::new();
    block.push(0xFF); // Flag: data
    block.extend_from_slice(data);
    
    let checksum = calculate_checksum(&block);
    block.push(checksum);
    block
}

/// Calculate TAP checksum (XOR of all bytes)
fn calculate_checksum(data: &[u8]) -> u8 {
    data.iter().fold(0u8, |acc, &byte| acc ^ byte)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_checksum() {
        let data = vec![0x00, 0x03, 0xFF];
        let checksum = calculate_checksum(&data);
        assert_eq!(checksum, 0xFC);
    }

    #[test]
    fn test_interpreter_embedded() {
        assert!(SPECTRUM_INTERPRETER.len() > 0);
        println!("Spectrum interpreter size: {} bytes", SPECTRUM_INTERPRETER.len());
    }
}
