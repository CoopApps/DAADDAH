const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ObjectsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Update the location select to support containers
content = content.replace(
  /value=\{\s*selectedObj\.location\.type === "at"\s*\? `at:\$\{selectedObj\.location\.locationId\}`\s*: selectedObj\.location\.type\s*\}/,
  `value={
                    selectedObj.location.type === "at"
                      ? \`at:\${selectedObj.location.locationId}\`
                      : selectedObj.location.type === "inside"
                      ? \`inside:\${selectedObj.location.containerId}\`
                      : selectedObj.location.type
                  }`
);

// Update onChange handler to support inside: prefix
content = content.replace(
  /if \(val\.startsWith\("at:"\)\) \{\s*newLoc = \{ type: "at", locationId: parseInt\(val\.split\(":"\)\[1\]\) \};\s*\} else \{\s*newLoc = \{ type: val as "carried" \| "worn" \| "limbo" \};\s*\}/,
  `if (val.startsWith("at:")) {
                      newLoc = { type: "at", locationId: parseInt(val.split(":")[1]) };
                    } else if (val.startsWith("inside:")) {
                      newLoc = { type: "inside", containerId: parseInt(val.split(":")[1]) };
                    } else {
                      newLoc = { type: val as "carried" | "worn" | "limbo" };
                    }`
);

// Add container options to the select dropdown - insert before closing </select>
content = content.replace(
  /\{game\.locations\.map\(\(loc\) => \(\s*<option key=\{loc\.id\} value=\{`at:\$\{loc\.id\}`\}>\s*At: \{loc\.name\}\s*<\/option>\s*\)\)\}\s*<\/select>/,
  `{game.locations.map((loc) => (
                    <option key={loc.id} value={\`at:\${loc.id}\`}>
                      At: {loc.name}
                    </option>
                  ))}
                  {game.objects.filter(o => o.isContainer && o.id !== selectedObj.id).length > 0 && (
                    <optgroup label="Inside Container">
                      {game.objects
                        .filter(o => o.isContainer && o.id !== selectedObj.id)
                        .map(container => (
                          <option key={container.id} value={\`inside:\${container.id}\`}>
                            In: {container.adjective} {container.noun}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>`
);

fs.writeFileSync(panelPath, content);
console.log('Enhanced ObjectsPanel with container support');
