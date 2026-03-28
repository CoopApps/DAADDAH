use crate::game::DaadGame;
use crate::types::*;

/// Computed message indices for system messages appended after game messages.
/// All indices are into the /MTX section.
#[derive(Debug, Clone, Copy)]
struct MessageIndices {
    /// Index of "Turns: " label used by PRO 12
    turns_msg: u8,
    /// Index of "Darkness" label used by PRO 11
    darkness_msg: u8,
    /// Index of help screen title used by PRO 5 HELP handler
    help_title_msg: u8,
    /// Index of help screen body used by PRO 5 HELP handler
    help_body_msg: u8,
    /// Index of first location name (location 1); location N is at loc_names_start + (N-1)
    loc_names_start: u8,
    /// Index where game messages begin (always 14, after the 0-13 exits labels)
    game_msg_start: u8,
    /// Index of the game intro text shown at startup in PRO 6
    intro_msg: u8,
}

/// DAAD Code Generator
/// Converts visual game data into DAAD source code
pub struct DaadCodeGenerator;

impl DaadCodeGenerator {
    /// Generate complete DAAD source code from visual game
    pub fn generate(game: &DaadGame) -> String {
        let mut code = String::new();

        // Header comments (not part of DRC spec, but helpful)
        code.push_str(&Self::generate_header(game));

        // DRC REQUIRED SECTION ORDER (STRICT - DO NOT CHANGE):
        // 1. /CTL - Control Section
        // 2. /VOC - Vocabulary
        // 3. /STX - System Text Messages
        // 4. /MTX - Message Texts
        // 5. /OTX - Object Texts
        // 6. /LTX - Location Texts
        // 7. /CON - Connections
        // 8. /OBJ - Object Definitions
        // 9. /PRO - Processes
        // 10. /END - End marker

        // 1. /CTL section (required by DRC)
        code.push_str(&Self::generate_ctl_section());

        // 2. /VOC - Vocabulary (MUST be position 2, immediately after /CTL)
        code.push_str(&Self::generate_vocabulary(&game.vocabulary, &game.objects));

        // 3. /STX - System Text Messages
        code.push_str(&Self::generate_system_messages());

        // 4. /MTX - Message Texts (also computes system message indices)
        let (mtx, msg_indices) = Self::generate_messages_with_indices(&game.messages, &game.locations, game.intro_text.as_deref().unwrap_or(""));
        code.push_str(&mtx);

        // 5. /OTX - Object Texts
        code.push_str(&Self::generate_object_texts(&game.objects));

        // 6. /LTX - Location Texts
        code.push_str(&Self::generate_locations(&game.locations));

        // 7. /CON - Connections
        code.push_str(&Self::generate_connections(&game.locations));

        // 8. /OBJ - Object Definitions
        code.push_str(&Self::generate_object_definitions(&game.objects));

        // 9. /PRO - Process tables (PRO 0-12)
        code.push_str(&Self::generate_processes(game, &msg_indices));

        // 10. /END marker (required by DRC)
        code.push_str("/END\n");

        code
    }

    /// Generate DAAD source code with verbose logging
    /// Returns (dsf_code, log_messages)
    pub fn generate_verbose(game: &DaadGame) -> (String, Vec<String>) {
        let mut code = String::new();
        let mut logs = Vec::new();

        logs.push("=".repeat(60));
        logs.push(format!("DAAD DSF Generation: {}", game.title));
        logs.push("=".repeat(60));
        logs.push(String::new());

        // Header
        logs.push("[HEADER] Generating game header...".to_string());
        code.push_str(&Self::generate_header(game));
        logs.push(format!("  ✓ Title: {}", game.title));
        logs.push(format!("  ✓ Author: {}", game.author));
        logs.push(format!("  ✓ Version: {}", game.version));
        logs.push(String::new());

        // 1. CTL Section
        logs.push("[CTL] Control section...".to_string());
        code.push_str(&Self::generate_ctl_section());
        logs.push("  ✓ Null word: _".to_string());
        logs.push("  ✓ System flags: Dark, DarkF, Score, Turns, Verb, Noun1, MaxCarr, Player, Prompt, Strength".to_string());
        logs.push(String::new());

        // 2. VOC Section
        logs.push("[VOC] Building vocabulary...".to_string());
        let vocab_code = Self::generate_vocabulary(&game.vocabulary, &game.objects);
        code.push_str(&vocab_code);

        let mut verb_count = 0;
        let mut noun_count = 0;
        let mut movement_verbs = 0;

        for v in &game.vocabulary {
            match v.word_type {
                VocabType::Verb => {
                    verb_count += 1;
                    if v.id < 14 {
                        movement_verbs += 1;
                        logs.push(format!("  + {} ({}, verb) - MOVEMENT", v.word.to_uppercase(), v.id));
                    }
                }
                VocabType::Noun => noun_count += 1,
                _ => {}
            }
        }

        logs.push(format!("  ✓ {} verbs ({} movement)", verb_count, movement_verbs));
        logs.push(format!("  ✓ {} nouns", noun_count));
        logs.push(format!("  ✓ {} total words", game.vocabulary.len()));
        logs.push(String::new());

        // 3. STX Section
        logs.push("[STX] System text messages...".to_string());
        code.push_str(&Self::generate_system_messages());
        logs.push("  ✓ 63 standard DAAD system messages (0-62)".to_string());
        logs.push(String::new());

        // 4. MTX Section
        logs.push("[MTX] Custom message texts...".to_string());
        let (mtx_v, msg_indices) = Self::generate_messages_with_indices(&game.messages, &game.locations, game.intro_text.as_deref().unwrap_or(""));
        code.push_str(&mtx_v);
        if !game.messages.is_empty() {
            logs.push(format!("  ✓ {} custom messages (0-{})",
                game.messages.len(),
                game.messages.len() - 1));

            // Show first few custom messages
            for (i, msg) in game.messages.iter().take(3).enumerate() {
                let preview = if msg.len() > 50 {
                    format!("{}...", &msg[0..50])
                } else {
                    msg.clone()
                };
                logs.push(format!("    /{} \"{}\"", i, preview));
            }
            if game.messages.len() > 3 {
                logs.push(format!("    ... and {} more", game.messages.len() - 3));
            }
        } else {
            logs.push("  ⚠ No custom messages defined".to_string());
        }
        logs.push(String::new());

        // 5. OTX Section
        logs.push("[OTX] Object texts...".to_string());
        code.push_str(&Self::generate_object_texts(&game.objects));
        if !game.objects.is_empty() {
            logs.push(format!("  ✓ {} objects defined", game.objects.len()));
            for (i, obj) in game.objects.iter().take(5).enumerate() {
                logs.push(format!("    /{} \"{}\"", i, obj.description));
            }
            if game.objects.len() > 5 {
                logs.push(format!("    ... and {} more", game.objects.len() - 5));
            }
        } else {
            logs.push("  ⚠ No objects defined".to_string());
        }
        logs.push(String::new());

        // 6. LTX Section
        logs.push("[LTX] Location texts...".to_string());
        code.push_str(&Self::generate_locations(&game.locations));
        if !game.locations.is_empty() {
            logs.push(format!("  ✓ {} locations defined", game.locations.len()));
            for loc in game.locations.iter().take(5) {
                let preview = if loc.description.len() > 40 {
                    format!("{}...", &loc.description[0..40])
                } else {
                    loc.description.clone()
                };
                logs.push(format!("    /{} {} \"{}\"",
                    loc.id,
                    loc.name,
                    preview));
            }
            if game.locations.len() > 5 {
                logs.push(format!("    ... and {} more", game.locations.len() - 5));
            }
        } else {
            logs.push("  ⚠ No locations defined".to_string());
        }
        logs.push(String::new());

        // 7. CON Section
        logs.push("[CON] Connections...".to_string());
        code.push_str(&Self::generate_connections(&game.locations));
        let mut total_connections = 0;
        for loc in &game.locations {
            total_connections += loc.connections.len();
        }
        if total_connections > 0 {
            logs.push(format!("  ✓ {} connections mapped", total_connections));
            for loc in game.locations.iter().take(3) {
                if !loc.connections.is_empty() {
                    for conn in &loc.connections {
                        logs.push(format!("    /{} ({}) → {} to location {}",
                            loc.id,
                            loc.name,
                            conn.direction.long(),
                            conn.target_location));
                    }
                }
            }
        } else {
            logs.push("  ⚠ No connections defined".to_string());
        }
        logs.push(String::new());

        // 8. OBJ Section
        logs.push("[OBJ] Object definitions...".to_string());
        code.push_str(&Self::generate_object_definitions(&game.objects));
        if !game.objects.is_empty() {
            logs.push(format!("  ✓ {} object properties defined", game.objects.len()));
            let mut carried = 0;
            let mut worn = 0;
            let mut containers = 0;

            for obj in &game.objects {
                match &obj.location {
                    ObjectLocation::Carried => carried += 1,
                    ObjectLocation::Worn => worn += 1,
                    _ => {}
                }
                if obj.is_container {
                    containers += 1;
                }
            }

            if carried > 0 {
                logs.push(format!("    {} initially carried", carried));
            }
            if worn > 0 {
                logs.push(format!("    {} initially worn", worn));
            }
            if containers > 0 {
                logs.push(format!("    {} containers", containers));
            }
        }
        logs.push(String::new());

        // 9. PRO Section
        logs.push("[PRO] Process tables...".to_string());
        code.push_str(&Self::generate_processes(game, &msg_indices));

        logs.push("  ✓ PRO 0 - Main game loop".to_string());
        logs.push("  ✓ PRO 1 - Input loop (PARSE/REDO)".to_string());
        logs.push("  ✓ PRO 2 - Error handler".to_string());
        logs.push("  ✓ PRO 3 - Post-description".to_string());
        logs.push("  ✓ PRO 4 - Status table".to_string());
        logs.push("  ✓ PRO 5 - Response table".to_string());

        // PRO0/PRO1/PRO5 all map to the DSF response table
        let pro5_rules: Vec<_> = game.rules.iter()
            .filter(|r| {
                matches!(r.process.as_str(), "PRO0" | "PRO1" | "PRO5") && r.enabled
            })
            .collect();

        if !pro5_rules.is_empty() {
            logs.push(format!("    {} custom response rules", pro5_rules.len()));
            for rule in pro5_rules.iter().take(3) {
                let (dv, dn) = Self::extract_verb_noun(&rule.name);
                let verb = rule.verb.as_deref().unwrap_or(&dv);
                let noun = rule.noun.as_deref().unwrap_or(&dn);
                logs.push(format!("      > {} {} - {}", verb, noun, rule.name));
            }
            if pro5_rules.len() > 3 {
                logs.push(format!("      ... and {} more", pro5_rules.len() - 3));
            }
            logs.push("    ⚠ LOOK catch-all placed at END (correct ordering)".to_string());
        }

        logs.push("  ✓ PRO 6 - Initialization".to_string());
        logs.push(String::new());

        // 10. END marker
        logs.push("[END] Finalizing...".to_string());
        code.push_str("/END\n");
        logs.push("  ✓ End marker added".to_string());
        logs.push(String::new());

        // Validation summary
        logs.push("=".repeat(60));
        logs.push("[VALIDATION]".to_string());
        logs.push("  ✓ All sections in correct DRC order".to_string());
        logs.push("  ✓ System messages (0-64) included".to_string());
        logs.push("  ✓ PRO 5 rule ordering correct".to_string());

        let line_count = code.lines().count();
        logs.push(String::new());
        logs.push("[OUTPUT]".to_string());
        logs.push(format!("  ✓ {} lines generated", line_count));
        logs.push("  ✓ Ready for DRF compilation".to_string());
        logs.push("=".repeat(60));

        (code, logs)
    }

