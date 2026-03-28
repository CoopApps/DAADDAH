// ZX Spectrum TAP file generator

use crate::compiler::codegen::Bytecode;
use crate::compiler::error::*;

/// Generate ZX Spectrum .TAP file
pub fn generate_tap(bytecode: &Bytecode, is_128k: bool) -> CompilerResult<Vec<u8>> {
    // TODO: Implement ZX Spectrum TAP generation
    // TAP format: https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format

    let _model = if is_128k { "128K" } else { "48K" };

    // Placeholder: return empty TAP
    Ok(Vec::new())
}
