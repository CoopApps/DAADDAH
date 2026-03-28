// Amstrad CPC DSK file generator

use crate::compiler::codegen::Bytecode;
use crate::compiler::error::*;

/// Generate Amstrad CPC .DSK file
pub fn generate_dsk(bytecode: &Bytecode) -> CompilerResult<Vec<u8>> {
    // TODO: Implement Amstrad DSK generation
    let _ = bytecode;
    Ok(Vec::new())
}
