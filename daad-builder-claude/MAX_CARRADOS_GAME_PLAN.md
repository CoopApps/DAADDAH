# Max Carrados: The Knight's Cross Signal Problem

## Game Overview

A mystery adventure based on the Max Carrados story "The Knight's Cross Signal Problem". The player is Max Carrados, a blind detective investigating a railway signal accident that may have been deliberately caused.

## Story Summary

Max Carrados receives a telegram from Hutchins, a railway signalman accused of causing an accident at Knight's Cross junction. Hutchins claims the accident was deliberate sabotage, not his fault. Carrados must investigate various locations in London, interview witnesses, and gather evidence to solve the mystery.

The villain is Harold Pendleton, a stockbroker who stood to profit from railway stock losses. He arranged for the signal lamp glass to be broken precisely to the width needed to show a false "clear" signal, causing the accident.

## Locations (15 total)

### Richmond Area (Starting Location)
0. **Richmond Terrace** - Carrados's townhouse entrance
1. **Study** - Carrados's private study (telegram here)
2. **Motor Car at Richmond** - Transportation hub

### Holloway Area (Signal Box)
3. **Holloway Road** - Street near signal box
4. **Motor Car at Holloway** - Transportation hub
5. **Knight's Cross Signal Box** - Crime scene (ruler and glass here)

### Hampton Area (Mead's Cottage)
6. **Hampton Street** - Residential area
7. **Motor Car at Hampton** - Transportation hub
8. **Mead's Cottage** - Interview with retired signalman Mead

### Woundy Street Area (Hutchins's Home)
9. **Woundy Street** - Near the docks
10. **Motor Car at Woundy** - Transportation hub
11. **Hutchins's Kitchen** - Interview with accused signalman (newspapers here)

### City Area (Pendleton's Office)
12. **Threadneedle Street** - Financial district
13. **Motor Car in the City** - Transportation hub
14. **Pendleton's Office** - Villain's location (certificate here)

## Motor Car System

The game uses a realistic motor car transportation system:
- Each destination has TWO rooms: Motor Car + Destination
- From Richmond (location 2), player can DRIVE to: HOLLOWAY, HAMPTON, WOUNDY, or CITY
- From any motor car location, player can DRIVE to any other destination
- Player must be IN the motor car to drive
- Driver is Parkinson (Carrados's manservant)

## Objects (5 evidence items)

0. **Ruler** (at location 5: Signal Box) - Shows measurement of 4-7/8 inches
1. **Glass** (at location 5: Signal Box) - Broken lamp glass, precisely measured
2. **Newspapers** (at location 11: Hutchins's Kitchen) - Financial news about railway stocks
3. **Telegram/Guide** (at location 1: Study) - Hutchins's plea for help
4. **Certificate** (at location 14: Pendleton's Office) - Stock purchase proof

## Vocabulary Needed

### Verbs
- examine, x
- take, get
- drop
- read
- interview, ask, talk
- drive
- accuse
- look, l
- inventory, i
- (Plus standard movement: n, s, e, w, ne, nw, se, sw, u, d, in, out)

### Nouns (Objects)
- ruler
- glass
- newspapers, paper
- telegram, guide
- certificate

### Nouns (People - for INTERVIEW)
- hutchins
- mead
- pendleton

### Nouns (Destinations - for DRIVE)
- richmond
- holloway
- hampton
- woundy
- city

## Flags Used

- **Flag 38**: ruler_examined (0=not examined, 1=examined)
- **Flag 39**: glass_examined (0=not examined, 1=examined)
- **Flag 40**: certificate_examined (0=not examined, 1=examined)

## Messages Needed

Descriptions and responses for:
- Examining evidence (ruler, glass, certificate) with clue text
- Reading items (newspapers, telegram)
- Interviewing NPCs (Hutchins, Mead, Pendleton)
- Driving transitions ("Parkinson skillfully navigates...")
- Accusation responses (success and failure)
- Victory message and confession

## Win Condition

Player must:
1. EXAMINE all three pieces of evidence (ruler, glass, certificate)
   - This sets flags 38, 39, and 40
2. ACCUSE PENDLETON while all three flags are set
3. Game displays victory message, Pendleton's confession, and congratulations
4. Game ends with END action

If player ACCUSES without examining all evidence, they get a "not enough evidence" message.

## Responses Needed

### Evidence Examination (with flag setting)
- EXAMINE RULER → Show description + Set flag 38
- EXAMINE GLASS → Show description + Set flag 39
- EXAMINE CERTIFICATE → Show description + Set flag 40

### Reading
- READ NEWSPAPERS → Financial information
- READ TELEGRAM → Hutchins's message

### Interviews
- INTERVIEW HUTCHINS (at location 11) → His testimony
- INTERVIEW MEAD (at location 8) → His reluctant testimony
- INTERVIEW PENDLETON (at location 14) → His false alibi

### Motor Car Navigation
- DRIVE HOLLOWAY (from any motor car) → Navigate to location 4
- DRIVE HAMPTON (from any motor car) → Navigate to location 7
- DRIVE WOUNDY (from any motor car) → Navigate to location 10
- DRIVE CITY (from any motor car) → Navigate to location 13
- DRIVE RICHMOND (from any motor car) → Navigate to location 2

### Win Condition
- ACCUSE PENDLETON (with all flags set) → Victory
- ACCUSE PENDLETON (without all flags) → Insufficient evidence

## Development Stages

### Stage 1: World Structure ✓
- Create all 15 locations with exits and descriptions
- Set up motor car connection system

### Stage 2: Evidence Objects
- Create 5 objects with proper locations and descriptions
- Make items takeable where appropriate

### Stage 3: Vocabulary
- Add all verbs (examine, read, interview, drive, accuse)
- Add all nouns (objects, people, destinations)

### Stage 4: Messages
- Write all description text
- Write clue text for evidence
- Write interview dialogues
- Write victory/failure messages

### Stage 5: Responses
- EXAMINE responses with flag setting
- READ responses
- INTERVIEW responses
- DRIVE navigation responses
- ACCUSE win condition responses

### Stage 6: Testing
- Test evidence collection
- Test all interviews
- Test motor car system
- Test win condition
- Test failure cases

## Game Flow

1. Player starts at Richmond Terrace (location 0)
2. Can enter Study (location 1) to read telegram
3. Can enter Motor Car (location 2) to travel
4. Drive to various locations to gather evidence:
   - Signal Box (location 5): ruler and glass
   - Hutchins's Kitchen (location 11): newspapers
   - Pendleton's Office (location 14): certificate
5. Interview witnesses at their locations
6. Examine all three key pieces of evidence (sets flags)
7. Accuse Pendleton to win

## Technical Notes

- All game logic stored in Responses, not hardcoded
- Motor car system uses GOTO actions to change location
- Flag system tracks investigation progress
- Multiple conditions check all evidence examined before allowing win
- Game uses standard DAAD two-word parser (VERB NOUN)
