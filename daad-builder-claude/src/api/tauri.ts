import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { DaadGame, ObjectLocation } from "../types/daad";
import { normalizeGameState } from "../services/gameNormalizer";

interface BackendGame {
  partNumber: number;
  title: string;
  author: string;
  version: string;
  introText?: string;
  walkthrough?: string[];
  locations: BackendLocation[];
  objects: BackendObject[];
  rules: BackendRule[];
  flags: BackendFlag[];
  messages: string[];
  vocabulary: BackendVocabEntry[];
  music: BackendMusic[];
  systemMessages?: Record<number, string>;
  statusBarConfig?: {
    paperColor: number;
    inkColor: number;
    showTurns: boolean;
    showLocationName: boolean;
    rightContent?: string;
    rightFlagId?: number;
    rightLabel?: string;
  };
}

interface BackendLocation {
  id: number;
  name: string;
  description: string;
  isDark: boolean;
  connections: BackendConnection[];
  editorX: number;
  editorY: number;
  image?: BackendLocationImage;
}

interface BackendLocationImage {
  sourceData: string;
  yPosition: number;
  height: number;
  platformImages?: Record<string, BackendPlatformImage>;
}

interface BackendPlatformImage {
  imageData: string;
  colorMode?: string;
  paletteIndices?: number[];
}

interface BackendConnection {
  direction: string;
  targetLocation: number;
}

interface BackendObject {
  id: number;
  name: string;
  noun: string;
  adjective: string;
  description: string;
  location: ObjectLocation;
  weight: number;
  isContainer: boolean;
  isWearable: boolean;
  isTakeable: boolean;
  isLightSource: boolean;
  isPSI: boolean;
  containerCapacity?: number;
  icon: string;
  otxText?: string;
  attributes?: number[];
}

interface BackendRule {
  id: number;
  name: string;
  process: string;
  enabled: boolean;
  conditions: unknown[];
  actions: unknown[];
  verb?: string;
  noun?: string;
  additionalTriggers?: Array<{ verb: string; noun: string }>;
}

interface BackendFlag {
  id: number;
  name: string;
  description: string;
  initialValue: number;
}

interface BackendVocabEntry {
  word: string;
  wordType: string;
  id: number;
}

interface BackendMusicNote {
  note: string;
  octave: number;
  duration: number;
  dotted: boolean;
}

interface BackendMusic {
  id: number;
  name: string;
  tempo: number;
  shape: number;
  volume: number;
  notes: BackendMusicNote[];
}

