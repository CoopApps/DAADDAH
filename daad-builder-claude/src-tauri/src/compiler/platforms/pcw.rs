// Amstrad PCW COM file generator

use crate::compiler::codegen::Bytecode;
use crate::compiler::error::*;

/// Generate PCW .COM file
pub fn generate_com(bytecode: &Bytecode) -> CompilerResult<Vec<u8>> {
    // TODO: Implement PCW COM generation
    let _ = bytecode;
    Ok(Vec::new())
}
