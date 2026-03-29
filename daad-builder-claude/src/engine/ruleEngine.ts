import { DaadGame, Rule, Condition, Action, VocabEntry } from "../types/daad";

export interface GameState {
  currentLocation: number;
  inventory: number[];
  flags: Map<number, number>;
  messages: string[];
  gameOver: boolean;
  objectLocations: Map<number, { type: string; locationId?: number }>; // Track dynamic object positions
}

export interface EngineContext {
  game: DaadGame;
  state: GameState;
  setState: (state: GameState) => void;
  addOutput: (text: string) => void;
}

/**
 * Parse player input into verb and noun IDs using vocabulary
 */
export function parseInput(input: string, vocab: VocabEntry[]): { verb: number | null; noun: number | null } {
  const words = input.toLowerCase().trim().split(/\s+/);

  let verb: number | null = null;
  let noun: number | null = null;

  // Find verb (first word)
  if (words.length > 0) {
    const verbWord = vocab.find(v => v.wordType === "verb" && v.word.toLowerCase() === words[0]);
    if (verbWord) {
      verb = verbWord.id;
    }
  }

  // Find noun (second word or remaining words)
  if (words.length > 1) {
    const nounPhrase = words.slice(1).join(" ");
    const nounWord = vocab.find(v => v.wordType === "noun" && v.word.toLowerCase() === nounPhrase);
    if (nounWord) {
      noun = nounWord.id;
    } else {
      // Try just second word
      const nounWord2 = vocab.find(v => v.wordType === "noun" && v.word.toLowerCase() === words[1]);
      if (nounWord2) {
        noun = nounWord2.id;
      }
    }
  }

  return { verb, noun };
}

/**
 * Find matching rules for verb/noun combination in specified process table
 */
export function findMatchingRules(
  game: DaadGame,
  process: string,
  verb: number | null,
  noun: number | null
): Rule[] {
  return game.rules.filter(rule => {
    if (!rule.enabled) return false;
    if (rule.process !== process) return false;

    // Check if rule has AT condition matching verb/noun
    const hasMatch = rule.conditions.some(cond => {
      if (cond.type === "AT") {
        const condVerb = cond.params.verb as number;
        const condNoun = cond.params.noun as number;

        // Match verb (255 = wildcard)
        const verbMatch = condVerb === 255 || condVerb === verb;
        // Match noun (255 = wildcard)
        const nounMatch = condNoun === 255 || condNoun === noun;

        return verbMatch && nounMatch;
      }
      return false;
    });

    return hasMatch;
  });
}

/**
 * Check if all conditions in a rule are satisfied
 */
