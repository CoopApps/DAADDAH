// Text compression module
// Implements DRC-compatible token-based text compression

use std::collections::HashMap;

/// Language-specific token tables
/// Based on DRC's compression JSON files
pub struct TokenTable {
    pub tokens: Vec<String>,
}

impl TokenTable {
    /// English token table (most common words/phrases)
    pub fn english() -> Self {
        Self {
            tokens: vec![
                " the".to_string(),
                " you".to_string(),
                "ing".to_string(),
                "er ".to_string(),
                " a ".to_string(),
                "ed ".to_string(),
                " to".to_string(),
                "in ".to_string(),
                "is ".to_string(),
                "re ".to_string(),
                " an".to_string(),
                "on ".to_string(),
                "at ".to_string(),
                "en ".to_string(),
                " of".to_string(),
                " be".to_string(),
                " he".to_string(),
                "it ".to_string(),
                "or ".to_string(),
                "ar ".to_string(),
                "an ".to_string(),
                "th".to_string(),
                "he".to_string(),
                "ou".to_string(),
                "nd".to_string(),
                "re".to_string(),
                "in".to_string(),
                "on".to_string(),
                "at".to_string(),
                "en".to_string(),
                "ha".to_string(),
                " I".to_string(),
                "I ".to_string(),
                "as".to_string(),
                "es".to_string(),
                "oo".to_string(),
                "al".to_string(),
                "ve".to_string(),
                "st".to_string(),
                "le".to_string(),
                "se".to_string(),
                "nt".to_string(),
                "ll".to_string(),
                "te".to_string(),
                "ur".to_string(),
                "ne".to_string(),
                "ly".to_string(),
                "ro".to_string(),
                "wa".to_string(),
                "ce".to_string(),
                "de".to_string(),
                "li".to_string(),
                "me".to_string(),
                "ra".to_string(),
                "ri".to_string(),
                "ti".to_string(),
                "be".to_string(),
                "ch".to_string(),
                "el".to_string(),
                "om".to_string(),
                "pe".to_string(),
                "hi".to_string(),
                "wi".to_string(),
                "fo".to_string(),
                "ta".to_string(),
                "no".to_string(),
                "di".to_string(),
                "ge".to_string(),
                "ma".to_string(),
                "tu".to_string(),
                "we".to_string(),
                "ca".to_string(),
                "la".to_string(),
                "na".to_string(),
                "si".to_string(),
                "pa".to_string(),
                "wh".to_string(),
                "bu".to_string(),
                "pr".to_string(),
                "fe".to_string(),
                "po".to_string(),
                "tr".to_string(),
                "co".to_string(),
                "sh".to_string(),
                "so".to_string(),
                "un".to_string(),
                "lo".to_string(),
                "mo".to_string(),
                "go".to_string(),
                "mi".to_string(),
                "mu".to_string(),
                "gr".to_string(),
                "sp".to_string(),
                "ke".to_string(),
                "bo".to_string(),
                "pi".to_string(),
                "do".to_string(),
                "ho".to_string(),
                "da".to_string(),
                "ru".to_string(),
                "ba".to_string(),
                "ga".to_string(),
                "cl".to_string(),
                "su".to_string(),
                "pl".to_string(),
                "ld".to_string(),
                "op".to_string(),
                "od".to_string(),
                "bi".to_string(),
                "fi".to_string(),
                "ck".to_string(),
                "gi".to_string(),
                "vi".to_string(),
                "ki".to_string(),
                "ni".to_string(),
                "sk".to_string(),
                "fa".to_string(),
                "ag".to_string(),
                "rd".to_string(),
                "id".to_string(),
                "ab".to_string(),
                "gu".to_string(),
                "va".to_string(),
                "ds".to_string(),
            ],
        }
    }

    /// Spanish token table
    pub fn spanish() -> Self {
        Self {
            tokens: vec![
                " que".to_string(),
                " de ".to_string(),
                "ara".to_string(),
                " una".to_string(),
                " la ".to_string(),
                " el ".to_string(),
                "ión".to_string(),
                " es ".to_string(),
                "ado".to_string(),
                "en ".to_string(),
                " no".to_string(),
                " un".to_string(),
                "nte".to_string(),
                "os ".to_string(),
                "er ".to_string(),
                "es ".to_string(),
                " se".to_string(),
                "ar ".to_string(),
                " co".to_string(),
                "con".to_string(),
                "sta".to_string(),
                "ien".to_string(),
                "as ".to_string(),
            ],
        }
    }
}

/// Text compression result
pub struct CompressionResult {
    pub compressed_text: Vec<u8>,
    pub token_table: Vec<u8>,
    pub savings: usize,
}

