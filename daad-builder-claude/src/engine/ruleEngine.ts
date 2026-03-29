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
 * Find matching rules for verb/noun combination in specified process table.
 * Uses the rule's verb/noun fields (not AT conditions) for matching.
 * "_" is the wildcard that matches anything.
 */
export function findMatchingRules(
  game: DaadGame,
  process: string,
  verb: string | null,
  noun: string | null,
  vocab: VocabEntry[]
): Rule[] {
  return game.rules.filter(rule => {
    if (!rule.enabled) return false;
    if (rule.process !== process) return false;

    const ruleVerb = (rule.verb || "_").toUpperCase();
    const ruleNoun = (rule.noun || "_").toUpperCase();

    // Wildcard matches anything
    const verbMatch = ruleVerb === "_" || (verb && ruleVerb === verb.toUpperCase());
    const nounMatch = ruleNoun === "_" || (noun && ruleNoun === noun.toUpperCase());

    return verbMatch && nounMatch;
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

    case "CHANCE": {
      const percent = (condition.params.percentage ?? condition.params.percent ?? 50) as number;
      return Math.random() * 100 < percent;
    }

    case "HASAT": {
      // Check object attribute — simplified for preview
      return false;
    }

    case "HASNAT": {
      return true;
    }

    case "ADJECT1":
    case "ADVERB":
    case "PREP":
    case "NOUN2":
    case "ADJECT2":
    case "ISDONE":
    case "ISNDONE":
    case "INKEY":
    case "QUIT":
      // These require parser state or are rare — return true to not block
      return true;

    default:
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

    // ── Additional condacts (Phase 2) ──────────────────────────────

    case "CREATE": {
      const objno = action.params.objno as number;
      const newObjLocs = new Map(state.objectLocations);
      newObjLocs.set(objno, { type: "at", locationId: state.currentLocation });
      setState({ ...state, objectLocations: newObjLocs });
      break;
    }

    case "SWAP": {
      const objno1 = action.params.objno1 as number;
      const objno2 = action.params.objno2 as number;
      const loc1 = state.objectLocations.get(objno1) || game.objects.find(o => o.id === objno1)?.location;
      const loc2 = state.objectLocations.get(objno2) || game.objects.find(o => o.id === objno2)?.location;
      const newObjLocs = new Map(state.objectLocations);
      if (loc1) newObjLocs.set(objno2, loc1 as any);
      if (loc2) newObjLocs.set(objno1, loc2 as any);
      setState({ ...state, objectLocations: newObjLocs });
      break;
    }

    case "COPYFF": {
      const f1 = action.params.flagno1 as number;
      const f2 = action.params.flagno2 as number;
      const newFlags = new Map(state.flags);
      newFlags.set(f1, newFlags.get(f2) ?? 0);
      setState({ ...state, flags: newFlags });
      break;
    }

    case "ADD": {
      const f1 = action.params.flagno1 as number;
      const f2 = action.params.flagno2 as number;
      const newFlags = new Map(state.flags);
      newFlags.set(f1, Math.min(255, (newFlags.get(f1) ?? 0) + (newFlags.get(f2) ?? 0)));
      setState({ ...state, flags: newFlags });
      break;
    }

    case "SUB": {
      const f1 = action.params.flagno1 as number;
      const f2 = action.params.flagno2 as number;
      const newFlags = new Map(state.flags);
      newFlags.set(f1, Math.max(0, (newFlags.get(f1) ?? 0) - (newFlags.get(f2) ?? 0)));
      setState({ ...state, flags: newFlags });
      break;
    }

    case "RANDOM": {
      const flagno = action.params.flagno as number;
      const newFlags = new Map(state.flags);
      newFlags.set(flagno, Math.floor(Math.random() * 256));
      setState({ ...state, flags: newFlags });
      break;
    }

    case "COPYOF": {
      // Copy object location to flag
      const objno = action.params.objno as number;
      const flagno = action.params.flagno as number;
      const objLoc = state.objectLocations.get(objno) || game.objects.find(o => o.id === objno)?.location;
      const newFlags = new Map(state.flags);
      newFlags.set(flagno, objLoc?.type === "at" ? (objLoc.locationId ?? 252) : 252);
      setState({ ...state, flags: newFlags });
      break;
    }

    case "COPYFO": {
      // Copy flag to object location
      const flagno = action.params.flagno as number;
      const objno = action.params.objno as number;
      const locId = state.flags.get(flagno) ?? 0;
      const newObjLocs = new Map(state.objectLocations);
      newObjLocs.set(objno, { type: "at", locationId: locId });
      setState({ ...state, objectLocations: newObjLocs });
      break;
    }

    case "SYSMESS": {
      const sysno = action.params.sysno as number;
      // Use custom system message if available, otherwise show default
      const customMsg = game.systemMessages?.[sysno];
      if (customMsg) {
        addOutput(customMsg);
      } else {
        // Default system messages for the most common ones
        const defaults: Record<number, string> = {
          0: "It's too dark to see anything.",
          1: "I can also see: ",
          6: "I don't understand that.",
          7: "I can't go that way.",
          8: "I can't do that.",
          9: "I have with me:",
          10: "I am wearing:",
          15: "OK.",
          35: "Time passes...",
          63: "You see nothing special.",
        };
        addOutput(defaults[sysno] ?? `[System message ${sysno}]`);
      }
      break;
    }

    case "LISTOBJ": {
      const here = game.objects.filter(obj => {
        const loc = state.objectLocations.get(obj.id) || obj.location;
        return loc.type === "at" && loc.locationId === state.currentLocation && !state.inventory.includes(obj.id);
      });
      if (here.length > 0) {
        const names = here.map(o => (o as any).otxText || (o.adjective ? `${o.adjective} ${o.noun}` : o.noun));
        addOutput(`I can also see: ${names.join(", ")}.`);
      }
      break;
    }

    case "LISTAT": {
      const locno = action.params.locno as number;
      // LISTAT CARRIED = 254, LISTAT WORN = 253
      let items: typeof game.objects;
      if (locno === 254) {
        items = game.objects.filter(o => state.inventory.includes(o.id));
      } else if (locno === 253) {
        items = game.objects.filter(o => {
          const loc = state.objectLocations.get(o.id) || o.location;
          return loc.type === "worn";
        });
      } else {
        items = game.objects.filter(o => {
          const loc = state.objectLocations.get(o.id) || o.location;
          return loc.type === "at" && loc.locationId === locno;
        });
      }
      if (items.length > 0) {
        const names = items.map(o => (o as any).otxText || o.noun);
        addOutput(names.join(", ") + ".");
      } else {
        addOutput("Nothing.");
      }
      break;
    }

    case "AUTOG": {
      // Auto-get: handles weight/carry limits automatically
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj && !state.inventory.includes(objno)) {
        setState({ ...state, inventory: [...state.inventory, objno] });
        const name = (obj as any).otxText || (obj.adjective ? `${obj.adjective} ${obj.noun}` : obj.noun);
        addOutput(`I now have ${name}.`);
      }
      break;
    }

    case "AUTOD": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj && state.inventory.includes(objno)) {
        const newObjLocs = new Map(state.objectLocations);
        newObjLocs.set(objno, { type: "at", locationId: state.currentLocation });
        setState({ ...state, inventory: state.inventory.filter(id => id !== objno), objectLocations: newObjLocs });
        const name = (obj as any).otxText || obj.noun;
        addOutput(`I've dropped ${name}.`);
      }
      break;
    }

    case "RESTART": {
      // Signal to PreviewPanel to restart the game loop
      break;
    }

    case "REDO": {
      // Signal to re-execute the process (handled by caller)
      break;
    }

    case "NOTDONE": {
      // Opposite of DONE — mark as not done so processing continues
      break;
    }

    case "WHATO": {
      // Set current object from last noun — handled by context
      break;
    }

    case "CLS": {
      // Clear screen — in preview we add a visual separator
      addOutput("\n─────────────────────────────────\n");
      break;
    }

    case "ANYKEY": {
      addOutput("[Press any key]");
      break;
    }

    case "PAUSE": {
      // In preview, just continue
      break;
    }

    case "PRINT": {
      const flagno = action.params.flagno as number;
      addOutput(String(state.flags.get(flagno) ?? 0));
      break;
    }

    case "DPRINT": {
      const flagno = action.params.flagno as number;
      addOutput(String(state.flags.get(flagno) ?? 0));
      break;
    }

    case "PROCESS": {
      // Execute another process table — simplified version
      const prono = action.params.prono as number;
      const procName = `PRO${prono}`;
      const procRules = game.rules.filter(r => r.enabled && r.process === procName);
      for (const rule of procRules) {
        if (checkConditions(rule, context)) {
          executeActions(rule, context);
          if (rule.actions.some(a => a.type === "DONE")) break;
        }
      }
      break;
    }

    case "RESET": {
      // Reset all objects to initial locations
      setState({ ...state, objectLocations: new Map(), inventory: [] });
      break;
    }

    case "MOVE": {
      // Move player to location stored in flag
      const flagno = action.params.flagno as number;
      const targetLoc = state.flags.get(flagno) ?? 0;
      setState({ ...state, currentLocation: targetLoc });
      break;
    }

    case "ABILITY": {
      const maxcarr = action.params.maxcarr as number;
      const strength = action.params.strength as number;
      const newFlags = new Map(state.flags);
      newFlags.set(37, maxcarr);
      newFlags.set(52, strength);
      setState({ ...state, flags: newFlags });
      break;
    }

    case "WINDOW":
    case "WINAT":
    case "WINSIZE":
    case "PAPER":
    case "INK":
    case "BORDER":
    case "TAB":
    case "PRINTAT":
    case "MODE":
    case "CENTRE":
    case "SAVEAT":
    case "BACKAT":
    case "PICTURE":
    case "DISPLAY":
    case "GFX":
    case "SFX":
    case "EXTERN":
    case "INPUT":
    case "TIME":
    case "XPICTURE":
    case "XSAVE":
    case "XLOAD":
    case "XPART":
    case "XSPLITSCR":
    case "XUNDONE":
    case "XBEEP":
    case "XMES":
    case "XMESSAGE":
    case "XDATA":
    case "MOUSE":
    case "CALL":
    case "DROPALL":
    case "PUTO":
    case "PUTIN":
    case "TAKEOUT":
    case "SETCO":
    case "WEIGH":
    case "WEIGHT":
    case "COPYBF":
    case "COPYOO":
    case "AUTOW":
    case "AUTOR":
    case "AUTOP":
    case "AUTOT":
    case "DOALL":
    case "SKIP":
    case "EXIT":
    case "SYNONYM":
    case "PARSE":
    case "NEWTEXT":
    case "GETKEY":
    case "WAIT":
    case "PLAY":
    case "RAMSAVE":
    case "RAMLOAD":
      // These condacts are either display-only, platform-specific, or
      // require full DAAD interpreter semantics. Silently ignored in preview.
      break;

    default:
      // Unknown action — don't warn, just skip
      break;
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
 * Execute all rules in a process table that match the given verb/noun.
 * Returns true if any rule with DONE/RESTART was executed.
 * This is the core of the DAAD execution model.
 */
