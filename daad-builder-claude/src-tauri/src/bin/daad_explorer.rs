// daad_explorer.rs — DAAD V2 DDB file explorer / interactive player / BFS walkthrough builder
//
// Usage:
//   daad_explorer <game.ddb> --dump            print vocab, locations, objects
//   daad_explorer <game.ddb> --play            interactive text play (reads from stdin)
//   daad_explorer <game.ddb> --bfs [--end-flag N]  BFS walkthrough builder
//
// No external dependencies — uses only std.
//
// Interpreter rewritten to match PCDAAD Pascal reference exactly.

use std::collections::{HashMap, HashSet, VecDeque};
use std::io::{self, BufRead, Write as IoWrite};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NO_WORD: u8 = 0xFF;
const NO_OBJECT: u8 = 0xFF; // MAX_OBJECT in Pascal
const END_OF_PROCESS: u8 = 0x00;
const END_OF_CONDACTS: u8 = 0xFF;
const END_OF_CONNECTIONS: u8 = 0xFF;

const LOC_NOT_CREATED: u8 = 252;
const LOC_WORN: u8 = 253;
const LOC_CARRIED: u8 = 254;
const LOC_HERE: u8 = 255;
const MAX_LOCATION: u8 = 255; // "any location" sentinel for object search

const FDARK: usize = 0;
const FCARRIED: usize = 1;
const FTURNS_LO: usize = 31;
const FTURNS_HI: usize = 32;
const FVERB: usize = 33;
const FNOUN: usize = 34;
const FADJECT: usize = 35;
const FADVERB: usize = 36;
const FOBJECTS_CONVEYABLE: usize = 37;
const FPLAYER: usize = 38;
const FINPUT: usize = 41;
const FPROMPT: usize = 42;
const FPREP: usize = 43;
const FNOUN2: usize = 44;
const FADJECT2: usize = 45;
const FTIMEOUT: usize = 48;
const FTIMEOUT_CONTROL: usize = 49;
const FDOALL: usize = 50;
const FREFOBJ: usize = 51;
const FPLAYER_STRENGTH: usize = 52;
const FOBJECT_PRINT_FLAGS: usize = 53;
const FREFOBJLOC: usize = 54;
const FREFOBJWEIGHT: usize = 55;
const FREFOBJCONTAINER: usize = 56;
const FREFOBJWEARABLE: usize = 57;
const FREFOBJATTR1: usize = 58;
const FREFOBJATTR2: usize = 59;
const FKEY1: usize = 60;
const FKEY2: usize = 61;
const FSCREENMODE: usize = 62;
const FACTIVEWINDOW: usize = 63;

const MAX_FLAGS: usize = 256;
const MAX_OBJECTS: usize = 256;
const MAX_CONDACT_STEPS: usize = 500_000;
const MAX_BFS_DEPTH: usize = 200;
const MAX_STACK_DEPTH: usize = 500;

// Vocab word types
const WTYPE_VERB: u8 = 0;
const WTYPE_NOUN: u8 = 2;

// ---------------------------------------------------------------------------
// DDB File
// ---------------------------------------------------------------------------

struct Ddb {
    data: Vec<u8>,
    version: u8,
    num_obj: usize,
    num_loc: usize,
    num_msg: usize,
    num_sys: usize,
    num_pro: usize,
    token_pos: usize,
    process_pos: usize,
    object_pos: usize,
    location_pos: usize,
    message_pos: usize,
    sysmess_pos: usize,
    connection_pos: usize,
    vocab_pos: usize,
    obj_init_pos: usize,
    obj_name_pos: usize,
    obj_weight_pos: usize,
    obj_attr_pos: usize,
}

impl Ddb {
    fn load(path: &str) -> Result<Ddb, String> {
        let data = std::fs::read(path).map_err(|e| format!("Cannot read {}: {}", path, e))?;
        if data.len() < 34 {
            return Err(format!("File too short: {} bytes", data.len()));
        }
        let version = data[0];
        if version != 2 {
            eprintln!("Warning: version byte is {}, expected 2", version);
        }
        fn w(data: &[u8], off: usize) -> usize {
            (data[off] as usize) | ((data[off + 1] as usize) << 8)
        }
        Ok(Ddb {
            version,
            num_obj: data[3] as usize,
            num_loc: data[4] as usize,
            num_msg: data[5] as usize,
            num_sys: data[6] as usize,
            num_pro: data[7] as usize,
            token_pos: w(&data, 8),
            process_pos: w(&data, 10),
            object_pos: w(&data, 12),
            location_pos: w(&data, 14),
            message_pos: w(&data, 16),
            sysmess_pos: w(&data, 18),
            connection_pos: w(&data, 20),
            vocab_pos: w(&data, 22),
            obj_init_pos: w(&data, 24),
            obj_name_pos: w(&data, 26),
            obj_weight_pos: w(&data, 28),
            obj_attr_pos: w(&data, 30),
            data,
        })
    }

    fn byte(&self, pos: usize) -> u8 {
        if pos < self.data.len() { self.data[pos] } else { 0 }
    }

    fn word(&self, pos: usize) -> usize {
        (self.byte(pos) as usize) | ((self.byte(pos + 1) as usize) << 8)
    }

    // -- Token table --

    fn decode_token(&self, idx: usize) -> String {
        let mut pos = self.token_pos + 1;
        let mut cur = 0usize;
        while cur < idx {
            if pos >= self.data.len() {
                return format!("<tok{}>", idx);
            }
            let b = self.byte(pos);
            pos += 1;
            if b > 127 {
                cur += 1;
            }
        }
        let mut s = String::new();
        loop {
            if pos >= self.data.len() {
                break;
            }
            let b = self.byte(pos);
            pos += 1;
            if b > 127 {
                let ch = (b & 0x7F) as char;
                s.push(if ch == '_' { ' ' } else { ch });
                break;
            } else {
                let ch = b as char;
                s.push(if ch == '_' { ' ' } else { ch });
            }
        }
        s
    }

    // -- Text sections --

    fn read_text(&self, section_pos: usize, n: usize) -> String {
        let offset_ptr = section_pos + 2 * n;
        let text_pos = self.word(offset_ptr);
        if text_pos == 0 || text_pos >= self.data.len() {
            return String::new();
        }
        let mut s = String::new();
        let mut pos = text_pos;
        loop {
            if pos >= self.data.len() {
                break;
            }
            let raw = self.data[pos];
            pos += 1;
            let xored = raw ^ 0xFF;
            if xored == 0x0A {
                break;
            }
            if xored > 0x7F {
                let tok_idx = (xored as usize) - 128;
                let tok_str = self.decode_token(tok_idx);
                s.push_str(&tok_str);
            } else {
                s.push(xored as char);
            }
        }
        s
    }

    // -- Vocabulary --

    fn parse_vocab(&self) -> Vec<(String, u8, u8)> {
        let mut result = Vec::new();
        let mut pos = self.vocab_pos;
        loop {
            if pos >= self.data.len() {
                break;
            }
            if self.data[pos] == 0x00 {
                break;
            }
            let mut word = String::new();
            for i in 0..5 {
                let c = self.data[pos + i] ^ 0xFF;
                if c != b' ' && c != 0 {
                    word.push(c as char);
                }
            }
            let id = self.data[pos + 5];
            let wtype = self.data[pos + 6];
            result.push((word, id, wtype));
            pos += 7;
        }
        result
    }

    // -- Connections (pointer-table based, matching PCDAAD) --

    /// Get connection table pointer for a given location.
    /// connectionPos is a table of word pointers, one per location.
    fn connections_ptr(&self, loc: usize) -> usize {
        self.word(self.connection_pos + 2 * loc)
    }

    /// Scan connections for a location and return Vec<(direction, target)>.
    fn connections_for_loc(&self, loc: usize) -> Vec<(u8, u8)> {
        if loc >= self.num_loc {
            return vec![];
        }
        let mut ptr = self.connections_ptr(loc);
        let mut conns = Vec::new();
        loop {
            if ptr >= self.data.len() {
                break;
            }
            let dir = self.byte(ptr);
            if dir == END_OF_CONNECTIONS {
                break;
            }
            let target = self.byte(ptr + 1);
            conns.push((dir, target));
            ptr += 2;
        }
        conns
    }

    /// Look up a movement: given a location and direction verb, return target location or None.
    fn find_connection(&self, loc: u8, direction_verb: u8) -> Option<u8> {
        if (loc as usize) >= self.num_loc {
            return None;
        }
        let mut ptr = self.connections_ptr(loc as usize);
        loop {
            if ptr >= self.data.len() {
                return None;
            }
            let dir = self.byte(ptr);
            if dir == END_OF_CONNECTIONS {
                return None;
            }
            if dir == direction_verb {
                return Some(self.byte(ptr + 1));
            }
            ptr += 2;
        }
    }

    /// Get object full weight (weight of object itself; container contents not counted here)
    fn obj_weight(&self, obj: usize) -> u8 {
        if obj < self.num_obj {
            self.byte(self.obj_weight_pos + obj) & 0x3F
        } else {
            0
        }
    }

    fn obj_is_container(&self, obj: usize) -> bool {
        if obj < self.num_obj {
            (self.byte(self.obj_weight_pos + obj) & 0x40) != 0
        } else {
            false
        }
    }

    fn obj_is_wearable(&self, obj: usize) -> bool {
        if obj < self.num_obj {
            (self.byte(self.obj_weight_pos + obj) & 0x80) != 0
        } else {
            false
        }
    }

    fn obj_noun(&self, obj: usize) -> u8 {
        self.byte(self.obj_name_pos + 2 * obj)
    }

    fn obj_adj(&self, obj: usize) -> u8 {
        self.byte(self.obj_name_pos + 2 * obj + 1)
    }
}

// ---------------------------------------------------------------------------
// VM State
// ---------------------------------------------------------------------------

#[derive(Clone)]
struct VmState {
    flags: [u8; MAX_FLAGS],
    obj_locs: [u8; MAX_OBJECTS],
}

impl VmState {
    fn new() -> Self {
        VmState {
            flags: [0u8; MAX_FLAGS],
            obj_locs: [0u8; MAX_OBJECTS],
        }
    }

    fn bfs_key(&self) -> Vec<u8> {
        let mut key = Vec::with_capacity(MAX_FLAGS + MAX_OBJECTS);
        for (i, &f) in self.flags.iter().enumerate() {
            match i {
                29 | 31 | 32 | 33 | 34 | 35 | 36 | 44 | 51 | 56 | 57 | 58 | 59
                | 60 | 61 | 62 | 63 => key.push(0),
                _ => key.push(f),
            }
        }
        key.extend_from_slice(&self.obj_locs);
        key
    }
}

// ---------------------------------------------------------------------------
// Stack Frame — matches PCDAAD stack.pas exactly
// ---------------------------------------------------------------------------

#[derive(Clone)]
struct StackFrame {
    process_ptr: usize,
    entry_ptr: usize,
    condact_ptr: usize,
    doall_ptr: usize,       // 0 = no doall active
    doall_entry_ptr: usize,
    doall_flag: u8,         // flag[50] value
    doall_location: u8,
}

// ---------------------------------------------------------------------------
// Interpreter
// ---------------------------------------------------------------------------

/// Control flow signals from condact execution
enum CondactSignal {
    Continue,       // Normal: check condactResult and proceed
    EndGame,        // END/EXIT(0) condact fired
}

struct Vm<'a> {
    ddb: &'a Ddb,
    state: VmState,
    // Execution pointers (match PCDAAD globals)
    process_ptr: usize,
    entry_ptr: usize,
    condact_ptr: usize,
    // DOALL state
    doall_ptr: usize,        // 0 if not active; else points to condact after DOALL
    doall_entry_ptr: usize,
    doall_location: u8,
    // Stack
    stack: Vec<StackFrame>,
    // Condact state
    condact_result: bool,
    done: bool,
    // Output collected during execution
    output: String,
    // Safety counter
    steps: usize,
    // Game-level signals
    end_game: bool,
    restart: bool,  // Set by RESTART/EXIT(!=0) — BFS/audit check this after run_process
    // RAMSAVE/RAMLOAD
    ram_flags: [u8; MAX_FLAGS],
    ram_obj_locs: [u8; MAX_OBJECTS],
    // SAVEAT/BACKAT (from PCDAAD - saves EntryPTR)
    saved_entry_ptr: usize,
    // Play mode: input buffer for PARSE
    input_lines: Vec<String>,
    input_line_idx: usize,
    // Verbose mode for debugging
    verbose: bool,
}

impl<'a> Vm<'a> {
    fn new(ddb: &'a Ddb, state: VmState) -> Self {
        Vm {
            ddb,
            state,
            process_ptr: 0,
            entry_ptr: 0,
            condact_ptr: 0,
            doall_ptr: 0,
            doall_entry_ptr: 0,
            doall_location: 0,
            stack: Vec::new(),
            condact_result: true,
            done: false,
            output: String::new(),
            steps: 0,
            end_game: false,
            restart: false,
            ram_flags: [0u8; MAX_FLAGS],
            ram_obj_locs: [0u8; MAX_OBJECTS],
            saved_entry_ptr: 0,
            input_lines: Vec::new(),
            input_line_idx: 0,
            verbose: false,
        }
    }

