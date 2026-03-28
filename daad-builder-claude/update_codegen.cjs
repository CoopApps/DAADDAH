const fs = require('fs');

const content = String.raw`// Bytecode Generator - Converts GameData AST into DAAD bytecode

use super::ast::*;
use super::error::*;
use super::condacts::{get_condact, DaadVersion};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Bytecode {
    pub vocabulary: Vec<u8>,
    pub system_messages: Vec<u8>,
    pub messages: Vec<u8>,
    pub object_texts: Vec<u8>,
    pub location_texts: Vec<u8>,
    pub connections: Vec<u8>,
    pub objects: Vec<u8>,
    pub processes: [Vec<u8>; 4],
    pub initial_flags: Vec<u8>,
}

pub fn generate_bytecode(game: &GameData) -> CompilerResult<Bytecode> {
    let mut bytecode = Bytecode {
        vocabulary: Vec::new(),
        system_messages: Vec::new(),
        messages: Vec::new(),
        object_texts: Vec::new(),
        location_texts: Vec::new(),
        connections: Vec::new(),
        objects: Vec::new(),
        processes: [Vec::new(), Vec::new(), Vec::new(), Vec::new()],
        initial_flags: Vec::new(),
    };

    generate_vocabulary(&game.vocabulary, &mut bytecode.vocabulary)?;
    generate_messages(&game.system_messages, &mut bytecode.system_messages)?;
    generate_messages(&game.messages, &mut bytecode.messages)?;
    generate_messages(&game.object_texts, &mut bytecode.object_texts)?;
    generate_messages(&game.location_texts, &mut bytecode.location_texts)?;
    generate_connections(&game.locations, &mut bytecode.connections)?;
    generate_objects(&game.objects, &mut bytecode.objects)?;

    for i in 0..4 {
        generate_process_table(&game.processes[i], &mut bytecode.processes[i])?;
    }

    generate_initial_flags(&game.initial_flags, &mut bytecode.initial_flags)?;
    Ok(bytecode)
}

fn generate_vocabulary(vocab: &[VocabEntry], output: &mut Vec<u8>) -> CompilerResult<()> {
    for entry in vocab {
        let mut word_bytes = [b' '; 5];
        let word = entry.word.as_bytes();
        let len = word.len().min(5);
        word_bytes[..len].copy_from_slice(&word[..len]);
        output.extend_from_slice(&word_bytes);
        output.push(entry.word_type as u8);
        output.push(entry.id);
    }
    output.extend_from_slice(&[b' ', b' ', b' ', b' ', b' ', 255, 255]);
    Ok(())
}

fn generate_messages(messages: &[String], output: &mut Vec<u8>) -> CompilerResult<()> {
    for message in messages {
        output.extend_from_slice(message.as_bytes());
        output.push(0);
    }
    output.push(0);
    Ok(())
}

fn generate_connections(locations: &[LocationDef], output: &mut Vec<u8>) -> CompilerResult<()> {
    for location in locations {
        output.push(location.connections.len() as u8);
        for conn in &location.connections {
            output.push(conn.direction);
            output.push(conn.target);
        }
    }
    Ok(())
}

fn generate_objects(objects: &[ObjectDef], output: &mut Vec<u8>) -> CompilerResult<()> {
    for obj in objects {
        output.push(obj.initial_location);
        let mut weight_byte = obj.weight & 0x3F;
        if obj.is_container {
            weight_byte |= 0x40;
        }
        if obj.is_wearable {
            weight_byte |= 0x80;
        }
        output.push(weight_byte);
        let mut flags_word: u16 = 0;
        for (i, &flag) in obj.custom_flags.iter().enumerate() {
            if flag {
                flags_word |= 1 << (15 - i);
            }
        }
        output.push((flags_word >> 8) as u8);
        output.push((flags_word & 0xFF) as u8);
        output.push(obj.noun.unwrap_or(255));
        output.push(obj.adjective.unwrap_or(255));
    }
    Ok(())
}

fn generate_process_table(entries: &[ProcessEntry], output: &mut Vec<u8>) -> CompilerResult<()> {
    for entry in entries {
        output.push(entry.verb);
        output.push(entry.noun);
        for condact in &entry.condacts {
            output.push(condact.opcode);
            for &param in &condact.params {
                output.push(param);
            }
        }
        output.push(255);
    }
    output.push(0);
    output.push(0);
    Ok(())
}

fn generate_initial_flags(flags: &HashMap<u8, u8>, output: &mut Vec<u8>) -> CompilerResult<()> {
    for (&flag_num, &value) in flags {
        output.push(flag_num);
        output.push(value);
    }
    output.push(255);
    output.push(255);
    Ok(())
}
`;

fs.writeFileSync('src-tauri/src/compiler/codegen.rs', content, 'utf8');
console.log('✓ Updated codegen.rs');
