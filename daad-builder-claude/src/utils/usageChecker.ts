import { DaadGame } from "../types/daad";

export interface UsageInfo {
  total: number;
  details: string[];
}

export function checkLocationUsage(game: DaadGame, locationId: number): UsageInfo {
  const details: string[] = [];

  // Check objects at this location
  const objectsHere = game.objects.filter(obj =>
    obj.location.type === "at" && obj.location.locationId === locationId
  );
  if (objectsHere.length > 0) {
    details.push(`${objectsHere.length} object(s) at this location`);
  }

  // Check location exits pointing here
  game.locations.forEach(loc => {
    const exits = Object.entries(loc.exits).filter(([_, targetId]) => targetId === locationId);
    if (exits.length > 0) {
      details.push(`${exits.length} exit(s) from "${loc.name}"`);
    }
  });

  // Check rules referencing this location
  const rulesWithLocation = game.rules.filter(rule =>
    rule.conditions.some(c => c.params.locno === locationId) ||
    rule.actions.some(a => a.params.locno === locationId)
  );
  if (rulesWithLocation.length > 0) {
    details.push(`${rulesWithLocation.length} rule(s)`);
  }

  return { total: details.length, details };
}

export function checkObjectUsage(game: DaadGame, objectId: number): UsageInfo {
  const details: string[] = [];

  // Check if other objects are inside this container
  const objectsInside = game.objects.filter(obj =>
    obj.location.type === "inside" && obj.location.containerId === objectId
  );
  if (objectsInside.length > 0) {
    details.push(`${objectsInside.length} object(s) inside this container`);
  }

  // Check rules referencing this object (with specific rule names)
  const rulesWithObject = game.rules.filter(rule =>
    rule.conditions.some(c => c.params.objno === objectId || c.params.objno1 === objectId || c.params.objno2 === objectId) ||
    rule.actions.some(a => a.params.objno === objectId || a.params.objno1 === objectId || a.params.objno2 === objectId)
  );
  for (const rule of rulesWithObject) {
    details.push(`Rule #${rule.id} "${rule.name}"`);
  }

  return { total: details.length, details };
}

export function checkFlagUsage(game: DaadGame, flagId: number): UsageInfo {
  const details: string[] = [];

  // Check rules referencing this flag (in conditions and actions)
  const rulesWithFlag = game.rules.filter(rule =>
    rule.conditions.some(c =>
      c.params.flagno === flagId || c.params.flagno1 === flagId || c.params.flagno2 === flagId
    ) ||
    rule.actions.some(a =>
      a.params.flagno === flagId || a.params.flagno1 === flagId || a.params.flagno2 === flagId || a.params.value === flagId
    )
  );
  if (rulesWithFlag.length > 0) {
    for (const rule of rulesWithFlag) {
      const inCond = rule.conditions.some(c => c.params.flagno === flagId || c.params.flagno1 === flagId || c.params.flagno2 === flagId);
      const inAct = rule.actions.some(a => a.params.flagno === flagId || a.params.flagno1 === flagId || a.params.flagno2 === flagId);
      details.push(`Rule #${rule.id} "${rule.name}" (${inCond ? "condition" : ""}${inCond && inAct ? " + " : ""}${inAct ? "action" : ""})`);
    }
  }

  // Check status bar config
  if (game.statusBarConfig?.rightFlagId === flagId) {
    details.push("Status bar (right side display)");
  }

  return { total: details.length, details };
}

export function checkMessageUsage(game: DaadGame, messageIndex: number): UsageInfo {
  const details: string[] = [];

  // Check rules using this message
  const rulesWithMessage = game.rules.filter(rule =>
    rule.actions.some(a => a.params.mesno === messageIndex)
  );
  if (rulesWithMessage.length > 0) {
    details.push(`${rulesWithMessage.length} rule(s)`);
  }

  return { total: details.length, details };
}

export function checkVocabularyUsage(game: DaadGame, vocabId: number): UsageInfo {
  const details: string[] = [];

  // Check rules using this word
  const rulesWithWord = game.rules.filter(rule =>
    rule.conditions.some(c =>
      c.params.verb === vocabId || c.params.noun === vocabId
    )
  );
  if (rulesWithWord.length > 0) {
    details.push(`${rulesWithWord.length} rule(s)`);
  }

  return { total: details.length, details };
}

export function checkMusicUsage(game: DaadGame, musicId: number): UsageInfo {
  const details: string[] = [];

  // Check rules using PLAY or XPLAY with this music
  const rulesWithMusic = game.rules.filter(rule =>
    rule.actions.some(a =>
      (a.type === "PLAY" || a.type === "XPLAY") && a.params.musno === musicId
    )
  );
  if (rulesWithMusic.length > 0) {
    details.push(`${rulesWithMusic.length} rule(s)`);
  }

  return { total: details.length, details };
}