/// Two-pass token compression algorithm (DRC-compatible)
pub fn compress_text(texts: &[String], language: &str) -> CompressionResult {
    // Get language-specific token table
    let token_table = match language {
        "es" => TokenTable::spanish(),
        _ => TokenTable::english(), // Default to English
    };

    // Concatenate all text for analysis
    let combined_text = texts.join("\n");

    // Pass 1: Evaluate token profitability
    let mut profitable_tokens = Vec::new();
    for token in &token_table.tokens {
        let count = count_occurrences(&combined_text, token);
        if count > 0 {
            // Calculate savings: count * (token_len - 1) - 1
            // First use costs 1 byte (token table entry), subsequent uses save (len-1) bytes
            let savings = count * (token.len() - 1);
            if savings > 1 {
                profitable_tokens.push((token.clone(), count, savings));
            }
        }
    }

    // Sort by savings (most profitable first)
    profitable_tokens.sort_by(|a, b| b.2.cmp(&a.2));

    // Limit to 128 tokens (0x00-0x7F reserved, 0x7F-0xFF for tokens)
    profitable_tokens.truncate(128);

    // Pass 2: Token substitution
    let mut compressed_text = combined_text.clone();
    let mut token_bytes = Vec::new();

    for (index, (token, _, _)) in profitable_tokens.iter().enumerate() {
        // Replace token with byte code (0x7F + index)
        let token_code = (0x7F + index) as u8;
        compressed_text = compressed_text.replace(token, &format!("{}", token_code as char));

        // Build token table: each token's bytes with last byte having high bit set
        let token_chars: Vec<u8> = token.bytes().collect();
        for (i, &byte) in token_chars.iter().enumerate() {
            if i == token_chars.len() - 1 {
                // Last byte: set bit 7 (termination marker)
                token_bytes.push(byte | 0x80);
            } else {
                token_bytes.push(byte);
            }
        }
    }

    // Apply XOR 0xFF obfuscation to compressed text
    let obfuscated: Vec<u8> = compressed_text
        .bytes()
        .map(|b| b ^ 0xFF)
        .collect();

    let original_size = combined_text.len();
    let compressed_size = obfuscated.len() + token_bytes.len();
    let savings = if compressed_size < original_size {
        original_size - compressed_size
    } else {
        0
    };

    CompressionResult {
        compressed_text: obfuscated,
        token_table: token_bytes,
        savings,
    }
}

/// Count occurrences of a substring in text
fn count_occurrences(text: &str, pattern: &str) -> usize {
    if pattern.is_empty() {
        return 0;
    }
    text.matches(pattern).count()
}

/// Compress individual text sections with \n terminators
pub fn compress_text_section(texts: &[String], language: &str) -> Vec<u8> {
    if texts.is_empty() {
        return vec![0x00]; // Empty section
    }

    let result = compress_text(texts, language);

    // Add \n terminators between messages (XORed)
    let mut output = Vec::new();
    let sections: Vec<&[u8]> = result.compressed_text.split(|&b| b == (b'\n' ^ 0xFF)).collect();

    for (i, section) in sections.iter().enumerate() {
        output.extend_from_slice(section);
        if i < sections.len() - 1 {
            output.push(0x0D ^ 0xFF); // \n terminator, obfuscated
        }
    }

    output
}

/// Build lookup table for text section
pub fn build_lookup_table(compressed_text: &[u8]) -> Vec<u8> {
    let mut offsets = Vec::new();
    let mut current_offset = 0u16;

    // Track offset of each message (separated by 0x0D ^ 0xFF)
    offsets.push(current_offset);

    for &byte in compressed_text {
        current_offset += 1;
        if byte == (0x0D ^ 0xFF) {
            offsets.push(current_offset);
        }
    }

    // Convert offsets to bytes (little-endian)
    let mut lookup = Vec::new();
    for offset in offsets {
        lookup.push((offset & 0xFF) as u8);
        lookup.push((offset >> 8) as u8);
    }

    lookup
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_compression() {
        let texts = vec![
            "You are in a room.".to_string(),
            "You see the door.".to_string(),
            "You can see the window.".to_string(),
        ];

        let result = compress_text(&texts, "en");
        assert!(result.savings > 0, "Should save bytes with compression");
        assert!(!result.token_table.is_empty(), "Should have token table");
    }

    #[test]
    fn test_count_occurrences() {
        assert_eq!(count_occurrences("the cat in the hat", "the"), 2);
        assert_eq!(count_occurrences("hello", "lo"), 1);
        assert_eq!(count_occurrences("test", "xyz"), 0);
    }

    #[test]
    fn test_xor_obfuscation() {
        let text = "Hello";
        let obfuscated: Vec<u8> = text.bytes().map(|b| b ^ 0xFF).collect();
        let deobfuscated: Vec<u8> = obfuscated.iter().map(|&b| b ^ 0xFF).collect();
        assert_eq!(text.as_bytes(), deobfuscated.as_slice());
    }
}