    fn byte(&self, pos: usize) -> u8 {
        self.ddb.byte(pos)
    }

    fn word(&self, pos: usize) -> usize {
        self.ddb.word(pos)
    }

    fn get_flag(&self, f: usize) -> u8 {
        if f < MAX_FLAGS { self.state.flags[f] } else { 0 }
    }

    fn set_flag(&mut self, f: usize, v: u8) {
        if f < MAX_FLAGS { self.state.flags[f] = v; }
    }

    fn obj_loc(&self, obj: usize) -> u8 {
        if obj < self.ddb.num_obj { self.state.obj_locs[obj] } else { LOC_NOT_CREATED }
    }

    fn set_obj_loc(&mut self, obj: usize, loc: u8) {
        if obj < self.ddb.num_obj { self.state.obj_locs[obj] = loc; }
    }

    fn player_loc(&self) -> u8 {
        self.get_flag(FPLAYER)
    }

    // -- Object helpers --

    fn obj_present(&self, obj: usize) -> bool {
        let loc = self.obj_loc(obj);
        loc == self.player_loc() || loc == LOC_CARRIED || loc == LOC_WORN
    }

    fn carried_count(&self) -> u8 {
        self.state.obj_locs[..self.ddb.num_obj]
            .iter()
            .filter(|&&l| l == LOC_CARRIED)
            .count() as u8
    }

    /// Update FCARRIED to actual count (recalculate)
    fn update_carried_count(&mut self) {
        let c = self.carried_count();
        self.set_flag(FCARRIED, c);
    }

    /// SetReferencedObject — matches PCDAAD objects.pas exactly
    fn set_referenced_object(&mut self, objno: u8) {
        self.set_flag(FREFOBJ, objno);
        if objno != NO_OBJECT {
            let obj = objno as usize;
            self.set_flag(FREFOBJLOC, self.obj_loc(obj));
            self.set_flag(FREFOBJWEIGHT, self.ddb.obj_weight(obj));
            if self.ddb.obj_is_container(obj) {
                self.set_flag(FREFOBJCONTAINER, 128);
            } else {
                self.set_flag(FREFOBJCONTAINER, 0);
            }
            if self.ddb.obj_is_wearable(obj) {
                self.set_flag(FREFOBJWEARABLE, 128);
            } else {
                self.set_flag(FREFOBJWEARABLE, 0);
            }
            self.set_flag(FREFOBJATTR2, self.ddb.byte(self.ddb.obj_attr_pos + obj * 2));
            self.set_flag(FREFOBJATTR1, self.ddb.byte(self.ddb.obj_attr_pos + obj * 2 + 1));
            self.set_flag(FNOUN, self.ddb.obj_noun(obj));
            self.set_flag(FADJECT, self.ddb.obj_adj(obj));
        }
    }

    /// getObjectByVocabularyAtLocation — matches PCDAAD objects.pas
    fn get_object_by_vocab_at(&self, noun: u8, adjective: u8, location: u8) -> u8 {
        for i in 0..self.ddb.num_obj {
            if location != MAX_LOCATION && self.obj_loc(i) != location {
                continue;
            }
            let obj_noun = self.ddb.obj_noun(i);
            let obj_adj = self.ddb.obj_adj(i);
            if obj_noun != NO_WORD && obj_noun == noun {
                if obj_adj == NO_WORD || obj_adj == adjective {
                    return i as u8;
                }
            }
        }
        // Partial match: noun matches but adjective is NO_WORD from player
        if adjective == NO_WORD {
            for i in 0..self.ddb.num_obj {
                if location != MAX_LOCATION && self.obj_loc(i) != location {
                    continue;
                }
                let obj_noun = self.ddb.obj_noun(i);
                if obj_noun != NO_WORD && obj_noun == noun {
                    return i as u8;
                }
            }
        }
        NO_OBJECT
    }

    /// getNextObjectAt — matches PCDAAD objects.pas
    /// Returns next object at locno starting after objno. Returns NO_OBJECT if none.
    fn get_next_object_at(&self, after_obj: i16, locno: u8) -> u8 {
        let loc = if locno == MAX_LOCATION { self.player_loc() } else { locno };
        if after_obj as u8 == NO_OBJECT {
            return NO_OBJECT;
        }
        let mut obj = (after_obj + 1) as usize;
        while obj < self.ddb.num_obj {
            if self.obj_loc(obj) == loc {
                return obj as u8;
            }
            obj += 1;
        }
        NO_OBJECT
    }

    /// WHATO — matches PCDAAD condacts.pas exactly
    fn whato(&mut self) {
        let noun = self.get_flag(FNOUN);
        let adj = self.get_flag(FADJECT);

        let mut objno = self.get_object_by_vocab_at(noun, adj, LOC_CARRIED);
        if objno != NO_OBJECT {
            self.set_referenced_object(objno);
            return;
        }
        objno = self.get_object_by_vocab_at(noun, adj, LOC_WORN);
        if objno != NO_OBJECT {
            self.set_referenced_object(objno);
            return;
        }
        objno = self.get_object_by_vocab_at(noun, adj, self.player_loc());
        if objno != NO_OBJECT {
            self.set_referenced_object(objno);
            return;
        }
        objno = self.get_object_by_vocab_at(noun, adj, MAX_LOCATION);
        if objno != NO_OBJECT {
            self.set_referenced_object(objno);
            return;
        }
        self.set_referenced_object(NO_OBJECT);
    }

    /// Weight of all objects at a given location
    fn weight_at(&self, loc: u8) -> u16 {
        let mut w: u16 = 0;
        for i in 0..self.ddb.num_obj {
            if self.obj_loc(i) == loc {
                w = w.saturating_add(self.ddb.obj_weight(i) as u16);
            }
        }
        w
    }

    // -- Text helpers --

    fn append_message(&mut self, n: usize) {
        if n < self.ddb.num_msg {
            let t = self.ddb.read_text(self.ddb.message_pos, n);
            self.output.push_str(&t);
        }
    }

    fn append_sysmess(&mut self, n: usize) {
        if n < self.ddb.num_sys {
            let t = self.ddb.read_text(self.ddb.sysmess_pos, n);
            self.output.push_str(&t);
        }
    }

    fn append_location_desc(&mut self, loc: usize) {
        if loc < self.ddb.num_loc {
            let t = self.ddb.read_text(self.ddb.location_pos, loc);
            self.output.push_str(&t);
        }
    }

    fn append_newline(&mut self) {
        self.output.push('\n');
    }

    fn append_object_name(&mut self, obj: usize) {
        // In a full interpreter this would use the OTX table;
        // for the explorer, output the vocab noun word
        if obj < self.ddb.num_obj {
            let noun_id = self.ddb.obj_noun(obj);
            if let Some(w) = vocab_word_for_id(self.ddb, noun_id, WTYPE_NOUN) {
                self.output.push_str(&w);
            } else {
                self.output.push_str(&format!("obj{}", obj));
            }
        }
    }

    /// LISTOBJ / LISTAT helper — matches PCDAAD condacts.pas listObjects
    fn list_objects(&mut self, locno: u8, is_listat: bool) {
        let mut count = 0u8;
        for i in 0..self.ddb.num_obj {
            if self.obj_loc(i) == locno {
                count += 1;
            }
        }
        let continuous = (self.get_flag(FOBJECT_PRINT_FLAGS) & 64) != 0;

        if count > 0 {
            self.set_flag(FOBJECT_PRINT_FLAGS, self.get_flag(FOBJECT_PRINT_FLAGS) | 0x80);
            if !is_listat {
                self.append_sysmess(1); // "I can also see:"
                if !continuous {
                    self.append_newline();
                }
            }
            let mut listed = 0u8;
            for i in 0..self.ddb.num_obj {
                if self.obj_loc(i) == locno {
                    self.append_object_name(i);
                    listed += 1;
                    if continuous {
                        if listed == count {
                            self.append_sysmess(48); // ".\n"
                        } else if listed == count - 1 {
                            self.append_sysmess(47); // " and "
                        } else {
                            self.append_sysmess(46); // ", "
                        }
                    } else {
                        self.append_newline();
                    }
                }
            }
        } else {
            self.set_flag(FOBJECT_PRINT_FLAGS, self.get_flag(FOBJECT_PRINT_FLAGS) & 0x7F);
            if is_listat {
                self.append_sysmess(53); // "Nothing"
            }
        }
    }

    // -- ConsumeProcess: advance entry_ptr to END_OF_PROCESS mark, then back 4 --

    fn consume_process(&mut self) {
        let mut p = self.entry_ptr;
        let limit = self.ddb.data.len();
        loop {
            if p >= limit {
                break;
            }
            if self.ddb.byte(p) == END_OF_PROCESS {
                self.entry_ptr = p.wrapping_sub(4);
                return;
            }
            p += 4;
        }
        self.entry_ptr = p.wrapping_sub(4);
    }

    // -- num_params: matches PCDAAD condactTable exactly --
    // CRITICAL: wrong param counts cause DDB byte stream desync

    fn num_params(opcode: u8) -> usize {
        match opcode {
            // 0 params — from Pascal condactTable
            20 | 21 | 22 | 23 | 24 | 29 | 30 | 31 | 32 | 33 | 34 | 52 | 57 | 60 |
            62 | 92 | 97 | 98 | 100 | 103 | 108 | 109 | 111 | 114 | 115 | 117 |
            120 | 122 | 124 | 127 => 0,
            // 2 params — from Pascal condactTable
            13 | 14 | 15 | 18 | 36 | 45 | 46 | 49 | 50 | 51 | 55 | 61 | 64 |
            71 | 72 | 76 | 79 | 80 | 82 | 83 | 86 | 87 | 88 | 89 | 90 | 91 |
            93 | 96 | 99 | 107 | 112 | 113 | 119 | 121 | 123 | 125 | 126 => 2,
            // 1 param: everything else (0-12, 16-17, 19, 25-28, 35, 37-44, 47-48,
            //   53-54, 56, 63, 65-70, 73-75, 77-78, 81, 84-85, 94-95, 101-102,
            //   104-106, 110, 116, 118)
            _ => 1,
        }
    }

    // -- PARSE condact (for play mode) --
    // Matches PCDAAD parser.pas logic:
    // 1. Print prompt, read a line from stdin
    // 2. Look up words in vocabulary
    // 3. Handle convertible nouns (direction words: noun id <= 39 → copy to FVERB)
    // 4. condactResult = !(FVERB != NO_WORD || FNOUN != NO_WORD)  (inverted!)
    // 5. done = false

    fn do_parse(&mut self) -> bool {
        // Flush any pending output before reading input
        {
            let out_text = self.output.clone();
            if !out_text.is_empty() {
                let mut out = io::stdout().lock();
                let _ = out.write_all(out_text.as_bytes());
                let _ = out.flush();
                self.output.clear();
            }
        }

        // Read a line of input
        let line = if self.input_line_idx < self.input_lines.len() {
            let l = self.input_lines[self.input_line_idx].clone();
            self.input_line_idx += 1;
            eprintln!("> {}", l);
            l
        } else {
            // Read from stdin
            {
                let mut out = io::stdout().lock();
                let _ = out.write_all(b"\n> ");
                let _ = out.flush();
            }
            let mut line = String::new();
            if io::stdin().lock().read_line(&mut line).unwrap_or(0) == 0 {
                self.end_game = true;
                return false;
            }
            line.trim().to_string()
        };

        if line.is_empty() {
            return false;
        }

        // Split into words and look up each in vocabulary
        let parts: Vec<&str> = line.split_whitespace().collect();

        let mut verb_id: u8 = NO_WORD;
        let mut noun_id: u8 = NO_WORD;
        let mut adjective_id: u8 = NO_WORD;
        let mut adverb_id: u8 = NO_WORD;
        let mut noun2_id: u8 = NO_WORD;
        let mut adjective2_id: u8 = NO_WORD;
        let mut prep_id: u8 = NO_WORD;
        let mut noun_count = 0u8;

        for word_str in &parts {
            let upper = word_str.to_uppercase();
            // Try each vocab type
            if let Some(vid) = lookup_word(self.ddb, &upper, WTYPE_VERB) {
                if verb_id == NO_WORD {
                    verb_id = vid;
                }
                continue;
            }
            if let Some(nid) = lookup_word(self.ddb, &upper, WTYPE_NOUN) {
                if noun_count == 0 {
                    noun_id = nid;
                    noun_count = 1;
                } else if noun_count == 1 {
                    noun2_id = nid;
                    noun_count = 2;
                }
                continue;
            }
            // Try adjective (type 3)
            if let Some(aid) = lookup_word_any_type(self.ddb, &upper, 3) {
                if adjective_id == NO_WORD {
                    adjective_id = aid;
                } else if adjective2_id == NO_WORD {
                    adjective2_id = aid;
                }
                continue;
            }
            // Try adverb (type 4)
            if let Some(avid) = lookup_word_any_type(self.ddb, &upper, 4) {
                if adverb_id == NO_WORD {
                    adverb_id = avid;
                }
                continue;
            }
            // Try preposition (type 5)
            if let Some(pid) = lookup_word_any_type(self.ddb, &upper, 5) {
                if prep_id == NO_WORD {
                    prep_id = pid;
                }
                continue;
            }
        }

        // Handle convertible nouns: if FVERB is NO_WORD and FNOUN <= 39 (direction word),
        // copy FNOUN to FVERB
        if verb_id == NO_WORD && noun_id != NO_WORD && noun_id <= 39 {
            verb_id = noun_id;
            noun_id = NO_WORD;
        }

        self.set_flag(FVERB, verb_id);
        self.set_flag(FNOUN, noun_id);
        self.set_flag(FADJECT, adjective_id);
        self.set_flag(FADVERB, adverb_id);
        self.set_flag(FPREP, prep_id);
        self.set_flag(FNOUN2, noun2_id);
        self.set_flag(FADJECT2, adjective2_id);

        // Return true if any verb or noun was found
        verb_id != NO_WORD || noun_id != NO_WORD
    }

