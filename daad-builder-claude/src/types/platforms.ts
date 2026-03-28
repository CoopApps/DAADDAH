// Platform graphics specifications for DAAD target systems

export type PlatformId =
  | "zx_spectrum"
  | "commodore_64"
  | "amstrad_cpc_mode0"
  | "amstrad_cpc_mode1"
  | "msx"
  | "amiga"
  | "atari_st"
  | "msdos";

export interface PlatformSpec {
  id: PlatformId;
  name: string;
  displayName: string;
  resolution: {
    width: number;
    height: number;
  };
  colorDepth: number;
  paletteSize: number;
  palette?: string[]; // Hex color values
  restrictions: {
    attributeBlockSize?: { width: number; height: number };
    colorsPerBlock?: number;
    description: string;
  };
}

export const PLATFORMS: Record<PlatformId, PlatformSpec> = {
  zx_spectrum: {
    id: "zx_spectrum",
    name: "ZX Spectrum",
    displayName: "ZX Spectrum (48K/128K)",
    resolution: { width: 256, height: 192 },
    colorDepth: 3, // 3-bit RGB
    paletteSize: 8,
    palette: [
      "#000000", // Black
      "#0000D7", // Blue
      "#D70000", // Red
      "#D700D7", // Magenta
      "#00D700", // Green
      "#00D7D7", // Cyan
      "#D7D700", // Yellow
      "#D7D7D7", // White
    ],
    restrictions: {
      attributeBlockSize: { width: 8, height: 8 },
      colorsPerBlock: 2,
      description: "2 colors per 8×8 block (attribute clash)",
    },
  },

  commodore_64: {
    id: "commodore_64",
    name: "Commodore 64",
    displayName: "Commodore 64",
    resolution: { width: 320, height: 200 },
    colorDepth: 4,
    paletteSize: 16,
    palette: [
      "#000000", "#FFFFFF", "#813338", "#75CEC8",
      "#8E3C97", "#56AC4D", "#2E2C9B", "#EDF171",
      "#8E5029", "#553800", "#C46C71", "#4A4A4A",
      "#7B7B7B", "#A9FF9F", "#706DEB", "#B2B2B2",
    ],
    restrictions: {
      attributeBlockSize: { width: 8, height: 8 },
      colorsPerBlock: 2,
      description: "HiRes: 2 colors per 8×8 cell, Multicolor: 4 colors per block",
    },
  },

  amstrad_cpc_mode0: {
    id: "amstrad_cpc_mode0",
    name: "Amstrad CPC",
    displayName: "Amstrad CPC (Mode 0)",
    resolution: { width: 160, height: 200 },
    colorDepth: 12, // 3-level RGB
    paletteSize: 16, // 16 simultaneous from 27
    // 27-color palette (3-level RGB)
    palette: [
      "#000000", "#000080", "#0000FF", "#800000", "#800080", "#8000FF",
      "#FF0000", "#FF0080", "#FF00FF", "#008000", "#008080", "#0080FF",
      "#808000", "#808080", "#8080FF", "#FF8000", "#FF8080", "#FF80FF",
      "#00FF00", "#00FF80", "#00FFFF", "#80FF00", "#80FF80", "#80FFFF",
      "#FFFF00", "#FFFF80", "#FFFFFF",
    ],
    restrictions: {
      description: "16 simultaneous colors from 27-color palette",
    },
  },

  amstrad_cpc_mode1: {
    id: "amstrad_cpc_mode1",
    name: "Amstrad CPC",
    displayName: "Amstrad CPC (Mode 1)",
    resolution: { width: 320, height: 200 },
    colorDepth: 12,
    paletteSize: 4, // 4 simultaneous from 27
    palette: [
      "#000000", "#000080", "#0000FF", "#800000", "#800080", "#8000FF",
      "#FF0000", "#FF0080", "#FF00FF", "#008000", "#008080", "#0080FF",
      "#808000", "#808080", "#8080FF", "#FF8000", "#FF8080", "#FF80FF",
      "#00FF00", "#00FF80", "#00FFFF", "#80FF00", "#80FF80", "#80FFFF",
      "#FFFF00", "#FFFF80", "#FFFFFF",
    ],
    restrictions: {
      description: "4 simultaneous colors from 27-color palette",
    },
  },

  msx: {
    id: "msx",
    name: "MSX",
    displayName: "MSX/MSX2",
    resolution: { width: 256, height: 192 },
    colorDepth: 4,
    paletteSize: 16,
    palette: [
      "#000000", "#000000", "#3EB849", "#74D07D",
      "#5955E0", "#8076F1", "#B95E51", "#65DBEF",
      "#DB6559", "#FF897D", "#CCC35E", "#DED087",
      "#3AA241", "#B766B5", "#CCCCCC", "#FFFFFF",
    ],
    restrictions: {
      description: "Screen 2: 16 colors, 1 color per 8-pixel line segment",
    },
  },

  amiga: {
    id: "amiga",
    name: "Amiga",
    displayName: "Commodore Amiga",
    resolution: { width: 320, height: 200 },
    colorDepth: 12, // 4096 colors total
    paletteSize: 32, // 32 simultaneous in standard modes
    palette: [
      "#000000", "#111111", "#222222", "#333333", "#444444", "#555555", "#666666", "#777777",
      "#888888", "#999999", "#AAAAAA", "#BBBBBB", "#CCCCCC", "#DDDDDD", "#EEEEEE", "#FFFFFF",
      "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
      "#FF8800", "#88FF00", "#00FF88", "#0088FF", "#8800FF", "#FF0088",
      "#884400", "#448800", "#004488", "#880044",
    ],
    restrictions: {
      description: "32 simultaneous colors from 4096-color palette",
    },
  },

  atari_st: {
    id: "atari_st",
    name: "Atari ST",
    displayName: "Atari ST",
    resolution: { width: 320, height: 200 },
    colorDepth: 9, // 512 colors total
    paletteSize: 16, // 16 simultaneous
    palette: [
      "#000000", "#FF0000", "#00FF00", "#FFFF00",
      "#0000FF", "#FF00FF", "#00FFFF", "#FFFFFF",
      "#888888", "#FF8888", "#88FF88", "#FFFF88",
      "#8888FF", "#FF88FF", "#88FFFF", "#F8F8F8",
    ],
    restrictions: {
      description: "16 simultaneous colors from 512-color palette",
    },
  },

  msdos: {
    id: "msdos",
    name: "MS-DOS",
    displayName: "MS-DOS (VGA)",
    resolution: { width: 320, height: 200 },
    colorDepth: 18, // 262,144 colors total (VGA)
    paletteSize: 256, // 256 simultaneous
    palette: ["#000000", "#0000AA", "#00AA00", "#00AAAA", "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA", "#555555", "#5555FF", "#55FF55", "#55FFFF", "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF", "#009000", "#009055", "#0090aa", "#0090ff", "#00b400", "#00b455", "#00b4aa", "#00b4ff", "#00d800", "#00d855", "#00d8aa", "#00d8ff", "#00fc00", "#00fc55", "#00fcaa", "#00fcff", "#240000", "#240055", "#2400aa", "#2400ff", "#242400", "#242455", "#2424aa", "#2424ff", "#244800", "#244855", "#2448aa", "#2448ff", "#246c00", "#246c55", "#246caa", "#246cff", "#249000", "#249055", "#2490aa", "#2490ff", "#24b400", "#24b455", "#24b4aa", "#24b4ff", "#24d800", "#24d855", "#24d8aa", "#24d8ff", "#24fc00", "#24fc55", "#24fcaa", "#24fcff", "#480000", "#480055", "#4800aa", "#4800ff", "#482400", "#482455", "#4824aa", "#4824ff", "#484800", "#484855", "#4848aa", "#4848ff", "#486c00", "#486c55", "#486caa", "#486cff", "#489000", "#489055", "#4890aa", "#4890ff", "#48b400", "#48b455", "#48b4aa", "#48b4ff", "#48d800", "#48d855", "#48d8aa", "#48d8ff", "#48fc00", "#48fc55", "#48fcaa", "#48fcff", "#6c0000", "#6c0055", "#6c00aa", "#6c00ff", "#6c2400", "#6c2455", "#6c24aa", "#6c24ff", "#6c4800", "#6c4855", "#6c48aa", "#6c48ff", "#6c6c00", "#6c6c55", "#6c6caa", "#6c6cff", "#6c9000", "#6c9055", "#6c90aa", "#6c90ff", "#6cb400", "#6cb455", "#6cb4aa", "#6cb4ff", "#6cd800", "#6cd855", "#6cd8aa", "#6cd8ff", "#6cfc00", "#6cfc55", "#6cfcaa", "#6cfcff", "#900000", "#900055", "#9000aa", "#9000ff", "#902400", "#902455", "#9024aa", "#9024ff", "#904800", "#904855", "#9048aa", "#9048ff", "#906c00", "#906c55", "#906caa", "#906cff", "#909000", "#909055", "#9090aa", "#9090ff", "#90b400", "#90b455", "#90b4aa", "#90b4ff", "#90d800", "#90d855", "#90d8aa", "#90d8ff", "#90fc00", "#90fc55", "#90fcaa", "#90fcff", "#b40000", "#b40055", "#b400aa", "#b400ff", "#b42400", "#b42455", "#b424aa", "#b424ff", "#b44800", "#b44855", "#b448aa", "#b448ff", "#b46c00", "#b46c55", "#b46caa", "#b46cff", "#b49000", "#b49055", "#b490aa", "#b490ff", "#b4b400", "#b4b455", "#b4b4aa", "#b4b4ff", "#b4d800", "#b4d855", "#b4d8aa", "#b4d8ff", "#b4fc00", "#b4fc55", "#b4fcaa", "#b4fcff", "#d80000", "#d80055", "#d800aa", "#d800ff", "#d82400", "#d82455", "#d824aa", "#d824ff", "#d84800", "#d84855", "#d848aa", "#d848ff", "#d86c00", "#d86c55", "#d86caa", "#d86cff", "#d89000", "#d89055", "#d890aa", "#d890ff", "#d8b400", "#d8b455", "#d8b4aa", "#d8b4ff", "#d8d800", "#d8d855", "#d8d8aa", "#d8d8ff", "#d8fc00", "#d8fc55", "#d8fcaa", "#d8fcff", "#fc0000", "#fc0055", "#fc00aa", "#fc00ff", "#fc2400", "#fc2455", "#fc24aa", "#fc24ff", "#fc4800", "#fc4855", "#fc48aa", "#fc48ff", "#fc6c00", "#fc6c55", "#fc6caa", "#fc6cff", "#fc9000", "#fc9055", "#fc90aa", "#fc90ff", "#fcb400", "#fcb455", "#fcb4aa", "#fcb4ff", "#fcd800", "#fcd855", "#fcd8aa", "#fcd8ff", "#fcfc00", "#fcfc55", "#fcfcaa", "#fcfcff"],
    restrictions: {
      description: "256 simultaneous colors from 262K-color palette",
    },
  },
};

// Get ordered list of platforms for UI display
export const PLATFORM_LIST: PlatformSpec[] = [
  PLATFORMS.zx_spectrum,
  PLATFORMS.commodore_64,
  PLATFORMS.amstrad_cpc_mode0,
  PLATFORMS.amstrad_cpc_mode1,
  PLATFORMS.msx,
  PLATFORMS.amiga,
  PLATFORMS.atari_st,
  PLATFORMS.msdos,
];
