// DDB (DAAD Database) binary format generator
// Implements DRC-compatible binary format

use super::ast::*;
use super::compression;
use super::error::*;

/// Platform-specific endianness
#[derive(Clone, Copy)]
pub enum Endianness {
    Little,
    Big,
}

/// DAAD version
#[derive(Clone, Copy)]
pub enum DaadVersion {
    V2 = 2,
    V3 = 3,
}

/// Machine ID codes (high nibble of byte 1)
#[derive(Clone, Copy)]
pub enum MachineId {
    ZXSpectrum = 0,
    C64 = 1,
    AmstradCPC = 2,
    MSX = 3,
    Amiga = 4,
    AtariST = 5,
    PC = 6,
}

/// Language codes (low nibble of byte 1)
#[derive(Clone, Copy)]
pub enum LanguageId {
    English = 0,
    Spanish = 1,
    German = 2,
    French = 3,
    Portuguese = 4,
}

/// DDB binary builder
pub struct DdbBuilder {
    version: DaadVersion,
    machine: MachineId,
    language: LanguageId,
    endianness: Endianness,
    enable_compression: bool,
}

impl DdbBuilder {
    pub fn new(platform: Platform) -> Self {
        let (machine, endianness) = match platform {
            Platform::ZXSpectrum48K | Platform::ZXSpectrum128K => {
                (MachineId::ZXSpectrum, Endianness::Little)
            }
            Platform::C64 | Platform::Plus4 => (MachineId::C64, Endianness::Little),
            Platform::AmstradCPC | Platform::PCW => (MachineId::AmstradCPC, Endianness::Little),
            Platform::MSX => (MachineId::MSX, Endianness::Little),
            Platform::Amiga => (MachineId::Amiga, Endianness::Little),
            Platform::AtariST => (MachineId::AtariST, Endianness::Little),
            Platform::MSDOS => (MachineId::PC, Endianness::Little),
        };

        Self {
            version: DaadVersion::V2, // Most platforms use V2
            machine,
            language: LanguageId::English,
            endianness,
            enable_compression: true,
        }
    }

    /// Build complete DDB binary
    pub fn build(&self, game: &GameData) -> CompilerResult<Vec<u8>> {
        let mut ddb = Vec::new();

        // Build all sections first (to calculate offsets)
        let vocabulary = self.build_vocabulary(&game.vocabulary)?;
        let (messages, msg_lookup) = self.build_text_section(&game.messages)?;
        let (sys_messages, sys_lookup) = self.build_text_section(&game.system_messages)?;
        let (loc_texts, loc_lookup) = self.build_text_section(&game.location_texts)?;
        let (obj_texts, obj_lookup) = self.build_text_section(&game.object_texts)?;
        let objects = self.build_objects(&game.objects)?;
        let connections = self.build_connections(&game.locations)?;
        let processes = self.build_processes_all(&game.processes)?;

        // Build header with section offsets
        let header = self.build_header(
            game,
            &vocabulary,
            &messages,
            &sys_messages,
            &loc_texts,
            &obj_texts,
            &objects,
            &connections,
            &processes,
        )?;

        // Assemble DDB in correct order
        ddb.extend_from_slice(&header);

        // External files section
        for ext_file in &game.external_files {
            ddb.extend_from_slice(&ext_file.data);
        }

        // Object texts + lookup
        ddb.extend_from_slice(&obj_texts);
        if self.needs_word_alignment() {
            self.add_word_alignment(&mut ddb);
        }
        ddb.extend_from_slice(&obj_lookup);

        // Object metadata
        ddb.extend_from_slice(&objects);

        // Vocabulary
        ddb.extend_from_slice(&vocabulary);

        // Token table (if compression enabled)
        if self.enable_compression {
            // TODO: Add token table from compression
        }

        // System messages + lookup
        ddb.extend_from_slice(&sys_messages);
        if self.needs_word_alignment() {
            self.add_word_alignment(&mut ddb);
        }
        ddb.extend_from_slice(&sys_lookup);

        // User messages + lookup
        ddb.extend_from_slice(&messages);
        if self.needs_word_alignment() {
            self.add_word_alignment(&mut ddb);
        }
        ddb.extend_from_slice(&msg_lookup);

        // Location texts + lookup
        ddb.extend_from_slice(&loc_texts);
        if self.needs_word_alignment() {
            self.add_word_alignment(&mut ddb);
        }
        ddb.extend_from_slice(&loc_lookup);

        // Connections
        ddb.extend_from_slice(&connections);

        // Processes
        ddb.extend_from_slice(&processes);

        Ok(ddb)
    }