export function checkConditions(rule: Rule, context: EngineContext): boolean {
  for (const condition of rule.conditions) {
    if (!evaluateCondition(condition, context)) {
      return false;
    }
  }
  return true;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(condition: Condition, context: EngineContext): boolean {
  const { game, state } = context;

  switch (condition.type) {
    // Player Location OR Verb/Noun match
    case "AT": {
      // Check if this is a location check (has locno parameter)
      if (condition.params.locno !== undefined) {
        const locno = condition.params.locno as number;
        return state.currentLocation === locno;
      }
      // Otherwise it's a verb/noun matcher - always return true in checkConditions
      // (the actual verb/noun matching happens in findMatchingRules)
      return true;
    }

    case "NOTAT": {
      const locno = condition.params.locno as number;
      return state.currentLocation !== locno;
    }

    case "ATGT": {
      const locno = condition.params.locno as number;
      return state.currentLocation > locno;
    }

    case "ATLT": {
      const locno = condition.params.locno as number;
      return state.currentLocation < locno;
    }

    // Object Location
    case "PRESENT": {
      const objno = condition.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (!obj) return false;

      // Present means: carried, worn, or at current location
      if (state.inventory.includes(objno)) return true;

      // Check state map first, fall back to game object location
      const objLocation = state.objectLocations.get(objno) || obj.location;
      if (objLocation.type === "at" && objLocation.locationId === state.currentLocation) return true;
      if (objLocation.type === "worn") return true;
      return false;
    }

    case "ABSENT": {
      const objno = condition.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (!obj) return true;

      if (state.inventory.includes(objno)) return false;

      // Check state map first, fall back to game object location
      const objLocation = state.objectLocations.get(objno) || obj.location;
      if (objLocation.type === "at" && objLocation.locationId === state.currentLocation) return false;
      if (objLocation.type === "worn") return false;
      return true;
    }

    case "CARRIED": {
      const objno = condition.params.objno as number;
      return state.inventory.includes(objno);
    }

    case "NOTCARR": {
      const objno = condition.params.objno as number;
      return !state.inventory.includes(objno);
    }

    case "WORN": {
      const objno = condition.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      return obj?.location.type === "worn";
    }

    case "NOTWORN": {
      const objno = condition.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      return obj?.location.type !== "worn";
    }

    case "ISAT": {
      const objno = condition.params.objno as number;
      const locno = condition.params.locno as number;
      const obj = game.objects.find(o => o.id === objno);
      return obj?.location.type === "at" && obj.location.locationId === locno;
    }

    case "ISNOTAT": {
      const objno = condition.params.objno as number;
      const locno = condition.params.locno as number;
      const obj = game.objects.find(o => o.id === objno);
      return !(obj?.location.type === "at" && obj.location.locationId === locno);
    }

    // Flag Comparison
    case "ZERO": {
      const flagno = condition.params.flagno as number;
      return (state.flags.get(flagno) ?? 0) === 0;
    }

    case "NOTZERO": {
      const flagno = condition.params.flagno as number;
      return (state.flags.get(flagno) ?? 0) !== 0;
    }

    case "EQ": {
      const flagno = condition.params.flagno as number;
      const value = condition.params.value as number;
      return (state.flags.get(flagno) ?? 0) === value;
    }

    case "NOTEQ": {
      const flagno = condition.params.flagno as number;
      const value = condition.params.value as number;
      return (state.flags.get(flagno) ?? 0) !== value;
    }

    case "GT": {
      const flagno = condition.params.flagno as number;
      const value = condition.params.value as number;
      return (state.flags.get(flagno) ?? 0) > value;
    }

    case "LT": {
      const flagno = condition.params.flagno as number;
      const value = condition.params.value as number;
      return (state.flags.get(flagno) ?? 0) < value;
    }

    case "SAME": {
      const flagno1 = condition.params.flagno1 as number;
      const flagno2 = condition.params.flagno2 as number;
      const flag1 = state.flags.get(flagno1) ?? 0;
      const flag2 = state.flags.get(flagno2) ?? 0;
      return flag1 === flag2;
    }

    case "NOTSAME": {
      const flagno1 = condition.params.flagno1 as number;
      const flagno2 = condition.params.flagno2 as number;
      const flag1 = state.flags.get(flagno1) ?? 0;
      const flag2 = state.flags.get(flagno2) ?? 0;
      return flag1 !== flag2;
    }

    case "BIGGER": {
      const flagno1 = condition.params.flagno1 as number;
      const flagno2 = condition.params.flagno2 as number;
      const flag1 = state.flags.get(flagno1) ?? 0;
      const flag2 = state.flags.get(flagno2) ?? 0;
      return flag1 > flag2;
    }

    case "SMALLER": {
      const flagno1 = condition.params.flagno1 as number;
      const flagno2 = condition.params.flagno2 as number;
      const flag1 = state.flags.get(flagno1) ?? 0;
      const flag2 = state.flags.get(flagno2) ?? 0;
      return flag1 < flag2;
    }

    default:
      console.warn(`Unknown condition type: ${condition.type}`);
      return false;
  }
}

/**
 * Execute all actions in a rule
 */
export function executeActions(rule: Rule, context: EngineContext): void {
  for (const action of rule.actions) {
    executeAction(action, context);
  }
}

/**
 * Execute a single action
 */
function executeAction(action: Action, context: EngineContext): void {
  const { game, state, setState, addOutput } = context;

  switch (action.type) {
    // Text Output
    case "MES":
    case "MESSAGE": {
      const mesno = action.params.mesno as number;
      if (mesno >= 0 && mesno < game.messages.length) {
        addOutput(game.messages[mesno]);
      }
      break;
    }

    // Player Movement
    case "GOTO": {
      const locno = action.params.locno as number;
      // Update state AND context immediately so subsequent actions see the new location
      state.currentLocation = locno;
      setState({ ...state, currentLocation: locno });
      // debug: console.log(`[GOTO] Moved to location ${locno}`);
      break;
    }

    // Object Manipulation
    case "GET": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (!state.inventory.includes(objno)) {
        setState({ ...state, inventory: [...state.inventory, objno] });
        if (obj) {
          const name = obj.adjective ? `${obj.adjective} ${obj.noun}` : obj.noun;
          addOutput(`You take the ${name}.`);
        }
      } else {
        addOutput("You already have that.");
      }
      break;
    }

    case "DROP": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      setState({
        ...state,
        inventory: state.inventory.filter(id => id !== objno)
      });
      if (obj) {
        const name = obj.adjective ? `${obj.adjective} ${obj.noun}` : obj.noun;
        addOutput(`You drop the ${name}.`);
      }
      break;
    }

    case "WEAR": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj && state.inventory.includes(objno)) {
        obj.location = { type: "worn" };
        // Keep in inventory (worn items are still "carried" in DAAD)
      }
      break;
    }

    case "REMOVE": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj && obj.location.type === "worn") {
        obj.location = { type: "carried" };
      }
      break;
    }

    case "DESTROY": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj) {
        obj.location = { type: "limbo" };
        setState({
          ...state,
          inventory: state.inventory.filter(id => id !== objno)
        });
      }
      break;
    }

    case "PLACE": {
      const objno = action.params.objno as number;
      const locno = action.params.locno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj) {
        // Update object location in state map
        const newObjectLocations = new Map(state.objectLocations);
        newObjectLocations.set(objno, { type: "at", locationId: locno });
        setState({
          ...state,
          objectLocations: newObjectLocations,
          inventory: state.inventory.filter(id => id !== objno)
        });
        // debug: console.log(`[PLACE] Moved object ${objno} to location ${locno}`);
      }
      break;
    }

    // Flag Manipulation
    case "SET": {
      const flagno = action.params.flagno as number;
      const newFlags = new Map(state.flags);
      newFlags.set(flagno, 1);
      setState({ ...state, flags: newFlags });
      break;
    }

    case "CLEAR": {
      const flagno = action.params.flagno as number;
      const newFlags = new Map(state.flags);
      newFlags.set(flagno, 0);
      setState({ ...state, flags: newFlags });
      break;
    }

    case "LET": {
      const flagno = action.params.flagno as number;
      const value = action.params.value as number;
      const newFlags = new Map(state.flags);
      newFlags.set(flagno, value);
      setState({ ...state, flags: newFlags });
      break;
    }

    case "PLUS": {
      const flagno = action.params.flagno as number;
      const value = action.params.value as number;
      const newFlags = new Map(state.flags);
      newFlags.set(flagno, Math.min(255, (newFlags.get(flagno) || 0) + value));
      setState({ ...state, flags: newFlags });
      break;
    }

    case "MINUS": {
      const flagno = action.params.flagno as number;
      const value = action.params.value as number;
      const newFlags = new Map(state.flags);
      newFlags.set(flagno, Math.max(0, (newFlags.get(flagno) || 0) - value));
      setState({ ...state, flags: newFlags });
      break;
    }

    // Control Flow
    case "DONE": {
      // Stop processing further rules (handled by caller)
      break;
    }

    case "OK": {
      addOutput("OK");
      break;
    }

    case "DESC": {
      // Will be handled by PreviewPanel to describe location
      addOutput("[DESC]");
      break;
    }

    case "DESCRIBE": {
      // Describe an object
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj && obj.description) {
        addOutput(obj.description);
      }
      break;
    }

    case "QUIT": {
      setState({ ...state, gameOver: true });
      addOutput("Thanks for playing!");
      break;
    }

    case "END": {
      setState({ ...state, gameOver: true });
      addOutput("\n*** THE END ***");
      break;
    }

    case "SAVE": {
      addOutput("Save not implemented in preview mode.");
      break;
    }

    case "LOAD": {
      addOutput("Load not implemented in preview mode.");
      break;
    }

    case "NEWLINE": {
      addOutput("");
      break;
    }

    case "SPACE": {
      // Add space (inline, not newline)
      break;
    }


    case "BEEP": {
      const duration = (action.params.duration as number) || 100;
      const frequency = (action.params.frequency as number) || 440;
      // Play a simple beep sound
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        gainNode.gain.value = 0.3;

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      }
      break;
    }

    case "XPLAY": {
      const musicId = action.params.music as number;
      const music = game.music.find(m => m.id === musicId);
      if (music) {
        addOutput(`[Playing: ${music.name}]`);
        // Play music asynchronously (non-blocking)
        playMusicTrack(music).catch(() => {
          // Ignore playback errors in game context
        });
      }
      break;
    }

    default:
      console.warn(`Unknown action type: ${action.type}`);
  }
}


