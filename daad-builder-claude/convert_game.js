// Convert game from Rust backend format to TypeScript frontend format
const fs = require('fs');

const game = JSON.parse(fs.readFileSync('./CARRADOS_FINAL_WORKING.json', 'utf8'));

// Convert locations from connections to exits
game.locations = game.locations.map(loc => {
  const exits = {
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

  for (const conn of (loc.connections || [])) {
    const dir = conn.direction.toLowerCase();
    if (dir in exits) {
      exits[dir] = conn.target_location;
    }
  }

  return {
    id: loc.id,
    name: loc.name,
    description: loc.description,
    isDark: loc.is_dark,
    exits,
    x: loc.editor_x,
    y: loc.editor_y,
    image: loc.image ? {
      sourceData: loc.image.source_data,
      yPosition: loc.image.y_position,
      height: loc.image.height,
    } : undefined,
  };
});

// Convert object locations
game.objects = game.objects.map(obj => {
  let location;
  if (obj.location.type === 'Location') {
    location = { type: 'at', locationId: obj.location.value };
  } else if (obj.location.type === 'Limbo') {
    location = { type: 'limbo' };
  } else if (obj.location.type === 'Carried') {
    location = { type: 'carried' };
  } else if (obj.location.type === 'Worn') {
    location = { type: 'worn' };
  } else {
    location = obj.location; // Already in correct format
  }

  return {
    id: obj.id,
    noun: obj.noun,
    adjective: obj.adjective,
    description: obj.description || obj.name,
    icon: obj.icon,
    weight: obj.weight,
    location,
    isContainer: obj.is_container,
    isWearable: obj.is_wearable,
    isTakeable: obj.is_takeable,
    isLightSource: obj.is_light_source,
    isPSI: obj.is_psi,
  };
});

// Convert flags
game.flags = game.flags.map(f => ({
  id: f.id,
  name: f.name,
  description: f.description,
  initialValue: f.initial_value,
}));

// Convert vocabulary
game.vocabulary = game.vocabulary.map(v => ({
  word: v.word,
  wordType: v.word_type,
  id: v.id,
}));

// Convert music (if any)
if (game.music) {
  game.music = game.music.map(m => ({
    id: m.id,
    name: m.name,
    notes: m.notes.map(n => ({
      note: n.note,
      octave: n.octave,
      duration: n.duration,
      dotted: n.dotted,
    })),
  }));
}

// Output
fs.writeFileSync('./CARRADOS_FRONTEND_FORMAT.json', JSON.stringify(game, null, 2));
console.log('Converted! Saved to CARRADOS_FRONTEND_FORMAT.json');
console.log(`\nLocation 1 (${game.locations[1].name}) exits:`, game.locations[1].exits);
