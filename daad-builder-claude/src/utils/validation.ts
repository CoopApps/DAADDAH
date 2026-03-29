import { DaadGame } from "../types/daad";

/**
 * Represents a validation issue found in the game data.
 */
export interface ValidationIssue {
  /** Severity level: error (prevents export), warning (may cause issues), info (suggestions) */
  severity: "error" | "warning" | "info";
  /** Category for grouping issues (e.g., "Broken Reference", "Duplicate Names") */
  category: string;
  /** Human-readable description of the issue */
  message: string;
  /** Panel where the issue can be fixed */
  panel: string;
  /** ID of the specific item with the issue (if applicable) */
  itemId?: number;
  /** Whether the issue can be automatically fixed */
  fixable?: boolean;
}

/**
 * Validates a DAAD game and returns a list of issues found.
 * Checks for:
 * - Missing required fields (title, names, descriptions)
 * - Broken references (objects, locations, flags, messages)
 * - Duplicate entity names
 * - Unreachable locations
 * - Unused vocabulary
 * - Orphaned objects in limbo
 *
 * @param game - The DAAD game data to validate
 * @returns Array of validation issues found
 *
 * @example
 * const issues = validateGame(game);
 * const errors = issues.filter(i => i.severity === 'error');
 * if (errors.length > 0) {
 *   console.log('Cannot export - fix errors first');
 * }
 */
