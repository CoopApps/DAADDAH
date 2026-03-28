# Creating Locations

## What is a Location?

Locations are the rooms/areas in your adventure game. The player moves between locations using direction commands (GO NORTH, SOUTH, etc.).

## Location Structure

```json
{
  "id": 0,
  "name": "Entrance Hall",
  "description": "A grand entrance hall with marble floors. A crystal chandelier hangs overhead. Stairs lead up to the north, and doors exit east and west.",
  "isDark": false,
  "exits": {
    "north": 1,
    "south": null,
    "east": 2,
    "west": 3,
    "northeast": null,
    "northwest": null,
    "southeast": null,
    "southwest": null,
    "up": null,
    "down": null,
    "in": null,
    "out": null
  },
  "x": 200,
  "y": 200
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique ID (0-based, sequential) |
| name | string | Yes | Short room name (shown in UI) |
| description | string | Yes | Full room description (shown to player) |
| isDark | boolean | Yes | If true, requires light source to see |
| exits | object | Yes | Connections to other locations |
| x, y | number | Yes | Position on the visual map editor |

## Exits

Exits use direction names as keys. The value is either:
- A number (location ID) - player can go that direction
- `null` - no exit in that direction

### Available Directions
- Cardinal: `north`, `south`, `east`, `west`
- Diagonal: `northeast`, `northwest`, `southeast`, `southwest`
- Vertical: `up`, `down`
- Abstract: `in`, `out`

## Creating Connected Locations

When creating multiple locations, make sure exits are bidirectional (unless you want one-way passages):

```json
{
  "locations": [
    {
      "id": 0,
      "name": "Living Room",
      "description": "A cozy living room with a fireplace.",
      "isDark": false,
      "exits": {
        "north": 1,
        "south": null, "east": null, "west": null,
        "northeast": null, "northwest": null, "southeast": null, "southwest": null,
        "up": null, "down": null, "in": null, "out": null
      },
      "x": 200, "y": 300
    },
    {
      "id": 1,
      "name": "Kitchen",
      "description": "A small kitchen with copper pots hanging from the ceiling.",
      "isDark": false,
      "exits": {
        "north": null,
        "south": 0,
        "east": null, "west": null,
        "northeast": null, "northwest": null, "southeast": null, "southwest": null,
        "up": null, "down": null, "in": null, "out": null
      },
      "x": 200, "y": 200
    }
  ]
}
```

## Dark Rooms

Dark rooms require a light source to see. Without light:
- The room description is hidden
- Objects in the room can't be seen
- Some actions may fail

```json
{
  "id": 5,
  "name": "Cellar",
  "description": "A damp cellar with stone walls. Cobwebs cover the corners.",
  "isDark": true,
  "exits": {
    "up": 0,
    "north": null, "south": null, "east": null, "west": null,
    "northeast": null, "northwest": null, "southeast": null, "southwest": null,
    "down": null, "in": null, "out": null
  },
  "x": 200, "y": 400
}
```

## Example: Creating a Small House

Prompt to Claude:
```
Create a 4-room house with:
- Living room (starting location, id 0)
- Kitchen to the north
- Bedroom to the east
- Bathroom connected to bedroom

Make the bathroom dark (broken light).
Position them logically on a 400x400 grid.
```

Expected output:
```json
{
  "locations": [
    {
      "id": 0,
      "name": "Living Room",
      "description": "A comfortable living room with worn sofas and a small television. The kitchen is to the north, and the bedroom to the east.",
      "isDark": false,
      "exits": {
        "north": 1, "east": 2,
        "south": null, "west": null,
        "northeast": null, "northwest": null, "southeast": null, "southwest": null,
        "up": null, "down": null, "in": null, "out": null
      },
      "x": 200, "y": 300
    },
    {
      "id": 1,
      "name": "Kitchen",
      "description": "A tidy kitchen with checkered linoleum floor. Dishes are stacked neatly by the sink.",
      "isDark": false,
      "exits": {
        "south": 0,
        "north": null, "east": null, "west": null,
        "northeast": null, "northwest": null, "southeast": null, "southwest": null,
        "up": null, "down": null, "in": null, "out": null
      },
      "x": 200, "y": 200
    },
    {
      "id": 2,
      "name": "Bedroom",
      "description": "A small bedroom with a single bed and a wooden wardrobe. The bathroom is to the north.",
      "isDark": false,
      "exits": {
        "west": 0, "north": 3,
        "south": null, "east": null,
        "northeast": null, "northwest": null, "southeast": null, "southwest": null,
        "up": null, "down": null, "in": null, "out": null
      },
      "x": 300, "y": 300
    },
    {
      "id": 3,
      "name": "Bathroom",
      "description": "A cramped bathroom with cracked tiles. The light bulb is broken.",
      "isDark": true,
      "exits": {
        "south": 2,
        "north": null, "east": null, "west": null,
        "northeast": null, "northwest": null, "southeast": null, "southwest": null,
        "up": null, "down": null, "in": null, "out": null
      },
      "x": 300, "y": 200
    }
  ]
}
```

## Description Writing Tips

Good descriptions:
- Are 2-3 sentences max
- Mention visible exits
- Set atmosphere and mood
- Hint at interactive elements
- Avoid listing objects (those appear separately)

```
# Good
"A dusty library with floor-to-ceiling bookshelves. Afternoon light streams through a grimy window. A door leads north."

# Too long
"This is a library. It has many books on shelves. The shelves go from floor to ceiling. There is dust everywhere. A window lets in light but it is dirty. You can see a door to the north that leads to the hallway."

# Too short
"A library."
```

## Map Positioning

The `x` and `y` values position rooms on the visual editor grid:
- Use increments of 100 for easy alignment
- North = lower y value
- East = higher x value
- Keep related rooms close together

```
(100,100) (200,100) (300,100)
(100,200) (200,200) (300,200)
(100,300) (200,300) (300,300)
```

## Checklist

Before finalizing locations:
- [ ] All IDs are unique and sequential from 0
- [ ] Two-way exits are properly linked
- [ ] Descriptions mention exits
- [ ] Dark rooms have a gameplay reason
- [ ] Map positions don't overlap
- [ ] Starting location (ID 0) makes sense

## Next Steps

After creating locations:
1. Add objects to your locations (see `03-OBJECTS.md`)
2. Add vocabulary for location-specific nouns (see `05-VOCABULARY.md`)
3. Create rules for special interactions (see `04-RULES.md`)