    /// Build DDB header (34-67 bytes)
    fn build_header(
        &self,
        game: &GameData,
        vocabulary: &[u8],
        messages: &[u8],
        sys_messages: &[u8],
        loc_texts: &[u8],
        obj_texts: &[u8],
        objects: &[u8],
        connections: &[u8],
        processes: &[u8],
    ) -> CompilerResult<Vec<u8>> {
        let mut header = Vec::new();

        // Byte 0: DAAD version
        header.push(self.version as u8);

        // Byte 1: Machine ID (high nibble) + Language (low nibble)
        let machine_lang = ((self.machine as u8) << 4) | (self.language as u8);
        header.push(machine_lang);

        // Byte 2: Sub-machine ID (0 for most platforms)
        header.push(0x00);

        // Byte 3: Object count
        header.push(game.objects.len() as u8);

        // Byte 4: Location count
        header.push(game.locations.len() as u8);

        // Byte 5: Message count (user messages)
        header.push(game.messages.len() as u8);

        // Byte 6: System message count
        header.push(game.system_messages.len() as u8);

        // Byte 7: Process count (total of all 4 tables)
        let total_processes: usize = game.processes.iter().map(|p| p.len()).sum();
        header.push(total_processes as u8);

        // Calculate offsets for each section
        let header_size = if matches!(self.version, DaadVersion::V3) { 67 } else { 60 };

        let mut offset = header_size as u16;

        // External files
        let external_offset = offset;
        for ext_file in &game.external_files {
            offset += ext_file.data.len() as u16;
        }

        // Object texts
        let obj_texts_offset = offset;
        offset += obj_texts.len() as u16;

        // Object metadata
        let objects_offset = offset;
        offset += objects.len() as u16;

        // Vocabulary
        let vocabulary_offset = offset;
        offset += vocabulary.len() as u16;

        // Token table (placeholder for now)
        let token_offset = offset;

        // System messages
        let sys_messages_offset = offset;
        offset += sys_messages.len() as u16;

        // User messages
        let messages_offset = offset;
        offset += messages.len() as u16;

        // Location texts
        let loc_texts_offset = offset;
        offset += loc_texts.len() as u16;

        // Connections
        let connections_offset = offset;
        offset += connections.len() as u16;

        // Processes
        let processes_offset = offset;

        // Bytes 8-33: Offset table (13 words = 26 bytes)
        // Offset 0: External files
        self.write_word_to_vec(&mut header, external_offset);

        // Offset 1: Object texts
        self.write_word_to_vec(&mut header, obj_texts_offset);

        // Offset 2: Object metadata
        self.write_word_to_vec(&mut header, objects_offset);

        // Offset 3: Vocabulary
        self.write_word_to_vec(&mut header, vocabulary_offset);

        // Offset 4: Token table
        self.write_word_to_vec(&mut header, token_offset);

        // Offset 5: System messages
        self.write_word_to_vec(&mut header, sys_messages_offset);

        // Offset 6: User messages
        self.write_word_to_vec(&mut header, messages_offset);

        // Offset 7: User messages 2 (V3 only, not used)
        self.write_word_to_vec(&mut header, 0);

        // Offset 8: Location texts
        self.write_word_to_vec(&mut header, loc_texts_offset);

        // Offset 9: Connections
        self.write_word_to_vec(&mut header, connections_offset);

        // Offset 10: Process 0
        self.write_word_to_vec(&mut header, processes_offset);

        // Offset 11-12: Process 1-3 (calculated later if separate tables)
        self.write_word_to_vec(&mut header, 0);
        self.write_word_to_vec(&mut header, 0);

        // Bytes 34-59: External vector pointers (13 words = 26 bytes)
        // These are for runtime use, initialize to 0
        for _ in 0..26 {
            header.push(0x00);
        }

        // V3 extension (bytes 60-67)
        if matches!(self.version, DaadVersion::V3) {
            // Extended message count (messages 2)
            header.push(0);

            // Blockable connections count
            let blockable_count = game.locations.iter()
                .flat_map(|loc| &loc.connections)
                .filter(|conn| conn.is_blocked)
                .count();
            header.push(blockable_count as u8);

            // Reserved bytes
            for _ in 0..6 {
                header.push(0x00);
            }
        }

        Ok(header)
    }

