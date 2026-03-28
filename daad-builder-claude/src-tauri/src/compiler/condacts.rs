// CondAct opcode mappings - OFFICIAL DRC SPECIFICATION
//
// This module defines all DAAD CondActs (Conditions and Actions)
// and their bytecode opcodes matching the official DRC compiler.
// Source: https://github.com/Utodev/DRC/blob/master/src/UCondacts.pas

use std::collections::HashMap;
use lazy_static::lazy_static;

/// CondAct definition
#[derive(Debug, Clone)]
pub struct CondActDef {
    pub name: &'static str,
    pub opcode: u8,
    pub param_count: u8,
    pub is_condition: bool,
    pub version: DaadVersion,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DaadVersion {
    V2,  // ZX Spectrum, C64, Amstrad CPC, MSX, PCW, Plus/4
    V3,  // Amiga, Atari ST, MS-DOS
}

lazy_static! {
    /// Map of CondAct names to their definitions (Official DRC opcodes)
    pub static ref CONDACTS: HashMap<&'static str, CondActDef> = {
        let mut m = HashMap::new();

        // ===== CONDITIONS (return true/false) =====

        // Opcodes 0-15: Location & basic tests
        m.insert("AT", CondActDef { name: "AT", opcode: 0, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("NOTAT", CondActDef { name: "NOTAT", opcode: 1, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("ATGT", CondActDef { name: "ATGT", opcode: 2, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("ATLT", CondActDef { name: "ATLT", opcode: 3, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("PRESENT", CondActDef { name: "PRESENT", opcode: 4, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("ABSENT", CondActDef { name: "ABSENT", opcode: 5, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("WORN", CondActDef { name: "WORN", opcode: 6, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("NOTWORN", CondActDef { name: "NOTWORN", opcode: 7, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("CARRIED", CondActDef { name: "CARRIED", opcode: 8, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("NOTCARR", CondActDef { name: "NOTCARR", opcode: 9, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("CHANCE", CondActDef { name: "CHANCE", opcode: 10, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("ZERO", CondActDef { name: "ZERO", opcode: 11, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("NOTZERO", CondActDef { name: "NOTZERO", opcode: 12, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("EQ", CondActDef { name: "EQ", opcode: 13, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("GT", CondActDef { name: "GT", opcode: 14, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("LT", CondActDef { name: "LT", opcode: 15, param_count: 2, is_condition: true, version: DaadVersion::V2 });

        // Opcodes 16-17: Extended parsing (adjective, adverb)
        m.insert("ADJECT1", CondActDef { name: "ADJECT1", opcode: 16, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("ADVERB", CondActDef { name: "ADVERB", opcode: 17, param_count: 1, is_condition: true, version: DaadVersion::V2 });

        // Opcodes 55-59, 68-70, 76, 79-80, 88, 112-115: More conditions
        m.insert("ISAT", CondActDef { name: "ISAT", opcode: 55, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("HASAT", CondActDef { name: "HASAT", opcode: 58, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("HASNAT", CondActDef { name: "HASNAT", opcode: 59, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("PREP", CondActDef { name: "PREP", opcode: 68, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("NOUN2", CondActDef { name: "NOUN2", opcode: 69, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("ADJECT2", CondActDef { name: "ADJECT2", opcode: 70, param_count: 1, is_condition: true, version: DaadVersion::V2 });
        m.insert("SAME", CondActDef { name: "SAME", opcode: 76, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("NOTEQ", CondActDef { name: "NOTEQ", opcode: 79, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("NOTSAME", CondActDef { name: "NOTSAME", opcode: 80, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("ISNOTAT", CondActDef { name: "ISNOTAT", opcode: 88, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("BIGGER", CondActDef { name: "BIGGER", opcode: 112, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("SMALLER", CondActDef { name: "SMALLER", opcode: 113, param_count: 2, is_condition: true, version: DaadVersion::V2 });
        m.insert("ISDONE", CondActDef { name: "ISDONE", opcode: 114, param_count: 0, is_condition: true, version: DaadVersion::V2 });
        m.insert("ISNDONE", CondActDef { name: "ISNDONE", opcode: 115, param_count: 0, is_condition: true, version: DaadVersion::V2 });
        m.insert("INKEY", CondActDef { name: "INKEY", opcode: 111, param_count: 0, is_condition: true, version: DaadVersion::V2 });

        // ===== ACTIONS (perform operations) =====

        // Opcodes 18-54: Core actions
        m.insert("SFX", CondActDef { name: "SFX", opcode: 18, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("DESC", CondActDef { name: "DESC", opcode: 19, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("QUIT", CondActDef { name: "QUIT", opcode: 20, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("END", CondActDef { name: "END", opcode: 21, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("DONE", CondActDef { name: "DONE", opcode: 22, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("OK", CondActDef { name: "OK", opcode: 23, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("ANYKEY", CondActDef { name: "ANYKEY", opcode: 24, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("SAVE", CondActDef { name: "SAVE", opcode: 25, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("LOAD", CondActDef { name: "LOAD", opcode: 26, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("DPRINT", CondActDef { name: "DPRINT", opcode: 27, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("DISPLAY", CondActDef { name: "DISPLAY", opcode: 28, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("CLS", CondActDef { name: "CLS", opcode: 29, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("DROPALL", CondActDef { name: "DROPALL", opcode: 30, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("AUTOG", CondActDef { name: "AUTOG", opcode: 31, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("AUTOD", CondActDef { name: "AUTOD", opcode: 32, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("AUTOW", CondActDef { name: "AUTOW", opcode: 33, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("AUTOR", CondActDef { name: "AUTOR", opcode: 34, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("PAUSE", CondActDef { name: "PAUSE", opcode: 35, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("SYNONYM", CondActDef { name: "SYNONYM", opcode: 36, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("GOTO", CondActDef { name: "GOTO", opcode: 37, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("MESSAGE", CondActDef { name: "MESSAGE", opcode: 38, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("REMOVE", CondActDef { name: "REMOVE", opcode: 39, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("GET", CondActDef { name: "GET", opcode: 40, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("DROP", CondActDef { name: "DROP", opcode: 41, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("WEAR", CondActDef { name: "WEAR", opcode: 42, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("DESTROY", CondActDef { name: "DESTROY", opcode: 43, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("CREATE", CondActDef { name: "CREATE", opcode: 44, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("SWAP", CondActDef { name: "SWAP", opcode: 45, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("PLACE", CondActDef { name: "PLACE", opcode: 46, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("SET", CondActDef { name: "SET", opcode: 47, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("CLEAR", CondActDef { name: "CLEAR", opcode: 48, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("PLUS", CondActDef { name: "PLUS", opcode: 49, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("MINUS", CondActDef { name: "MINUS", opcode: 50, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("LET", CondActDef { name: "LET", opcode: 51, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("NEWLINE", CondActDef { name: "NEWLINE", opcode: 52, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("PRINT", CondActDef { name: "PRINT", opcode: 53, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("SYSMESS", CondActDef { name: "SYSMESS", opcode: 54, param_count: 1, is_condition: false, version: DaadVersion::V2 });

        // Opcode 56-127: Extended actions
        m.insert("SETCO", CondActDef { name: "SETCO", opcode: 56, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("SPACE", CondActDef { name: "SPACE", opcode: 57, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("LISTOBJ", CondActDef { name: "LISTOBJ", opcode: 60, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("EXTERN", CondActDef { name: "EXTERN", opcode: 61, param_count: 2, is_condition: false, version: DaadVersion::V3 });
        m.insert("RAMSAVE", CondActDef { name: "RAMSAVE", opcode: 62, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("RAMLOAD", CondActDef { name: "RAMLOAD", opcode: 63, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("BEEP", CondActDef { name: "BEEP", opcode: 64, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("PAPER", CondActDef { name: "PAPER", opcode: 65, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("INK", CondActDef { name: "INK", opcode: 66, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("BORDER", CondActDef { name: "BORDER", opcode: 67, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("ADD", CondActDef { name: "ADD", opcode: 71, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("SUB", CondActDef { name: "SUB", opcode: 72, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("PARSE", CondActDef { name: "PARSE", opcode: 73, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("LISTAT", CondActDef { name: "LISTAT", opcode: 74, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("PROCESS", CondActDef { name: "PROCESS", opcode: 75, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("MES", CondActDef { name: "MES", opcode: 77, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("WINDOW", CondActDef { name: "WINDOW", opcode: 78, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("MODE", CondActDef { name: "MODE", opcode: 81, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("WINAT", CondActDef { name: "WINAT", opcode: 82, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("TIME", CondActDef { name: "TIME", opcode: 83, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("PICTURE", CondActDef { name: "PICTURE", opcode: 84, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("DOALL", CondActDef { name: "DOALL", opcode: 85, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("MOUSE", CondActDef { name: "MOUSE", opcode: 86, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("GFX", CondActDef { name: "GFX", opcode: 87, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("WEIGH", CondActDef { name: "WEIGH", opcode: 89, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("PUTIN", CondActDef { name: "PUTIN", opcode: 90, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("TAKEOUT", CondActDef { name: "TAKEOUT", opcode: 91, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("NEWTEXT", CondActDef { name: "NEWTEXT", opcode: 92, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("ABILITY", CondActDef { name: "ABILITY", opcode: 93, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("WEIGHT", CondActDef { name: "WEIGHT", opcode: 94, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("RANDOM", CondActDef { name: "RANDOM", opcode: 95, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("INPUT", CondActDef { name: "INPUT", opcode: 96, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("SAVEAT", CondActDef { name: "SAVEAT", opcode: 97, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("BACKAT", CondActDef { name: "BACKAT", opcode: 98, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("PRINTAT", CondActDef { name: "PRINTAT", opcode: 99, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("WHATO", CondActDef { name: "WHATO", opcode: 100, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("CALL", CondActDef { name: "CALL", opcode: 101, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("PUTO", CondActDef { name: "PUTO", opcode: 102, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("NOTDONE", CondActDef { name: "NOTDONE", opcode: 103, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("AUTOP", CondActDef { name: "AUTOP", opcode: 104, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("AUTOT", CondActDef { name: "AUTOT", opcode: 105, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("MOVE", CondActDef { name: "MOVE", opcode: 106, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("WINSIZE", CondActDef { name: "WINSIZE", opcode: 107, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("REDO", CondActDef { name: "REDO", opcode: 108, param_count: 0, is_condition: false, version: DaadVersion::V3 });
        m.insert("CENTRE", CondActDef { name: "CENTRE", opcode: 109, param_count: 0, is_condition: false, version: DaadVersion::V3 });
        m.insert("EXIT", CondActDef { name: "EXIT", opcode: 110, param_count: 1, is_condition: false, version: DaadVersion::V3 });
        m.insert("SKIP", CondActDef { name: "SKIP", opcode: 116, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("RESTART", CondActDef { name: "RESTART", opcode: 117, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("TAB", CondActDef { name: "TAB", opcode: 118, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("COPYOF", CondActDef { name: "COPYOF", opcode: 119, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("COPYOO", CondActDef { name: "COPYOO", opcode: 121, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("COPYFO", CondActDef { name: "COPYFO", opcode: 123, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("COPYFF", CondActDef { name: "COPYFF", opcode: 125, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("COPYBF", CondActDef { name: "COPYBF", opcode: 126, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("RESET", CondActDef { name: "RESET", opcode: 127, param_count: 0, is_condition: false, version: DaadVersion::V2 });

        // Extended/Maluva condacts (128-142)
        m.insert("XMES", CondActDef { name: "XMES", opcode: 128, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XMESSAGE", CondActDef { name: "XMESSAGE", opcode: 129, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XPICTURE", CondActDef { name: "XPICTURE", opcode: 130, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XSAVE", CondActDef { name: "XSAVE", opcode: 131, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XLOAD", CondActDef { name: "XLOAD", opcode: 132, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XPART", CondActDef { name: "XPART", opcode: 133, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XPLAY", CondActDef { name: "XPLAY", opcode: 134, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XBEEP", CondActDef { name: "XBEEP", opcode: 135, param_count: 2, is_condition: false, version: DaadVersion::V2 });
        m.insert("XSPLITSCR", CondActDef { name: "XSPLITSCR", opcode: 136, param_count: 1, is_condition: false, version: DaadVersion::V2 });
        m.insert("XUNDONE", CondActDef { name: "XUNDONE", opcode: 137, param_count: 0, is_condition: false, version: DaadVersion::V2 });
        m.insert("XDATA", CondActDef { name: "XDATA", opcode: 142, param_count: 1, is_condition: false, version: DaadVersion::V2 });

        // Legacy/compatibility
        m.insert("GETKEY", CondActDef { name: "GETKEY", opcode: 101, param_count: 0, is_condition: false, version: DaadVersion::V2 }); // Alias for CALL
        m.insert("WAIT", CondActDef { name: "WAIT", opcode: 35, param_count: 1, is_condition: false, version: DaadVersion::V2 }); // Alias for PAUSE

        m
    };
}

/// Get CondAct definition by name
pub fn get_condact(name: &str) -> Option<&'static CondActDef> {
    let upper = name.to_uppercase();
    CONDACTS.get(upper.as_str())
}

/// Check if a CondAct is supported on a platform version
pub fn is_supported(name: &str, version: DaadVersion) -> bool {
    if let Some(def) = get_condact(name) {
        match version {
            DaadVersion::V2 => def.version == DaadVersion::V2,
            DaadVersion::V3 => true, // V3 supports both V2 and V3 condacts
        }
    } else {
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_condact_lookup() {
        let at = get_condact("AT").unwrap();
        assert_eq!(at.opcode, 0);
        assert_eq!(at.param_count, 1);
        assert!(at.is_condition);
    }

    #[test]
    fn test_case_insensitive() {
        assert!(get_condact("at").is_some());
        assert!(get_condact("AT").is_some());
        assert!(get_condact("At").is_some());
    }

    #[test]
    fn test_v3_support() {
        assert!(is_supported("AT", DaadVersion::V2));
        assert!(is_supported("AT", DaadVersion::V3));
        assert!(!is_supported("EXTERN", DaadVersion::V2));
        assert!(is_supported("EXTERN", DaadVersion::V3));
    }
}
