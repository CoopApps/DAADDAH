import { DaadGame, Condition, Action, Rule } from "../types/daad";

export interface GameState {
  currentLocation: number;
  inventory: number[];
  flags: Map<number, number>;
  // Parser state
  verb: string;
  noun1: string;
  adjective1: string;
  noun2: string;
  adjective2: string;
  adverb: string;
  preposition: string;
}

interface ExecutionContext {
  game: DaadGame;
  state: GameState;
  output: string[];
  done: boolean;
  shouldDescribeLocation: boolean;
}

/**
 * DAAD Execution Engine
 * Processes conditions and actions according to DAAD semantics
 */

// ============================================================================
// CONDITION EVALUATION
// ============================================================================

export function evaluateCondition(condition: Condition, ctx: ExecutionContext): boolean {
  const { game, state } = ctx;

  switch (condition.type) {
    // Player Location
    case "AT":
      return state.currentLocation === (condition.params.locno as number);

    case "NOTAT":
      return state.currentLocation !== (condition.params.locno as number);

    case "ATGT":
      return state.currentLocation > (condition.params.locno as number);

    case "ATLT":
      return state.currentLocation < (condition.params.locno as number);

    // Object Location
    case "PRESENT": {
      const objno = condition.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (!obj) return false;

      // Present means: carried, worn, or at current location
      if (state.inventory.includes(objno)) return true;
      if (obj.location.type === "at" && obj.location.locationId === state.currentLocation) return true;
      if (obj.location.type === "worn") return true;
      return false;
    }

    case "ABSENT": {
      const objno = condition.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (!obj) return true;

      if (state.inventory.includes(objno)) return false;
      if (obj.location.type === "at" && obj.location.locationId === state.currentLocation) return false;
      if (obj.location.type === "worn") return false;
      return true;
    }

    case "CARRIED":
      return state.inventory.includes(condition.params.objno as number);

    case "NOTCARR":
      return !state.inventory.includes(condition.params.objno as number);

    case "WORN": {
      const obj = game.objects.find(o => o.id === (condition.params.objno as number));
      return obj?.location.type === "worn";
    }

    case "NOTWORN": {
      const obj = game.objects.find(o => o.id === (condition.params.objno as number));
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
    case "ZERO":
      return (state.flags.get(condition.params.flagno as number) ?? 0) === 0;

    case "NOTZERO":
      return (state.flags.get(condition.params.flagno as number) ?? 0) !== 0;

    case "EQ":
      return (state.flags.get(condition.params.flagno as number) ?? 0) === (condition.params.value as number);

    case "NOTEQ":
      return (state.flags.get(condition.params.flagno as number) ?? 0) !== (condition.params.value as number);

    case "GT":
      return (state.flags.get(condition.params.flagno as number) ?? 0) > (condition.params.value as number);

    case "LT":
      return (state.flags.get(condition.params.flagno as number) ?? 0) < (condition.params.value as number);

    case "SAME": {
      const flag1 = state.flags.get(condition.params.flagno1 as number) ?? 0;
      const flag2 = state.flags.get(condition.params.flagno2 as number) ?? 0;
      return flag1 === flag2;
    }

    case "NOTSAME": {
      const flag1 = state.flags.get(condition.params.flagno1 as number) ?? 0;
      const flag2 = state.flags.get(condition.params.flagno2 as number) ?? 0;
      return flag1 !== flag2;
    }

    case "BIGGER": {
      const flag1 = state.flags.get(condition.params.flagno1 as number) ?? 0;
      const flag2 = state.flags.get(condition.params.flagno2 as number) ?? 0;
      return flag1 > flag2;
    }

    case "SMALLER": {
      const flag1 = state.flags.get(condition.params.flagno1 as number) ?? 0;
      const flag2 = state.flags.get(condition.params.flagno2 as number) ?? 0;
      return flag1 < flag2;
    }

    // Extended Logical Sentence
    case "ADJECT1":
      return state.adjective1.toLowerCase() === (condition.params.word as string).toLowerCase();

    case "ADVERB":
      return state.adverb.toLowerCase() === (condition.params.word as string).toLowerCase();

    case "PREP":
      return state.preposition.toLowerCase() === (condition.params.word as string).toLowerCase();

    case "NOUN2":
      return state.noun2.toLowerCase() === (condition.params.word as string).toLowerCase();

    case "ADJECT2":
      return state.adjective2.toLowerCase() === (condition.params.word as string).toLowerCase();

    // Random/Probability
    case "CHANCE": {
      const percent = condition.params.percent as number;
      return Math.random() * 100 < percent;
    }

    default:
      console.warn(`Unimplemented condition: ${condition.type}`);
      return false;
  }
}

// ============================================================================
// ACTION EXECUTION
// ============================================================================

export function executeAction(action: Action, ctx: ExecutionContext): void {
  const { game, state, output } = ctx;

  switch (action.type) {
    // Object Manipulation
    case "GET": {
      const objno = action.params.objno as number;
      if (!state.inventory.includes(objno)) {
        state.inventory.push(objno);
      }
      break;
    }

    case "DROP": {
      const objno = action.params.objno as number;
      const index = state.inventory.indexOf(objno);
      if (index > -1) {
        state.inventory.splice(index, 1);
      }
      break;
    }

    case "WEAR": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj && state.inventory.includes(objno)) {
        // Remove from inventory and mark as worn
        const index = state.inventory.indexOf(objno);
        if (index > -1) {
          state.inventory.splice(index, 1);
        }
        obj.location = { type: "worn" };
      }
      break;
    }

    case "REMOVE": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj && obj.location.type === "worn") {
        obj.location = { type: "carried" };
        if (!state.inventory.includes(objno)) {
          state.inventory.push(objno);
        }
      }
      break;
    }

    case "DESTROY": {
      const objno = action.params.objno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj) {
        obj.location = { type: "limbo" };
        const index = state.inventory.indexOf(objno);
        if (index > -1) {
          state.inventory.splice(index, 1);
        }
      }
      break;
    }

    case "PLACE": {
      const objno = action.params.objno as number;
      const locno = action.params.locno as number;
      const obj = game.objects.find(o => o.id === objno);
      if (obj) {
        obj.location = { type: "at", locationId: locno };
        const index = state.inventory.indexOf(objno);
        if (index > -1) {
          state.inventory.splice(index, 1);
        }
      }
      break;
    }

    // Flag Manipulation
    case "SET": {
      const flagno = action.params.flagno as number;
      state.flags.set(flagno, 1);
      break;
    }

    case "CLEAR": {
      const flagno = action.params.flagno as number;
      state.flags.set(flagno, 0);
      break;
    }

    case "LET": {
      const flagno = action.params.flagno as number;
      const value = action.params.value as number;
      state.flags.set(flagno, value);
      break;
    }

    case "PLUS": {
      const flagno = action.params.flagno as number;
      const value = action.params.value as number;
      const current = state.flags.get(flagno) ?? 0;
      state.flags.set(flagno, Math.min(255, current + value));
      break;
    }

    case "MINUS": {
      const flagno = action.params.flagno as number;
      const value = action.params.value as number;
      const current = state.flags.get(flagno) ?? 0;
      state.flags.set(flagno, Math.max(0, current - value));
      break;
    }

    // Player Movement
    case "GOTO": {
      const locno = action.params.locno as number;
      state.currentLocation = locno;
      break;
    }

    // Text Output
    case "MES":
    case "MESSAGE": {
      const mesno = action.params.mesno as number;
      if (mesno >= 0 && mesno < game.messages.length) {
        output.push(game.messages[mesno]);
      }
      break;
    }

    case "DESC": {
      ctx.shouldDescribeLocation = true;
      break;
    }

    case "NEWLINE":
      output.push("");
      break;

    case "SPACE":
      output.push(" ");
      break;

    // Control Flow
    case "DONE":
      ctx.done = true;
      break;

    case "NOTDONE":
      ctx.done = false;
      break;

    case "END":
      output.push("\n*** THE END ***");
      ctx.done = true;
      break;

    case "QUIT":
      output.push("\n*** GAME OVER ***");
      ctx.done = true;
      break;

    default:
      console.warn(`Unimplemented action: ${action.type}`);
      break;
  }
}

