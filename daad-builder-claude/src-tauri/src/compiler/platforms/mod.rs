// Platform-specific binary generators
//
// This module converts platform-independent bytecode into
// platform-specific binary formats (.TAP, .PRG, .DSK, .ROM, .ADF, etc.)

pub mod zx_spectrum;
pub mod c64;
pub mod amstrad_cpc;
pub mod msx;
pub mod amiga;
pub mod atari_st;
pub mod msdos;

use super::ast::Platform;
use super::error::*;

/// Generate a platform-specific binary from DDB data
pub fn generate_binary(platform: Platform, ddb_data: &[u8]) -> CompilerResult<Vec<u8>> {
    match platform {
        Platform::ZXSpectrum48K | Platform::ZXSpectrum128K => {
            zx_spectrum::generate(ddb_data, platform)
        }
        Platform::C64 => {
            c64::generate(ddb_data)
        }
        Platform::AmstradCPC => {
            amstrad_cpc::generate(ddb_data)
        }
        Platform::MSX => {
            msx::generate(ddb_data)
        }
        Platform::Amiga => {
            amiga::generate(ddb_data)
        }
        Platform::AtariST => {
            atari_st::generate(ddb_data)
        }
        Platform::MSDOS => {
            msdos::generate(ddb_data)
        }
        Platform::PCW => {
            // PCW uses similar format to Amstrad CPC (text-only)
            amstrad_cpc::generate(ddb_data)
        }
        Platform::Plus4 => {
            // Plus/4 uses similar format to C64
            c64::generate(ddb_data)
        }
    }
}