    // -- Main execution loop — matches PCDAAD run() procedure exactly --

    fn run_process(&mut self, pro_id: usize, bfs_mode: bool) -> String {
        if pro_id >= self.ddb.num_pro {
            return String::new();
        }
        self.output.clear();
        self.stack.clear();
        self.done = false;
        self.end_game = false;
        self.restart = false;
        self.steps = 0;
        self.doall_ptr = 0;
        self.doall_entry_ptr = 0;

        // Set up process pointers
        self.process_ptr = self.ddb.process_pos + 2 * pro_id;
        self.entry_ptr = self.word(self.process_ptr);

        self.run_inner(bfs_mode);
        self.output.clone()
    }

    /// Run the full DAAD game from process 0 (for play mode).
    /// Matches PCDAAD main: just calls run() which never returns (loops via REDO/RESTART).
    fn run_game(&mut self) {
        if self.ddb.num_pro == 0 {
            return;
        }
        self.output.clear();
        self.stack.clear();
        self.done = false;
        self.end_game = false;
        self.restart = false;
        self.steps = 0;
        self.doall_ptr = 0;

        // Start at process 0 — first entry
        self.process_ptr = self.ddb.process_pos;
        self.entry_ptr = self.word(self.process_ptr);

        // Single run_inner call — it loops forever via REDO/RESTART until halt or EndGame
        self.run_inner(false);
    }

    /// Main execution loop — matches PCDAAD run() procedure exactly.
    /// Uses goto-style labels RunEntry and RunCondact modeled as a state machine.
    /// `done` does NOT control the loop — only EndGame or stack underflow exit.
    fn run_inner(&mut self, bfs_mode: bool) {
        let step_cap = if bfs_mode { 5000 } else { MAX_CONDACT_STEPS };

        enum Phase { RunEntry, RunCondact }
        let mut phase = Phase::RunEntry;

        loop {
            self.steps += 1;
            if self.steps > step_cap || self.end_game {
                break;
            }

            match phase {
                Phase::RunEntry => {
                    // Check if current process has finished (END_OF_PROCESS mark)
                    if self.byte(self.entry_ptr) == END_OF_PROCESS {
                        // If DOALL loop in execution
                        if self.doall_ptr != 0 {
                            // Try to get next object at the doall location
                            let mut found_doall = false;
                            loop {
                                let next_obj = self.get_next_object_at(
                                    self.get_flag(FREFOBJ) as i16,
                                    self.doall_location,
                                );
                                if next_obj != NO_OBJECT {
                                    self.set_referenced_object(next_obj);
                                    self.set_flag(FDOALL, next_obj);

                                    // EXCEPT check: skip if OBJ1 matches OBJ2
                                    let noun_match = self.get_flag(FNOUN) == self.get_flag(FNOUN2);
                                    let adj1 = self.get_flag(FADJECT);
                                    let adj2 = self.get_flag(FADJECT2);
                                    let adj_match = adj1 == adj2 || adj1 == NO_WORD || adj2 == NO_WORD;
                                    if noun_match && adj_match {
                                        continue; // Skip this object (EXCEPT)
                                    }

                                    // Found valid object — loop back to doall condact
                                    self.entry_ptr = self.doall_entry_ptr;
                                    self.condact_ptr = self.doall_ptr;
                                    found_doall = true;
                                    break;
                                } else {
                                    // No more objects — mark doall inactive
                                    self.doall_ptr = 0;
                                    break;
                                }
                            }
                            if found_doall {
                                phase = Phase::RunCondact;
                                continue;
                            }
                            // Fall through: doall finished, do stack pop
                        }

                        // Process finishes normally — StackPop
                        if let Some(frame) = self.stack.pop() {
                            self.process_ptr = frame.process_ptr;
                            self.entry_ptr = frame.entry_ptr;
                            self.condact_ptr = frame.condact_ptr;
                            self.doall_ptr = frame.doall_ptr;
                            self.doall_entry_ptr = frame.doall_entry_ptr;
                            self.doall_location = frame.doall_location;
                            self.set_flag(FDOALL, frame.doall_flag);
                            // CondactPTR += 1 (advance past the PROCESS condact that called us)
                            self.condact_ptr += 1;
                            phase = Phase::RunCondact;
                            continue;
                        } else {
                            // Stack empty: game over (halt(0) in Pascal)
                            break;
                        }
                    }

                    // Read verb/noun from entry, check match
                    let entry_verb = self.byte(self.entry_ptr);
                    let entry_noun = self.byte(self.entry_ptr + 1);
                    let valid = (entry_verb == self.get_flag(FVERB) || entry_verb == NO_WORD)
                        && (entry_noun == self.get_flag(FNOUN) || entry_noun == NO_WORD);

                    self.condact_ptr = self.word(self.entry_ptr + 2);

                    if !valid {
                        self.entry_ptr += 4;
                        // goto RunEntry
                        continue;
                    }

                    if self.verbose {
                        eprintln!("[VM] MATCH entry@{:04X} ev={} en={} fv={} fn={}",
                            self.entry_ptr, entry_verb, entry_noun,
                            self.get_flag(FVERB), self.get_flag(FNOUN));
                    }

                    // Valid entry matched — fall through to RunCondact
                    phase = Phase::RunCondact;
                    continue;
                }

                Phase::RunCondact => {
                    // Reset condactResult BEFORE each condact (per Pascal: line 109)
                    self.condact_result = true;
                    let opcode_raw = self.byte(self.condact_ptr);

                    // Check end of condacts mark
                    if opcode_raw == END_OF_CONDACTS {
                        self.entry_ptr += 4;
                        phase = Phase::RunEntry;
                        continue;
                    }

                    // Decode indirection and opcode
                    let indirection = (opcode_raw & 0x80) != 0;
                    let opcode = opcode_raw & 0x7F;

                    // Get parameters (matching Pascal param-reading exactly)
                    let nparams = Self::num_params(opcode);
                    let mut p1: u8 = 0;
                    let mut p2: u8 = 0;

                    if nparams > 0 {
                        self.condact_ptr += 1;
                        p1 = self.byte(self.condact_ptr);
                        if indirection {
                            p1 = self.get_flag(p1 as usize);
                        }
                        if nparams > 1 {
                            self.condact_ptr += 1;
                            p2 = self.byte(self.condact_ptr);
                        }
                    }

                    if self.verbose {
                        eprintln!("[VM] {:04X} op={} p1={} p2={} ind={}",
                            self.condact_ptr, opcode, p1, p2, indirection);
                    }

                    // Execute condact (condactResult already set to true above)
                    self.condact_result = true;
                    let signal = self.exec_condact(opcode, p1, p2, bfs_mode);

                    match signal {
                        CondactSignal::EndGame => {
                            self.end_game = true;
                            break;
                        }
                        CondactSignal::Continue => {
                            // Normal flow
                        }
                    }

                    // If condact execution failed, go to next entry
                    if !self.condact_result {
                        self.entry_ptr += 4;
                        phase = Phase::RunEntry;
                        continue;
                    }

                    // Otherwise go to next condact
                    self.condact_ptr += 1;
                    // stay in Phase::RunCondact
                    continue;
                }
            }
        }
    }

    // -- Execute a single condact --