/**
 * Play a music track using Web Audio API
 */
async function playMusicTrack(music: any): Promise<void> {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return;
  }

  const audioContext = new AudioContext();
  const beatDuration = 60 / music.tempo;

  const NOTE_FREQUENCIES: Record<string, number> = {
    "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
    "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
    "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77,
    "C6": 1046.50, "C#6": 1108.73, "D6": 1174.66, "D#6": 1244.51, "E6": 1318.51, "F6": 1396.91, "F#6": 1479.98, "G6": 1567.98, "G#6": 1661.22, "A6": 1760.00, "A#6": 1864.66, "B6": 1975.53
  };

  for (const note of music.notes) {
    let noteDuration = beatDuration * (4 / note.duration);
    if (note.dotted) noteDuration *= 1.5;

    if (note.note !== "R") {
      const frequency = NOTE_FREQUENCIES[`${note.note}${note.octave}`];
      if (frequency) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration * 0.9);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + noteDuration * 0.9);
      }
    }

    await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
  }
}

/**
 * Process player input through the rule system
 * Returns true if a rule was executed, false if command not understood
 */
export function processCommand(input: string, context: EngineContext): boolean {
  const { game } = context;

  // Parse input into verb/noun
  const { verb, noun } = parseInput(input, game.vocabulary);

  // debug: console.log(`[RULE ENGINE] Input: "${input}"`);
  // debug: console.log(`[RULE ENGINE] Parsed - verb: ${verb}, noun: ${noun}`);
  // debug: console.log(`[RULE ENGINE] Vocabulary size: ${game.vocabulary.length}`);

  // Debug: Show what vocabulary words match
  const words = input.toLowerCase().trim().split(/\s+/);
  // debug: console.log(`[RULE ENGINE] Looking for verb "${words[0]}" in vocabulary...`);
  const verbMatches = game.vocabulary.filter(v => v.wordType === "verb" && v.word === words[0]);
  // debug: console.log(`[RULE ENGINE] Verb matches:`, verbMatches);

  if (words.length > 1) {
    // debug: console.log(`[RULE ENGINE] Looking for noun "${words[1]}" in vocabulary...`);
    const nounMatches = game.vocabulary.filter(v => v.wordType === "noun" && v.word === words[1]);
    // debug: console.log(`[RULE ENGINE] Noun matches:`, nounMatches);
  }

  if (verb === null) {
    // debug: console.log(`[RULE ENGINE] No valid verb found, returning false`);
    return false; // No valid verb found
  }

  // Process tables in order: PRO0, PRO1, PRO2
  const processTables = ["PRO0", "PRO1", "PRO2"];

  for (const process of processTables) {
    const matchingRules = findMatchingRules(game, process, verb, noun);
    // debug: console.log(`[RULE ENGINE] ${process}: Found ${matchingRules.length} matching rules for verb=${verb}, noun=${noun}`);

    for (const rule of matchingRules) {
      // debug: console.log(`[RULE ENGINE] Checking rule #${rule.id}: ${rule.name}`);
      const conditionsMet = checkConditions(rule, context);
      // debug: console.log(`[RULE ENGINE] Rule #${rule.id} conditions met: ${conditionsMet}`);

      if (conditionsMet) {
        // debug: console.log(`[RULE ENGINE] Executing rule #${rule.id}: ${rule.name}`);
        executeActions(rule, context);

        // Check if DONE action was executed
        const hasDone = rule.actions.some(a => a.type === "DONE");
        if (hasDone) {
          // debug: console.log(`[RULE ENGINE] Rule #${rule.id} has DONE, stopping processing`);
          return true; // Stop processing
        }
      }
    }
  }

  // debug: console.log(`[RULE ENGINE] No matching rule found, returning false`);
  return false; // No matching rule found
}