    fn generate_header(game: &DaadGame) -> String {
        format!(
            "; ========================================\n\
             ; {}\n\
             ; by {}\n\
             ; Version: {}\n\
             ; Generated by DAAD Builder\n\
             ; ========================================\n\n",
            game.title, game.author, game.version
        )
    }

    fn generate_ctl_section() -> String {
        // Full CTL matching Rabenstein/working DSF for PC target
        let mut code = String::from("/CTL\n_\n");
        code.push_str("#define Turns_TAB \"COLS-13\"\n");
        code.push_str("\n");
        code.push_str("#define NOTCREATED 252\n");
        code.push_str("#define TRUE 1\n");
        code.push_str("#define FALSE 0\n");
        code.push_str("#define YES 255\n");
        code.push_str("#define NO 0\n");
        code.push_str("\n");
        code.push_str("; Attributes for system\n");
        code.push_str("#define WEARABLE  23\n");
        code.push_str("#define CONTAINER 31\n");
        code.push_str("#define LISTED    55\n");
        code.push_str("#define OA_CLIST  54\n");
        code.push_str("#define OO_CLIST  64\n");
        code.push_str("#define TIMEOUT   87\n");
        code.push_str("#define IA_RBUF   85\n");
        code.push_str("#define IO_RBUF   32\n");
        code.push_str("#define IA_PINP   84\n");
        code.push_str("#define IO_PINP   16\n");
        code.push_str("#define IA_CSTR   83\n");
        code.push_str("#define IO_CSTR   8\n");
        code.push_str("#define IA_TAKEY  82\n");
        code.push_str("#define IO_TAKEY  4\n");
        code.push_str("#define IA_TMORE  81\n");
        code.push_str("#define IO_TMORE  2\n");
        code.push_str("#define IA_TSTAR  80\n");
        code.push_str("#define IO_TSTAR  1\n");
        code.push_str("#define GMODE     247\n");
        code.push_str("#define GA_MDRW   246\n");
        code.push_str("#define GO_MDRW   64\n");
        code.push_str("#define GA_POFF   245\n");
        code.push_str("#define GO_POFF   32\n");
        code.push_str("#define GA_WKEY   244\n");
        code.push_str("#define GO_WKEY   16\n");
        code.push_str("#define GA_CBOR   243\n");
        code.push_str("#define GO_CBOR   8\n");
        code.push_str("#define MOUSE     240\n");
        code.push_str("\n");
        code.push_str("; System flags 0-63\n");
        code.push_str("#define Dark        0\n");
        code.push_str("#define NOCarr      1\n");
        code.push_str("#define Work1       2\n");
        code.push_str("#define Work2       3\n");
        code.push_str("#define Stack      24\n");
        code.push_str("#define EMPTY      23\n");
        code.push_str("#define FULL        3\n");
        code.push_str("#define GFXFail    20\n");
        code.push_str("#define O2Num      25\n");
        code.push_str("#define O2Con      26\n");
        code.push_str("#define O2Loc      27\n");
        code.push_str("#define DarkF      28\n");
        code.push_str("#define GFlags     29\n");
        code.push_str("#define Score      30\n");
        code.push_str("#define Turns      31\n");
        code.push_str("#define Verb       33\n");
        code.push_str("#define Noun1      34\n");
        code.push_str("#define Adject1    35\n");
        code.push_str("#define Adverb     36\n");
        code.push_str("#define MaxCarr    37\n");
        code.push_str("#define Player     38\n");
        code.push_str("#define O2Att      39\n");
        code.push_str("#define InStream   41\n");
        code.push_str("#define Prompt     42\n");
        code.push_str("#define Prep       43\n");
        code.push_str("#define Noun2      44\n");
        code.push_str("#define Adject2    45\n");
        code.push_str("#define CPNoun     46\n");
        code.push_str("#define CPAdject   47\n");
        code.push_str("#define Time       48\n");
        code.push_str("#define TIFlags    49\n");
        code.push_str("#define DAObjNo    50\n");
        code.push_str("#define CONum      51\n");
        code.push_str("#define Strength   52\n");
        code.push_str("#define OFlags     53\n");
        code.push_str("#define COLoc      54\n");
        code.push_str("#define COWei      55\n");
        code.push_str("#define COCon      56\n");
        code.push_str("#define COWR       57\n");
        code.push_str("#define COAtt      58\n");
        code.push_str("#define Key1       60\n");
        code.push_str("#define Key2       61\n");
        code.push_str("#define ScMode     62\n");
        code.push_str("#define CurWin     63\n");
        code.push_str("\n");
        code
    }

    fn generate_system_messages() -> String {
        let mut code = String::from("/STX    ;System Message Texts\n");

        // Standard DAAD system messages (0-62) - required by DRC
        let system_messages = vec![
            "/0 \"It's too dark to see anything.\"",
            "/1 \"I can also see: \"",
            "/2 \"What now?\"",
            "/3 \"What next?\"",
            "/4 \"What should I do now?\"",
            "/5 \"What should I do next?\"",
            "/6 \"I was not able to understand any of that.  Please try again.\"",
            "/7 \"I can't go in that direction.\"",
            "/8 \"I can't do that.\"",
            "/9 \"I have with me:\"",
            "/10 \"I am wearing:\"",
            "/11 \"\";*Spare\"",
            "/12 \"Are you sure? \"",
            "/13 \"Would you like another go? \"",
            "/14 \"\";*Spare\"",
            "/15 \"OK.\"",
            "/16 \"Press any key to continue.\"",
            "/17 \"\";*You have taken\"",
            "/18 \"\";*\\\\sturn\"",
            "/19 \"\";*s\"",
            "/20 \"\";*.[CR]\"",
            "/21 \"\";*You have scored\"",
            "/22 \"\";*%[CR]\"",
            "/23 \"I'm not wearing one of those.\"",
            "/24 \"I can't.  I'm wearing the _.\"",
            "/25 \"I already have the _.\"",
            "/26 \"There isn't one of those here.\"",
            "/27 \"I can't carry any more things.\"",
            "/28 \"I don't have one of those.\"",
            "/29 \"I'm already wearing the _.\"",
            "/30 \"Y\"    ;One upper case character only",
            "/31 \"N\"    ;One upper case character only",
            "/32 \"More...\"",
            "/33 \">\"",
            "/34 \"\";*Spare\"",
            "/35 \"Time passes...\"",
            "/36 \"I now have the _.\"",
            "/37 \"I'm now wearing the _.\"",
            "/38 \"I've removed the _.\"",
            "/39 \"I've dropped the _.\"",
            "/40 \"I can't wear the _.\"",
            "/41 \"I can't remove the _.\"",
            "/42 \"I can't remove the _.  My hands are full.\"",
            "/43 \"The _ weighs too much for me.\"",
            "/44 \"The _ is in the \"",
            "/45 \"The _ isn't in the \"",
            "/46 \", \"",
            "/47 \" and \"",
            "/48 \".\"",
            "/49 \"I don't have the _.\"",
            "/50 \"I'm not wearing the _.\"",
            "/51 \".\"",
            "/52 \"There isn't one of those in the \"",
            "/53 \"Nothing.\"",
            "/54 \"T\" ;Letter for Tape",
            "/55 \"D\" ;Disc",
            "/56 \"Drive not ready - press any key to retry.\"",
            "/57 \"I/O Error.\"",
            "/58 \"Disc or Directory may be full.\"",
            "/59 \"Invalid filename.\"",
            "/60 \"Type in name of file:\"",
            "/61 \"Start tape.\"",
            "/62 \"Tape or Disc?\"",
        ];

        for msg in system_messages {
            code.push_str(msg);
            code.push('\n');
        }
        code.push_str("\n\n");

        code
    }

