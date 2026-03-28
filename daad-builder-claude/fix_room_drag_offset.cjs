const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Fix the room card drag calculation to account for pan offset and map position
content = content.replace(
  `                  onMouseDown={(e) => {
                    if (isPanning || e.shiftKey) return;
                    e.stopPropagation();
                    const startX = e.clientX / zoom - loc.x;
                    const startY = e.clientY / zoom - loc.y;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      setGame((prev) => ({
                        ...prev,
                        locations: prev.locations.map((l) =>
                          l.id === loc.id
                            ? {
                                ...l,
                                x: (moveEvent.clientX / zoom) - startX - (panOffset.x / zoom),
                                y: (moveEvent.clientY / zoom) - startY - (panOffset.y / zoom)
                              }
                            : l
                        ),
                      }));
                    };`,
  `                  onMouseDown={(e) => {
                    if (isPanning || e.shiftKey) return;
                    e.stopPropagation();
                    const rect = mapRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const startX = (e.clientX - rect.left - panOffset.x) / zoom - loc.x;
                    const startY = (e.clientY - rect.top - panOffset.y) / zoom - loc.y;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      setGame((prev) => ({
                        ...prev,
                        locations: prev.locations.map((l) =>
                          l.id === loc.id
                            ? {
                                ...l,
                                x: (moveEvent.clientX - rect.left - panOffset.x) / zoom - startX,
                                y: (moveEvent.clientY - rect.top - panOffset.y) / zoom - startY
                              }
                            : l
                        ),
                      }));
                    };`
);

fs.writeFileSync(panelPath, content);
console.log('Fixed room drag to keep card under mouse cursor');