// ============================================================================
// RESPONSE PROCESSOR
// ============================================================================

/**
 * Process responses for a given verb/noun input
 * Returns output text and updated game state
 */
export function processResponse(
  game: DaadGame,
  state: GameState,
  verb: string,
  noun: string
): { output: string[]; newState: GameState; shouldDescribeLocation: boolean } {
  // Update parser state
  state.verb = verb.toLowerCase();
  state.noun1 = noun.toLowerCase();

  const ctx: ExecutionContext = {
    game,
    state: { ...state },
    output: [],
    done: false,
    shouldDescribeLocation: false,
  };

  // Get all enabled rules for PRO0 (main response table)
  const rules = game.rules.filter(r => r.enabled && r.process === "PRO0");

  // Try each rule in order
  for (const rule of rules) {
    // Check if all conditions pass
    const allConditionsPass = rule.conditions.every(cond => evaluateCondition(cond, ctx));

    if (allConditionsPass) {
      // Execute all actions
      for (const action of rule.actions) {
        executeAction(action, ctx);
        if (ctx.done) break;
      }

      // If DONE was called, stop processing rules
      if (ctx.done) break;
    }
  }

  return {
    output: ctx.output,
    newState: ctx.state,
    shouldDescribeLocation: ctx.shouldDescribeLocation,
  };
}