// Convert frontend game to backend format.
// All field names must match the Rust struct field names after
// #[serde(rename_all = "camelCase")] is applied.
export function toBackendGame(game: DaadGame): BackendGame {
  return {
    partNumber: game.partNumber || 1,
    title: game.title,
    author: game.author,
    version: game.version,
    introText: game.introText,
    walkthrough: game.walkthrough,
    locations: game.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      isDark: loc.isDark,
      connections:
        (loc as any).connections ||
        Object.entries((loc as any).exits || {})
          .filter(([, target]) => target !== null)
          .map(([direction, target]) => ({
            direction,
            targetLocation: target as number,
          })),
      editorX: loc.x,
      editorY: loc.y,
      image: loc.image
        ? {
            sourceData: loc.image.sourceData,
            yPosition: loc.image.yPosition,
            height: loc.image.height,
            platformImages: loc.image.platformImages
              ? Object.entries(loc.image.platformImages).reduce(
                  (acc, [key, val]) => ({
                    ...acc,
                    [key]: {
                      imageData: val.imageData,
                      colorMode: val.colorMode,
                      paletteIndices: val.paletteIndices,
                    },
                  }),
                  {} as Record<string, BackendPlatformImage>
                )
              : undefined,
          }
        : undefined,
    })),
    objects: game.objects.map((obj) => ({
      id: obj.id,
      name: obj.adjective ? `${obj.adjective} ${obj.noun}` : obj.noun,
      noun: obj.noun,
      adjective: obj.adjective || "_",
      description: obj.description,
      location: obj.location,
      weight: obj.weight,
      isContainer: obj.isContainer,
      isWearable: obj.isWearable,
      isTakeable: obj.isTakeable,
      isLightSource: obj.isLightSource,
      isPSI: obj.isPSI,
      containerCapacity: obj.containerCapacity,
      icon: obj.icon,
      otxText: (obj as any).otxText,
      attributes: obj.attributes,
    })),
    rules: game.rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      process: rule.process || "PRO5",
      enabled: rule.enabled !== false,
      conditions: (rule.conditions || []).map((c) => ({
        type: c.type,
        params: c.params || {},
        ...(c.indirect ? { indirect: c.indirect } : {}),
      })),
      actions: (rule.actions || []).map((a) => ({
        type: a.type,
        params: a.params || {},
        ...(a.indirect ? { indirect: a.indirect } : {}),
        ...(a.text != null ? { text: a.text } : {}),
      })),
      verb: rule.verb,
      noun: rule.noun,
      additionalTriggers: rule.additionalTriggers,
    })),
    flags: game.flags.map((flag) => ({
      id: flag.id,
      name: flag.name,
      description: flag.description,
      initialValue: flag.initialValue,
    })),
    messages: game.messages,
    vocabulary: game.vocabulary.map((vocab) => ({
      word: vocab.word,
      wordType: vocab.wordType,
      id: vocab.id,
    })),
    music: game.music.map((track) => ({
      id: track.id,
      name: track.name,
      tempo: track.tempo,
      shape: track.shape,
      volume: track.volume,
      notes: track.notes.map((note) => ({
        note: note.note,
        octave: note.octave,
        duration: note.duration,
        dotted: note.dotted,
      })),
    })),
    systemMessages: game.systemMessages,
    statusBarConfig: (game as any).statusBarConfig,
  };
}

// Convert backend game to frontend format
export function toFrontendGame(backend: BackendGame): DaadGame {
  const game = {
    partNumber: backend.partNumber,
    walkthrough: backend.walkthrough,
    title: backend.title,
    author: backend.author,
    version: backend.version,
    introText: backend.introText,
    locations: backend.locations.map((loc) => {
      const exits: DaadGame["locations"][0]["exits"] = {
        north: null,
        south: null,
        east: null,
        west: null,
        northeast: null,
        northwest: null,
        southeast: null,
        southwest: null,
        up: null,
        down: null,
        in: null,
        out: null,
      };
      for (const conn of loc.connections) {
        const dir = conn.direction.toLowerCase() as keyof typeof exits;
        if (dir in exits) {
          exits[dir] = conn.targetLocation;
        }
      }
      return {
        id: loc.id,
        name: loc.name,
        description: loc.description,
        isDark: loc.isDark,
        exits,
        x: loc.editorX,
        y: loc.editorY,
        image: loc.image
          ? {
              sourceData: loc.image.sourceData,
              yPosition: loc.image.yPosition,
              height: loc.image.height,
              platformImages: loc.image.platformImages
                ? Object.entries(loc.image.platformImages).reduce(
                    (acc, [key, val]) => ({
                      ...acc,
                      [key]: {
                        imageData: val.imageData,
                        colorMode: val.colorMode,
                        paletteIndices: val.paletteIndices,
                      },
                    }),
                    {}
                  )
                : undefined,
            }
          : undefined,
      };
    }),
    objects: backend.objects.map((obj) => ({
      id: obj.id,
      noun: obj.noun,
      adjective: obj.adjective === "_" ? "" : obj.adjective,
      description: obj.description,
      icon: obj.icon || "",
      location: obj.location,
      weight: obj.weight,
      isContainer: obj.isContainer,
      isWearable: obj.isWearable,
      isTakeable: obj.isTakeable,
      isLightSource: obj.isLightSource,
      isPSI: obj.isPSI,
      containerCapacity: obj.containerCapacity,
      otxText: obj.otxText,
      attributes: obj.attributes,
    })),
    rules: backend.rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      process: rule.process || "PRO0",
      enabled: rule.enabled,
      conditions: (rule.conditions || []).map((cond: any) => ({
        type: cond.type,
        params: cond.params || {},
        ...(cond.indirect ? { indirect: cond.indirect } : {}),
      })),
      actions: (rule.actions || []).map((action: any) => ({
        type: action.type,
        params: action.params || {},
        ...(action.indirect ? { indirect: action.indirect } : {}),
        ...(action.text != null ? { text: action.text } : {}),
      })),
      verb: rule.verb,
      noun: rule.noun,
      additionalTriggers: rule.additionalTriggers,
    })),
    flags: backend.flags.map((flag) => ({
      id: flag.id,
      name: flag.name,
      description: flag.description,
      initialValue: flag.initialValue,
    })),
    messages: backend.messages,
    vocabulary: backend.vocabulary.map((vocab) => ({
      word: vocab.word,
      wordType: vocab.wordType.toLowerCase() as
        | "verb"
        | "noun"
        | "adjective"
        | "adverb"
        | "preposition"
        | "pronoun"
        | "conjugation",
      id: vocab.id,
    })),
    music: backend.music.map((track) => ({
      id: track.id,
      name: track.name,
      tempo: track.tempo,
      shape: track.shape,
      volume: track.volume,
      notes: track.notes.map((note) => ({
        note: note.note as
          | "C"
          | "C#"
          | "D"
          | "D#"
          | "E"
          | "F"
          | "F#"
          | "G"
          | "G#"
          | "A"
          | "A#"
          | "B"
          | "R",
        octave: note.octave,
        duration: note.duration,
        dotted: note.dotted,
      })),
    })),
    systemMessages: backend.systemMessages,
    statusBarConfig: (backend as any).statusBarConfig,
  } as any;

  return normalizeGameState(game);
}