/**
 * Execute PRO2 automatic rules after every turn
 * PRO2 rules run automatically regardless of command, checking only location conditions
 */
export function executePRO2(context: EngineContext): void {
  const { game, state } = context;

  // debug: console.log(`[PRO2] Executing automatic rules for location ${state.currentLocation}`);

  // Get all PRO2 rules
  const pro2Rules = game.rules.filter(r => r.enabled && r.process === "PRO2");
  // debug: console.log(`[PRO2] Found ${pro2Rules.length} PRO2 rules total`);

  for (const rule of pro2Rules) {
    // debug: console.log(`[PRO2] Checking rule #${rule.id}: ${rule.name}`);

    // Check if conditions are met (location conditions only, not verb/noun)
    const conditionsMet = checkConditions(rule, context);
    // debug: console.log(`[PRO2] Rule #${rule.id} conditions met: ${conditionsMet}`);

    if (conditionsMet) {
      // debug: console.log(`[PRO2] Executing rule #${rule.id}: ${rule.name}`);
      executeActions(rule, context);

      // PRO2 rules with DONE stop further PRO2 processing
      const hasDone = rule.actions.some(a => a.type === "DONE");
      if (hasDone) {
        // debug: console.log(`[PRO2] Rule #${rule.id} has DONE, stopping PRO2 processing`);
        break;
      }
    }
  }

  // debug: console.log(`[PRO2] Automatic rule execution complete`);
}