export function validateGame(game: DaadGame): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Validate title
  if (!game.title || game.title.trim() === "") {
    issues.push({
      severity: "error",
      category: "Game Info",
      message: "Game title is required",
      panel: "game-info",
    });
  }

  // Validate object names and locations
  game.objects.forEach((obj) => {
    // Check for empty object names
    if (!obj.noun || obj.noun.trim() === "") {
      issues.push({
        severity: "error",
        category: "Invalid Data",
        message: `Object #${obj.id} has no noun (name)`,
        panel: "objects",
        itemId: obj.id,
      });
    }

    // Check for empty descriptions
    if (!obj.description || obj.description.trim() === "") {
      issues.push({
        severity: "warning",
        category: "Incomplete Data",
        message: `Object "${obj.noun || `#${obj.id}`}" has no description`,
        panel: "objects",
        itemId: obj.id,
      });
    }

    if (obj.location.type === "at") {
      const locId = obj.location.locationId;
      if (locId !== undefined && locId !== null) {
        const locationExists = game.locations.some(l => l.id === locId);
        if (!locationExists) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Object "${obj.description}" references non-existent location ${locId}`,
            panel: "objects",
            itemId: obj.id,
            fixable: true,
          });
        }
      }
    }
  });

  // Validate location names
  game.locations.forEach((loc) => {
    if (!loc.name || loc.name.trim() === "") {
      issues.push({
        severity: "error",
        category: "Invalid Data",
        message: `Location #${loc.id} has no name`,
        panel: "locations",
        itemId: loc.id,
      });
    }

    if (!loc.description || loc.description.trim() === "") {
      issues.push({
        severity: "warning",
        category: "Incomplete Data",
        message: `Location "${loc.name || `#${loc.id}`}" has no description`,
        panel: "locations",
        itemId: loc.id,
      });
    }
  });

  // Validate location exits
  game.locations.forEach((loc) => {
    Object.entries(loc.exits).forEach(([dir, targetId]) => {
      if (targetId !== null) {
        const targetExists = game.locations.some(l => l.id === targetId);
        if (!targetExists) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Location "${loc.name}" has ${dir} exit to non-existent location ${targetId}`,
            panel: "locations",
            itemId: loc.id,
            fixable: true,
          });
        }
      }
    });
  });

  // Validate rules
  game.rules.forEach((rule) => {
    // Check conditions
    rule.conditions.forEach((cond, idx) => {
      if (cond.params.objno !== undefined) {
        const objId = Number(cond.params.objno);
        if (!game.objects.some(o => o.id === objId)) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Rule "${rule.name}" condition ${idx + 1} references non-existent object ${objId}`,
            panel: "rules",
            itemId: rule.id,
          });
        }
      }
      if (cond.params.locno !== undefined) {
        const locId = Number(cond.params.locno);
        if (!game.locations.some(l => l.id === locId)) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Rule "${rule.name}" condition ${idx + 1} references non-existent location ${locId}`,
            panel: "rules",
            itemId: rule.id,
          });
        }
      }
      if (cond.params.flagno !== undefined) {
        const flagId = Number(cond.params.flagno);
        if (!game.flags.some(f => f.id === flagId)) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Rule "${rule.name}" condition ${idx + 1} references non-existent flag ${flagId}`,
            panel: "rules",
            itemId: rule.id,
          });
        }
      }
    });

    // Check actions
    rule.actions.forEach((action, idx) => {
      if (action.params.objno !== undefined) {
        const objId = Number(action.params.objno);
        if (!game.objects.some(o => o.id === objId)) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Rule "${rule.name}" action ${idx + 1} references non-existent object ${objId}`,
            panel: "rules",
            itemId: rule.id,
          });
        }
      }
      if (action.params.locno !== undefined) {
        const locId = Number(action.params.locno);
        if (!game.locations.some(l => l.id === locId)) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Rule "${rule.name}" action ${idx + 1} references non-existent location ${locId}`,
            panel: "rules",
            itemId: rule.id,
          });
        }
      }
      if (action.params.flagno !== undefined) {
        const flagId = Number(action.params.flagno);
        if (!game.flags.some(f => f.id === flagId)) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Rule "${rule.name}" action ${idx + 1} references non-existent flag ${flagId}`,
            panel: "rules",
            itemId: rule.id,
          });
        }
      }
      if (action.params.mesno !== undefined) {
        const mesId = Number(action.params.mesno);
        if (mesId < 0 || mesId >= game.messages.length) {
          issues.push({
            severity: "error",
            category: "Broken Reference",
            message: `Rule "${rule.name}" action ${idx + 1} references non-existent message ${mesId}`,
            panel: "rules",
            itemId: rule.id,
          });
        }
      }
    });
  });

  // Check for unreachable locations
  const reachableLocations = new Set<number>();
  const startLocation = 0;
  reachableLocations.add(startLocation);

  let changed = true;
  while (changed) {
    changed = false;
    game.locations.forEach((loc) => {
      if (reachableLocations.has(loc.id)) {
        Object.values(loc.exits).forEach((targetId) => {
          if (targetId !== null && !reachableLocations.has(targetId)) {
            reachableLocations.add(targetId);
            changed = true;
          }
        });
      }
    });
  }

  game.locations.forEach((loc) => {
    if (!reachableLocations.has(loc.id) && loc.id !== 0) {
      issues.push({
        severity: "warning",
        category: "Unreachable Content",
        message: `Location "${loc.name}" cannot be reached from the starting location`,
        panel: "locations",
        itemId: loc.id,
      });
    }
  });

  // Check for duplicate location names
  const locationNames = new Map<string, number[]>();
  game.locations.forEach((loc) => {
    const name = loc.name.toLowerCase().trim();
    if (!locationNames.has(name)) {
      locationNames.set(name, []);
    }
    locationNames.get(name)!.push(loc.id);
  });
  locationNames.forEach((ids, name) => {
    if (ids.length > 1) {
      issues.push({
        severity: "warning",
        category: "Duplicate Names",
        message: `Multiple locations share the name "${name}" (IDs: ${ids.join(", ")})`,
        panel: "locations",
        itemId: ids[0],
      });
    }
  });

  // Check for duplicate object names (noun + adjective)
  const objectNames = new Map<string, number[]>();
  game.objects.forEach((obj) => {
    const fullName = `${obj.adjective} ${obj.noun}`.toLowerCase().trim();
    if (!objectNames.has(fullName)) {
      objectNames.set(fullName, []);
    }
    objectNames.get(fullName)!.push(obj.id);
  });
  objectNames.forEach((ids, name) => {
    if (ids.length > 1) {
      issues.push({
        severity: "warning",
        category: "Duplicate Names",
        message: `Multiple objects share the name "${name}" (IDs: ${ids.join(", ")})`,
        panel: "objects",
        itemId: ids[0],
      });
    }
  });

  // Check for duplicate flag names
  const flagNames = new Map<string, number[]>();
  game.flags.forEach((flag) => {
    const name = flag.name.toLowerCase().trim();
    if (!flagNames.has(name)) {
      flagNames.set(name, []);
    }
    flagNames.get(name)!.push(flag.id);
  });
  flagNames.forEach((ids, name) => {
    if (ids.length > 1) {
      issues.push({
        severity: "warning",
        category: "Duplicate Names",
        message: `Multiple flags share the name "${name}" (IDs: ${ids.join(", ")})`,
        panel: "flags",
        itemId: ids[0],
      });
    }
  });

  // Check for unused vocabulary
  const usedWords = new Set<number>();
  game.rules.forEach((rule) => {
    rule.conditions.forEach((cond) => {
      if (cond.params.verb !== undefined) usedWords.add(Number(cond.params.verb));
      if (cond.params.noun !== undefined) usedWords.add(Number(cond.params.noun));
    });
  });

  game.vocabulary.forEach((vocab) => {
    if (!usedWords.has(vocab.id)) {
      issues.push({
        severity: "info",
        category: "Unused Content",
        message: `Vocabulary word "${vocab.word}" (${vocab.wordType}) is not used in any rules`,
        panel: "vocabulary",
        itemId: vocab.id,
      });
    }
  });

  // Check for orphaned objects (in limbo with no rules to place them)
  game.objects.forEach((obj) => {
    if (obj.location.type === "limbo") {
      const hasPlacementRule = game.rules.some(rule =>
        rule.actions.some(action =>
          (action.type === "PLACE" || action.type === "CREATE") && action.params.objno === obj.id
        )
      );
      if (!hasPlacementRule) {
        issues.push({
          severity: "warning",
          category: "Orphaned Content",
          message: `Object "${obj.noun}" (ID: ${obj.id}) is in limbo with no PLACE/CREATE rule to reveal it`,
          panel: "objects",
          itemId: obj.id,
        });
      }
    }
  });

  // Check for unused messages (defined but never referenced)
  const usedMessages = new Set<number>();
  game.rules.forEach((rule) => {
    rule.actions.forEach((action) => {
      if ((action.type === "MESSAGE" || action.type === "MES") && action.params.mesno !== undefined) {
        usedMessages.add(Number(action.params.mesno));
      }
    });
  });
  game.messages.forEach((msg, idx) => {
    if (!usedMessages.has(idx) && msg.trim() !== "") {
      issues.push({
        severity: "info",
        category: "Unused Content",
        message: `Message #${idx} is defined but not referenced by any rule`,
        panel: "messages",
        itemId: idx,
      });
    }
  });

  // Check for one-way exits (A→B exists but B→A doesn't)
  game.locations.forEach((loc) => {
    Object.entries(loc.exits).forEach(([dir, targetId]) => {
      if (targetId === null) return;
      const targetLoc = game.locations.find(l => l.id === targetId);
      if (!targetLoc) return;
      const hasReturn = Object.values(targetLoc.exits).some(id => id === loc.id);
      if (!hasReturn) {
        issues.push({
          severity: "info",
          category: "One-Way Exit",
          message: `${loc.name} → ${targetLoc.name} (${dir}) has no return path`,
          panel: "locations",
          itemId: loc.id,
        });
      }
    });
  });

  // Check for dark rooms without any light source object
  const hasLightSource = game.objects.some(obj => obj.isLightSource);
  const hasDarkRooms = game.locations.some(loc => loc.isDark);
  if (hasDarkRooms && !hasLightSource) {
    issues.push({
      severity: "warning",
      category: "Game Logic",
      message: "Game has dark rooms but no light source object (Object 0 should be a light source)",
      panel: "objects",
    });
  }

  // Check for container objects that clash with location IDs
  game.objects.forEach((obj) => {
    if (obj.isContainer && game.locations.some(l => l.id === obj.id)) {
      issues.push({
        severity: "warning",
        category: "Container Conflict",
        message: `Container object "${obj.noun}" (ID: ${obj.id}) clashes with location ID ${obj.id}. DAAD reserves location N for container N's contents.`,
        panel: "objects",
        itemId: obj.id,
      });
    }
  });

  // Check for vocabulary conflicts (duplicate word + type combinations)
  const vocabKeys = new Map<string, number[]>();
  game.vocabulary.forEach((v) => {
    const key = `${v.word.toLowerCase().slice(0, 5)}_${v.wordType}`;
    if (!vocabKeys.has(key)) vocabKeys.set(key, []);
    vocabKeys.get(key)!.push(v.id);
  });
  vocabKeys.forEach((ids, key) => {
    if (ids.length > 1 && new Set(ids).size > 1) {
      issues.push({
        severity: "warning",
        category: "Vocabulary Conflict",
        message: `Word "${key.split("_")[0]}" has conflicting IDs: ${[...new Set(ids)].join(", ")}`,
        panel: "vocabulary",
      });
    }
  });

  // Check for empty location descriptions
  game.locations.forEach((loc) => {
    if (loc.id > 0 && (!loc.description || loc.description.trim() === "")) {
      issues.push({
        severity: "warning",
        category: "Incomplete Data",
        message: `Location "${loc.name}" has no description`,
        panel: "locations",
        itemId: loc.id,
      });
    }
  });

  // Check for rules with no actions
  game.rules.forEach((rule) => {
    if (rule.enabled && rule.actions.length === 0) {
      issues.push({
        severity: "warning",
        category: "Empty Rule",
        message: `Rule "${rule.name}" has no actions — it will do nothing`,
        panel: "rules",
        itemId: rule.id,
      });
    }
  });

  // Check for missing DONE in response rules (PRO5)
  game.rules.forEach((rule) => {
    if (rule.enabled && (rule.process === "PRO5" || rule.process === "PRO0") &&
        rule.verb !== "_" && rule.actions.length > 0) {
      const lastAction = rule.actions[rule.actions.length - 1];
      if (lastAction.type !== "DONE" && lastAction.type !== "NOTDONE" &&
          lastAction.type !== "RESTART" && lastAction.type !== "END" &&
          lastAction.type !== "REDO" && lastAction.type !== "OK") {
        issues.push({
          severity: "info",
          category: "Missing DONE",
          message: `Rule "${rule.name}" doesn't end with DONE/RESTART/END — execution will fall through to the next rule`,
          panel: "rules",
          itemId: rule.id,
        });
      }
    }
  });

  return issues;
}

