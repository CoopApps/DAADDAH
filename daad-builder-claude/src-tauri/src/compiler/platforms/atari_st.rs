// Atari ST binary generator
// Generates .ST disk images for Atari ST

use super::super::error::*;

// Embed the official DAAD interpreter for Atari ST
const ATARI_ST_INTERPRETER: &[u8] = include_bytes!("../../../resources/interpreters/atari_st/DAAD_ST.ST");

/// Generate an Atari ST .ST disk image
pub fn generate(ddb_data: &[u8]) -> CompilerResult<Vec<u8>> {
    // .ST format is similar to ADF (720KB floppy for ST)
    let mut st = vec![0u8; 737280]; // Standard ST floppy size

    // Write DDB data
    let offset = 1024;
    st[offset..offset + ddb_data.len()].copy_from_slice(ddb_data);

    Ok(st)
}