    /// Helper to write word to a vector
    fn write_word_to_vec(&self, vec: &mut Vec<u8>, value: u16) {
        match self.endianness {
            Endianness::Little => {
                vec.push((value & 0xFF) as u8);
                vec.push((value >> 8) as u8);
            }
            Endianness::Big => {
                vec.push((value >> 8) as u8);
                vec.push((value & 0xFF) as u8);
            }
        }
    }

    /// Build vocabulary section (7-byte entries)
    fn build_vocabulary(&self, vocab: &[VocabEntry]) -> CompilerResult<Vec<u8>> {
        let mut data = Vec::new();

        for entry in vocab {
            // Word: 5 bytes (uppercase, right-padded with spaces, XORed with 0xFF)
            let word_upper = entry.word.to_uppercase();
            let mut word_bytes = [b' '; 5];
            for (i, ch) in word_upper.chars().take(5).enumerate() {
                word_bytes[i] = ch as u8;
            }

            // XOR each byte with 0xFF
            for &byte in &word_bytes {
                data.push(byte ^ 0xFF);
            }

            // Value: 1 byte (vocabulary ID)
            data.push(entry.id as u8);

            // Type: 1 byte
            let type_code = entry.word_type as u8;
            data.push(type_code);
        }

        // Terminator: 0x00
        data.push(0x00);

        Ok(data)
    }

    /// Build text section with lookup table
    fn build_text_section(&self, texts: &[String]) -> CompilerResult<(Vec<u8>, Vec<u8>)> {
        if texts.is_empty() {
            return Ok((vec![0x00], vec![0x00, 0x00]));
        }

        let lang = match self.language {
            LanguageId::Spanish => "es",
            LanguageId::German => "de",
            LanguageId::French => "fr",
            LanguageId::Portuguese => "pt",
            _ => "en",
        };

        // Compress and obfuscate text
        let compressed = if self.enable_compression {
            compression::compress_text_section(texts, lang)
        } else {
            // No compression: just XOR with 0xFF and add \n terminators
            let mut output = Vec::new();
            for (i, text) in texts.iter().enumerate() {
                for &byte in text.as_bytes() {
                    output.push(byte ^ 0xFF);
                }
                if i < texts.len() - 1 {
                    output.push(0x0D ^ 0xFF); // \n terminator
                }
            }
            output
        };

        // Build lookup table
        let lookup = compression::build_lookup_table(&compressed);

        Ok((compressed, lookup))
    }

    /// Build location text section
    fn build_location_texts(&self, _locations: &[LocationDef]) -> CompilerResult<(Vec<u8>, Vec<u8>)> {
        // Location texts come from game.location_texts, not from locations themselves
        // This will be handled by build() method directly
        Ok((vec![0x00], vec![0x00, 0x00]))
    }

    /// Build object text section
    fn build_object_texts(&self, _objects: &[ObjectDef]) -> CompilerResult<(Vec<u8>, Vec<u8>)> {
        // Object texts come from game.object_texts, not from objects themselves
        // This will be handled by build() method directly
        Ok((vec![0x00], vec![0x00, 0x00]))
    }