export async function newGame(
  title: string,
  author: string
): Promise<DaadGame> {
  const backend = await invoke<BackendGame>("new_game", { title, author });
  return toFrontendGame(backend);
}

export async function getDefaultGame(): Promise<DaadGame> {
  const backend = await invoke<BackendGame>("get_default_game");
  return toFrontendGame(backend);
}

export async function saveGame(game: DaadGame): Promise<string | null> {
  const path = await save({
    filters: [{ name: "DAAD Builder Project", extensions: ["daad.json"] }],
    defaultPath: `${game.title.replace(/\s+/g, "_").toLowerCase()}.daad.json`,
  });

  if (path) {
    const backendGame = toBackendGame(game);
    await invoke("save_game", { game: backendGame, path });
  }

  return path;
}

export async function loadGame(): Promise<DaadGame | null> {
  const path = await open({
    filters: [
      {
        name: "DAAD Builder Project",
        extensions: ["daad.json", "json"],
      },
    ],
    multiple: false,
  });

  if (path) {
    const backend = await invoke<BackendGame>("load_game", { path });
    return toFrontendGame(backend);
  }

  return null;
}

export async function exportDaad(game: DaadGame): Promise<string> {
  const backendGame = toBackendGame(game);
  return invoke<string>("export_daad", { game: backendGame });
}

export async function exportDaadToFile(game: DaadGame): Promise<string | null> {
  const suggestedName = await invoke<string>("get_suggested_filename", {
    title: game.title,
    extension: "dsf",
  });

  const path = await save({
    filters: [{ name: "DAAD Source Code", extensions: ["dsf"] }],
    defaultPath: suggestedName,
  });

  if (path) {
    const backendGame = toBackendGame(game);
    await invoke("export_daad_to_file", { game: backendGame, path });
  }

  return path;
}

export async function validateGame(game: DaadGame): Promise<string[]> {
  const backendGame = toBackendGame(game);
  return invoke<string[]>("validate_game", { game: backendGame });
}

export async function launchAiAssistance(): Promise<string> {
  return invoke<string>("launch_ai_assistance");
}

export async function stopAiAssistance(): Promise<string> {
  return invoke<string>("stop_ai_assistance");
}

export async function checkAiStatus(): Promise<boolean> {
  return invoke<boolean>("check_ai_status");
}