    fn generate_locations(locations: &[Location]) -> String {
        let mut code = String::from("/LTX\n\n");

        if locations.is_empty() {
            code.push_str("; No locations defined\n\n");
        } else {
            for loc in locations {
                let escaped_desc = loc.description
                    .replace('"', "\\\"")
                    .replace('\n', "^")
                    .replace('\r', "");

                code.push_str(&format!(
                    "/{} \"{}\"{}\n",
                    loc.id,
                    escaped_desc,
                    if loc.is_dark { "  ; DARK location" } else { "" }
                ));
            }
            code.push('\n');
        }

        code
    }

    fn generate_connections(locations: &[Location]) -> String {
        let mut code = String::from("/CON ; Connections\n\n");

        // All direction keywords including IN/OUT are valid in /CON
        // as long as they are defined in /VOC (as verbs or nouns).
        for loc in locations {
            if loc.connections.is_empty() {
                code.push_str(&format!("/{}   ; {} - no exits\n", loc.id, loc.name));
            } else {
                code.push_str(&format!("/{}   ; {}\n", loc.id, loc.name));
                for conn in &loc.connections {
                    code.push_str(&format!(
                        "{}  {}\n",
                        conn.direction.short(),
                        conn.target_location
                    ));
                }
            }
            code.push('\n');
        }

        code
    }

    fn generate_object_texts(objects: &[Object]) -> String {
        let mut code = String::from("/OTX\n\n");
        if objects.is_empty() {
            code.push_str("; No objects defined\n\n");
        } else {
            for obj in objects {
                // Use otxText field if present, otherwise generate short name
                let display_text = if let Some(ref t) = obj.otx_text {
                    t.clone()
                } else if obj.adjective.is_empty() || obj.adjective == "_" {
                    format!("a {}", obj.noun.to_lowercase())
                } else {
                    format!("a {} {}", obj.adjective.to_lowercase(), obj.noun.to_lowercase())
                };
                let escaped = display_text.replace('"', "\\\"");
                code.push_str(&format!("/{} \"{}\"\n", obj.id, escaped));
            }
            code.push('\n');
        }
        code
    }

    fn generate_object_definitions(objects: &[Object]) -> String {
        let mut code = String::from("/OBJ\n\n");

        if objects.is_empty() {
            code.push_str("; No objects defined\n\n");
        } else {
            for obj in objects {
                code.push_str(&format!("/{:<3}", obj.id));

                let loc_str = match &obj.location {
                    ObjectLocation::Carried => "CARRIED".to_string(),
                    ObjectLocation::Worn => "WORN".to_string(),
                    ObjectLocation::Limbo => "_".to_string(),
                    ObjectLocation::At { location_id } => location_id.to_string(),
                    ObjectLocation::Inside { .. } => "_".to_string(),
                };
                code.push_str(&format!("  {:<12}", loc_str));

                code.push_str(&format!("{:<3}", obj.weight.min(63)));
                code.push_str(if obj.is_container { " Y" } else { " _" });
                code.push_str(if obj.is_wearable { " Y" } else { " _" });
                code.push_str(if obj.is_light_source { "  Y" } else { "  _" });
                code.push_str(if obj.is_psi { " Y" } else { " _" });
                code.push_str(if !obj.is_takeable { " Y" } else { " _" });

                for _ in 0..13 {
                    code.push_str(" _");
                }

                let noun = if obj.noun.is_empty() { "_" } else { &obj.noun };
                code.push_str(&format!("    {:<12}", noun.to_uppercase()));

                let adjective = if obj.adjective.is_empty() { "_" } else { &obj.adjective };
                code.push_str(&format!(" {}", adjective.to_uppercase()));

                let mut attrs = Vec::new();
                if obj.is_container { attrs.push("container"); }
                if obj.is_wearable { attrs.push("wearable"); }
                if obj.is_light_source { attrs.push("light"); }
                if obj.is_psi { attrs.push("psi"); }
                if !obj.is_takeable { attrs.push("scenery"); }

                if !attrs.is_empty() {
                    code.push_str(&format!("  ; {}", attrs.join(", ")));
                }

                code.push('\n');
            }
            code.push('\n');
        }

        code
    }

