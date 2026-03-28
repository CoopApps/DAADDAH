// Commodore Plus/4 PRG file generator

use crate::compiler::codegen::Bytecode;
use crate::compiler::error::*;

/// Generate Plus/4 .PRG file
pub fn generate_prg(bytecode: &Bytecode) -> CompilerResult<Vec<u8>> {
    // TODO: Implement Plus/4 PRG generation
    let _ = bytecode;
    Ok(Vec::new())
}