    fn exec_condact(&mut self, opcode: u8, p1: u8, p2: u8, bfs_mode: bool) -> CondactSignal {
        let p1u = p1 as usize;
        let p2u = p2 as usize;

        match opcode {
            // -- Conditions (don't set done) --

            0 => { // AT
                self.condact_result = self.get_flag(FPLAYER) == p1;
            }
            1 => { // NOTAT
                self.condact_result = self.get_flag(FPLAYER) != p1;
            }
            2 => { // ATGT
                self.condact_result = self.get_flag(FPLAYER) > p1;
            }
            3 => { // ATLT
                self.condact_result = self.get_flag(FPLAYER) < p1;
            }
            4 => { // PRESENT
                self.condact_result = self.obj_present(p1u);
            }
            5 => { // ABSENT
                self.condact_result = !self.obj_present(p1u);
            }
            6 => { // WORN
                self.condact_result = self.obj_loc(p1u) == LOC_WORN;
            }
            7 => { // NOTWORN
                self.condact_result = self.obj_loc(p1u) != LOC_WORN;
            }
            8 => { // CARRIED
                self.condact_result = self.obj_loc(p1u) == LOC_CARRIED;
            }
            9 => { // NOTCARR
                self.condact_result = self.obj_loc(p1u) != LOC_CARRIED;
            }
            10 => { // CHANCE
                if bfs_mode {
                    self.condact_result = true;
                } else if p1 > 100 {
                    self.condact_result = false;
                } else {
                    self.condact_result = (rand_u8() % 101) <= p1;
                }
            }
            11 => { // ZERO
                self.condact_result = self.get_flag(p1u) == 0;
            }
            12 => { // NOTZERO
                self.condact_result = self.get_flag(p1u) != 0;
            }
            13 => { // EQ flag[p1] == p2
                self.condact_result = self.get_flag(p1u) == p2;
            }
            14 => { // GT flag[p1] > p2
                self.condact_result = self.get_flag(p1u) > p2;
            }
            15 => { // LT flag[p1] < p2
                self.condact_result = self.get_flag(p1u) < p2;
            }
            16 => { // ADJECT1 flag[35]==p1
                self.condact_result = self.get_flag(FADJECT) == p1;
            }
            17 => { // ADVERB flag[36]==p1
                self.condact_result = self.get_flag(FADVERB) == p1;
            }
            55 => { // ISAT obj_loc[p1]==p2 (resolve LOC_HERE)
                let loc2 = if p2 == LOC_HERE { self.player_loc() } else { p2 };
                self.condact_result = self.obj_loc(p1u) == loc2;
            }
            68 => { // PREP flag[43]==p1
                self.condact_result = self.get_flag(FPREP) == p1;
            }
            69 => { // NOUN2 flag[44]==p1
                self.condact_result = self.get_flag(FNOUN2) == p1;
            }
            70 => { // ADJECT2 flag[45]==p1
                self.condact_result = self.get_flag(FADJECT2) == p1;
            }
            76 => { // SAME flag[p1]==flag[p2]
                self.condact_result = self.get_flag(p1u) == self.get_flag(p2u);
            }
            79 => { // NOTEQ flag[p1]!=p2
                self.condact_result = self.get_flag(p1u) != p2;
            }
            80 => { // NOTSAME flag[p1]!=flag[p2]
                self.condact_result = self.get_flag(p1u) != self.get_flag(p2u);
            }
            88 => { // ISNOTAT obj_loc[p1]!=p2 (resolve LOC_HERE)
                let loc2 = if p2 == LOC_HERE { self.player_loc() } else { p2 };
                self.condact_result = self.obj_loc(p1u) != loc2;
            }
            112 => { // BIGGER flag[p1] > flag[p2] (unsigned per Pascal)
                self.condact_result = self.get_flag(p1u) > self.get_flag(p2u);
            }
            113 => { // SMALLER flag[p1] < flag[p2] (unsigned per Pascal)
                self.condact_result = self.get_flag(p1u) < self.get_flag(p2u);
            }
            114 => { // ISDONE
                self.condact_result = self.done;
            }
            115 => { // ISNDONE
                self.condact_result = !self.done;
            }
            58 => { // HASAT — read from flags 56-59 (per Pascal: getFlagBit(59 - p1/8, p1%8))
                let flag_idx = 59 - (p1u / 8);
                let bit_no = p1u % 8;
                self.condact_result = (self.get_flag(flag_idx) & (1 << bit_no)) != 0;
            }
            59 => { // HASNAT
                let flag_idx = 59 - (p1u / 8);
                let bit_no = p1u % 8;
                self.condact_result = (self.get_flag(flag_idx) & (1 << bit_no)) == 0;
            }

            // -- Actions (most set done=true) --

            18 => { // SFX — no-op for explorer but must handle extra bytes
                // PCDAAD _SFX: sub-commands 3 and 4 read an extra byte from DDB
                if p2 == 3 || p2 == 4 {
                    self.condact_ptr += 1; // Skip extra byte (sample rate)
                }
                self.done = true;
            }
            19 => { // DESC (1 param, resolve LOC_HERE)
                let loc = if p1 == LOC_HERE { self.player_loc() } else { p1 };
                self.append_location_desc(loc as usize);
                self.done = true;
            }
            20 => { // QUIT — matches PCDAAD (simplified: always confirm)
                // In PCDAAD: ask "Are you sure?", wait for input
                // For explorer: print sysmess 12 and succeed
                if !bfs_mode {
                    self.append_sysmess(12); // "Are you sure?"
                }
                self.done = true;
            }
            21 => { // END — exit(parameter) via _EXIT
                // In PCDAAD, END asks "Play again?" then calls _EXIT.
                // For explorer: signal end game.
                return CondactSignal::EndGame;
            }
            22 => { // DONE
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            23 => { // OK = sysmess(15) + DONE
                self.append_sysmess(15);
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            24 => { // ANYKEY — matches PCDAAD (simplified: print sysmess 16, skip wait)
                if !bfs_mode {
                    self.append_sysmess(16); // "Press any key to continue"
                }
                self.done = true;
            }
            25 => { // SAVE — no-op
                self.done = true;
            }
            26 => { // LOAD — no-op
                self.done = true;
            }
            27 => { // DPRINT — print 16-bit value from flag[p1]+256*flag[p1+1]
                let val = self.get_flag(p1u) as u16 + 256 * self.get_flag(p1u + 1) as u16;
                self.output.push_str(&val.to_string());
                self.done = true;
            }
            28 => { // DISPLAY — no-op (graphics)
                self.done = true;
            }
            29 => { // CLS — no-op for explorer
                self.done = true;
            }
            30 => { // DROPALL
                let here = self.player_loc();
                // Pascal iterates LOC_WORN then LOC_CARRIED
                for loc_check in &[LOC_WORN, LOC_CARRIED] {
                    let mut obj: i16 = -1;
                    loop {
                        let next = self.get_next_object_at(obj, *loc_check);
                        if next == NO_OBJECT { break; }
                        // PLACE obj at here
                        let old_loc = self.obj_loc(next as usize);
                        if old_loc == LOC_CARRIED {
                            let c = self.get_flag(FCARRIED);
                            if c > 0 { self.set_flag(FCARRIED, c - 1); }
                        }
                        self.set_obj_loc(next as usize, here);
                        if here == LOC_CARRIED {
                            self.set_flag(FCARRIED, self.get_flag(FCARRIED) + 1);
                        }
                        obj = next as i16;
                    }
                }
                self.done = true;
            }
            31 => { // AUTOG
                let noun = self.get_flag(FNOUN);
                let adj = self.get_flag(FADJECT);
                let mut found = self.get_object_by_vocab_at(noun, adj, self.player_loc());
                if found != NO_OBJECT {
                    self.do_get(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_WORN);
                if found != NO_OBJECT {
                    self.do_get(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_CARRIED);
                if found != NO_OBJECT {
                    self.do_get(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, MAX_LOCATION);
                if found != NO_OBJECT {
                    self.append_sysmess(26); // "There isn't one of those here."
                } else {
                    self.append_sysmess(8); // "I can't do that."
                }
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            32 => { // AUTOD
                let noun = self.get_flag(FNOUN);
                let adj = self.get_flag(FADJECT);
                let mut found = self.get_object_by_vocab_at(noun, adj, LOC_CARRIED);
                if found != NO_OBJECT {
                    self.do_drop(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_WORN);
                if found != NO_OBJECT {
                    self.do_drop(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, self.player_loc());
                if found != NO_OBJECT {
                    self.do_drop(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, MAX_LOCATION);
                if found != NO_OBJECT {
                    self.append_sysmess(28); // "I don't have one of those."
                } else {
                    self.append_sysmess(8);
                }
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            33 => { // AUTOW
                let noun = self.get_flag(FNOUN);
                let adj = self.get_flag(FADJECT);
                let mut found = self.get_object_by_vocab_at(noun, adj, LOC_CARRIED);
                if found != NO_OBJECT {
                    self.do_wear(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_WORN);
                if found != NO_OBJECT {
                    self.do_wear(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, self.player_loc());
                if found != NO_OBJECT {
                    self.do_wear(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, MAX_LOCATION);
                if found != NO_OBJECT {
                    self.append_sysmess(28);
                } else {
                    self.append_sysmess(8);
                }
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            34 => { // AUTOR
                let noun = self.get_flag(FNOUN);
                let adj = self.get_flag(FADJECT);
                let mut found = self.get_object_by_vocab_at(noun, adj, LOC_WORN);
                if found != NO_OBJECT {
                    self.do_remove(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_CARRIED);
                if found != NO_OBJECT {
                    self.do_remove(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, self.player_loc());
                if found != NO_OBJECT {
                    self.do_remove(found);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, MAX_LOCATION);
                if found != NO_OBJECT {
                    self.append_sysmess(23); // "I'm not wearing one of those."
                } else {
                    self.append_sysmess(8);
                }
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            35 => { // PAUSE — no-op for explorer
                self.done = true;
            }
            36 => { // SYNONYM — unconditionally set FVERB=p1, FNOUN=p2 (unless NO_WORD)
                if p1 != NO_WORD { self.set_flag(FVERB, p1); }
                if p2 != NO_WORD { self.set_flag(FNOUN, p2); }
                self.done = true;
            }
            37 => { // GOTO
                self.set_flag(FPLAYER, p1);
                self.done = true;
            }
            38 => { // MESSAGE = MES + NEWLINE
                self.append_message(p1u);
                self.append_newline();
                self.done = true;
            }
            39 => { // REMOVE (remove worn object → carried)
                self.do_remove(p1);
            }
            40 => { // GET
                self.do_get(p1);
            }
            41 => { // DROP
                self.do_drop(p1);
            }
            42 => { // WEAR
                self.do_wear(p1);
            }
            43 => { // DESTROY = PLACE obj at LOC_NOT_CREATED
                self.do_place(p1, LOC_NOT_CREATED);
            }
            44 => { // CREATE = PLACE obj at player location
                self.do_place(p1, self.player_loc());
            }
            45 => { // SWAP
                let a = self.obj_loc(p1u);
                let b = self.obj_loc(p2u);
                self.set_obj_loc(p1u, b);
                self.set_obj_loc(p2u, a);
                self.set_referenced_object(p2);
                self.done = true;
            }
            46 => { // PLACE
                let loc = if p2 == LOC_HERE { self.player_loc() } else { p2 };
                self.do_place(p1, loc);
            }
            47 => { // SET flag[p1] = 255 (not 1!)
                self.set_flag(p1u, 255);
                self.done = true;
            }
            48 => { // CLEAR flag[p1] = 0
                self.set_flag(p1u, 0);
                self.done = true;
            }
            49 => { // PLUS flag[p1] += p2, clamp at 255
                let v = self.get_flag(p1u) as u16 + p2 as u16;
                self.set_flag(p1u, if v > 255 { 255 } else { v as u8 });
                self.done = true;
            }
            50 => { // MINUS flag[p1] -= p2, clamp at 0
                let cur = self.get_flag(p1u) as i16;
                let result = cur - p2 as i16;
                self.set_flag(p1u, if result < 0 { 0 } else { result as u8 });
                self.done = true;
            }
            51 => { // LET flag[p1] = p2
                self.set_flag(p1u, p2);
                self.done = true;
            }
            52 => { // NEWLINE
                self.append_newline();
                self.done = true;
            }
            53 => { // PRINT — print flag[p1] as number (NOT a message!)
                let val = self.get_flag(p1u);
                self.output.push_str(&val.to_string());
                self.done = true;
            }
            54 => { // SYSMESS
                self.append_sysmess(p1u);
                self.done = true;
            }
            56 => { // SETCO
                self.set_referenced_object(p1);
                self.done = true;
            }
            57 => { // SPACE
                self.output.push(' ');
                self.done = true;
            }
            60 => { // LISTOBJ — list objects at player location
                self.list_objects(self.player_loc(), false);
                self.done = true;
            }
            61 => { // EXTERN — no-op for explorer
                self.done = true;
            }
            62 => { // RAMSAVE — save flags AND obj_locs
                self.ram_flags.copy_from_slice(&self.state.flags);
                self.ram_obj_locs[..self.ddb.num_obj].copy_from_slice(&self.state.obj_locs[..self.ddb.num_obj]);
                self.done = true;
            }
            63 => { // RAMLOAD — restore flags up to p1 AND all obj_locs
                let lim = (p1u + 1).min(MAX_FLAGS);
                self.state.flags[..lim].copy_from_slice(&self.ram_flags[..lim]);
                self.state.obj_locs[..self.ddb.num_obj].copy_from_slice(&self.ram_obj_locs[..self.ddb.num_obj]);
                self.done = true;
            }
            64 => { // BEEP — no-op
                self.done = true;
            }
            65 => { // PAPER — no-op
                self.done = true;
            }
            66 => { // INK — no-op
                self.done = true;
            }
            67 => { // BORDER — no-op
                self.done = true;
            }
            71 => { // ADD flag[p2] = flag[p1] + flag[p2], clamp 255
                let v = self.get_flag(p1u) as u16 + self.get_flag(p2u) as u16;
                self.set_flag(p2u, if v > 255 { 255 } else { v as u8 });
                self.done = true;
            }
            72 => { // SUB flag[p2] = flag[p2] - flag[p1], clamp 0
                let result = self.get_flag(p2u) as i16 - self.get_flag(p1u) as i16;
                self.set_flag(p2u, if result < 0 { 0 } else { result as u8 });
                self.done = true;
            }
            73 => { // PARSE
                if bfs_mode {
                    // In BFS mode, PARSE is a no-op (verb/noun already set)
                    self.condact_result = true;
                } else {
                    // In play mode, read input from stdin
                    let success = self.do_parse();
                    if self.verbose {
                        eprintln!("[PARSE] success={} FVERB={} FNOUN={} FADJ={} FADV={}",
                            success, self.get_flag(FVERB), self.get_flag(FNOUN),
                            self.get_flag(FADJECT), self.get_flag(FADVERB));
                    }
                    // Per Pascal: condactResult = NOT result (parse success means skip to next entry)
                    self.condact_result = !success;
                    self.done = false;
                }
            }
            74 => { // LISTAT
                let loc = if p1 == LOC_HERE { self.player_loc() } else { p1 };
                self.list_objects(loc, true);
                self.done = true;
            }
            75 => { // PROCESS — call sub-process (per Pascal _PROCESS)
                if p1u >= self.ddb.num_pro || self.stack.len() >= MAX_STACK_DEPTH {
                    return CondactSignal::Continue;
                }
                // StackPush: save all current state
                self.stack.push(StackFrame {
                    process_ptr: self.process_ptr,
                    entry_ptr: self.entry_ptr,
                    condact_ptr: self.condact_ptr,
                    doall_ptr: self.doall_ptr,
                    doall_entry_ptr: self.doall_entry_ptr,
                    doall_flag: self.get_flag(FDOALL),
                    doall_location: self.doall_location,
                });
                // Clear DOALL for sub-process (NestedDoallEnabled behavior)
                self.doall_ptr = 0;
                self.doall_entry_ptr = 0;
                // Set up new process
                self.condact_ptr = 0;
                self.process_ptr = self.ddb.process_pos + 2 * p1u;
                // EntryPTR = getWord(ProcessPTR) - 4; condactResult = false;
                // The false condactResult causes entry_ptr += 4, landing on first entry
                self.entry_ptr = self.word(self.process_ptr).wrapping_sub(4);
                self.condact_result = false;
                // Done is cleared so ISDONE after PROCESS refers to sub-process
                self.done = false;
            }
            77 => { // MES — message without newline
                self.append_message(p1u);
                self.done = true;
            }
            78 => { // WINDOW — no-op for explorer
                self.done = true;
            }
            81 => { // MODE — no-op
                self.done = true;
            }
            82 => { // WINAT — no-op
                self.done = true;
            }
            83 => { // TIME
                self.set_flag(FTIMEOUT, p1);
                self.set_flag(FTIMEOUT_CONTROL, p2);
                self.done = true;
            }
            84 => { // PICTURE — no-op for explorer (matches PCDAAD)
                // In PCDAAD: if p1==LOC_HERE then p1=flag[FPLAYER]; condactResult = LoadPicture(p1)
                // For explorer: always succeed (no graphics)
                self.condact_result = true;
                self.done = true;
            }
            85 => { // DOALL (per Pascal _DOALL)
                if self.doall_ptr != 0 {
                    // Nested DOALL not supported — runtime error
                    return CondactSignal::EndGame;
                }
                let loc = if p1 == LOC_HERE { self.player_loc() } else { p1 };
                self.set_flag(FDOALL, loc);
                let mut i: i16 = -1;
                loop {
                    let objno = self.get_next_object_at(i, loc);
                    if objno != NO_OBJECT {
                        self.set_referenced_object(objno);
                        // EXCEPT check: skip if OBJ1 matches OBJ2
                        let noun_match = self.get_flag(FNOUN) == self.get_flag(FNOUN2);
                        let adj1 = self.get_flag(FADJECT);
                        let adj2 = self.get_flag(FADJECT2);
                        let adj_match = adj1 == adj2 || adj1 == NO_WORD || adj2 == NO_WORD;
                        if noun_match && adj_match {
                            i += 1;
                            continue; // Skip this object (EXCEPT)
                        }
                        // Found valid object
                        self.doall_ptr = self.condact_ptr + 1; // Points to next condact after DOALL
                        self.doall_entry_ptr = self.entry_ptr;
                        self.doall_location = loc;
                        self.done = true;
                        return CondactSignal::Continue;
                    } else {
                        // No objects at location — NOTDONE behavior
                        // Pascal: newtext; _NOTDONE;
                        self.done = false;
                        self.consume_process();
                        self.condact_result = false;
                        return CondactSignal::Continue;
                    }
                }
            }
            86 => { // MOUSE — no-op
                self.done = true;
            }
            87 => { // GFX — no-op
                self.done = true;
            }
            89 => { // WEIGH — weight of obj p1 → flag[p2]
                let w = self.ddb.obj_weight(p1u);
                self.set_flag(p2u, w);
                self.done = true;
            }
            90 => { // PUTIN
                self.do_putin(p1, p2);
            }
            91 => { // TAKEOUT
                self.do_takeout(p1, p2);
            }
            92 => { // NEWTEXT — no-op for explorer (clears input buffer in real DAAD)
                self.done = true;
            }
            93 => { // ABILITY — flag[37]=p1, flag[52]=p2
                self.set_flag(FOBJECTS_CONVEYABLE, p1);
                self.set_flag(FPLAYER_STRENGTH, p2);
                self.done = true;
            }
            94 => { // WEIGHT — sum all carried+worn weights → flag[p1]
                let mut w: u16 = 0;
                for i in 0..self.ddb.num_obj {
                    let loc = self.obj_loc(i);
                    if loc == LOC_CARRIED || loc == LOC_WORN {
                        let ow = self.ddb.obj_weight(i) as u16;
                        w = w.saturating_add(ow);
                    }
                }
                self.set_flag(p1u, if w > 255 { 255 } else { w as u8 });
                self.done = true;
            }
            95 => { // RANDOM flag[p1] = random(0..100)
                if bfs_mode {
                    self.set_flag(p1u, 50);
                } else {
                    self.set_flag(p1u, rand_u8() % 101);
                }
                self.done = true;
            }
            96 => { // INPUT — matches PCDAAD _INPUT
                // p1 = window number for input, p2 = timeout control bits
                // Set FINPUT to window number
                self.set_flag(FINPUT, p1);
                // Shift p2 left by 3 and isolate bits 3-5
                let shifted = (p2 << 3) & 0x38;
                // Clear bits 3-5 of flag 49 and OR in the new bits
                let flag49 = self.get_flag(FTIMEOUT_CONTROL) & 0xC7;
                self.set_flag(FTIMEOUT_CONTROL, flag49 | shifted);
                self.done = true;
            }
            97 => { // SAVEAT — save entry_ptr (0 params per condact table!)
                self.saved_entry_ptr = self.entry_ptr;
                self.done = true;
            }
            98 => { // BACKAT — restore saved entry_ptr (0 params)
                self.entry_ptr = self.saved_entry_ptr;
                self.done = true;
            }
            99 => { // PRINTAT — no-op
                self.done = true;
            }
            100 => { // WHATO — always succeeds (action, not condition)
                self.whato();
                self.done = true;
            }
            101 => { // CALL — no-op
                self.done = true;
            }
            102 => { // PUTO — place refobj at loc p1
                let refobj = self.get_flag(FREFOBJ);
                self.do_place(refobj, if p1 == LOC_HERE { self.player_loc() } else { p1 });
                self.done = true;
            }
            103 => { // NOTDONE
                self.done = false;
                self.consume_process();
                self.condact_result = false;
            }
            104 => { // AUTOP — matches PCDAAD _AUTOP
                let container = if p1 == LOC_HERE { self.player_loc() } else { p1 };
                let noun = self.get_flag(FNOUN);
                let adj = self.get_flag(FADJECT);
                let mut found = self.get_object_by_vocab_at(noun, adj, LOC_CARRIED);
                if found != NO_OBJECT {
                    self.do_putin(found, container);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_WORN);
                if found != NO_OBJECT {
                    self.do_putin(found, container);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, self.player_loc());
                if found != NO_OBJECT {
                    self.do_putin(found, container);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, MAX_LOCATION);
                if found != NO_OBJECT {
                    self.append_sysmess(28); // "I don't have one of those."
                } else {
                    self.append_sysmess(8); // "I can't do that."
                }
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            105 => { // AUTOT — matches PCDAAD _AUTOT
                let container = if p1 == LOC_HERE { self.player_loc() } else { p1 };
                let noun = self.get_flag(FNOUN);
                let adj = self.get_flag(FADJECT);
                // First check in container
                let mut found = self.get_object_by_vocab_at(noun, adj, container);
                if found != NO_OBJECT {
                    self.do_takeout(found, container);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_CARRIED);
                if found != NO_OBJECT {
                    self.do_takeout(found, container);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, LOC_WORN);
                if found != NO_OBJECT {
                    self.do_takeout(found, container);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, self.player_loc());
                if found != NO_OBJECT {
                    self.do_takeout(found, container);
                    return CondactSignal::Continue;
                }
                found = self.get_object_by_vocab_at(noun, adj, MAX_LOCATION);
                if found != NO_OBJECT {
                    self.append_sysmess(52); // "There isn't one of those in the"
                } else {
                    self.append_sysmess(8); // "I can't do that."
                }
                self.done = true;
                self.consume_process();
                self.condact_result = false;
            }
            106 => { // MOVE — look up connections for loc=flag[p1], match direction=FVERB
                let loc = self.get_flag(p1u);
                let dir = self.get_flag(FVERB);
                self.done = true;
                if let Some(target) = self.ddb.find_connection(loc, dir) {
                    self.set_flag(p1u, target);
                } else {
                    self.condact_result = false;
                }
            }
            107 => { // WINSIZE — no-op
                self.done = true;
            }
            108 => { // REDO — jump to first entry of CURRENT process (per Pascal _REDO)
                // EntryPTR := getWord(ProcessPTR) - 4; condactResult := false;
                self.entry_ptr = self.word(self.process_ptr).wrapping_sub(4);
                self.condact_result = false;
            }
            109 => { // CENTRE — no-op
                self.done = true;
            }
            110 => { // EXIT (per Pascal _EXIT)
                if p1 == 0 {
                    return CondactSignal::EndGame;
                }
                // EXIT with p1 != 0: resetWindows, resetFlags, resetObjects, then _RESTART
                for i in 0..MAX_FLAGS {
                    self.set_flag(i, 0);
                }
                for obj in 0..self.ddb.num_obj {
                    let init = self.ddb.byte(self.ddb.obj_init_pos + obj);
                    self.state.obj_locs[obj] = init;
                }
                // Then do RESTART behavior (stays in loop)
                self.stack.clear();
                self.doall_ptr = 0;
                self.process_ptr = self.ddb.process_pos;
                self.entry_ptr = self.word(self.process_ptr).wrapping_sub(4);
                self.condact_result = false;
                self.restart = true; // Signal for BFS/audit mode
            }
            111 => { // INKEY — no-op (set key flags to 0)
                self.set_flag(FKEY1, 0);
                self.set_flag(FKEY2, 0);
                self.condact_result = false; // No key pressed
            }
            116 => { // SKIP — 1 param, signed byte offset (per Pascal _SKIP)
                // OriginalSkip := signed(parameter1); EntryPTR += 4 * OriginalSkip; condactResult := false;
                let offset = if p1 >= 128 { p1 as i32 - 256 } else { p1 as i32 };
                self.entry_ptr = (self.entry_ptr as i64 + 4 * offset as i64) as usize;
                self.condact_result = false;
            }
            117 => { // RESTART (per Pascal _RESTART)
                // resetProcesses; resetStack;
                // EntryPTR := getWord(ProcessPtr) - 4; condactResult := false;
                self.stack.clear();
                self.doall_ptr = 0;
                self.process_ptr = self.ddb.process_pos;
                self.entry_ptr = self.word(self.process_ptr).wrapping_sub(4);
                self.condact_result = false;
                self.restart = true; // Signal for BFS/audit mode
            }
            118 => { // TAB — no-op
                self.done = true;
            }
            119 => { // COPYOF flag[p2] = obj_loc[p1]
                let loc = self.obj_loc(p1u);
                self.set_flag(p2u, loc);
                self.done = true;
            }
            120 => { // dumb (stub)
            }
            121 => { // COPYOO — obj_loc[p2] = obj_loc[p1] (via PLACE)
                let loc = self.obj_loc(p1u);
                self.do_place(p2, loc);
            }
            122 => { // dumb (stub)
            }
            123 => { // COPYFO — obj_loc[p2] = flag[p1] (via PLACE)
                let loc = self.get_flag(p1u);
                self.do_place(p2, loc);
            }
            124 => { // dumb (stub)
            }
            125 => { // COPYFF flag[p2] = flag[p1]
                let v = self.get_flag(p1u);
                self.set_flag(p2u, v);
                self.done = true;
            }
            126 => { // COPYBF flag[p1] = flag[p2]
                let v = self.get_flag(p2u);
                self.set_flag(p1u, v);
                self.done = true;
            }
            127 => { // RESET — restore objects to initial locations
                for obj in 0..self.ddb.num_obj {
                    let init = self.ddb.byte(self.ddb.obj_init_pos + obj);
                    self.state.obj_locs[obj] = init;
                }
                self.done = true;
            }
            _ => {
                // Unknown opcode — treat as no-op
            }
        }
        CondactSignal::Continue
    }

    // -- Object manipulation condacts (matching PCDAAD exactly) --

    /// GET condact (40)
    fn do_get(&mut self, objno: u8) {
        let obj = objno as usize;
        self.set_referenced_object(objno);
        let loc = self.obj_loc(obj);

        if loc == LOC_WORN || loc == LOC_CARRIED {
            self.append_sysmess(25); // "I already have the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc != self.player_loc() {
            self.append_sysmess(26); // "There isn't one of those here."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        // Check weight
        let wc = self.weight_at(LOC_CARRIED) as u16;
        let ww = self.weight_at(LOC_WORN) as u16;
        let ow = self.ddb.obj_weight(obj) as u16;
        if wc + ww + ow > self.get_flag(FPLAYER_STRENGTH) as u16 {
            self.append_sysmess(43); // "The _ weighs too much for me."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        // Check conveyable limit
        if self.get_flag(FCARRIED) >= self.get_flag(FOBJECTS_CONVEYABLE) {
            self.append_sysmess(27); // "I can't carry any more things."
            self.doall_ptr = 0;
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        self.set_obj_loc(obj, LOC_CARRIED);
        self.set_flag(FCARRIED, self.get_flag(FCARRIED) + 1);
        self.append_sysmess(36); // "I now have the _."
        self.done = true;
    }

    /// DROP condact (41)
    fn do_drop(&mut self, objno: u8) {
        let obj = objno as usize;
        self.set_referenced_object(objno);
        let loc = self.obj_loc(obj);

        if loc == LOC_WORN {
            self.append_sysmess(24); // "I can't. I'm wearing the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc == self.player_loc() {
            self.append_sysmess(49); // "I don't have the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc != LOC_CARRIED {
            self.append_sysmess(28); // "I don't have one of those."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        self.set_obj_loc(obj, self.player_loc());
        self.set_flag(FCARRIED, self.get_flag(FCARRIED).saturating_sub(1));
        self.append_sysmess(39); // "I've dropped the _."
        self.done = true;
    }

    /// WEAR condact (42)
    fn do_wear(&mut self, objno: u8) {
        let obj = objno as usize;
        self.set_referenced_object(objno);
        let loc = self.obj_loc(obj);

        if loc == self.player_loc() {
            self.append_sysmess(49); // "I don't have the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc == LOC_WORN {
            self.append_sysmess(29); // "I'm already wearing the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc != LOC_CARRIED {
            self.append_sysmess(28); // "I don't have one of those."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if !self.ddb.obj_is_wearable(obj) {
            self.append_sysmess(40); // "I can't wear the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        self.set_obj_loc(obj, LOC_WORN);
        self.set_flag(FCARRIED, self.get_flag(FCARRIED).saturating_sub(1));
        self.append_sysmess(37); // "I'm now wearing the _."
        self.done = true;
    }

    /// REMOVE condact (39)
    fn do_remove(&mut self, objno: u8) {
        let obj = objno as usize;
        self.set_referenced_object(objno);
        let loc = self.obj_loc(obj);

        if loc == LOC_CARRIED || loc == self.player_loc() {
            self.append_sysmess(50); // "I'm not wearing the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc != LOC_WORN {
            self.append_sysmess(23); // "I'm not wearing one of those."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if !self.ddb.obj_is_wearable(obj) {
            self.append_sysmess(41); // "I can't remove the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if self.get_flag(FCARRIED) >= self.get_flag(FOBJECTS_CONVEYABLE) {
            self.append_sysmess(42); // "I can't remove the _. My hands are full."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        self.set_obj_loc(obj, LOC_CARRIED);
        self.set_flag(FCARRIED, self.get_flag(FCARRIED) + 1);
        self.append_sysmess(38); // "I've removed the _."
        self.done = true;
    }

    /// PLACE condact (46) — matches PCDAAD exactly
    fn do_place(&mut self, objno: u8, loc: u8) {
        let obj = objno as usize;
        // If was carried, decrement FCARRIED
        if self.obj_loc(obj) == LOC_CARRIED {
            self.set_flag(FCARRIED, self.get_flag(FCARRIED).saturating_sub(1));
        }
        self.set_obj_loc(obj, loc);
        // If now carried, increment FCARRIED
        if self.obj_loc(obj) == LOC_CARRIED {
            self.set_flag(FCARRIED, self.get_flag(FCARRIED) + 1);
        }
        self.done = true;
    }

    /// PUTIN condact (90) — matches PCDAAD condacts.pas exactly
    fn do_putin(&mut self, p1: u8, p2: u8) {
        // Resolve LOC_HERE for object number (PCDAAD quirk)
        let obj = if p1 == LOC_HERE { self.player_loc() } else { p1 };
        let obj_u = obj as usize;
        self.set_referenced_object(obj);
        let loc = self.obj_loc(obj_u);
        let player_loc = self.player_loc();

        if loc == LOC_WORN {
            self.append_sysmess(24); // "I can't. I'm wearing the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc == player_loc {
            self.append_sysmess(49); // "I don't have the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc != player_loc && loc != LOC_CARRIED {
            self.append_sysmess(28); // "I don't have one of those."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        self.set_obj_loc(obj_u, p2);
        self.set_flag(FCARRIED, self.get_flag(FCARRIED).saturating_sub(1));
        self.append_sysmess(44); // "The _ is in the "
        self.done = true;
    }

    /// TAKEOUT condact (91) — matches PCDAAD condacts.pas exactly
    fn do_takeout(&mut self, p1: u8, p2: u8) {
        // Resolve LOC_HERE for object number (PCDAAD quirk)
        let obj = if p1 == LOC_HERE { self.player_loc() } else { p1 };
        let obj_u = obj as usize;
        self.set_referenced_object(obj);
        let loc = self.obj_loc(obj_u);
        let player_loc = self.player_loc();

        if loc == LOC_WORN || loc == LOC_CARRIED {
            self.append_sysmess(45); // "I already have the _."
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc == player_loc {
            self.append_sysmess(49); // "The _ isn't in the"
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        if loc != player_loc && loc != p2 {
            self.append_sysmess(52); // "There isn't one of those in the"
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        // Weight/conveyable checks only if not already carried/worn
        if loc != LOC_CARRIED && loc != LOC_WORN {
            let wc = self.weight_at(LOC_CARRIED) as u16;
            let ww = self.weight_at(LOC_WORN) as u16;
            let ow = self.ddb.obj_weight(obj_u) as u16;
            if wc + ww + ow > self.get_flag(FPLAYER_STRENGTH) as u16 {
                self.append_sysmess(43); // "The _ weighs too much for me."
                self.done = true;
                self.consume_process();
                self.condact_result = false;
                return;
            }
        }
        if self.get_flag(FCARRIED) >= self.get_flag(FOBJECTS_CONVEYABLE) {
            self.append_sysmess(27); // "I can't carry any more things."
            self.doall_ptr = 0;
            self.done = true;
            self.consume_process();
            self.condact_result = false;
            return;
        }
        self.set_obj_loc(obj_u, LOC_CARRIED);
        self.set_flag(FCARRIED, self.get_flag(FCARRIED) + 1);
        self.append_sysmess(36); // "I now have the _."
        self.done = true;
    }
}

// Simple RNG (no external deps)
fn rand_u8() -> u8 {
    use std::time::SystemTime;
    let t = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap_or_default();
    ((t.subsec_nanos() >> 8) & 0xFF) as u8
}

// ---------------------------------------------------------------------------
// Vocabulary helpers
// ---------------------------------------------------------------------------

fn vocab_word_for_id(ddb: &Ddb, id: u8, wtype: u8) -> Option<String> {
    for (word, wid, wt) in ddb.parse_vocab() {
        if wid == id && wt == wtype {
            return Some(word);
        }
    }
    None
}

fn vocab_verbs(ddb: &Ddb) -> Vec<(String, u8)> {
    let mut seen = HashSet::new();
    let mut result = Vec::new();
    for (word, id, wtype) in ddb.parse_vocab() {
        if wtype == WTYPE_VERB && !seen.contains(&id) {
            seen.insert(id);
            result.push((word, id));
        }
    }
    result
}

fn vocab_nouns(ddb: &Ddb) -> Vec<(String, u8)> {
    let mut seen = HashSet::new();
    let mut result = Vec::new();
    for (word, id, wtype) in ddb.parse_vocab() {
        if wtype == WTYPE_NOUN && !seen.contains(&id) {
            seen.insert(id);
            result.push((word, id));
        }
    }
    result
}

fn parse_input(line: &str) -> (String, Option<String>) {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.is_empty() {
        return (String::new(), None);
    }
    let verb = parts[0].to_uppercase();
    let noun = if parts.len() > 1 { Some(parts[1].to_uppercase()) } else { None };
    (verb, noun)
}

fn lookup_word_any_type(ddb: &Ddb, word: &str, wtype: u8) -> Option<u8> {
    let upper = word.to_uppercase();
    let truncated: String = upper.chars().take(5).collect();
    for (w, id, wt) in ddb.parse_vocab() {
        if wt == wtype && w == truncated {
            return Some(id);
        }
    }
    None
}

fn lookup_word(ddb: &Ddb, word: &str, wtype: u8) -> Option<u8> {
    // DAAD uses exact 5-character comparison (both input and vocab truncated to 5 chars)
    let upper = word.to_uppercase();
    let truncated: String = upper.chars().take(5).collect();
    for (w, id, wt) in ddb.parse_vocab() {
        if wt == wtype && w == truncated {
            return Some(id);
        }
    }
    None
}

fn visible_noun_ids(ddb: &Ddb, state: &VmState) -> HashSet<u8> {
    let ploc = state.flags[FPLAYER];
    let mut ids = HashSet::new();
    for obj in 0..ddb.num_obj {
        let loc = state.obj_locs[obj];
        if loc == ploc || loc == LOC_CARRIED || loc == LOC_WORN {
            let noun_id = ddb.byte(ddb.obj_name_pos + 2 * obj);
            if noun_id != NO_WORD {
                ids.insert(noun_id);
            }
        }
    }
    ids
}

fn special_noun_ids(ddb: &Ddb) -> HashSet<u8> {
    let special_words = [
        "HOLLO", "WOUND", "HAMPT", "CITY", "HOUSE", "LONGA", "MAYFA", "RICHM",
        "NORTH", "SOUTH", "EAST", "WEST", "UP", "DOWN",
        "CARLY", "HAROL", "HARRI", "HUTCH", "MAX", "PARDE", "LOUIS",
        "DOOR", "WALL", "FLOOR", "WINDO",
    ];
    let mut ids = HashSet::new();
    for word in &special_words {
        if let Some(nid) = lookup_word(ddb, word, WTYPE_NOUN) {
            ids.insert(nid);
        }
    }
    ids
}

// ---------------------------------------------------------------------------
// DUMP mode
// ---------------------------------------------------------------------------

fn mode_dump(ddb: &Ddb) {
    println!("=== DAAD V2 DDB DUMP ===");
    println!("Version: {}", ddb.version);
    println!("Objects: {}", ddb.num_obj);
    println!("Locations: {}", ddb.num_loc);
    println!("Messages: {}", ddb.num_msg);
    println!("System messages: {}", ddb.num_sys);
    println!("Processes: {}", ddb.num_pro);
    println!();
    println!("Offsets:");
    println!("  token_pos=0x{:04X}  process_pos=0x{:04X}  object_pos=0x{:04X}",
        ddb.token_pos, ddb.process_pos, ddb.object_pos);
    println!("  location_pos=0x{:04X}  message_pos=0x{:04X}  sysmess_pos=0x{:04X}",
        ddb.location_pos, ddb.message_pos, ddb.sysmess_pos);
    println!("  connection_pos=0x{:04X}  vocab_pos=0x{:04X}",
        ddb.connection_pos, ddb.vocab_pos);
    println!("  obj_init_pos=0x{:04X}  obj_name_pos=0x{:04X}  obj_weight_pos=0x{:04X}  obj_attr_pos=0x{:04X}",
        ddb.obj_init_pos, ddb.obj_name_pos, ddb.obj_weight_pos, ddb.obj_attr_pos);
    println!();

    // Vocabulary
    println!("=== VOCABULARY ===");
    let type_names = ["verb", "?", "noun", "adj", "adverb", "prep", "conj"];
    let vocab = ddb.parse_vocab();
    for (word, id, wtype) in &vocab {
        let tname = if (*wtype as usize) < type_names.len() { type_names[*wtype as usize] } else { "?" };
        println!("  {:6} id={:3}  type={} ({})", word, id, wtype, tname);
    }
    println!("  ({} words total)", vocab.len());
    println!();

    // Locations
    println!("=== LOCATIONS ===");
    for i in 0..ddb.num_loc {
        let desc = ddb.read_text(ddb.location_pos, i);
        let conns = ddb.connections_for_loc(i);
        println!("  [{:3}] {}", i, desc.lines().next().unwrap_or("(empty)"));
        if !conns.is_empty() {
            let conn_strs: Vec<String> = conns.iter().map(|(d, t)| format!("dir{}->loc{}", d, t)).collect();
            println!("        Connections: {}", conn_strs.join(", "));
        }
    }
    println!();

    // Objects
    println!("=== OBJECTS ===");
    for i in 0..ddb.num_obj {
        let init_loc = ddb.byte(ddb.obj_init_pos + i);
        let noun = ddb.obj_noun(i);
        let adj = ddb.obj_adj(i);
        let weight = ddb.obj_weight(i);
        let container = ddb.obj_is_container(i);
        let wearable = ddb.obj_is_wearable(i);
        let attr = ddb.word(ddb.obj_attr_pos + 2 * i);
        let noun_word = vocab_word_for_id(ddb, noun, WTYPE_NOUN).unwrap_or_else(|| format!("n{}", noun));
        let adj_word = if adj == 0xFF {
            String::from("-")
        } else {
            vocab_word_for_id(ddb, adj, 3).unwrap_or_else(|| format!("a{}", adj))
        };
        println!("  [{:3}] noun={} adj={} init_loc={} weight={} container={} wearable={} attr=0x{:04X}",
            i, noun_word, adj_word, init_loc, weight, container, wearable, attr);
    }
    println!();

    // System messages (first 20)
    println!("=== SYSTEM MESSAGES (first 20) ===");
    for i in 0..ddb.num_sys.min(20) {
        let t = ddb.read_text(ddb.sysmess_pos, i);
        println!("  [{:3}] {:?}", i, t);
    }
    println!();

    // Game messages (first 20)
    println!("=== MESSAGES (first 20) ===");
    for i in 0..ddb.num_msg.min(20) {
        let t = ddb.read_text(ddb.message_pos, i);
        println!("  [{:3}] {:?}", i, t);
    }
    println!();

    // Process entry counts
    println!("=== PROCESSES ===");
    for pro in 0..ddb.num_pro {
        let pro_ptr = ddb.process_pos + 2 * pro;
        let entry_table = ddb.word(pro_ptr);
        let mut pos = entry_table;
        let mut count = 0usize;
        for _ in 0..10000 {
            if pos >= ddb.data.len() { break; }
            if ddb.byte(pos) == END_OF_PROCESS { break; }
            pos += 4;
            count += 1;
        }
        println!("  PRO {:3}  entry_table=0x{:04X}  entries={}", pro, entry_table, count);
    }
}

// ---------------------------------------------------------------------------
// PLAY mode (interactive)
// ---------------------------------------------------------------------------

fn mode_play(ddb: &Ddb) {
    // Initialize state: reset flags, restore objects to initial locations
    let mut state = VmState::new();
    for obj in 0..ddb.num_obj {
        state.obj_locs[obj] = ddb.byte(ddb.obj_init_pos + obj);
    }

    let mut vm = Vm::new(ddb, state);
    // Enable verbose from env var
    vm.verbose = std::env::var("DAAD_VERBOSE").is_ok();

    // The DAAD game loop is entirely driven by PRO 0.
    // PRO 0 contains DESC, PARSE, PROCESS 1, PROCESS 2, etc.
    // PARSE reads input from stdin.
    // The game loops via REDO in PRO 0.
    // Single run_game() call — it loops forever until halt/END.
    vm.run_game();

    // Flush any remaining output
    let out = vm.output.clone();
    if !out.is_empty() {
        print!("{}", out);
        let _ = io::stdout().flush();
    }
    if vm.end_game {
        println!("\n[Game over]");
    }
}

// ---------------------------------------------------------------------------
// BFS mode
// ---------------------------------------------------------------------------

#[derive(Clone)]
struct BfsNode {
    state: VmState,
    depth: usize,
    path: Vec<(String, String)>,
}

fn extract_process_commands(ddb: &Ddb, process_ids: &[usize]) -> Vec<(u8, u8)> {
    let mut seen = HashSet::new();
    let mut result = Vec::new();
    for &pro in process_ids {
        if pro >= ddb.num_pro { continue; }
        let pro_ptr = ddb.process_pos + 2 * pro;
        let entry_table = ddb.word(pro_ptr);
        let mut pos = entry_table;
        for _ in 0..10000 {
            if pos >= ddb.data.len() { break; }
            if ddb.byte(pos) == END_OF_PROCESS { break; }
            let verb = ddb.byte(pos);
            let noun = ddb.byte(pos + 1);
            if seen.insert((verb, noun)) {
                result.push((verb, noun));
            }
            pos += 4;
        }
    }
    result
}

fn mode_bfs(ddb: &Ddb, end_flag: Option<usize>) {
    println!("=== BFS WALKTHROUGH BUILDER ===");
    println!("Processes: {}  Locations: {}  Objects: {}  Flags: 256",
        ddb.num_pro, ddb.num_loc, ddb.num_obj);

    let verbs = vocab_verbs(ddb);
    let nouns = vocab_nouns(ddb);
    println!("Verbs: {}  Nouns: {}", verbs.len(), nouns.len());

    let response_pros: Vec<usize> = (1..ddb.num_pro).filter(|&p| p != 2).collect();
    let process_commands = extract_process_commands(ddb, &response_pros);
    let mut specific_commands: Vec<(u8, u8)> = Vec::new();
    let mut wildcard_verb_nouns: HashSet<u8> = HashSet::new();
    let mut wildcard_noun_verbs: HashSet<u8> = HashSet::new();
    let mut has_full_wildcard = false;
    for &(v, n) in &process_commands {
        match (v, n) {
            (0xFF, 0xFF) => { has_full_wildcard = true; }
            (0xFF, noun) => { wildcard_verb_nouns.insert(noun); }
            (verb, 0xFF) => { wildcard_noun_verbs.insert(verb); }
            (verb, noun) => { specific_commands.push((verb, noun)); }
        }
    }

    let noun_id_to_str: HashMap<u8, String> = nouns.iter().map(|(s, id)| (*id, s.clone())).collect();
    let verb_id_to_str: HashMap<u8, String> = verbs.iter().map(|(s, id)| (*id, s.clone())).collect();
    let always_try_nouns = special_noun_ids(ddb);

    const SKIP_VERB_IDS: &[u8] = &[25, 26, 27];

    let mut fixed_commands: Vec<(u8, u8)> = Vec::new();
    for &(v, n) in &specific_commands {
        if !SKIP_VERB_IDS.contains(&v) {
            fixed_commands.push((v, n));
        }
    }
    fixed_commands.sort();
    fixed_commands.dedup();

    let wn_verbs: Vec<u8> = wildcard_noun_verbs.iter()
        .filter(|v| !SKIP_VERB_IDS.contains(v))
        .copied().collect();
    let wv_nouns: Vec<u8> = wildcard_verb_nouns.iter().copied().collect();
    let wv_verb_ids: Vec<u8> = verbs.iter()
        .filter(|(_, v)| !SKIP_VERB_IDS.contains(v))
        .map(|(_, v)| *v)
        .collect();

    let mut fw_commands: Vec<(u8, u8)> = Vec::new();
    if has_full_wildcard {
        for (_, vid) in &verbs {
            if !SKIP_VERB_IDS.contains(vid) {
                fw_commands.push((*vid, NO_WORD));
            }
        }
    }

    println!("Fixed: {}  WN-verbs: {}  WV-nouns: {}  FW: {}",
        fixed_commands.len(), wn_verbs.len(), wv_nouns.len(), fw_commands.len());

    let mut init_state = VmState::new();
    for obj in 0..ddb.num_obj {
        init_state.obj_locs[obj] = ddb.byte(ddb.obj_init_pos + obj);
    }

    // Run PRO 0 (init) on initial state — this runs the game from the start
    // For BFS we need to run process-by-process approach
    {
        let mut vm = Vm::new(ddb, init_state.clone());
        vm.set_flag(FVERB, NO_WORD);
        vm.set_flag(FNOUN, NO_WORD);
        vm.run_process(0, true);
        init_state = vm.state.clone();
        let out = vm.output.clone();
        if !out.is_empty() {
            println!("\n[Initial state output]\n{}", out);
        }
    }

    let start_node = BfsNode {
        state: init_state,
        depth: 0,
        path: Vec::new(),
    };

    let mut visited: HashSet<Vec<u8>> = HashSet::new();
    visited.insert(start_node.state.bfs_key());

    let mut queue: VecDeque<BfsNode> = VecDeque::new();
    queue.push_back(start_node);

    let mut location_commands: HashMap<u8, Vec<(String, String, String)>> = HashMap::new();
    let mut win_path: Option<Vec<(String, String)>> = None;

    let mut bfs_count = 0usize;
    let mut solutions_found = 0usize;
    let bfs_start = std::time::Instant::now();

    'bfs: while let Some(node) = queue.pop_front() {
        if node.depth >= MAX_BFS_DEPTH {
            continue;
        }
        bfs_count += 1;
        if bfs_count % 100 == 0 {
            eprintln!("[BFS] nodes={} queue={} visited={} elapsed={:.1}s",
                bfs_count, queue.len(), visited.len(), bfs_start.elapsed().as_secs_f32());
        }

        let loc = node.state.flags[FPLAYER];
        let visible = visible_noun_ids(ddb, &node.state);
        let try_nouns: HashSet<u8> = visible.union(&always_try_nouns).copied().collect();

        let mut commands: Vec<(String, u8, String, u8)> = Vec::new();
        for &(v, n) in &fixed_commands {
            let vs = verb_id_to_str.get(&v).cloned().unwrap_or_else(|| format!("v{}", v));
            let ns = noun_id_to_str.get(&n).cloned().unwrap_or_else(|| format!("n{}", n));
            commands.push((vs, v, ns, n));
        }
        for &v in &wn_verbs {
            let vs = verb_id_to_str.get(&v).cloned().unwrap_or_else(|| format!("v{}", v));
            commands.push((vs.clone(), v, String::from("_"), NO_WORD));
            for &n in &try_nouns {
                let ns = noun_id_to_str.get(&n).cloned().unwrap_or_else(|| format!("n{}", n));
                commands.push((vs.clone(), v, ns, n));
            }
        }
        for &n in &wv_nouns {
            if try_nouns.contains(&n) {
                let ns = noun_id_to_str.get(&n).cloned().unwrap_or_else(|| format!("n{}", n));
                for &v in &wv_verb_ids {
                    let vs = verb_id_to_str.get(&v).cloned().unwrap_or_else(|| format!("v{}", v));
                    commands.push((vs, v, ns.clone(), n));
                }
            }
        }
        for &(v, n) in &fw_commands {
            let vs = verb_id_to_str.get(&v).cloned().unwrap_or_else(|| format!("v{}", v));
            commands.push((vs, v, String::from("_"), n));
        }

        for (verb_str, vid, noun_str, nid) in &commands {
            let mut vm = Vm::new(ddb, node.state.clone());
            vm.set_flag(FVERB, *vid);
            vm.set_flag(FNOUN, *nid);
            vm.set_flag(FADJECT, 0xFF);
            vm.set_flag(FADVERB, 0xFF);

            let pro_to_run = if ddb.num_pro > 1 { 1 } else { 0 };
            vm.run_process(pro_to_run, true);

            let out = vm.output.clone();

            if !vm.end_game && !vm.restart && ddb.num_pro > 2 {
                vm.run_process(2, true);
            }

            if !vm.end_game && !vm.restart {
                vm.set_flag(FVERB, NO_WORD);
                vm.set_flag(FNOUN, NO_WORD);
                vm.run_process(0, true);
            }

            let new_state = vm.state.clone();

            if !out.trim().is_empty() {
                let entry = location_commands.entry(loc).or_insert_with(Vec::new);
                if entry.len() < 100 {
                    let key = format!("{} {}", verb_str, noun_str);
                    if !entry.iter().any(|(v, n, _)| format!("{} {}", v, n) == key) {
                        let truncated_out = out.trim().chars().take(200).collect::<String>();
                        entry.push((verb_str.clone(), noun_str.clone(), truncated_out));
                    }
                }
            }

            if vm.end_game {
                if win_path.is_none() {
                    let mut path = node.path.clone();
                    path.push((verb_str.clone(), noun_str.clone()));
                    println!("\n[WIN PATH FOUND at depth {}]", node.depth + 1);
                    println!("=== WINNING WALKTHROUGH ({} steps) ===", path.len());
                    for (i, (v, n)) in path.iter().enumerate() {
                        if n == "_" {
                            println!("  {:3}. {}", i + 1, v);
                        } else {
                            println!("  {:3}. {} {}", i + 1, v, n);
                        }
                    }
                    println!();
                    let _ = std::io::stdout().flush();
                    win_path = Some(path);
                    solutions_found += 1;
                }
                continue;
            }

            if vm.restart {
                continue;
            }

            if let Some(ef) = end_flag {
                if new_state.flags[ef] != 0 {
                    if win_path.is_none() {
                        let mut path = node.path.clone();
                        path.push((verb_str.clone(), noun_str.clone()));
                        println!("\n[WIN PATH FOUND (flag {} set) at depth {}]", ef, node.depth + 1);
                        println!("=== WINNING WALKTHROUGH ({} steps) ===", path.len());
                        for (i, (v, n)) in path.iter().enumerate() {
                            if n == "_" {
                                println!("  {:3}. {}", i + 1, v);
                            } else {
                                println!("  {:3}. {} {}", i + 1, v, n);
                            }
                        }
                        println!();
                        let _ = std::io::stdout().flush();
                        win_path = Some(path);
                        solutions_found += 1;
                    }
                    continue;
                }
            }

            let new_key = new_state.bfs_key();
            if !visited.contains(&new_key) {
                visited.insert(new_key);
                if node.depth + 1 < MAX_BFS_DEPTH {
                    let mut new_path = node.path.clone();
                    new_path.push((verb_str.clone(), noun_str.clone()));
                    queue.push_back(BfsNode {
                        state: new_state,
                        depth: node.depth + 1,
                        path: new_path,
                    });
                }
            }

            if solutions_found >= 1 {
                break 'bfs;
            }
        }
    }

    println!("\n=== BFS COMPLETE ===");
    println!("States explored: {}  Unique states: {}", bfs_count, visited.len());
    println!();

    if let Some(path) = &win_path {
        println!("=== WINNING WALKTHROUGH ({} steps) ===", path.len());
        for (i, (v, n)) in path.iter().enumerate() {
            if n == "_" {
                println!("  {:3}. {}", i + 1, v);
            } else {
                println!("  {:3}. {} {}", i + 1, v, n);
            }
        }
        println!();
    } else {
        println!("[No winning path found in {} BFS steps]", bfs_count);
        println!();
    }

    println!("=== PER-LOCATION COMMAND MAP ===");
    let mut loc_keys: Vec<u8> = location_commands.keys().cloned().collect();
    loc_keys.sort();
    for loc in loc_keys {
        let loc_desc = ddb.read_text(ddb.location_pos, loc as usize);
        println!("\nLocation {} - {}", loc, loc_desc.lines().next().unwrap_or("?"));
        if let Some(cmds) = location_commands.get(&loc) {
            for (v, n, out) in cmds {
                let cmd = if n == "_" { v.clone() } else { format!("{} {}", v, n) };
                let first_line = out.lines().next().unwrap_or("(no output)");
                let truncated = if first_line.len() > 80 {
                    format!("{}...", &first_line[..80])
                } else {
                    first_line.to_string()
                };
                println!("  > {:20}  -> {}", cmd, truncated);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// AUDIT mode
// ---------------------------------------------------------------------------

fn mode_audit(ddb: &Ddb) {
    println!("=== ROOM-BY-ROOM COMMAND AUDIT ===");
    println!("Processes: {}  Locations: {}  Objects: {}",
        ddb.num_pro, ddb.num_loc, ddb.num_obj);

    let verbs = vocab_verbs(ddb);
    let nouns = vocab_nouns(ddb);
    let noun_id_to_str: HashMap<u8, String> = nouns.iter().map(|(s, id)| (*id, s.clone())).collect();
    let verb_id_to_str: HashMap<u8, String> = verbs.iter().map(|(s, id)| (*id, s.clone())).collect();

    let response_pros: Vec<usize> = (1..ddb.num_pro).filter(|&p| p != 2).collect();
    let process_commands = extract_process_commands(ddb, &response_pros);

    let mut specific_commands: Vec<(u8, u8)> = Vec::new();
    let mut wildcard_verb_nouns: HashSet<u8> = HashSet::new();
    let mut wildcard_noun_verbs: HashSet<u8> = HashSet::new();
    let mut has_full_wildcard = false;
    for &(v, n) in &process_commands {
        match (v, n) {
            (0xFF, 0xFF) => { has_full_wildcard = true; }
            (0xFF, noun) => { wildcard_verb_nouns.insert(noun); }
            (verb, 0xFF) => { wildcard_noun_verbs.insert(verb); }
            (verb, noun) => { specific_commands.push((verb, noun)); }
        }
    }

    const SKIP_VERB_IDS: &[u8] = &[25, 26, 27];
    let always_try_nouns = special_noun_ids(ddb);

    let mut fixed_commands: Vec<(u8, u8)> = Vec::new();
    for &(v, n) in &specific_commands {
        if !SKIP_VERB_IDS.contains(&v) {
            fixed_commands.push((v, n));
        }
    }
    fixed_commands.sort();
    fixed_commands.dedup();

    let wn_verbs: Vec<u8> = wildcard_noun_verbs.iter()
        .filter(|v| !SKIP_VERB_IDS.contains(v))
        .copied().collect();
    let wv_nouns: Vec<u8> = wildcard_verb_nouns.iter().copied().collect();
    let wv_verb_ids: Vec<u8> = verbs.iter()
        .filter(|(_, v)| !SKIP_VERB_IDS.contains(v))
        .map(|(_, v)| *v)
        .collect();

    let mut base_state = VmState::new();
    for obj in 0..ddb.num_obj {
        base_state.obj_locs[obj] = ddb.byte(ddb.obj_init_pos + obj);
    }

    {
        let mut vm = Vm::new(ddb, base_state.clone());
        vm.set_flag(FVERB, NO_WORD);
        vm.set_flag(FNOUN, NO_WORD);
        vm.run_process(0, true);
        base_state = vm.state.clone();
    }

    let start_loc = base_state.flags[FPLAYER];
    let mut visited_rooms: HashSet<u8> = HashSet::new();
    let mut explore_stack: Vec<u8> = vec![start_loc];

    let obj_name = |obj: usize| -> String {
        if obj < ddb.num_obj {
            let noun_id = ddb.obj_noun(obj);
            vocab_word_for_id(ddb, noun_id, WTYPE_NOUN)
                .unwrap_or_else(|| format!("obj{}", obj))
        } else {
            format!("obj{}", obj)
        }
    };

    let loc_name = |loc: u8| -> String {
        match loc {
            252 => String::from("limbo"),
            253 => String::from("worn"),
            254 => String::from("carried"),
            l => format!("loc{}", l),
        }
    };

    while let Some(target_loc) = explore_stack.pop() {
        if visited_rooms.contains(&target_loc) {
            continue;
        }
        if target_loc as usize >= ddb.num_loc {
            continue;
        }
        visited_rooms.insert(target_loc);

        let mut room_state = base_state.clone();
        room_state.flags[FPLAYER] = target_loc;

        let room_desc = ddb.read_text(ddb.location_pos, target_loc as usize);
        let room_first_line = room_desc.lines().next().unwrap_or("(no description)");
        let room_title = if room_first_line.len() > 80 {
            format!("{}...", &room_first_line[..80])
        } else {
            room_first_line.to_string()
        };
        println!("\n=== ROOM {}: {} ===", target_loc, room_title);

        let mut objs_here: Vec<String> = Vec::new();
        for obj in 0..ddb.num_obj {
            if room_state.obj_locs[obj] == target_loc {
                let name = obj_name(obj);
                objs_here.push(format!("{} (obj {})", name, obj));
            }
        }
        if !objs_here.is_empty() {
            println!("Objects here: {}", objs_here.join(", "));
        }
        println!();

        let visible = visible_noun_ids(ddb, &room_state);
        let try_nouns: HashSet<u8> = visible.union(&always_try_nouns).copied().collect();

        let mut commands: Vec<(u8, u8, String, String)> = Vec::new();

        for &(v, n) in &fixed_commands {
            let vs = verb_id_to_str.get(&v).cloned().unwrap_or_else(|| format!("v{}", v));
            let ns = noun_id_to_str.get(&n).cloned().unwrap_or_else(|| format!("n{}", n));
            commands.push((v, n, vs, ns));
        }

        for &v in &wn_verbs {
            let vs = verb_id_to_str.get(&v).cloned().unwrap_or_else(|| format!("v{}", v));
            commands.push((v, NO_WORD, vs.clone(), String::from("_")));
            for &n in &try_nouns {
                let ns = noun_id_to_str.get(&n).cloned().unwrap_or_else(|| format!("n{}", n));
                commands.push((v, n, vs.clone(), ns));
            }
        }

        for &n in &wv_nouns {
            if try_nouns.contains(&n) {
                let ns = noun_id_to_str.get(&n).cloned().unwrap_or_else(|| format!("n{}", n));
                for &v in &wv_verb_ids {
                    let vs = verb_id_to_str.get(&v).cloned().unwrap_or_else(|| format!("v{}", v));
                    commands.push((v, n, vs, ns.clone()));
                }
            }
        }

        if has_full_wildcard {
            for &(_, vid) in &verbs {
                if !SKIP_VERB_IDS.contains(&vid) {
                    let vs = verb_id_to_str.get(&vid).cloned().unwrap_or_else(|| format!("v{}", vid));
                    commands.push((vid, NO_WORD, vs, String::from("_")));
                }
            }
        }

        {
            let mut seen: HashSet<(u8, u8)> = HashSet::new();
            commands.retain(|(v, n, _, _)| seen.insert((*v, *n)));
        }

        for (vid, nid, verb_str, noun_str) in &commands {
            let saved_state = room_state.clone();

            let mut vm = Vm::new(ddb, room_state.clone());
            vm.set_flag(FVERB, *vid);
            vm.set_flag(FNOUN, *nid);
            vm.set_flag(FADJECT, 0xFF);
            vm.set_flag(FADVERB, 0xFF);

            let pro_to_run = if ddb.num_pro > 1 { 1 } else { 0 };
            vm.run_process(pro_to_run, true);
            let output_text = vm.output.clone();
            let triggered_end = vm.end_game;

            if !vm.end_game && !vm.restart && ddb.num_pro > 2 {
                vm.run_process(2, true);
            }

            if !vm.end_game && !vm.restart {
                vm.set_flag(FVERB, NO_WORD);
                vm.set_flag(FNOUN, NO_WORD);
                vm.run_process(0, true);
            }

            let after_state = vm.state.clone();

            let mut flag_changes: Vec<String> = Vec::new();
            for i in 0..MAX_FLAGS {
                if i == FVERB || i == FNOUN || i == FADJECT || i == FADVERB {
                    continue;
                }
                if saved_state.flags[i] != after_state.flags[i] {
                    flag_changes.push(format!("{}={}>{}", i, saved_state.flags[i], after_state.flags[i]));
                }
            }

            let mut obj_changes: Vec<String> = Vec::new();
            for i in 0..ddb.num_obj {
                if saved_state.obj_locs[i] != after_state.obj_locs[i] {
                    let name = obj_name(i);
                    let from = loc_name(saved_state.obj_locs[i]);
                    let to = loc_name(after_state.obj_locs[i]);
                    obj_changes.push(format!("{} (obj {}): {}>{}", name, i, from, to));
                }
            }

            let has_output = !output_text.trim().is_empty();
            let has_flag_change = !flag_changes.is_empty();
            let has_obj_change = !obj_changes.is_empty();

            if !has_output && !has_flag_change && !has_obj_change && !triggered_end {
                room_state = saved_state;
                continue;
            }

            let cmd_label = if noun_str == "_" {
                format!("{:<5} _", verb_str)
            } else {
                format!("{:<5} {:<5}", verb_str, noun_str)
            };

            let player_moved = saved_state.flags[FPLAYER] != after_state.flags[FPLAYER];

            let mut line_parts: Vec<String> = Vec::new();

            if player_moved {
                let new_loc = after_state.flags[FPLAYER];
                line_parts.push(format!("[player moved to loc {}]", new_loc));
                if !visited_rooms.contains(&new_loc) {
                    explore_stack.push(new_loc);
                }
            } else if has_output {
                let trimmed = output_text.trim().replace('\n', " ");
                let truncated: String = if trimmed.len() > 150 {
                    format!("{}...", trimmed.chars().take(150).collect::<String>())
                } else {
                    trimmed
                };
                line_parts.push(format!("\"{}\"", truncated));
            }

            if triggered_end {
                line_parts.push(String::from("[END]"));
            }

            if has_flag_change {
                line_parts.push(format!("[flags: {}]", flag_changes.join(", ")));
            }

            if has_obj_change {
                for oc in &obj_changes {
                    line_parts.push(format!("[obj {}]", oc));
                }
            }

            println!("  {:<14} -> {}", cmd_label, line_parts.join("  "));

            room_state = saved_state;
        }
    }

    println!("\n=== AUDIT COMPLETE ===");
    println!("Rooms audited: {} / {} total locations", visited_rooms.len(), ddb.num_loc);

    let mut unreachable: Vec<u8> = Vec::new();
    for i in 0..ddb.num_loc as u8 {
        if !visited_rooms.contains(&i) {
            unreachable.push(i);
        }
    }
    if !unreachable.is_empty() {
        println!("Unreachable rooms: {:?}", unreachable);
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage:");
        eprintln!("  daad_explorer <game.ddb> --dump");
        eprintln!("  daad_explorer <game.ddb> --play");
        eprintln!("  daad_explorer <game.ddb> --bfs [--end-flag N]");
        eprintln!("  daad_explorer <game.ddb> --audit");
        std::process::exit(1);
    }

    let ddb_path = &args[1];
    let mode = &args[2];

    let ddb = match Ddb::load(ddb_path) {
        Ok(d) => d,
        Err(e) => {
            eprintln!("Error loading DDB: {}", e);
            std::process::exit(1);
        }
    };

    match mode.as_str() {
        "--dump" => {
            mode_dump(&ddb);
        }
        "--play" => {
            mode_play(&ddb);
        }
        "--bfs" => {
            let end_flag = args.windows(2).find(|w| w[0] == "--end-flag")
                .and_then(|w| w[1].parse::<usize>().ok());
            mode_bfs(&ddb, end_flag);
        }
        "--audit" => {
            mode_audit(&ddb);
        }
        other => {
            eprintln!("Unknown mode: {}. Use --dump, --play, --bfs, or --audit.", other);
            std::process::exit(1);
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn make_minimal_ddb() -> Ddb {
        let mut data = vec![0u8; 64];
        data[0] = 2;
        data[3] = 0;
        data[4] = 1;
        data[5] = 0;
        data[6] = 0;
        data[7] = 1;
        data[10] = 34;
        data[11] = 0;
        data[34] = 36;
        data[35] = 0;
        data[36] = END_OF_PROCESS;
        data[22] = 60;
        data[23] = 0;
        data[14] = 60;
        data[15] = 0;
        Ddb {
            data,
            version: 2,
            num_obj: 0,
            num_loc: 1,
            num_msg: 0,
            num_sys: 0,
            num_pro: 1,
            token_pos: 0,
            process_pos: 34,
            object_pos: 0,
            location_pos: 60,
            message_pos: 0,
            sysmess_pos: 0,
            connection_pos: 0,
            vocab_pos: 60,
            obj_init_pos: 0,
            obj_name_pos: 0,
            obj_weight_pos: 0,
            obj_attr_pos: 0,
        }
    }

    #[test]
    fn test_vocab_empty() {
        let ddb = make_minimal_ddb();
        assert_eq!(ddb.parse_vocab().len(), 0);
    }

    #[test]
    fn test_run_empty_process() {
        let ddb = make_minimal_ddb();
        let state = VmState::new();
        let mut vm = Vm::new(&ddb, state);
        vm.set_flag(FVERB, NO_WORD);
        vm.set_flag(FNOUN, NO_WORD);
        let out = vm.run_process(0, true);
        assert!(out.is_empty());
        assert!(!vm.end_game);
    }

    #[test]
    fn test_flag_set_clear() {
        let ddb = make_minimal_ddb();
        let state = VmState::new();
        let mut vm = Vm::new(&ddb, state);
        vm.set_flag(5, 42);
        assert_eq!(vm.get_flag(5), 42);
        vm.set_flag(5, 0);
        assert_eq!(vm.get_flag(5), 0);
    }

    #[test]
    fn test_bfs_key_excludes_turn_counters() {
        let mut s1 = VmState::new();
        let mut s2 = VmState::new();
        s1.flags[FTURNS_LO] = 10;
        s2.flags[FTURNS_LO] = 20;
        assert_eq!(s1.bfs_key(), s2.bfs_key());
    }
}