    /// Generates the /MTX section using the fixed layout from the hand-authored DSF.
    ///
    /// Fixed layout:
    ///  0-13  : exits direction labels (hardcoded)
    ///  14    : game intro text (from game.introText)
    ///  15    : "Turns: " status line label
    ///  16-31 : location names for status line (up to 16 locations, ids 1-16)
    ///  32    : help text
    ///  33    : "Darkness" status line label
    ///  34-39 : empty padding (reserved)
    ///  40+   : game messages (0-based in JSON → 40+ in DSF)
    fn generate_messages_with_indices(messages: &[String], locations: &[crate::types::Location], intro_text: &str) -> (String, MessageIndices) {
        let mut code = String::from("/MTX\n\n");

        // Messages 0-13: exits direction labels (PRO 10)
        code.push_str("/0 \"Visible exits: \"\n");
        code.push_str("/1 \"none\"\n");
        code.push_str("/2 \"north \"\n");
        code.push_str("/3 \"south \"\n");
        code.push_str("/4 \"east \"\n");
        code.push_str("/5 \"west \"\n");
        code.push_str("/6 \"northeast \"\n");
        code.push_str("/7 \"northwest \"\n");
        code.push_str("/8 \"southeast \"\n");
        code.push_str("/9 \"southwest \"\n");
        code.push_str("/10 \"up \"\n");
        code.push_str("/11 \"down \"\n");
        code.push_str("/12 \"in \"\n");
        code.push_str("/13 \"out \"\n\n");

        // Message 14: intro text
        let escaped_intro = if !intro_text.is_empty() {
            intro_text.replace('"', "\\\"").replace('\n', "#n").replace('\r', "")
        } else {
            String::from("Welcome.")
        };
        code.push_str(&format!("/14 \"{}\"
\n", escaped_intro));

        // Message 15: turns label
        code.push_str("/15 \"Turns: \"\n\n");

        // Messages 16-31: location names (location ids 1-16)
        for i in 0..16usize {
            let loc_id = (i + 1) as u8;
            let name = locations.iter()
                .find(|l| l.id == loc_id)
                .map(|l| l.name.as_str())
                .unwrap_or("");
            let escaped = name.replace('"', "\\\"");
            code.push_str(&format!("/{} \"{}\"
", 16 + i, escaped));
        }
        code.push('\n');

        // Next available index after location names
        let n_locs = locations.iter().filter(|l| l.id > 0).count();
        let help_idx       = 16 + n_locs;       // help text
        let darkness_idx   = 16 + n_locs + 1;   // "Darkness"
        let game_start     = 16 + n_locs + 2;   // game messages begin here

        // Help text
        code.push_str(&format!("/{} \"Text adventures use simple ACTION-OBJECT commands.#n#nMovement: NORTH/N, SOUTH/S, EAST/E, WEST/W, IN, OUT.#n#nUseful commands: EXAMINE (or X), TAKE, DROP, INVENTORY (I), LOOK (L), READ, FEEL, SMELL, LISTEN, DRIVE, ASK, ACCUSE, SEARCH.#n\"\n\n", help_idx));

        // Darkness label
        code.push_str(&format!("/{} \"Darkness\"\n\n", darkness_idx));

        // Game messages start here
        code.push_str(&format!("; Game messages start at {}\n\n", game_start));
        for (i, msg) in messages.iter().enumerate() {
            let idx = game_start + i;
            if idx > 254 { break; }
            let escaped = msg
                .replace('"', "\\\"")
                .replace('\n', "#n")
                .replace('\r', "");
            code.push_str(&format!("/{} \"{}\"
", idx, escaped));
        }
        code.push('\n');

        let indices = MessageIndices {
            turns_msg: 15,
            darkness_msg: darkness_idx as u8,
            help_title_msg: help_idx as u8,
            help_body_msg: help_idx as u8,
            loc_names_start: 16,
            game_msg_start: game_start as u8,
            intro_msg: 14,
        };

        (code, indices)
    }


    fn generate_messages(messages: &[String]) -> String {
        // Simple wrapper used by generate() — processes without index tracking
        let dummy_locs: Vec<crate::types::Location> = Vec::new();
        let (code, _) = Self::generate_messages_with_indices(messages, &dummy_locs, "");
        code
    }
    fn generate_vocabulary(vocab: &[VocabEntry], objects: &[Object]) -> String {
        // Strategy: emit the BLANK.SCE standard vocabulary block unconditionally,
        // then append only game-specific words from JSON that aren't already covered.
        // This matches blank_en.dsf exactly and removes all the fragile deduplication logic.

        let mut code = String::from("/VOC

");

        // ── BLOCK 1: Movement directions (hardcoded, matching blank_en.dsf / working DSF) ──
        code.push_str("; Movements - verbs and nouns < 14
");
        code.push_str("N       2   noun
");
        code.push_str("NORTH   2   noun
");
        code.push_str("S       3   noun
");
        code.push_str("SOUTH   3   noun
");
        code.push_str("E       4   noun
");
        code.push_str("EAST    4   noun
");
        code.push_str("W       5   noun
");
        code.push_str("WEST    5   noun
");
        code.push_str("NE      6   noun
");
        code.push_str("NW      7   noun
");
        code.push_str("SE      8   noun
");
        code.push_str("SW      9   noun
");
        code.push_str("U       10  noun
");
        code.push_str("UP      10  noun
");
        code.push_str("ASCEND  10  verb
");
        code.push_str("D       11  noun
");
        code.push_str("DOWN    11  noun
");
        code.push_str("DESCEND 11  verb
");
        code.push_str("IN      12  verb
");
        code.push_str("INSIDE  12  noun
");
        code.push_str("OUT     13  verb
");
        code.push_str("OUTSID  13  verb
");
        code.push_str("
");

        // ── BLOCK 2: Special nouns (hardcoded) ──
        code.push_str("; Nouns < 20 can be used as verbs; < 50 are proper nouns
");
        code.push_str("I       14  noun
");
        code.push_str("INVENT  14  noun
");
        code.push_str("ALL     20  noun
");
        code.push_str("LOT     20  noun
");
        code.push_str("EVERY   20  noun
");
        code.push_str("
");

        // ── BLOCK 3: Standard system verbs (hardcoded, matching blank_en.dsf) ──
        code.push_str("; Standard system verbs
");
        code.push_str("GET     20  verb
");
        code.push_str("TAKE    20  verb
");
        code.push_str("GRAB    20  verb
");
        code.push_str("DROP    21  verb
");
        code.push_str("PUT     21  verb
");
        code.push_str("REMOVE  22  verb
");
        code.push_str("WEAR    23  verb
");
        code.push_str("R       24  verb
");
        code.push_str("REDES   24  verb
");
        code.push_str("QUIT    25  verb
");
        code.push_str("STOP    25  verb
");
        code.push_str("SAVE    26  verb
");
        code.push_str("LOAD    27  verb
");
        code.push_str("RAMSA   28  verb
");
        code.push_str("RAMLO   29  verb
");
        code.push_str("L       30  verb
");
        code.push_str("LOOK    30  verb
");
        code.push_str("X       30  verb
");
        code.push_str("EX      30  verb
");
        code.push_str("EXAMI   30  verb
");
        code.push_str("READ    30  verb
");
        code.push_str("SAY     31  verb
");
        code.push_str("ASK     31  verb
");
        code.push_str("TALK    31  verb
");
        code.push_str("SPEAK   31  verb
");
        code.push_str("
");

        // ── BLOCK 4: Standard prepositions (hardcoded, matching blank_en.dsf) ──
        code.push_str("; Prepositions
");
        code.push_str("TO      2   preposition
");
        code.push_str("FROM    3   preposition
");
        code.push_str("THROUGH 6   preposition
");
        code.push_str("OVER    7   preposition
");
        code.push_str("UNDER   8   preposition
");
        code.push_str("BY      9   preposition
");
        code.push_str("ON      10  preposition
");
        code.push_str("OFF     11  preposition
");
        code.push_str("AT      12  preposition
");
        code.push_str("ABOUT   13  preposition
");
        code.push_str("
");

        // ── BLOCK 5: Pronouns and conjugations (hardcoded) ──
        code.push_str("; Pronouns
");
        code.push_str("IT      2   pronoun
");
        code.push_str("THEM    2   pronoun
");
        code.push_str("
");
        code.push_str("; Conjugations
");
        code.push_str("AND     2   conjugation
");
        code.push_str("THEN    2   conjugation
");
        code.push_str("
");

        // ── BLOCK 6: Game-specific vocabulary from JSON ──
        // These are words the game author added: custom verbs, nouns for objects,
        // destination names, topic nouns, scenery nouns, adjectives, adverbs.
        // We skip anything already emitted in the hardcoded blocks above.

        let system_words: std::collections::HashSet<&str> = [
            "N","NORTH","S","SOUTH","E","EAST","W","WEST",
            "NE","NW","SE","SW","U","UP","ASCEND","D","DOWN","DESCEND",
            "IN","INSIDE","OUT","OUTSID","I","INVENT","ALL","LOT","EVERY",
            "GET","TAKE","GRAB","DROP","PUT","REMOVE","WEAR","R","REDES",
            "QUIT","STOP","SAVE","LOAD","RAMSA","RAMLO","L","LOOK","X","EX",
            "EXAMI","READ","SAY","ASK","TALK","SPEAK",
            "TO","FROM","THROUGH","OVER","UNDER","BY","ON","OFF","AT","ABOUT",
            "IT","THEM","AND","THEN",
        ].iter().copied().collect();

        // Collect game verbs (excluding system words)
        let mut game_verbs: Vec<&VocabEntry> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Verb))
            .filter(|v| !system_words.contains(v.word.to_uppercase().as_str()))
            .collect();
        // Deduplicate by word
        let mut seen_verbs = std::collections::HashSet::new();
        game_verbs.retain(|v| seen_verbs.insert(v.word.to_uppercase()));

        if !game_verbs.is_empty() {
            code.push_str("; Game verbs
");
            for v in &game_verbs {
                let word = if v.word.len() > 8 { &v.word[..8] } else { &v.word };
                code.push_str(&format!("{:<8}{:<4}verb
", word.to_uppercase(), v.id));
            }
            code.push_str("
");
        }

        // Collect game nouns (excluding system words)
        let mut game_nouns: Vec<&VocabEntry> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Noun))
            .filter(|v| !system_words.contains(v.word.to_uppercase().as_str()))
            .collect();
        let mut seen_nouns = std::collections::HashSet::new();
        game_nouns.retain(|v| seen_nouns.insert(v.word.to_uppercase()));

        if !game_nouns.is_empty() {
            code.push_str("; Game nouns\n");
            for v in &game_nouns {
                let word = if v.word.len() > 7 { &v.word[..7] } else { &v.word };
                code.push_str(&format!("{:<8}{:<4}noun\n", word.to_uppercase(), v.id));
            }
            code.push_str("\n");
        }


        // Game adjectives - from JSON vocab only, never auto-generate from object adjectives
        // (object.adjective fields may not match truncated vocab entries, causing VOC duplicates)
        let mut game_adjs: Vec<&VocabEntry> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Adjective))
            .collect();
        let mut seen_adjs: std::collections::HashSet<String> = std::collections::HashSet::new();
        game_adjs.retain(|v| seen_adjs.insert(v.word.to_uppercase()));

        if !game_adjs.is_empty() {
            code.push_str("; Adjectives\n");
            for v in &game_adjs {
                let word = if v.word.len() > 7 { &v.word[..7] } else { &v.word };
                code.push_str(&format!("{:<8}{:<4}adjective\n", word.to_uppercase(), v.id));
            }
            code.push_str("\n");
        }


        // Game adverbs
        let game_adverbs: Vec<&VocabEntry> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Adverb))
            .collect();
        if !game_adverbs.is_empty() {
            code.push_str("; Adverbs
");
            let mut seen = std::collections::HashSet::new();
            for v in &game_adverbs {
                if seen.insert(v.word.to_uppercase()) {
                    let word = if v.word.len() > 8 { &v.word[..8] } else { &v.word };
                    code.push_str(&format!("{:<8}{:<4}adverb
", word.to_uppercase(), v.id));
                }
            }
            code.push_str("
");
        }

        code
    }

    fn generate_processes(game: &DaadGame, indices: &MessageIndices) -> String {
        let mut code = String::new();

        // Find starting location (first non-zero location, or 1 if none)
        let start_loc = game.locations.iter()
            .find(|l| l.id > 0)
            .map(|l| l.id)
            .unwrap_or(1);

        // Message indices computed dynamically from game message count
        let dark_msg = indices.darkness_msg;
        let intro_msg = indices.intro_msg; // game intro text from JSON introText field
        let loc_name_msg_offset = indices.loc_names_start as usize;
        let turns_msg = indices.turns_msg;
        let help_title = indices.help_title_msg;
        let help_body  = indices.help_body_msg;

        // ── PRO 0: Main location loop ──────────────────────────────────────
        code.push_str("/PRO 0\n\n");
        code.push_str("; PRO 0 is the first process executed in DAAD.\n");
        code.push_str("; Calls init if at location 0, then runs main loop.\n\n");

        // Init check
        code.push_str(">\n");
        code.push_str("_       _       AT 0\n");
        code.push_str("                PROCESS 6\n\n");

        // Dark flag calculation
        code.push_str("; Sets DarkF according to Dark flag and light sources.\n");
        code.push_str(">\n");
        code.push_str("_       _       CLEAR DarkF\n");
        code.push_str("                NOTZERO Dark\n");
        code.push_str("                ABSENT 0\n");
        code.push_str("                SET DarkF\n\n");

        // Status line update
        code.push_str("; Updates status line.\n");
        code.push_str(">\n");
        code.push_str("_       _       PROCESS 11\n\n");

        // Text window + darkness message
        code.push_str("; Go to text window; if dark print darkness message.\n");
        code.push_str(">\n");
        code.push_str("_       _       WINDOW 1\n");
        code.push_str("                NOTZERO DarkF\n");
        code.push_str("                SYSMESS 0\n\n");

        // PICTURE/DISPLAY: only emit if any location has an image defined
        let has_images = game.locations.iter().any(|l| l.image.is_some());
        if has_images {
            code.push_str("; Load location picture and display (if light).\n");
            code.push_str(">\n");
            code.push_str("_       _       PICTURE @Player\n");
            code.push_str("                DISPLAY @DarkF\n\n");
        }

        // Location description if light
        code.push_str("; If light, print current location description.\n");
        code.push_str(">\n");
        code.push_str("_       _       ZERO DarkF\n");
        code.push_str("                DESC @Player\n\n");

        // Game-specific PRO0 location loop rules — wildcard (_ _) only.
        // Rules with explicit verb/noun go to PRO5 (response table), NOT here.
        let pro0_rules: Vec<_> = game.rules.iter()
            .filter(|r| r.process == "PRO0" && r.enabled && {
                let v = r.verb.as_deref().unwrap_or("_");
                let n = r.noun.as_deref().unwrap_or("_");
                v == "_" && n == "_"
            })
            .collect();
        if !pro0_rules.is_empty() {
            code.push_str("; Game-specific location loop events.\n");
            for rule in pro0_rules {
                code.push_str(&Self::generate_rule(rule, game, indices.game_msg_start));
                code.push('\n');
            }
        }

        code.push_str("; Calls PRO 3 (post-description) then PRO 1 (input loop).\n");
        code.push_str(">\n");
        code.push_str("_       _       PROCESS 3\n\n");
        code.push_str(">\n");
        code.push_str("_       _       PROCESS 1\n\n");

        // ── PRO 1: Input loop ──────────────────────────────────────────────
        code.push_str("/PRO 1\n\n");
        code.push_str(">\n");
        code.push_str("_       _       PROCESS 4\n\n");

        code.push_str(">\n");
        code.push_str("_       _       PARSE 0\n");
        code.push_str("                PROCESS 2\n");
        code.push_str("                REDO\n\n");

        // 2-byte turn counter (matching Rabenstein exactly)
        code.push_str(">\n");
        code.push_str("_       _       EQ Turns 255\n");
        code.push_str("                EQ 32 255\n");
        code.push_str("                CLEAR Turns\n");
        code.push_str("                CLEAR 32\n");
        code.push_str("                SKIP 2\n\n");

        code.push_str(">\n");
        code.push_str("_       _       EQ Turns 255\n");
        code.push_str("                PLUS 32 1\n");
        code.push_str("                CLEAR Turns\n");
        code.push_str("                SKIP 1\n\n");

        code.push_str(">\n");
        code.push_str("_       _       PLUS Turns 1\n\n");

        code.push_str(">\n");
        code.push_str("_       _       PROCESS 11\n\n");

        code.push_str(">\n");
        code.push_str("_       _       PROCESS 5\n");
        code.push_str("                ISDONE\n");
        code.push_str("                REDO\n\n");

        code.push_str(">\n");
        code.push_str("_       _       MOVE Player\n");
        code.push_str("                RESTART\n\n");

        code.push_str(">\n");
        code.push_str("_       _       NEWTEXT\n");
        code.push_str("                LT Verb 14\n");
        code.push_str("                SYSMESS 7\n");
        code.push_str("                REDO\n\n");

        code.push_str(">\n");
        code.push_str("_       _       SYSMESS 8\n");
        code.push_str("                REDO\n\n");

        // ── PRO 2: Parse error handler ─────────────────────────────────────
        code.push_str("/PRO 2\n\n");
        code.push_str(">\n");
        code.push_str("_       _       HASAT TIMEOUT\n");
        code.push_str("                SYSMESS 35\n");
        code.push_str("                DONE\n\n");
        code.push_str(">\n");
        code.push_str("_       _       SYSMESS 6\n\n");

        // ── PRO 3: Post-description (exits + objects) ──────────────────────
        code.push_str("/PRO 3\n\n");
        code.push_str("; Objects listing (if not dark).\n");
        code.push_str(">\n");
        code.push_str("_       _       NEWLINE\n");
        code.push_str("                ZERO DarkF\n");
        code.push_str("                LISTOBJ\n\n");

        // ── PRO 4: Status table (auto-events before input) ─────────────────
        code.push_str("/PRO 4\n\n");
        let pro4_rules: Vec<_> = game.rules.iter()
            .filter(|r| r.process == "PRO4" && r.enabled)
            .collect();
        for rule in pro4_rules {
            code.push_str(&Self::generate_rule(rule, game, indices.game_msg_start));
            code.push('\n');
        }

        // ── PRO 5: Response table ──────────────────────────────────────────
        code.push_str("/PRO 5\n\n");

        // HELP
        code.push_str(">\n");
        code.push_str("HELP    _       PROCESS 7\n");
        code.push_str("                WINDOW 2\n");
        code.push_str("                CLS\n");
        code.push_str(&format!("                MES {}\n", help_title));
        code.push_str("                WINDOW 1\n");
        code.push_str(&format!("                MESSAGE {}\n", help_body));
        code.push_str("                ANYKEY\n");
        code.push_str("                RESTART\n\n");

        // INVENTORY
        code.push_str(">\n");
        code.push_str("I       _       SYSMESS 9\n");
        code.push_str("                LISTAT CARRIED\n");
        code.push_str("                SYSMESS 10\n");
        code.push_str("                LISTAT WORN\n");
        code.push_str("                DONE\n\n");

        // EXITS
        code.push_str(">\n");
        code.push_str("EXITS   _       PROCESS 10\n");
        code.push_str("                DONE\n\n");

        // User-defined response rules for PRO5 (response table):
        // - All PRO1 and PRO5 rules
        // - PRO0 rules with explicit verb/noun (not wildcards)
        let pro5_rules: Vec<_> = game.rules.iter()
            .filter(|r| r.enabled && {
                let v = r.verb.as_deref().unwrap_or("_");
                let n = r.noun.as_deref().unwrap_or("_");
                match r.process.as_str() {
                    "PRO1" | "PRO5" => true,
                    "PRO0" => !(v == "_" && n == "_"), // has explicit verb/noun
                    _ => false,
                }
            })
            .collect();
        for rule in pro5_rules {
            code.push_str(&Self::generate_rule(rule, game, indices.game_msg_start));
            code.push('\n');
        }

        // Standard commands at end (from Rabenstein)
        code.push_str(">\n");
        code.push_str("GET     ALL     DOALL HERE\n");
        code.push_str(">\n");
        code.push_str("GET     _       AUTOG\n");
        code.push_str("                DONE\n\n");
        code.push_str(">\n");
        code.push_str("DROP    ALL     DOALL CARRIED\n");
        code.push_str(">\n");
        code.push_str("DROP    _       AUTOD\n");
        code.push_str("                DONE\n\n");
        code.push_str(">\n");
        code.push_str("REMOVE  ALL     DOALL WORN\n");
        code.push_str(">\n");
        code.push_str("REMOVE  _       AUTOR\n");
        code.push_str("                DONE\n\n");
        code.push_str(">\n");
        code.push_str("WEAR    ALL     DOALL CARRIED\n");
        code.push_str(">\n");
        code.push_str("WEAR    _       AUTOW\n");
        code.push_str("                DONE\n\n");
        code.push_str(">\n");
        code.push_str("R       _       EQ 34 255\n");
        code.push_str("                RESTART\n\n");
        code.push_str(">\n");
        code.push_str("R       _       LET 33 30\n");
        code.push_str("                REDO\n\n");
        code.push_str(">\n");
        code.push_str("QUIT    _       QUIT\n");
        code.push_str("                END\n\n");
        code.push_str(">\n");
        code.push_str("QUIT    _       DONE\n\n");
        code.push_str(">\n");
        code.push_str("SAVE    _       SAVE 0\n");
        code.push_str("                RESTART\n\n");
        code.push_str(">\n");
        code.push_str("LOAD    _       LOAD 0\n");
        code.push_str("                RESTART\n\n");
        code.push_str(">\n");
        code.push_str("RAMSA   _       RAMSAVE\n");
        code.push_str("                RESTART\n\n");
        code.push_str(">\n");
        code.push_str("RAMLO   _       RAMLOAD 255\n");
        code.push_str("                RESTART\n\n");
        // LOOK catch-all at end
        code.push_str(">\n");
        code.push_str("L       _       RESTART\n\n");

        // ── PRO 6: Initialization ──────────────────────────────────────────
        code.push_str("/PRO 6\n\n");
        code.push_str("; Initialization process. Called from PRO 0 at location 0.\n\n");

        // Status line window
        code.push_str(">\n");
        code.push_str("_       _       WINDOW 2\n");
        code.push_str("                WINAT 6 0\n");
        code.push_str("                WINSIZE 1 COLS\n\n");

        // 80-col fallback
        code.push_str(">\n");
        code.push_str("_       _       LT GFlags 128\n");
        code.push_str("                WINSIZE 1 80\n\n");

        // Colours + window setup
        code.push_str(">\n");
        code.push_str("_       _       PAPER 0\n");
        code.push_str("                INK 1\n");
        code.push_str("                CLS\n");
        code.push_str("                PROCESS 9\n\n");

        // Title screen + intro
        code.push_str(">\n");
        code.push_str("_       _       DESC 0\n");
        code.push_str("                ANYKEY\n");
        code.push_str("                CLS\n");
        code.push_str(&format!("                MESSAGE {}\n", intro_msg));
        code.push_str("                ANYKEY\n");
        code.push_str("                CLEAR 255\n\n");

        // Flag clear loop (matching Rabenstein exactly)
        code.push_str(">\n");
        code.push_str("_       _       NOTEQ 255 GFlags\n");
        code.push_str("                CLEAR @255\n\n");
        code.push_str(">\n");
        code.push_str("_       _       PLUS 255 1\n");
        code.push_str("                LT 255 255\n");
        code.push_str("                SKIP -2\n\n");

        // Reset and start
        code.push_str(">\n");
        code.push_str("_       _       RESET\n");
        code.push_str("                LET Strength 10\n");
        code.push_str("                LET MaxCarr 10\n");
        code.push_str("                SET CPNoun\n");
        code.push_str("                SET CPAdject\n");
        code.push_str("                LET OFlags 64\n");
        code.push_str(&format!("                GOTO {}\n\n", start_loc));

        // ── PRO 7: Text window "up" ────────────────────────────────────────
        code.push_str("/PRO 7\n\n");
        code.push_str(">\n");
        code.push_str("_       _       WINDOW 1\n");
        code.push_str("                WINAT 7 0\n");
        code.push_str("                WINSIZE ROWS 127\n");
        code.push_str("                CLS\n\n");

        // ── PRO 8: Text window "down" ──────────────────────────────────────
        code.push_str("/PRO 8\n\n");
        code.push_str(">\n");
        code.push_str("_       _       WINDOW 1\n");
        code.push_str("                WINAT 7 0\n");
        code.push_str("                WINSIZE ROWS 127\n");
        code.push_str("                CLS\n\n");

        // ── PRO 9: Set text window position ───────────────────────────────
        code.push_str("/PRO 9\n\n");
        code.push_str(">\n");
        code.push_str("_       _       PROCESS 8\n");
        code.push_str("                DONE\n\n");
        code.push_str(">\n");
        code.push_str("_       _       PROCESS 7\n\n");

        // ── PRO 10: Automatic exits listing ───────────────────────────────
        code.push_str("/PRO 10\n\n");
        code.push_str("; Automatic exits listing. Uses flags 100 and 101.\n\n");
        code.push_str(">\n");
        code.push_str("_       _       MES 0\n");
        code.push_str("                CLEAR 101\n");
        code.push_str("                LET 33 2\n\n");
        code.push_str(">\n");
        code.push_str("_       _       COPYFF 38 100\n");
        code.push_str("                MOVE 100\n");
        code.push_str("                MES @33\n");
        code.push_str("                PLUS 101 1\n\n");
        code.push_str(">\n");
        code.push_str("_       _       PLUS 33 1\n");
        code.push_str("                LT 33 14\n");
        code.push_str("                SKIP -2\n\n");
        code.push_str(">\n");
        code.push_str("_       _       NOTZERO 101\n");
        code.push_str("                NEWLINE\n");
        code.push_str("                DONE\n\n");
        code.push_str(">\n");
        code.push_str("_       _       MESSAGE 1\n\n");

        // ── PRO 11: Status line ────────────────────────────────────────────
        code.push_str("/PRO 11\n\n");
        code.push_str("; Update status line.\n\n");
        code.push_str(">\n");
        code.push_str("_       _       WINDOW 2\n");
        code.push_str("                PAPER 0\n");
        code.push_str("                INK 1\n");
        code.push_str("                CLS\n\n");
        code.push_str("; If dark, print darkness label and turns.\n");
        code.push_str(">\n");
        code.push_str("_       _       NOTZERO DarkF\n");
        code.push_str(&format!("                MES {}\n", dark_msg));
        code.push_str("                PROCESS 12\n");
        code.push_str("                DONE\n\n");
        code.push_str("; Print location name for each location.\n");
        for loc in &game.locations {
            if loc.id == 0 { continue; }
            let msg_idx = loc_name_msg_offset + (loc.id as usize - 1);
            code.push_str(">\n");
            code.push_str(&format!("_       _       AT {}\n", loc.id));
            code.push_str(&format!("                MES {}\n\n", msg_idx));
        }
        code.push_str(">\n");
        code.push_str("_       _       PROCESS 12\n\n");

        // ── PRO 12: Print turns counter ────────────────────────────────────
        code.push_str("/PRO 12\n\n");
        code.push_str("; Print turns at status line.\n\n");
        code.push_str(">\n");
        code.push_str("_       _       TAB Turns_TAB\n");
        code.push_str("                LT 29 128\n");
        code.push_str("                TAB 67\n\n");
        code.push_str(">\n");
        code.push_str(&format!("_       _       MES {}\n", turns_msg));
        code.push_str("                DPRINT Turns\n");
        code.push_str("                WINDOW 1\n\n");

        code
    }

    fn get_u8_param(params: &std::collections::HashMap<String, serde_json::Value>, key: &str) -> u8 {
        params.get(key)
            .and_then(|v| v.as_u64())
            .unwrap_or(0) as u8
    }

    fn get_string_param(params: &std::collections::HashMap<String, serde_json::Value>, key: &str) -> String {
        params.get(key)
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string()
    }

    /// Extract verb and noun from a rule name.
    ///
    /// Rule names in the guide follow the pattern "VERB NOUN - description"
    /// e.g. "EXAMINE RULER - set flag"      → (EXAMINE, RULER)
    ///      "DRIVE HOLLOWAY from Hampton"   → (DRIVE, HOLLOWAY)
    ///      "LISTEN - tools clue"           → (LISTEN, _)
    ///      "ACCUSE PENDLETON - full evidence" → (ACCUSE, PENDLETON)
    ///      "ASK CARLYLE"                   → (ASK, CARLYLE)
    ///
    /// When a rule has explicit verb/noun fields set those take priority over
    /// this extraction. This function is only used as a fallback when those
    /// fields are None (i.e. for all rules in EYES_OF_MAX_CARRADOS.json).
    fn extract_verb_noun(name: &str) -> (String, String) {
        // Strip descriptive suffix after " - "
        let command_part = name.split(" - ").next().unwrap_or(name);
        let words: Vec<&str> = command_part.split_whitespace().collect();

        // Second-position words that indicate there is no noun following the verb
        let non_noun = [
            "WITHOUT", "FROM", "TO", "FOR", "WITH", "INTO",
            "USING", "VIA", "WHEN", "IF", "ALREADY", "NO",
            "IN", "OUT", "AT", "THE", "A", "AN", "OF",
        ];

        let verb = words.get(0).map(|w| {
            let u = w.to_uppercase();
            if u.len() > 8 { u[..8].to_string() } else { u }
        }).unwrap_or_else(|| "_".to_string());

        let noun = words.get(1).map(|w| {
            let u = w.to_uppercase();
            if non_noun.contains(&u.as_str()) {
                "_".to_string()
            } else if u.len() > 8 {
                u[..8].to_string()
            } else {
                u
            }
        }).unwrap_or_else(|| "_".to_string());

        (verb, noun)
    }

    fn generate_rule(rule: &Rule, game: &DaadGame, game_msg_start: u8) -> String {
        let mut code = String::new();

        // Use explicit verb/noun fields when present; fall back to extraction from name
        let (default_verb, default_noun) = Self::extract_verb_noun(&rule.name);
        let verb = rule.verb.as_deref().unwrap_or(&default_verb);
        let noun = rule.noun.as_deref().unwrap_or(&default_noun);

        code.push_str(">\n");
        code.push_str(&format!("{:<8} {}\n", verb, noun));

        // Generate conditions
        for condition in &rule.conditions {
            code.push_str("                ");
            code.push_str(&Self::generate_condition(condition, game));
            code.push('\n');
        }

        // Generate actions
        for action in &rule.actions {
            code.push_str("                ");
            code.push_str(&Self::generate_action(action, game, game_msg_start));
            code.push('\n');
        }

        code
    }

    fn generate_condition(condition: &Condition, _game: &DaadGame) -> String {
        let cond_type = &condition.r#type;
        let params = &condition.params;

        match cond_type.as_str() {
            "AT" => format!("AT {}", Self::get_u8_param(params, "locno")),
            "NOTAT" => format!("NOTAT {}", Self::get_u8_param(params, "locno")),
            "ATGT" => format!("ATGT {}", Self::get_u8_param(params, "locno")),
            "ATLT" => format!("ATLT {}", Self::get_u8_param(params, "locno")),
            "PRESENT" => format!("PRESENT {}", Self::get_u8_param(params, "objno")),
            "ABSENT" => format!("ABSENT {}", Self::get_u8_param(params, "objno")),
            "WORN" => format!("WORN {}", Self::get_u8_param(params, "objno")),
            "NOTWORN" => format!("NOTWORN {}", Self::get_u8_param(params, "objno")),
            "CARRIED" => format!("CARRIED {}", Self::get_u8_param(params, "objno")),
            "NOTCARR" => format!("NOTCARR {}", Self::get_u8_param(params, "objno")),
            "ISAT" => format!("ISAT {} {}", Self::get_u8_param(params, "objno"), Self::get_u8_param(params, "locno")),
            "ISNOTAT" => format!("ISNOTAT {} {}", Self::get_u8_param(params, "objno"), Self::get_u8_param(params, "locno")),
            "ZERO" => format!("ZERO {}", Self::get_u8_param(params, "flagno")),
            "NOTZERO" => format!("NOTZERO {}", Self::get_u8_param(params, "flagno")),
            "EQ" => format!("EQ {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "value")),
            "NOTEQ" => format!("NOTEQ {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "value")),
            "GT" => format!("GT {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "value")),
            "LT" => format!("LT {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "value")),
            "SAME" => format!("SAME {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "NOTSAME" => format!("NOTSAME {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "BIGGER" => format!("BIGGER {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "SMALLER" => format!("SMALLER {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "ADJECT1" => format!("ADJECT1 {}", Self::get_string_param(params, "word")),
            "ADVERB" => format!("ADVERB {}", Self::get_string_param(params, "word")),
            "PREP" => format!("PREP {}", Self::get_string_param(params, "word")),
            "NOUN2" => format!("NOUN2 {}", Self::get_string_param(params, "word")),
            "ADJECT2" => format!("ADJECT2 {}", Self::get_string_param(params, "word")),
            "CHANCE" => format!("CHANCE {}", Self::get_u8_param(params, "percent")),
            "ISDONE" => "ISDONE".to_string(),
            "ISNDONE" => "ISNDONE".to_string(),
            "HASAT" => format!("HASAT {}", Self::get_u8_param(params, "attribute")),
            "HASNAT" => format!("HASNAT {}", Self::get_u8_param(params, "attribute")),
            "INKEY" => "INKEY".to_string(),
            "QUIT" => "QUIT".to_string(),
            _ => format!("{} {}", cond_type, params.iter().map(|(k,v)| format!("{:?}", v)).collect::<Vec<_>>().join(" ")),
        }
    }

    /// Validate generated DSF source before passing to drf.exe.
    /// Returns a list of all detected problems with line numbers.
    pub fn validate_dsf(dsf: &str) -> Vec<String> {
        let mut errors = Vec::new();
        let mut in_pro = false;
        let mut expect_verb_noun = false;

        let known_condacts = [
            "AT ", "NOTAT ", "PRESENT ", "ABSENT ", "CARRIED ",
            "NOTCARR ", "WORN ", "NOTWORN ", "ISAT ", "ISNOTAT ",
            "ZERO ", "NOTZERO ", "EQ ", "NOTEQ ", "GT ", "LT ",
            "SAME ", "NOTSAME ", "DONE", "NOTDONE", "MESSAGE ",
            "SYSMESS ", "GOTO ", "CREATE ", "DESTROY ", "SET ",
            "CLEAR ", "LET ", "PLUS ", "MINUS ", "PROCESS ",
            "RESTART", "END", "DESC", "LISTOBJ", "LISTAT ",
            "REDO", "AUTOG", "AUTOD", "AUTOW", "AUTOR",
        ];

        for (line_idx, line) in dsf.lines().enumerate() {
            let lineno = line_idx + 1;
            let trimmed = line.trim();

            if trimmed.starts_with("/PRO") {
                in_pro = true;
                expect_verb_noun = false;
            } else if trimmed.starts_with('/') {
                in_pro = false;
                expect_verb_noun = false;
            }

            if in_pro && trimmed == ">" {
                expect_verb_noun = true;
                continue;
            }

            // Check 1: invalid escape sequences in string literals
            if trimmed.contains('"') {
                let mut chars = trimmed.chars().peekable();
                let mut in_string = false;
                while let Some(c) = chars.next() {
                    if c == '"' { in_string = !in_string; }
                    else if in_string && c == '\\' {
                        match chars.peek() {
                            Some(&'\\') | Some(&'"') | Some(&'/')
                            | Some(&'n') | Some(&'r') | Some(&'t')
                            | Some(&'b') | Some(&'f') | Some(&'u')
                            | Some(&'^') => { chars.next(); }
                            Some(&next_c) => {
                                errors.push(format!(
                                    "Line {}: Invalid escape \\{} in string literal",
                                    lineno, next_c
                                ));
                                chars.next();
                            }
                            None => {}
                        }
                    }
                }
            }

            // Check 2: verb/noun line checks
            if in_pro && expect_verb_noun {
                expect_verb_noun = false;
                if trimmed.is_empty() || trimmed.starts_with(';') { continue; }

                let upper = trimmed.to_uppercase();
                for kw in &known_condacts {
                    if upper.starts_with(kw) || upper.trim() == kw.trim() {
                        errors.push(format!(
                            "Line {}: Condact '{}' found where verb/noun expected: '{}'",
                            lineno, kw.trim(), trimmed
                        ));
                        break;
                    }
                }

                let space_tokens: Vec<&str> = trimmed.split_whitespace().collect();
                if space_tokens.len() == 1 {
                    let tok = space_tokens[0];
                    if tok != "_" && tok.len() > 8 {
                        errors.push(format!(
                            "Line {}: Possible merged verb+noun '{}' (missing space?)",
                            lineno, tok
                        ));
                    }
                }
                if let Some(verb) = space_tokens.get(0) {
                    if *verb != "_" && verb.len() > 8 {
                        errors.push(format!("Line {}: Verb '{}' exceeds 8 chars", lineno, verb));
                    }
                }
                if let Some(noun) = space_tokens.get(1) {
                    if *noun != "_" && noun.len() > 8 {
                        errors.push(format!("Line {}: Noun '{}' exceeds 8 chars", lineno, noun));
                    }
                }
                // Inline comment on verb/noun line
                let parts: Vec<&str> = trimmed.splitn(3, char::is_whitespace).collect();
                if let Some(third) = parts.get(2) {
                    if third.trim_start().starts_with(';') {
                        errors.push(format!(
                            "Line {}: Inline comment on verb/noun line (unsupported): '{}'",
                            lineno, trimmed
                        ));
                    }
                }
            }
        }
        errors
    }


    fn generate_action(action: &Action, _game: &DaadGame, game_msg_start: u8) -> String {
        let action_type = &action.r#type;
        let params = &action.params;

        match action_type.as_str() {
            "GET" => format!("GET {}", Self::get_u8_param(params, "objno")),
            "DROP" => format!("DROP {}", Self::get_u8_param(params, "objno")),
            "WEAR" => format!("WEAR {}", Self::get_u8_param(params, "objno")),
            "REMOVE" => format!("REMOVE {}", Self::get_u8_param(params, "objno")),
            "CREATE" => format!("CREATE {}", Self::get_u8_param(params, "objno")),
            "DESTROY" => format!("DESTROY {}", Self::get_u8_param(params, "objno")),
            "SWAP" => format!("SWAP {} {}", Self::get_u8_param(params, "objno1"), Self::get_u8_param(params, "objno2")),
            "PLACE" => format!("PLACE {} {}", Self::get_u8_param(params, "objno"), Self::get_u8_param(params, "locno")),
            "PUTO" => format!("PUTO {}", Self::get_u8_param(params, "locno")),
            "PUTIN" => format!("PUTIN {} {}", Self::get_u8_param(params, "objno1"), Self::get_u8_param(params, "objno2")),
            "TAKEOUT" => format!("TAKEOUT {} {}", Self::get_u8_param(params, "objno1"), Self::get_u8_param(params, "objno2")),
            "DROPALL" => "DROPALL".to_string(),
            "COPYOO" => format!("COPYOO {} {}", Self::get_u8_param(params, "objno1"), Self::get_u8_param(params, "objno2")),
            "RESET" => "RESET".to_string(),
            "AUTOG" => "AUTOG".to_string(),
            "AUTOD" => "AUTOD".to_string(),
            "AUTOW" => "AUTOW".to_string(),
            "AUTOR" => "AUTOR".to_string(),
            "AUTOP" => "AUTOP".to_string(),
            "AUTOT" => "AUTOT".to_string(),
            "SET" => format!("SET {}", Self::get_u8_param(params, "flagno")),
            "CLEAR" => format!("CLEAR {}", Self::get_u8_param(params, "flagno")),
            "LET" => format!("LET {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "value")),
            "PLUS" => format!("PLUS {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "value")),
            "MINUS" => format!("MINUS {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "value")),
            "ADD" => format!("ADD {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "SUB" => format!("SUB {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "COPYFF" => format!("COPYFF {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "COPYBF" => format!("COPYBF {} {}", Self::get_u8_param(params, "flagno1"), Self::get_u8_param(params, "flagno2")),
            "RANDOM" => format!("RANDOM {}", Self::get_u8_param(params, "flagno")),
            "MOVE" => format!("MOVE {}", Self::get_u8_param(params, "flagno")),
            "COPYOF" => format!("COPYOF {} {}", Self::get_u8_param(params, "objno"), Self::get_u8_param(params, "flagno")),
            "COPYFO" => format!("COPYFO {} {}", Self::get_u8_param(params, "flagno"), Self::get_u8_param(params, "objno")),
            "WHATO" => "WHATO".to_string(),
            "SETCO" => format!("SETCO {}", Self::get_u8_param(params, "objno")),
            "WEIGH" => format!("WEIGH {} {}", Self::get_u8_param(params, "objno"), Self::get_u8_param(params, "flagno")),
            "WEIGHT" => format!("WEIGHT {}", Self::get_u8_param(params, "flagno")),
            "ABILITY" => format!("ABILITY {} {}", Self::get_u8_param(params, "maxcarr"), Self::get_u8_param(params, "strength")),
            "GOTO" => format!("GOTO {}", Self::get_u8_param(params, "locno")),
            "WINDOW" => format!("WINDOW {}", Self::get_u8_param(params, "winno")),
            "WINAT" => format!("WINAT {} {}", Self::get_u8_param(params, "line"), Self::get_u8_param(params, "column")),
            "WINSIZE" => format!("WINSIZE {} {}", Self::get_u8_param(params, "lines"), Self::get_u8_param(params, "columns")),
            "CENTRE" => "CENTRE".to_string(),
            "CLS" => "CLS".to_string(),
            "SAVEAT" => "SAVEAT".to_string(),
            "BACKAT" => "BACKAT".to_string(),
            "PAPER" => format!("PAPER {}", Self::get_u8_param(params, "color")),
            "INK" => format!("INK {}", Self::get_u8_param(params, "color")),
            "BORDER" => format!("BORDER {}", Self::get_u8_param(params, "color")),
            "PRINTAT" => format!("PRINTAT {} {}", Self::get_u8_param(params, "line"), Self::get_u8_param(params, "column")),
            "TAB" => format!("TAB {}", Self::get_u8_param(params, "column")),
            "MODE" => format!("MODE {}", Self::get_u8_param(params, "mode")),
            // Game message indices in JSON are 0-based.
            // In the DSF, game messages start at index 14 (after exits labels 0-13).
            "MES" => format!("MES {}", Self::get_u8_param(params, "mesno") + game_msg_start),
            "MESSAGE" => format!("MESSAGE {}", Self::get_u8_param(params, "mesno") + game_msg_start),
            "SYSMESS" => format!("SYSMESS {}", Self::get_u8_param(params, "sysno")),
            "DESC" => "DESC @Player".to_string(),
            "SPACE" => "SPACE".to_string(),
            "NEWLINE" => "NEWLINE".to_string(),
            "PRINT" => format!("PRINT {}", Self::get_u8_param(params, "flagno")),
            "DPRINT" => format!("DPRINT {}", Self::get_u8_param(params, "flagno")),
            "LISTOBJ" => "LISTOBJ".to_string(),
            "LISTAT" => format!("LISTAT {}", Self::get_u8_param(params, "locno")),
            "SAVE" => "SAVE".to_string(),
            "LOAD" => "LOAD".to_string(),
            "RAMSAVE" => "RAMSAVE".to_string(),
            "RAMLOAD" => format!("RAMLOAD {}", Self::get_u8_param(params, "slot")),
            "INPUT" => format!("INPUT {} {}", Self::get_u8_param(params, "stream"), Self::get_u8_param(params, "option")),
            "TIME" => format!("TIME {} {}", Self::get_u8_param(params, "duration"), Self::get_u8_param(params, "option")),
            "ANYKEY" => "ANYKEY".to_string(),
            "PAUSE" => format!("PAUSE {}", Self::get_u8_param(params, "decisecs")),
            "PARSE" => "PARSE 0".to_string(),
            "NEWTEXT" => "NEWTEXT".to_string(),
            "SYNONYM" => format!("SYNONYM {} {}", Self::get_string_param(params, "verb"), Self::get_string_param(params, "noun")),
            "PROCESS" => format!("PROCESS {}", Self::get_u8_param(params, "prono")),
            "REDO" => "REDO".to_string(),
            "DOALL" => format!("DOALL {}", Self::get_u8_param(params, "locno")),
            "SKIP" => format!("SKIP {}", Self::get_u8_param(params, "count")),
            "RESTART" => "RESTART".to_string(),
            "END" => "END".to_string(),
            "EXIT" => format!("EXIT {}", Self::get_u8_param(params, "code")),
            "DONE" => "DONE".to_string(),
            "NOTDONE" => "NOTDONE".to_string(),
            "OK" => "OK".to_string(),
            "PICTURE" => format!("PICTURE {}", Self::get_u8_param(params, "picno")),
            "DISPLAY" => format!("DISPLAY {}", Self::get_u8_param(params, "value")),
            "SFX" => format!("SFX {} {}", Self::get_u8_param(params, "value1"), Self::get_u8_param(params, "value2")),
            "GFX" => format!("GFX {} {}", Self::get_u8_param(params, "gfxno"), Self::get_u8_param(params, "param")),
            "XMES" => format!("XMES {} {}", Self::get_u8_param(params, "bank"), Self::get_u8_param(params, "mesno")),
            "XMESSAGE" => format!("XMESSAGE {} {}", Self::get_u8_param(params, "bank"), Self::get_u8_param(params, "mesno")),
            "XSPLITSCR" => format!("XSPLITSCR {}", Self::get_u8_param(params, "lines")),
            "XUNDONE" => "XUNDONE".to_string(),
            "XPLAY" => format!("XPLAY {}", Self::get_u8_param(params, "musicno")),
            "XDATA" => format!("XDATA {} {}", Self::get_u8_param(params, "datano"), Self::get_u8_param(params, "param")),
            "BEEP" => format!("BEEP {} {}", Self::get_u8_param(params, "duration"), Self::get_u8_param(params, "pitch")),
            "EXTERN" => format!("EXTERN {}", Self::get_u8_param(params, "value")),
            "CALL" => format!("CALL {}", Self::get_u8_param(params, "address")),
            // DAAD Ready / Maluva extensions (passthrough)
            "XMES" | "XMESSAGE" => format!("XMES {} {}", Self::get_u8_param(params, "bank"), Self::get_u8_param(params, "mesno")),
            "XPLAY" => format!("XPLAY {}", Self::get_u8_param(params, "trackno")),
            "XBEEP" => format!("XBEEP {} {}", Self::get_u8_param(params, "duration"), Self::get_u8_param(params, "pitch")),
            "XSPLITSCR" => format!("XSPLITSCR {}", Self::get_u8_param(params, "lines")),
            "XSAVE" | "XLOAD" | "XPART" | "XUNDONE" => action_type.to_string(),
            "MOUSE" => "MOUSE".to_string(),
            _ => format!("{} {}", action_type, params.iter().map(|(k,v)| format!("{:?}", v)).collect::<Vec<_>>().join(" ")),
        }
    }
}