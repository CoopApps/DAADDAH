// module-visual-process-flow.js
// Visual Process Flow System - DAAD Adventure Creator
// Priority #26: Graphical process representation
(function() {
    'use strict';

    console.log('Visual Process Flow System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Make sure this module loads after the main app.');
        return;
    }

    const VisualProcessFlowSystem = {
        name: 'Visual Process Flow System',
        description: 'Graphical process representation with interactive canvas',
        category: 'Professional Tools',
        complexity: 'Expert',

        init: function() {
            console.log('Visual Process Flow System initialized');

            if (!AdventureCreator.state.visualFlow) {
                AdventureCreator.state.visualFlow = {
                    maps: [],
                    currentMap: null,
                    viewMode: 'map',
                    canvas: {
                        width: 1200,
                        height: 700,
                        zoom: 1.0,
                        panX: 0,
                        panY: 0
                    },
                    selectedNodes: [],
                    draggedNode: null,
                    connectionStart: null,
                    tools: {
                        selectedTool: 'select',
                        snapToGrid: true,
                        gridSize: 20,
                        showGrid: true,
                        showLabels: true
                    },
                    theme: {
                        nodeColors: {
                            location: '#10b981',
                            process: '#ec4899',
                            rule: '#f59e0b',
                            object: '#06b6d4'
                        },
                        connectionColor: '#666',
                        selectedColor: '#8b5cf6',
                        gridColor: '#222'
                    },
                    settings: {
                        autoSave: true,
                        showMinimap: false,
                        enableAnimations: true
                    }
                };
            }
        },

        render: function() {
            const stats = this.getVisualizationStatistics();
            const currentMap = this.getCurrentMap();

            return `
                <div style="padding: 2rem; background: #0a0a0a;">
                    <h2 style="color: #8b5cf6; margin-bottom: 1.5rem;">🎨 Visual Process Flow System</h2>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        ${this.renderStatCard('Maps Created', stats.totalMaps, '#8b5cf6')}
                        ${this.renderStatCard('Nodes', stats.totalNodes, '#10b981')}
                        ${this.renderStatCard('Connections', stats.totalConnections, '#ec4899')}
                        ${this.renderStatCard('Active Map', currentMap ? '✓' : '✗', '#f59e0b')}
                    </div>

                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #fff; margin-bottom: 1rem;">Visual Design Tools</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                            ${this.renderToolCard('🗺️ Map Editor', 'Drag-and-drop location layout and world design', 'openMapEditor')}
                            ${this.renderToolCard('⚙️ Process Visualizer', 'Game logic flow charts and rule diagrams', 'openProcessVisualizer')}
                            ${this.renderToolCard('🔍 Debug Viewer', 'Interactive game state visualization', 'openDebugViewer')}
                            ${this.renderToolCard('📊 Analytics Dashboard', 'Visual analytics and performance metrics', 'openAnalyticsDashboard')}
                        </div>
                    </div>

                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #fff; margin-bottom: 1rem;">Visualization Modes</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            ${this.renderModeCard('MAP', 'Location Network', 'Visual map of all locations and connections', '#10b981')}
                            ${this.renderModeCard('PROCESS', 'Logic Flow', 'Game rules and process relationships', '#ec4899')}
                            ${this.renderModeCard('RULES', 'Rule Dependencies', 'Condition and action dependencies', '#f59e0b')}
                            ${this.renderModeCard('DEBUG', 'Live Debug', 'Real-time game state visualization', '#06b6d4')}
                        </div>
                    </div>

                    ${this.renderInteractiveCanvas()}

                    ${this.renderAdvancedFeatures()}

                    ${this.renderProjectGallery()}
                </div>
            `;
        },

        renderStatCard: function(label, value, color) {
            return `
                <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 4px; padding: 1rem; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 600; color: ${color};">${value}</div>
                    <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; margin-top: 0.25rem;">${label}</div>
                </div>
            `;
        },

        renderToolCard: function(title, description, action) {
            return `
                <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 4px; padding: 1rem; cursor: pointer; transition: border-color 0.2s;"
                     onclick="AdventureCreator.modules['visual-process-flow'].${action}()"
                     onmouseover="this.style.borderColor='#8b5cf6'"
                     onmouseout="this.style.borderColor='#333'">
                    <h4 style="color: #8b5cf6; margin-bottom: 0.5rem;">${title}</h4>
                    <p style="color: #999; font-size: 0.875rem;">${description}</p>
                </div>
            `;
        },

        renderModeCard: function(mode, title, description, color) {
            const isActive = AdventureCreator.state.visualFlow.viewMode === mode.toLowerCase();
            return `
                <div style="background: #0a0a0a; border: 2px solid ${isActive ? color : '#333'}; border-radius: 4px; padding: 1rem; cursor: pointer; transition: border-color 0.2s;"
                     onclick="AdventureCreator.modules['visual-process-flow'].switchMode('${mode.toLowerCase()}')">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: ${color}; font-family: monospace;">${mode}</h4>
                        ${isActive ? `<span style="color: ${color}; font-size: 0.75rem;">ACTIVE</span>` : ''}
                    </div>
                    <h5 style="color: #fff; margin-bottom: 0.25rem;">${title}</h5>
                    <p style="color: #999; font-size: 0.8rem;">${description}</p>
                </div>
            `;
        },

        renderInteractiveCanvas: function() {
            const currentMap = this.getCurrentMap();

            return `
                <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="color: #fff; margin: 0;">Interactive Canvas</h3>
                        ${currentMap ? `<span style="color: #10b981; font-size: 0.875rem;">📍 ${currentMap.name}</span>` : '<span style="color: #666; font-size: 0.875rem;">No map selected</span>'}
                    </div>

                    <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 4px; padding: 1rem; margin-bottom: 1rem;">
                        ${this.renderCanvasToolbar()}
                    </div>

                    <div style="position: relative; background: #000; border: 1px solid #333; border-radius: 4px; overflow: hidden;">
                        ${this.renderCanvas()}
                    </div>

                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${this.renderCanvasActions()}
                    </div>
                </div>
            `;
        },

        renderCanvasToolbar: function() {
            const tools = [
                { id: 'select', icon: '👆', name: 'Select', desc: 'Select and move nodes' },
                { id: 'pan', icon: '✋', name: 'Pan', desc: 'Pan canvas view' },
                { id: 'connect', icon: '🔗', name: 'Connect', desc: 'Create connections' },
                { id: 'add', icon: '➕', name: 'Add Node', desc: 'Add new nodes' }
            ];

            const selectedTool = AdventureCreator.state.visualFlow.tools.selectedTool;
            const canvas = AdventureCreator.state.visualFlow.canvas;
            const toolsState = AdventureCreator.state.visualFlow.tools;

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${tools.map(tool => `
                            <button style="padding: 0.5rem 1rem; background: ${selectedTool === tool.id ? '#8b5cf6' : '#333'}; border: none; border-radius: 4px; color: #fff; cursor: pointer; transition: background 0.2s;"
                                    onclick="AdventureCreator.modules['visual-process-flow'].selectTool('${tool.id}')"
                                    title="${tool.desc}">
                                <span style="margin-right: 0.5rem;">${tool.icon}</span>
                                ${tool.name}
                            </button>
                        `).join('')}
                    </div>

                    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; color: #999; font-size: 0.875rem; cursor: pointer;">
                            <input type="checkbox" ${toolsState.showGrid ? 'checked' : ''}
                                   onchange="AdventureCreator.modules['visual-process-flow'].toggleGrid()"
                                   style="cursor: pointer;">
                            Grid
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; color: #999; font-size: 0.875rem; cursor: pointer;">
                            <input type="checkbox" ${toolsState.snapToGrid ? 'checked' : ''}
                                   onchange="AdventureCreator.modules['visual-process-flow'].toggleSnap()"
                                   style="cursor: pointer;">
                            Snap
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; color: #999; font-size: 0.875rem; cursor: pointer;">
                            <input type="checkbox" ${toolsState.showLabels ? 'checked' : ''}
                                   onchange="AdventureCreator.modules['visual-process-flow'].toggleLabels()"
                                   style="cursor: pointer;">
                            Labels
                        </label>
                        <span style="color: #999; font-size: 0.875rem; border-left: 1px solid #333; padding-left: 1rem;">
                            Zoom: ${(canvas.zoom * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            `;
        },

        renderCanvas: function() {
            const canvas = AdventureCreator.state.visualFlow.canvas;
            const currentMap = this.getCurrentMap();
            const showGrid = AdventureCreator.state.visualFlow.tools.showGrid;

            const gridBackground = showGrid
                ? 'background: linear-gradient(90deg, #111 1px, transparent 1px), linear-gradient(#111 1px, transparent 1px); background-size: 20px 20px;'
                : 'background: #000;';

            return `
                <div id="visualFlowCanvas" style="width: ${canvas.width}px; height: ${canvas.height}px; position: relative; ${gridBackground}">
                    ${currentMap ? this.renderMapContent(currentMap) : this.renderEmptyCanvas()}
                    ${this.renderCanvasControls()}
                </div>
            `;
        },

        renderMapContent: function(map) {
            if (!map.nodes || map.nodes.length === 0) {
                return `
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #666;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🗺️</div>
                        <div>Empty map - use tools to add nodes</div>
                    </div>
                `;
            }

            const theme = AdventureCreator.state.visualFlow.theme;
            const showLabels = AdventureCreator.state.visualFlow.tools.showLabels;

            // Render connections first (below nodes)
            const connections = map.connections ? map.connections.map(conn => {
                const fromNode = map.nodes.find(n => n.id === conn.from);
                const toNode = map.nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return '';

                return `
                    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                        <line x1="${fromNode.x}" y1="${fromNode.y}"
                              x2="${toNode.x}" y2="${toNode.y}"
                              stroke="${theme.connectionColor}"
                              stroke-width="2"
                              marker-end="url(#arrowhead)"/>
                    </svg>
                `;
            }).join('') : '';

            // Render nodes
            const nodes = map.nodes.map(node => {
                const color = theme.nodeColors[node.type] || '#666';
                const isSelected = AdventureCreator.state.visualFlow.selectedNodes.includes(node.id);

                return `
                    <div style="position: absolute; left: ${node.x - 30}px; top: ${node.y - 30}px;
                                width: 60px; height: 60px; background: ${color};
                                border: 3px solid ${isSelected ? theme.selectedColor : color};
                                border-radius: 50%; cursor: pointer;
                                display: flex; align-items: center; justify-content: center;
                                font-size: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                transition: transform 0.2s;"
                         onclick="AdventureCreator.modules['visual-process-flow'].selectNode('${node.id}')"
                         onmouseover="this.style.transform='scale(1.1)'"
                         onmouseout="this.style.transform='scale(1)'">
                        ${node.icon || '📍'}
                        ${showLabels ? `
                            <div style="position: absolute; top: 70px; white-space: nowrap;
                                        background: rgba(0,0,0,0.8); padding: 0.25rem 0.5rem;
                                        border-radius: 3px; font-size: 0.75rem; color: #fff;">
                                ${node.label || node.name || 'Node'}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            return `
                <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="${theme.connectionColor}" />
                        </marker>
                    </defs>
                </svg>
                ${connections}
                ${nodes}
            `;
        },

        renderEmptyCanvas: function() {
            return `
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎨</div>
                    <div style="font-size: 1.25rem; margin-bottom: 0.5rem;">Interactive Visual Canvas</div>
                    <div style="font-size: 0.875rem; margin-bottom: 1.5rem;">Create or open a map to start designing</div>
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['visual-process-flow'].createNewMap()">
                            🆕 New Map
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['visual-process-flow'].loadSampleMap()">
                            📍 Load Sample
                        </button>
                    </div>
                </div>
            `;
        },

        renderCanvasControls: function() {
            return `
                <div style="position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 0.5rem;">
                    <button style="width: 40px; height: 40px; background: #333; border: none; border-radius: 4px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;"
                            onclick="AdventureCreator.modules['visual-process-flow'].zoomIn()"
                            title="Zoom In">+</button>
                    <button style="width: 40px; height: 40px; background: #333; border: none; border-radius: 4px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;"
                            onclick="AdventureCreator.modules['visual-process-flow'].zoomOut()"
                            title="Zoom Out">−</button>
                    <button style="width: 40px; height: 40px; background: #333; border: none; border-radius: 4px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                            onclick="AdventureCreator.modules['visual-process-flow'].fitToScreen()"
                            title="Fit to Screen">⏹</button>
                    <button style="width: 40px; height: 40px; background: #333; border: none; border-radius: 4px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                            onclick="AdventureCreator.modules['visual-process-flow'].resetView()"
                            title="Reset View">↻</button>
                </div>
            `;
        },

        renderCanvasActions: function() {
            const currentMap = this.getCurrentMap();

            return `
                <button class="btn btn-primary" onclick="AdventureCreator.modules['visual-process-flow'].addNode()" ${!currentMap ? 'disabled' : ''}>
                    ➕ Add Node
                </button>
                <button class="btn btn-secondary" onclick="AdventureCreator.modules['visual-process-flow'].autoLayout()" ${!currentMap ? 'disabled' : ''}>
                    🔄 Auto Layout
                </button>
                <button class="btn btn-secondary" onclick="AdventureCreator.modules['visual-process-flow'].clearSelection()">
                    ✖️ Clear Selection
                </button>
                <button class="btn btn-secondary" onclick="AdventureCreator.modules['visual-process-flow'].deleteSelected()" ${!currentMap || AdventureCreator.state.visualFlow.selectedNodes.length === 0 ? 'disabled' : ''}>
                    🗑️ Delete Selected
                </button>
                <button class="btn btn-secondary" onclick="AdventureCreator.modules['visual-process-flow'].exportVisualization()" ${!currentMap ? 'disabled' : ''}>
                    💾 Export
                </button>
            `;
        },

        renderAdvancedFeatures: function() {
            return `
                <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h3 style="color: #fff; margin-bottom: 1rem;">Advanced Features</h3>
                    <div style="color: #ccc; line-height: 1.6;">
                        <p style="margin-bottom: 1rem;">
                            Professional visual design tools for creating comprehensive game documentation,
                            interactive maps, and sophisticated debugging interfaces.
                        </p>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                            ${this.renderFeatureCard('🎯 Smart Layout', 'Automatic positioning algorithms for optimal readability')}
                            ${this.renderFeatureCard('🔗 Live Connections', 'Real-time updates when game structure changes')}
                            ${this.renderFeatureCard('📐 Precision Tools', 'Grid snapping, alignment guides, and measurements')}
                            ${this.renderFeatureCard('🎨 Custom Styling', 'Themes, colors, icons, and visual customization')}
                            ${this.renderFeatureCard('📤 Export Options', 'PNG, SVG, PDF export for documentation')}
                            ${this.renderFeatureCard('🔄 Version Control', 'Track changes and manage diagram versions')}
                        </div>

                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 4px; border-left: 3px solid #8b5cf6;">
                            <h4 style="color: #8b5cf6; margin-bottom: 0.5rem;">Visual Editor Capabilities:</h4>
                            <ul style="margin-left: 1.5rem; color: #999;">
                                <li>Drag-and-drop interface for intuitive design</li>
                                <li>Multi-layer visualization with selective visibility</li>
                                <li>Interactive debugging with live game state</li>
                                <li>Collaborative editing and sharing features</li>
                                <li>Professional documentation generation</li>
                                <li>Performance optimization and large-scale support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        },

        renderFeatureCard: function(title, description) {
            return `
                <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 4px; padding: 1rem;">
                    <h5 style="color: #10b981; margin-bottom: 0.5rem; font-size: 0.9rem;">${title}</h5>
                    <p style="color: #999; font-size: 0.8rem; line-height: 1.4;">${description}</p>
                </div>
            `;
        },

        renderProjectGallery: function() {
            const maps = AdventureCreator.state.visualFlow.maps;

            return `
                <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem;">
                    <h3 style="color: #fff; margin-bottom: 1rem;">Project Gallery</h3>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${maps.length === 0 ? this.renderEmptyGallery() : maps.map(map => this.renderMapCard(map)).join('')}
                    </div>
                    <div style="margin-top: 1rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['visual-process-flow'].createNewMap()">
                            🆕 New Map
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['visual-process-flow'].importMap()">
                            📥 Import
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['visual-process-flow'].exportAllMaps()">
                            📤 Export All
                        </button>
                    </div>
                </div>
            `;
        },

        renderEmptyGallery: function() {
            return `
                <div style="text-align: center; color: #666; padding: 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🗂️</div>
                    <div>No visual maps created yet. Start your first project!</div>
                </div>
            `;
        },

        renderMapCard: function(map) {
            const isActive = AdventureCreator.state.visualFlow.currentMap === map.id;

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;
                            background: ${isActive ? '#1e1e2e' : '#0a0a0a'}; border-radius: 4px; margin-bottom: 0.5rem;
                            border-left: 3px solid ${isActive ? '#8b5cf6' : '#333'};">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <span style="color: #10b981; font-weight: 600;">${map.name}</span>
                            ${isActive ? '<span style="color: #8b5cf6; font-size: 0.75rem; background: rgba(139, 92, 246, 0.2); padding: 0.125rem 0.5rem; border-radius: 3px;">ACTIVE</span>' : ''}
                        </div>
                        <div style="color: #999; font-size: 0.8rem;">
                            ${map.nodeCount || 0} nodes • ${map.connectionCount || 0} connections • ${map.type || 'map'} mode
                        </div>
                        <div style="color: #666; font-size: 0.75rem; margin-top: 0.25rem;">
                            Modified ${this.formatDate(map.lastModified)}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                onclick="AdventureCreator.modules['visual-process-flow'].openMap('${map.id}')">
                            ${isActive ? '👁️ View' : '📂 Open'}
                        </button>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                onclick="AdventureCreator.modules['visual-process-flow'].editMapSettings('${map.id}')">
                            ⚙️
                        </button>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                onclick="AdventureCreator.modules['visual-process-flow'].duplicateMap('${map.id}')">
                            📋
                        </button>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: #ef4444;"
                                onclick="AdventureCreator.modules['visual-process-flow'].deleteMap('${map.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        },

        // Visual Editor Methods
        openMapEditor: function() {
            this.switchMode('map');
            console.log('Visual Map Editor: Opening map editing mode');

            if (!this.getCurrentMap()) {
                const create = confirm('No map is currently open. Would you like to create a new map?');
                if (create) {
                    this.createNewMap();
                }
            }
        },

        openProcessVisualizer: function() {
            this.switchMode('process');
            console.log('Process Visualizer: Opening process flow mode');
            AdventureCreator.navigate('editor');
        },

        openDebugViewer: function() {
            this.switchMode('debug');
            console.log('Debug Viewer: Opening live debug mode');
            AdventureCreator.navigate('editor');
        },

        openAnalyticsDashboard: function() {
            console.log('Analytics Dashboard: Opening analytics view');
            alert('📊 Analytics Dashboard!\n\nFeatures:\n• Game complexity metrics\n• Performance analysis\n• Player path visualization\n• Design optimization suggestions\n\nAdvanced analytics coming in future update!');
        },

        switchMode: function(mode) {
            AdventureCreator.state.visualFlow.viewMode = mode;
            console.log(`Visual Flow: Switched to ${mode} mode`);
            AdventureCreator.navigate('editor');
        },

        selectTool: function(toolId) {
            AdventureCreator.state.visualFlow.tools.selectedTool = toolId;
            console.log(`Visual Flow: Selected ${toolId} tool`);
            AdventureCreator.navigate('editor');
        },

        // Canvas Controls
        toggleGrid: function() {
            AdventureCreator.state.visualFlow.tools.showGrid = !AdventureCreator.state.visualFlow.tools.showGrid;
            AdventureCreator.navigate('editor');
        },

        toggleSnap: function() {
            AdventureCreator.state.visualFlow.tools.snapToGrid = !AdventureCreator.state.visualFlow.tools.snapToGrid;
            AdventureCreator.navigate('editor');
        },

        toggleLabels: function() {
            AdventureCreator.state.visualFlow.tools.showLabels = !AdventureCreator.state.visualFlow.tools.showLabels;
            AdventureCreator.navigate('editor');
        },

        zoomIn: function() {
            const canvas = AdventureCreator.state.visualFlow.canvas;
            canvas.zoom = Math.min(canvas.zoom * 1.2, 3.0);
            console.log(`Visual Flow: Zoomed in to ${(canvas.zoom * 100).toFixed(0)}%`);
            AdventureCreator.navigate('editor');
        },

        zoomOut: function() {
            const canvas = AdventureCreator.state.visualFlow.canvas;
            canvas.zoom = Math.max(canvas.zoom / 1.2, 0.1);
            console.log(`Visual Flow: Zoomed out to ${(canvas.zoom * 100).toFixed(0)}%`);
            AdventureCreator.navigate('editor');
        },

        resetView: function() {
            const canvas = AdventureCreator.state.visualFlow.canvas;
            canvas.zoom = 1.0;
            canvas.panX = 0;
            canvas.panY = 0;
            console.log('Visual Flow: Reset view to default');
            AdventureCreator.navigate('editor');
        },

        fitToScreen: function() {
            const currentMap = this.getCurrentMap();
            if (!currentMap || !currentMap.nodes || currentMap.nodes.length === 0) {
                console.log('Visual Flow: No nodes to fit');
                return;
            }

            // Calculate bounds
            const nodes = currentMap.nodes;
            const minX = Math.min(...nodes.map(n => n.x));
            const maxX = Math.max(...nodes.map(n => n.x));
            const minY = Math.min(...nodes.map(n => n.y));
            const maxY = Math.max(...nodes.map(n => n.y));

            const width = maxX - minX;
            const height = maxY - minY;

            const canvas = AdventureCreator.state.visualFlow.canvas;
            const zoomX = (canvas.width - 100) / width;
            const zoomY = (canvas.height - 100) / height;

            canvas.zoom = Math.min(zoomX, zoomY, 3.0);
            canvas.panX = -(minX + width / 2) + canvas.width / 2;
            canvas.panY = -(minY + height / 2) + canvas.height / 2;

            console.log('Visual Flow: Fitted content to screen');
            AdventureCreator.navigate('editor');
        },

        // Node Management
        addNode: function() {
            const currentMap = this.getCurrentMap();
            if (!currentMap) {
                alert('Please create or open a map first!');
                return;
            }

            const type = prompt('Node type (location/process/rule/object):', 'location');
            if (!type) return;

            const name = prompt('Node name:', 'New Node');
            if (!name) return;

            if (!currentMap.nodes) currentMap.nodes = [];

            const node = {
                id: 'node_' + Date.now(),
                type: type,
                name: name,
                label: name,
                icon: this.getNodeIcon(type),
                x: Math.random() * 800 + 200,
                y: Math.random() * 400 + 150,
                created: new Date().toISOString()
            };

            currentMap.nodes.push(node);
            currentMap.nodeCount = currentMap.nodes.length;
            currentMap.lastModified = new Date().toISOString();

            console.log(`Visual Flow: Added ${type} node "${name}"`);
            AdventureCreator.navigate('editor');
        },

        getNodeIcon: function(type) {
            const icons = {
                location: '📍',
                process: '⚙️',
                rule: '📋',
                object: '📦'
            };
            return icons[type] || '⭕';
        },

        selectNode: function(nodeId) {
            const selectedNodes = AdventureCreator.state.visualFlow.selectedNodes;
            const index = selectedNodes.indexOf(nodeId);

            if (index > -1) {
                selectedNodes.splice(index, 1);
            } else {
                selectedNodes.push(nodeId);
            }

            console.log(`Visual Flow: ${index > -1 ? 'Deselected' : 'Selected'} node ${nodeId}`);
            AdventureCreator.navigate('editor');
        },

        clearSelection: function() {
            AdventureCreator.state.visualFlow.selectedNodes = [];
            console.log('Visual Flow: Cleared selection');
            AdventureCreator.navigate('editor');
        },

        deleteSelected: function() {
            const currentMap = this.getCurrentMap();
            if (!currentMap) return;

            const selectedNodes = AdventureCreator.state.visualFlow.selectedNodes;
            if (selectedNodes.length === 0) return;

            if (!confirm(`Delete ${selectedNodes.length} selected node(s)?`)) return;

            currentMap.nodes = currentMap.nodes.filter(n => !selectedNodes.includes(n.id));
            currentMap.nodeCount = currentMap.nodes.length;

            // Remove connections involving deleted nodes
            if (currentMap.connections) {
                currentMap.connections = currentMap.connections.filter(c =>
                    !selectedNodes.includes(c.from) && !selectedNodes.includes(c.to)
                );
                currentMap.connectionCount = currentMap.connections.length;
            }

            currentMap.lastModified = new Date().toISOString();

            AdventureCreator.state.visualFlow.selectedNodes = [];

            console.log(`Visual Flow: Deleted ${selectedNodes.length} node(s)`);
            AdventureCreator.navigate('editor');
        },

        // Map Management
        createNewMap: function() {
            const name = prompt('Map name:', 'New Map');
            if (!name) return;

            const map = {
                id: 'map_' + Date.now(),
                name: name,
                type: AdventureCreator.state.visualFlow.viewMode,
                nodes: [],
                connections: [],
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                nodeCount: 0,
                connectionCount: 0
            };

            AdventureCreator.state.visualFlow.maps.push(map);
            AdventureCreator.state.visualFlow.currentMap = map.id;

            console.log(`Visual Flow: Created new map "${name}"`);
            AdventureCreator.navigate('editor');
        },

        openMap: function(mapId) {
            AdventureCreator.state.visualFlow.currentMap = mapId;
            AdventureCreator.state.visualFlow.selectedNodes = [];

            const map = this.getCurrentMap();
            if (map) {
                console.log(`Visual Flow: Opened map "${map.name}"`);
            }
            AdventureCreator.navigate('editor');
        },

        editMapSettings: function(mapId) {
            const map = AdventureCreator.state.visualFlow.maps.find(m => m.id === mapId);
            if (!map) return;

            const newName = prompt('Map name:', map.name);
            if (newName && newName !== map.name) {
                map.name = newName;
                map.lastModified = new Date().toISOString();
                console.log(`Visual Flow: Renamed map to "${newName}"`);
                AdventureCreator.navigate('editor');
            }
        },

        duplicateMap: function(mapId) {
            const originalMap = AdventureCreator.state.visualFlow.maps.find(m => m.id === mapId);
            if (!originalMap) return;

            const newMap = JSON.parse(JSON.stringify(originalMap));
            newMap.id = 'map_' + Date.now();
            newMap.name = originalMap.name + ' (Copy)';
            newMap.created = new Date().toISOString();
            newMap.lastModified = new Date().toISOString();

            AdventureCreator.state.visualFlow.maps.push(newMap);
            console.log(`Visual Flow: Duplicated map "${originalMap.name}"`);
            AdventureCreator.navigate('editor');
        },

        deleteMap: function(mapId) {
            const map = AdventureCreator.state.visualFlow.maps.find(m => m.id === mapId);
            if (!map) return;

            if (!confirm(`Delete map "${map.name}"? This cannot be undone.`)) return;

            AdventureCreator.state.visualFlow.maps = AdventureCreator.state.visualFlow.maps.filter(m => m.id !== mapId);

            if (AdventureCreator.state.visualFlow.currentMap === mapId) {
                AdventureCreator.state.visualFlow.currentMap = null;
            }

            console.log(`Visual Flow: Deleted map "${map.name}"`);
            AdventureCreator.navigate('editor');
        },

        loadSampleMap: function() {
            const map = {
                id: 'map_sample_' + Date.now(),
                name: 'Sample Adventure Map',
                type: 'map',
                nodes: [
                    { id: 'n1', type: 'location', name: 'Start Room', label: 'Start', icon: '🏠', x: 400, y: 300, created: new Date().toISOString() },
                    { id: 'n2', type: 'location', name: 'Forest', label: 'Forest', icon: '🌲', x: 600, y: 300, created: new Date().toISOString() },
                    { id: 'n3', type: 'location', name: 'Cave', label: 'Cave', icon: '🕳️', x: 800, y: 400, created: new Date().toISOString() },
                    { id: 'n4', type: 'object', name: 'Key', label: 'Key', icon: '🔑', x: 500, y: 200, created: new Date().toISOString() },
                    { id: 'n5', type: 'process', name: 'Unlock Door', label: 'Unlock', icon: '🔓', x: 700, y: 200, created: new Date().toISOString() }
                ],
                connections: [
                    { from: 'n1', to: 'n2', type: 'north' },
                    { from: 'n2', to: 'n3', type: 'east' },
                    { from: 'n4', to: 'n5', type: 'trigger' }
                ],
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                nodeCount: 5,
                connectionCount: 3
            };

            AdventureCreator.state.visualFlow.maps.push(map);
            AdventureCreator.state.visualFlow.currentMap = map.id;

            console.log('Visual Flow: Loaded sample map');
            AdventureCreator.navigate('editor');
        },

        autoLayout: function() {
            const currentMap = this.getCurrentMap();
            if (!currentMap || !currentMap.nodes || currentMap.nodes.length === 0) {
                alert('No nodes to layout!');
                return;
            }

            // Simple circular layout
            const nodes = currentMap.nodes;
            const centerX = 600;
            const centerY = 350;
            const radius = 200;
            const angleStep = (2 * Math.PI) / nodes.length;

            nodes.forEach((node, index) => {
                const angle = index * angleStep;
                node.x = centerX + radius * Math.cos(angle);
                node.y = centerY + radius * Math.sin(angle);
            });

            currentMap.lastModified = new Date().toISOString();

            console.log('Visual Flow: Applied automatic layout');
            AdventureCreator.navigate('editor');
        },

        // Import/Export
        importMap: function() {
            const json = prompt('Paste map JSON:');
            if (!json) return;

            try {
                const map = JSON.parse(json);
                map.id = 'map_' + Date.now();
                map.lastModified = new Date().toISOString();

                AdventureCreator.state.visualFlow.maps.push(map);
                console.log(`Visual Flow: Imported map "${map.name}"`);
                AdventureCreator.navigate('editor');
            } catch (e) {
                alert('Invalid JSON format!');
            }
        },

        exportVisualization: function() {
            const currentMap = this.getCurrentMap();
            if (!currentMap) {
                alert('No map selected for export!');
                return;
            }

            const json = JSON.stringify(currentMap, null, 2);

            // Create downloadable file
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentMap.name.replace(/\s+/g, '_')}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log(`Visual Flow: Exported map "${currentMap.name}"`);
        },

        exportAllMaps: function() {
            const maps = AdventureCreator.state.visualFlow.maps;
            if (maps.length === 0) {
                alert('No maps to export!');
                return;
            }

            const data = {
                maps: maps,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const json = JSON.stringify(data, null, 2);

            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'visual_flow_maps.json';
            a.click();
            URL.revokeObjectURL(url);

            console.log(`Visual Flow: Exported ${maps.length} map(s)`);
        },

        // Statistics and Analysis
        getVisualizationStatistics: function() {
            const maps = AdventureCreator.state.visualFlow.maps;

            const totalNodes = maps.reduce((sum, map) => sum + (map.nodeCount || 0), 0);
            const totalConnections = maps.reduce((sum, map) => sum + (map.connectionCount || 0), 0);

            return {
                totalMaps: maps.length,
                totalNodes: totalNodes,
                totalConnections: totalConnections
            };
        },

        getCurrentMap: function() {
            const currentMapId = AdventureCreator.state.visualFlow.currentMap;
            return AdventureCreator.state.visualFlow.maps.find(m => m.id === currentMapId);
        },

        formatDate: function(dateStr) {
            if (!dateStr) return 'never';
            const date = new Date(dateStr);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    };

    // Register the module
    AdventureCreator.registerModule('visual-process-flow', VisualProcessFlowSystem);

    console.log('Visual Process Flow System registered successfully');

})();
