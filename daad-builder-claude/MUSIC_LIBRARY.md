# DAAD Music Library

A comprehensive collection of 50 pre-composed music tracks and sound effects for DAAD games.

## Quick Start

1. Open the **Music** panel in DAAD Builder
2. Click the **📚 Library** button
3. Browse tracks by category
4. **Preview tracks** - Click the ▶ play button on any track to hear it
5. Select the tracks you want to import (click checkbox)
6. Click **Import** - tracks will be assigned new unique IDs in your game

## Using Music in Your Game

Once imported, reference music tracks in your Rules/Responses using the **XPLAY** action:

```
Rule: "Open door"
Conditions: CARRIED key, AT hallway
Actions:
  - XPLAY 0  (plays the music track with ID 0)
  - MES 15   ("The door creaks open")
  - GOTO 23
```

## Library Contents

### UI & Feedback (IDs 0-9)
- **Item Pickup** - Short upward chime when picking up items
- **Item Drop** - Downward chime when dropping items
- **Success/Confirm** - Positive feedback for successful actions
- **Error/Deny** - Negative feedback for invalid actions
- **Menu Select** - Quick beep for menu selection
- **Menu Navigate** - Subtle beep for menu navigation
- **Unlock/Solve Puzzle** - Ascending scale for unlocking/solving
- **Achievement/Discovery** - Triumphant chord for discoveries
- **Warning/Alert** - Repetitive alert tone
- **Coin/Score** - High-pitched ding for collecting items

### Doors & Objects (IDs 10-14)
- **Door Open** - Creaking door opening sound
- **Door Close** - Creaking door closing sound
- **Door Locked** - Double beep indicating locked door
- **Chest Open** - Rising tone with final high note
- **Switch/Lever** - Quick mechanical sound

### Movement & Environment (IDs 15-19)
- **Footsteps (Single)** - Single footstep sound
- **Footsteps (Walking)** - Walking rhythm (4 steps)
- **Footsteps (Running)** - Fast running rhythm (8 steps)
- **Splash/Water** - Descending splash sound
- **Wind/Breeze** - Gentle ambient wind sound

### Combat & Danger (IDs 20-24)
- **Sword Swing** - Quick descending whoosh
- **Hit/Impact** - Heavy impact sound
- **Enemy Appear** - Ominous ascending tone
- **Player Hurt** - Descending pain sound
- **Enemy Defeated** - Descending defeat sound

### Magic & Special (IDs 25-29)
- **Magic Spell** - Ascending magical sparkle
- **Teleport** - Alternating high-low teleport sound
- **Power Up** - Ascending power-up scale
- **Power Down** - Descending power-down scale
- **Mystery/Question** - Questioning melodic phrase

### Victory & Success (IDs 30-32)
- **Victory Fanfare** - Classic victory theme
- **Level Complete** - Quick completion fanfare
- **Quest Complete** - Extended victory melody

### Defeat & Game Over (IDs 33-34)
- **Game Over** - Sad descending game over theme
- **Player Death** - Descending death melody

### Ambient & Atmosphere (IDs 35-39)
- **Mysterious Ambience** - Subtle mysterious background
- **Danger Theme** - Tense danger music
- **Peaceful Melody** - Calm peaceful music
- **Suspense Build** - Slowly building tension
- **Sad/Melancholy** - Sad emotional music

### Clock & Time (IDs 40-41)
- **Clock Ticking** - Regular ticking sound
- **Bell Chimes** - Three bell chimes

### Title & Intro (IDs 42-44)
- **Title Screen Theme** - Upbeat title screen music
- **Game Start** - Rising game start fanfare
- **Cutscene Music** - Gentle cutscene background music

### Special Events (IDs 45-49)
- **Boss Encounter** - Dramatic boss battle intro
- **Treasure Found** - Ascending treasure discovery
- **Secret Discovered** - Mysterious secret reveal
- **Transformation/Morph** - Ascending transformation sound
- **Final Boss Victory** - Epic victory fanfare

## Technical Details

### Cross-Platform Compatibility

All music tracks use the DAAD MML (Music Macro Language) format, which compiles to platform-specific audio:

- **ZX Spectrum** - Beeper (square wave)
- **Commodore 64** - SID chip
- **Amstrad CPC** - AY-3-8912 PSG
- **MSX** - PSG
- **Amiga** - Paula audio chip
- **PC** - PC speaker / Sound Blaster

You write music once, and it plays on all platforms!

### Music Parameters

Each track has the following properties:

- **Tempo** - Speed in BPM (40-240)
- **Shape** - Waveform shape (0-7)
  - 0-3: Square waves with different duty cycles
  - 4-7: More complex waveforms (platform-dependent)
- **Volume** - Volume level (0-15000)
- **Notes** - Sequence of musical notes

### Note System

Notes follow standard musical notation:
- **Pitch**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B, R (rest)
- **Octave**: 3-6 (4 is middle octave)
- **Duration**: 1 (whole), 2 (half), 4 (quarter), 8 (eighth), 16 (16th), 32 (32nd)
- **Dotted**: Extends note duration by 50%

### MML Format Example

```
T120S3M5000O4C4D4E4F4G4A4B4O5C2
```

Breaks down as:
- `T120` - Tempo 120 BPM
- `S3` - Shape 3 (waveform)
- `M5000` - Volume 5000
- `O4` - Octave 4
- `C4D4E4...` - Quarter notes C, D, E, etc.
- `O5C2` - Octave 5, half note C

## Customizing Tracks

After importing, you can:
1. Edit the track name
2. Adjust tempo, shape, and volume
3. Add, remove, or modify notes using the piano keyboard
4. Play the track to preview changes

## Best Practices

1. **Import Selectively** - Only import tracks you'll actually use to keep your game file small
2. **Consistent Volume** - Keep volume levels similar across tracks for consistent audio experience
3. **Test on Target Platform** - Different platforms may sound slightly different
4. **Use Categories** - Browse by category to quickly find the right sound for your needs
5. **Document Usage** - Add comments in your rules explaining which music plays when

## Example Usage

```
; Game intro
_ _ ; No conditions (always runs)
  XPLAY 42  ; Title Screen Theme
  MES 1     ; "Welcome to the adventure!"
  ANYKEY

; Victory condition
CARRIED treasure
AT exit
  XPLAY 30  ; Victory Fanfare
  MES 99    ; "You won!"
  END

; Walking sound
VERB "walk"
  XPLAY 16  ; Footsteps (Walking)
  DONE

; Opening a door
VERB "open"
NOUN1 "door"
CARRIED key
  XPLAY 10  ; Door Open
  MES 50    ; "The door creaks open"
  DONE

; Locked door
VERB "open"
NOUN1 "door"
NOTCARR key
  XPLAY 12  ; Door Locked
  MES 51    ; "The door is locked"
  DONE

; Finding a secret
VERB "push"
NOUN1 "stone"
AT hidden_room
  XPLAY 47  ; Secret Discovered
  CREATE secret_passage
  MES 77    ; "A secret passage opens!"
  DONE
```

## Contributing

The music library is defined in `src/data/musicLibrary.ts`. You can:
- Add new tracks by extending the `MUSIC_LIBRARY` array
- Create new categories in `MUSIC_CATEGORIES`
- Modify existing tracks (though this may affect games using them)

## License

All music tracks in this library are original compositions created specifically for DAAD games and are free to use in your projects.