    /// Build object metadata section (V2 format)
    fn build_objects(&self, objects: &[ObjectDef]) -> CompilerResult<Vec<u8>> {
        let mut data = Vec::new();

        // Noun/Adjective indexes (2 bytes per object)
        for obj in objects {
            data.push(obj.noun.unwrap_or(255) as u8);
            data.push(obj.adjective.unwrap_or(255) as u8);
        }

        // Weight + Flags (1 byte per object)
        for obj in objects {
            let mut weight_flags = (obj.weight & 0x3F) as u8; // Bits 0-5: weight (0-63)
            if obj.is_container {
                weight_flags |= 0x40; // Bit 6: container flag
            }
            if obj.is_wearable {
                weight_flags |= 0x80; // Bit 7: wearable flag
            }
            data.push(weight_flags);
        }

        // Extra attributes (2 bytes per object, endianness-dependent)
        // Convert custom_flags bool array to u16
        for obj in objects {
            let mut attrs = 0u16;
            for (i, &flag) in obj.custom_flags.iter().enumerate() {
                if flag {
                    attrs |= 1 << i;
                }
            }
            self.write_word(&mut data, attrs);
        }

        // Initial locations (1 byte per object)
        for obj in objects {
            data.push(obj.initial_location as u8);
        }

        // Terminator
        data.push(0xFF);

        Ok(data)
    }

    /// Build connections section
    fn build_connections(&self, locations: &[LocationDef]) -> CompilerResult<Vec<u8>> {
        let mut data = Vec::new();
        let mut blockable_states = Vec::new();
        let mut blockable_ordinal = 0u8;

        // First pass: Build connection table and track blockable connections
        for loc in locations {
            for conn in &loc.connections {
                // Direction byte (bits 0-6: direction, bit 7: blockable flag)
                let mut direction_byte = conn.direction & 0x7F; // Mask to 7 bits

                if conn.is_blocked {
                    direction_byte |= 0x80; // Set bit 7 if blockable
                    data.push(direction_byte);
                    data.push(conn.target as u8);
                    data.push(blockable_ordinal); // Blockable ordinal

                    // Track initial blockable state (blocked or not)
                    blockable_states.push(conn.is_blocked);
                    blockable_ordinal += 1;
                } else {
                    data.push(direction_byte);
                    data.push(conn.target as u8);
                    // No ordinal byte for non-blockable connections
                }
            }

            // Terminator for this location
            data.push(0xFF);
        }

        // Second pass: Append blockable states bitmap (V3 only)
        if matches!(self.version, DaadVersion::V3) && !blockable_states.is_empty() {
            // Pack blockable states into bytes (8 states per byte)
            let mut state_bytes = vec![0u8; (blockable_states.len() + 7) / 8];

            for (i, &is_blocked) in blockable_states.iter().enumerate() {
                if is_blocked {
                    let byte_index = i / 8;
                    let bit_index = i % 8;
                    state_bytes[byte_index] |= 1 << bit_index;
                }
            }

            data.extend_from_slice(&state_bytes);
        }

        Ok(data)
    }

    /// Build all process tables (PRO 0-3)
    fn build_processes_all(&self, processes: &[Vec<ProcessEntry>; 4]) -> CompilerResult<Vec<u8>> {
        let mut data = Vec::new();

        // Build all 4 process tables
        for process_table in processes {
            // First pass: Build entry table (verb/noun/offset)
            let mut entry_table = Vec::new();
            let mut condact_chains = Vec::new();
            let mut condact_offsets = Vec::new();

            for process in process_table {
                // Store entry
                entry_table.push(process.verb as u8);
                entry_table.push(process.noun as u8);

                // Build condact chain for this entry
                let chain = self.build_condact_chain(&process.condacts)?;
                let offset = condact_chains.len() as u16;
                condact_offsets.push(offset);
                condact_chains.extend_from_slice(&chain);
            }

            // Now write entry table with correct offsets
            for (i, offset) in condact_offsets.iter().enumerate() {
                data.push(entry_table[i * 2]);     // Verb
                data.push(entry_table[i * 2 + 1]); // Noun

                // Calculate absolute offset (after entry table + terminator)
                let entry_table_size = entry_table.len() + 1; // +1 for terminator
                let absolute_offset = entry_table_size as u16 + *offset;
                self.write_word(&mut data, absolute_offset);
            }

            // Terminator for entry table
            data.push(0x00);

            // Append all condact chains
            data.extend_from_slice(&condact_chains);
        }

        Ok(data)
    }