export function executeProcess(
  context: EngineContext,
  processName: string,
  verbWord: string | null,
  nounWord: string | null
): boolean {
  const { game } = context;
  const matchingRules = findMatchingRules(game, processName, verbWord, nounWord, game.vocabulary);

  for (const rule of matchingRules) {
    if (checkConditions(rule, context)) {
      executeActions(rule, context);
      if (rule.actions.some(a => a.type === "DONE" || a.type === "RESTART")) return true;
    }
  }
  return false;
}

/**
 * Process player input through the DAAD rule system.
 * Mirrors the real DAAD execution flow from the manual:
 *
 * 1. Parse input into verb/noun words (matching vocabulary, including
 *    conversion nouns < 20 that auto-convert to verbs)
 * 2. Execute PRO 5 (response table) with verb/noun matching
 * 3. Also check PRO0 rules with explicit verb/noun (not wildcards)
 * 4. Check any custom process tables (PRO13+)
 * 5. Return false if nothing matched (triggers "I can't do that")
 *
 * PRO 0 wildcard rules (_ _) and PRO 4 auto-events run separately
 * via executePRO0Wildcards and executePRO4 (called by PreviewPanel each turn).
 */
export function processCommand(input: string, context: EngineContext): boolean {
  const { game } = context;
  const words = input.toLowerCase().trim().split(/\s+/);

  // Find verb word (first word that matches a vocab verb)
  let verbWord: string | null = null;
  let nounWord: string | null = null;

  if (words.length > 0) {
    const w = words[0];
    // Match against vocabulary — try full word, then truncated to 5 chars (DAAD truncation)
    const match = game.vocabulary.find(v =>
      v.wordType === "verb" && (v.word.toLowerCase() === w || v.word.toLowerCase().slice(0, 5) === w.slice(0, 5))
    );
    if (match) verbWord = match.word.toUpperCase();

    // Also check nouns < 20 (conversion nouns that act as verbs in DAAD)
    if (!verbWord) {
      const nounAsVerb = game.vocabulary.find(v =>
        v.wordType === "noun" && v.id < 20 && (v.word.toLowerCase() === w || v.word.toLowerCase().slice(0, 5) === w.slice(0, 5))
      );
      if (nounAsVerb) verbWord = nounAsVerb.word.toUpperCase();
    }
  }

  if (words.length > 1) {
    const w = words[1];
    const match = game.vocabulary.find(v =>
      v.wordType === "noun" && (v.word.toLowerCase() === w || v.word.toLowerCase().slice(0, 5) === w.slice(0, 5))
    );
    if (match) nounWord = match.word.toUpperCase();
  }

  if (!verbWord) return false;

  // Execute PRO 5 (response table) — primary verb/noun matching
  if (executeProcess(context, "PRO5", verbWord, nounWord)) return true;

  // Also check PRO0 and PRO1 rules with explicit verb/noun
  if (executeProcess(context, "PRO0", verbWord, nounWord)) return true;
  if (executeProcess(context, "PRO1", verbWord, nounWord)) return true;

  // Check any custom process tables that have matching verb/noun rules
  const customProcesses = new Set(game.rules.map(r => r.process));
  for (const proc of customProcesses) {
    if (["PRO0", "PRO1", "PRO2", "PRO3", "PRO4", "PRO5"].includes(proc)) continue;
    if (executeProcess(context, proc, verbWord, nounWord)) return true;
  }

  return false;
}

/**
 * Execute PRO 0 wildcard rules (_ _) — location loop events.
 * These run every turn regardless of player input (NPC movement, timers, etc.)
 */
export function executePRO0Wildcards(context: EngineContext): void {
  executeProcess(context, "PRO0", "_", "_");
}

/**
 * Execute PRO 4 auto-events — run before each input prompt.
 * All PRO4 rules are wildcard (_ _) and run unconditionally.
 */
export function executePRO4(context: EngineContext): void {
  executeProcess(context, "PRO4", "_", "_");
}

/**
 * Execute PRO2 automatic rules (backward compat wrapper).
 * In the real DAAD, PRO2 is the parse error handler.
 * Some games use it for auto-events.
 */
export function executePRO2(context: EngineContext): void {
  executeProcess(context, "PRO2", "_", "_");
}