/**
 * Automatically fixes a validation issue if possible.
 * Currently supports fixing:
 * - Broken object location references (moves object to limbo)
 * - Broken location exit references (removes the exit)
 *
 * @param game - The current game state
 * @param issue - The validation issue to fix (must have fixable: true)
 * @returns A new game state with the issue fixed
 *
 * @example
 * const fixableIssues = issues.filter(i => i.fixable);
 * let fixedGame = game;
 * for (const issue of fixableIssues) {
 *   fixedGame = autoFixIssue(fixedGame, issue);
 * }
 */
export function autoFixIssue(game: DaadGame, issue: ValidationIssue): DaadGame {
  const newGame = { ...game };

  if (issue.category === "Broken Reference" && issue.fixable) {
    if (issue.panel === "objects" && issue.itemId !== undefined) {
      // Fix broken object location reference
      newGame.objects = game.objects.map(obj =>
        obj.id === issue.itemId
          ? { ...obj, location: { type: "limbo" } }
          : obj
      );
    } else if (issue.panel === "locations" && issue.itemId !== undefined) {
      // Fix broken location exit reference
      newGame.locations = game.locations.map(loc => {
        if (loc.id === issue.itemId) {
          const newExits = { ...loc.exits };
          Object.entries(newExits).forEach(([dir, targetId]) => {
            if (targetId !== null && !game.locations.some(l => l.id === targetId)) {
              (newExits as any)[dir] = null;
            }
          });
          return { ...loc, exits: newExits };
        }
        return loc;
      });
    }
  }

  return newGame;
}