    /// Build condact chain for a process entry
    fn build_condact_chain(&self, condacts: &[CondAct]) -> CompilerResult<Vec<u8>> {
        let mut chain = Vec::new();

        for condact in condacts {
            // Write opcode
            chain.push(condact.opcode);

            // Write parameters
            for &param in &condact.params {
                chain.push(param);
            }
        }

        // Terminator: 0xFF (end of chain)
        chain.push(0xFF);

        Ok(chain)
    }

    /// Write 16-bit word with platform-specific endianness
    fn write_word(&self, data: &mut Vec<u8>, value: u16) {
        match self.endianness {
            Endianness::Little => {
                data.push((value & 0xFF) as u8);
                data.push((value >> 8) as u8);
            }
            Endianness::Big => {
                data.push((value >> 8) as u8);
                data.push((value & 0xFF) as u8);
            }
        }
    }

    /// Check if platform needs word alignment
    fn needs_word_alignment(&self) -> bool {
        matches!(
            self.machine,
            MachineId::PC | MachineId::AtariST | MachineId::Amiga
        )
    }

    /// Add padding byte if needed for word alignment
    fn add_word_alignment(&self, data: &mut Vec<u8>) {
        if data.len() % 2 != 0 {
            data.push(0x00);
        }
    }
}

/// Platform-specific header generators
pub mod headers {
    use super::*;

    /// C64 PRG header (2-byte load address)
    pub fn c64_prg_header(base_address: u16) -> Vec<u8> {
        vec![
            (base_address & 0xFF) as u8,
            (base_address >> 8) as u8,
        ]
    }

    /// Spectrum +3 PLUS3DOS header (128 bytes)
    pub fn spectrum_plus3_header(data_size: usize, load_address: u16) -> Vec<u8> {
        let mut header = vec![0u8; 128];

        // Signature: "PLUS3DOS"
        header[0..8].copy_from_slice(b"PLUS3DOS");

        // Soft EOF marker
        header[8] = 0x1A;

        // Issue number
        header[9] = 0x01;

        // Version
        header[10] = 0x00;

        // Total file size (header + data), little-endian
        let total_size = 128 + data_size;
        header[11] = (total_size & 0xFF) as u8;
        header[12] = ((total_size >> 8) & 0xFF) as u8;
        header[13] = ((total_size >> 16) & 0xFF) as u8;
        header[14] = ((total_size >> 24) & 0xFF) as u8;

        // File type (0x03 = code block)
        header[15] = 0x03;

        // Data size (excluding header), little-endian
        header[16] = (data_size & 0xFF) as u8;
        header[17] = ((data_size >> 8) & 0xFF) as u8;

        // Load address
        header[18] = (load_address & 0xFF) as u8;
        header[19] = (load_address >> 8) as u8;

        // Reserved/padding (bytes 20-126 already zeroed)

        // Checksum (sum of bytes 0-126, low byte only)
        let checksum: u8 = header[0..127].iter().map(|&b| b as u16).sum::<u16>() as u8;
        header[127] = checksum;

        header
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_c64_header() {
        let header = headers::c64_prg_header(0x3880);
        assert_eq!(header.len(), 2);
        assert_eq!(header[0], 0x80);
        assert_eq!(header[1], 0x38);
    }

    #[test]
    fn test_spectrum_plus3_header() {
        let header = headers::spectrum_plus3_header(1000, 0x8400);
        assert_eq!(header.len(), 128);
        assert_eq!(&header[0..8], b"PLUS3DOS");
        assert_eq!(header[8], 0x1A);
        assert_eq!(header[15], 0x03); // Code block
    }

    #[test]
    fn test_vocabulary_format() {
        let builder = DdbBuilder::new(Platform::ZXSpectrum48K);
        let vocab = vec![VocabEntry {
            word: "GET".to_string(),
            id: 10,
            word_type: "verb".to_string(),
        }];

        let data = builder.build_vocabulary(&vocab).unwrap();
        assert_eq!(data.len(), 8); // 7 bytes + terminator
        // Check XOR obfuscation
        assert_ne!(data[0], b'G');
        assert_eq!(data[0] ^ 0xFF, b'G');
    }
}
