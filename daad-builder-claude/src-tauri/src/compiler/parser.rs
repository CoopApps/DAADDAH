// DSF Parser - Converts DSF text files into GameData AST
//
// This parser reads the DSF format we generate and converts it
// into an intermediate representation suitable for compilation.

use super::ast::*;
use super::error::*;
use std::fs;

/// Parse a DSF file into game data
pub fn parse_dsf_file(path: &str) -> CompilerResult<GameData> {
    let content = fs::read_to_string(path)?;
    parse_dsf(&content)
}

/// Parse DSF content string
pub fn parse_dsf(content: &str) -> CompilerResult<GameData> {
    let mut parser = DsfParser::new(content);
    parser.parse()
}

struct DsfParser {
    lines: Vec<String>,
    current_line: usize,
    game: GameData,
}

impl DsfParser {
    fn new(content: &str) -> Self {
        let lines: Vec<String> = content
            .lines()
            .map(|l| l.trim().to_string())
            .collect();

        Self {
            lines,
            current_line: 0,
            game: GameData::new(
                "Untitled".to_string(),
                "Unknown".to_string(),
                "1.0".to_string(),
            ),
        }
    }

    fn parse(&mut self) -> CompilerResult<GameData> {
        // Skip header comments
        self.skip_comments();

        // Parse required sections in order
        self.parse_ctl()?;
        self.parse_voc()?;
        self.parse_stx()?;
        self.parse_mtx()?;
        self.parse_otx()?;
        self.parse_ltx()?;
        self.parse_con()?;
        self.parse_obj()?;
        self.parse_pro()?;
        self.expect_section("/END")?;

        Ok(self.game.clone())
    }

    fn skip_comments(&mut self) {
        while self.current_line < self.lines.len() {
            let line = &self.lines[self.current_line];
            if line.is_empty() || line.starts_with(';') {
                self.current_line += 1;
            } else {
                break;
            }
        }
    }

    fn current(&self) -> Option<&String> {
        self.lines.get(self.current_line)
    }

    fn advance(&mut self) {
        self.current_line += 1;
    }

    fn expect_section(&mut self, expected: &str) -> CompilerResult<()> {
        self.skip_comments();

        match self.current() {
            Some(line) if line.starts_with(expected) => {
                self.advance();
                Ok(())
            }
            Some(line) => Err(CompilerError::UnexpectedToken {
                expected: expected.to_string(),
                found: line.clone(),
                line: self.current_line + 1,
            }),
            None => Err(CompilerError::ParseError {
                line: self.current_line + 1,
                column: 0,
                message: format!("Expected {} but reached end of file", expected),
            }),
        }
    }

    fn parse_ctl(&mut self) -> CompilerResult<()> {
        self.expect_section("/CTL")?;

        // Skip underscores/asterisks
        while let Some(line) = self.current() {
            if line.starts_with('_') || line.starts_with('*') || line.is_empty() {
                self.advance();
            } else {
                break;
            }
        }

        Ok(())
    }

    fn parse_voc(&mut self) -> CompilerResult<()> {
        self.expect_section("/VOC")?;
        self.skip_comments();

        // Parse vocabulary entries until next section
        while let Some(line) = self.current() {
            if line.starts_with('/') || line.is_empty() {
                break;
            }

            if line.starts_with(';') {
                self.advance();
                continue;
            }

            // Format: WORD ID type
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                let word = parts[0].to_uppercase();
                let id: u8 = parts[1].parse().map_err(|_| {
                    CompilerError::ParseError {
                        line: self.current_line + 1,
                        column: 0,
                        message: format!("Invalid vocabulary ID: {}", parts[1]),
                    }
                })?;

                let word_type = VocabType::from_str(parts[2]).ok_or_else(|| {
                    CompilerError::ParseError {
                        line: self.current_line + 1,
                        column: 0,
                        message: format!("Invalid vocabulary type: {}", parts[2]),
                    }
                })?;

                // Truncate to 5 characters
                let word = if word.len() > 5 {
                    word[..5].to_string()
                } else {
                    word
                };

                self.game.vocabulary.push(VocabEntry {
                    word: word.clone(),
                    id,
                    word_type,
                });

                self.game.vocab_lookup.insert(word, id);
            }

            self.advance();
        }

        Ok(())
    }

    fn parse_stx(&mut self) -> CompilerResult<()> {
        self.expect_section("/STX")?;
        self.parse_message_section(&mut self.game.system_messages.clone())?;
        self.game.system_messages = self.game.system_messages.clone();
        Ok(())
    }

    fn parse_mtx(&mut self) -> CompilerResult<()> {
        self.expect_section("/MTX")?;
        self.parse_message_section(&mut self.game.messages.clone())?;
        self.game.messages = self.game.messages.clone();
        Ok(())
    }

    fn parse_otx(&mut self) -> CompilerResult<()> {
        self.expect_section("/OTX")?;
        self.parse_message_section(&mut self.game.object_texts.clone())?;
        self.game.object_texts = self.game.object_texts.clone();
        Ok(())
    }

    fn parse_ltx(&mut self) -> CompilerResult<()> {
        self.expect_section("/LTX")?;
        self.parse_message_section(&mut self.game.location_texts.clone())?;
        self.game.location_texts = self.game.location_texts.clone();
        Ok(())
    }

    fn parse_message_section(&mut self, messages: &mut Vec<String>) -> CompilerResult<()> {
        self.skip_comments();

        while let Some(line) = self.current() {
            if !line.starts_with('/') || line.starts_with("/END") ||
               (line.starts_with('/') && !line.chars().nth(1).map(|c| c.is_numeric()).unwrap_or(false)) {
                break;
            }

            // Format: /N "text"
            if let Some(quote_start) = line.find('"') {
                if let Some(quote_end) = line.rfind('"') {
                    if quote_end > quote_start {
                        let text = &line[quote_start + 1..quote_end];
                        messages.push(text.to_string());
                    }
                }
            }

            self.advance();
        }

        Ok(())
    }

    fn parse_con(&mut self) -> CompilerResult<()> {
        self.expect_section("/CON")?;
        self.skip_comments();

        // Parse location connections
        // Format: /LOC followed by direction-target pairs
        while let Some(line) = self.current() {
            if line.starts_with("/OBJ") || line.starts_with("/PRO") || line.starts_with("/END") {
                break;
            }

            if line.starts_with(';') || line.is_empty() {
                self.advance();
                continue;
            }

            // Location header: /N
            if line.starts_with('/') {
                let loc_id_str = line.trim_start_matches('/').split_whitespace().next().unwrap_or("0");
                let loc_id: u8 = loc_id_str.parse().map_err(|_| {
                    CompilerError::ParseError {
                        line: self.current_line + 1,
                        column: 0,
                        message: format!("Invalid location ID: {}", loc_id_str),
                    }
                })?;

                self.advance();

                // Parse connections for this location
                let mut connections = Vec::new();
                while let Some(conn_line) = self.current() {
                    if conn_line.starts_with('/') || conn_line.is_empty() {
                        break;
                    }

                    if conn_line.starts_with(';') {
                        self.advance();
                        continue;
                    }

                    // Format: DIRECTION TARGET (e.g., "N 12" or "NORTH 12")
                    let parts: Vec<&str> = conn_line.split_whitespace().collect();
                    if parts.len() >= 2 {
                        // Look up direction word in vocabulary
                        let direction_word = parts[0].to_uppercase();
                        let direction = self.game.get_vocab_id(&direction_word).unwrap_or(0);

                        let target: u8 = parts[1].parse().map_err(|_| {
                            CompilerError::ParseError {
                                line: self.current_line + 1,
                                column: 0,
                                message: format!("Invalid connection target: {}", parts[1]),
                            }
                        })?;

                        connections.push(Connection {
                            direction,
                            target,
                            is_blocked: false, // V3 only, not supported yet
                        });
                    }

                    self.advance();
                }

                // Create or update location
                if loc_id as usize >= self.game.locations.len() {
                    self.game.locations.resize(
                        loc_id as usize + 1,
                        LocationDef {
                            id: 0,
                            connections: Vec::new(),
                            is_dark: false,
                        },
                    );
                }

                self.game.locations[loc_id as usize] = LocationDef {
                    id: loc_id,
                    connections,
                    is_dark: false, // DARK flag parsed from LTX comments if needed
                };
            } else {
                self.advance();
            }
        }

        Ok(())
    }

    fn parse_obj(&mut self) -> CompilerResult<()> {
        self.expect_section("/OBJ")?;
        self.skip_comments();

        // Parse object definitions
        // Format: /ID LOCATION WEIGHT CONTAINER WEARABLE f15 f14... f0 NOUN ADJECTIVE
        while let Some(line) = self.current() {
            if line.starts_with("/PRO") || line.starts_with("/END") {
                break;
            }

            if line.starts_with(';') || line.is_empty() {
                self.advance();
                continue;
            }

            if line.starts_with('/') {
                let parts: Vec<&str> = line.split_whitespace().collect();

                if parts.len() < 22 {
                    // Need at least: /ID LOCATION WEIGHT C W + 16 flags + NOUN + ADJ = 22 parts
                    self.advance();
                    continue;
                }

                // Parse object ID
                let id_str = parts[0].trim_start_matches('/');
                let id: u8 = id_str.parse().map_err(|_| {
                    CompilerError::ParseError {
                        line: self.current_line + 1,
                        column: 0,
                        message: format!("Invalid object ID: {}", id_str),
                    }
                })?;

                // Parse initial location
                let initial_location = match parts[1] {
                    "CARRIED" => 254,
                    "WORN" => 253,
                    "_" => 252, // Limbo
                    loc_str => loc_str.parse().unwrap_or(252),
                };

                // Parse weight
                let weight: u8 = parts[2].parse().unwrap_or(0).min(63);

                // Parse container flag
                let is_container = parts[3] == "Y";

                // Parse wearable flag
                let is_wearable = parts[4] == "Y";

                // Parse 16 custom flags (f15 to f0)
                let mut custom_flags = [false; 16];
                for i in 0..16 {
                    custom_flags[i] = parts[5 + i] == "Y";
                }

                // Parse noun (required)
                let noun_word = parts[21].to_uppercase();
                let noun = if noun_word == "_" {
                    None
                } else {
                    self.game.get_vocab_id(&noun_word)
                };

                // Parse adjective (optional)
                let adjective = if parts.len() > 22 {
                    let adj_word = parts[22].to_uppercase();
                    if adj_word == "_" {
                        None
                    } else {
                        self.game.get_vocab_id(&adj_word)
                    }
                } else {
                    None
                };

                self.game.objects.push(ObjectDef {
                    id,
                    initial_location,
                    weight,
                    is_container,
                    is_wearable,
                    custom_flags,
                    noun,
                    adjective,
                });
            }

            self.advance();
        }

        Ok(())
    }

    fn parse_pro(&mut self) -> CompilerResult<()> {
        // Parse all process tables (PRO 0-3)
        for process_idx in 0..4 {
            if let Some(line) = self.current() {
                if line.starts_with("/PRO") {
                    self.advance();
                    self.skip_comments();

                    // Parse process entries for this table
                    while let Some(entry_line) = self.current() {
                        if entry_line.starts_with("/PRO") || entry_line.starts_with("/END") {
                            break;
                        }

                        if entry_line.starts_with(';') || entry_line.is_empty() {
                            self.advance();
                            continue;
                        }

                        // Process entry starts with '>'
                        if entry_line.starts_with('>') {
                            let parts: Vec<&str> = entry_line.split_whitespace().collect();

                            if parts.len() < 3 {
                                self.advance();
                                continue;
                            }

                            // Parse verb and noun (can be '_' for wildcard or vocab words)
                            let verb = if parts[1] == "_" {
                                255 // Wildcard
                            } else {
                                let verb_word = parts[1].to_uppercase();
                                self.game.get_vocab_id(&verb_word).unwrap_or(255)
                            };

                            let noun = if parts[2] == "_" {
                                255 // Wildcard
                            } else {
                                let noun_word = parts[2].to_uppercase();
                                self.game.get_vocab_id(&noun_word).unwrap_or(255)
                            };

                            self.advance();

                            // Parse condacts for this entry
                            let mut condacts = Vec::new();
                            while let Some(condact_line) = self.current() {
                                if condact_line.starts_with('>')
                                   || condact_line.starts_with('/')
                                   || condact_line.is_empty() {
                                    break;
                                }

                                if condact_line.starts_with(';') {
                                    self.advance();
                                    continue;
                                }

                                // Parse condact line (e.g., "AT 0", "MESSAGE 0")
                                let condact_parts: Vec<&str> = condact_line.split_whitespace().collect();
                                if !condact_parts.is_empty() {
                                    // For now, store as opcode=0 and raw params
                                    // We'll resolve opcodes in Phase 2 (codegen)
                                    let params: Vec<u8> = condact_parts[1..]
                                        .iter()
                                        .filter_map(|p| p.parse().ok())
                                        .collect();

                                    condacts.push(CondAct {
                                        opcode: 0, // Will be resolved in codegen phase
                                        params,
                                    });
                                }

                                self.advance();
                            }

                            self.game.processes[process_idx].push(ProcessEntry {
                                verb,
                                noun,
                                condacts,
                            });
                        } else {
                            self.advance();
                        }
                    }
                }
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_minimal_dsf() {
        let dsf = r#"
; Test game
/CTL
_

/VOC
GET   10  verb
KEY   100 noun

/STX
/0 "Intro text"

/MTX
/0 "OK"

/OTX

/LTX
/0 "A room"

/CON
/0

/OBJ

/PRO 0
/PRO 1
/PRO 2
/PRO 3

/END
"#;

        let result = parse_dsf(dsf);
        assert!(result.is_ok());

        let game = result.unwrap();
        assert_eq!(game.vocabulary.len(), 2);
        assert_eq!(game.messages.len(), 1);
    }
}
