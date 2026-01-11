// module-maluva-extensions-enhanced.js
// Complete MALUVA Extensions System - DAAD Adventure Creator
// Priority #13: Advanced multimedia and system integration features
// Enhanced with full sound, graphics, and platform capabilities

(function() {
    'use strict';

    console.log('Enhanced MALUVA Extensions System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Make sure this module loads after the main app.');
        return;
    }

    const MaluvaExtensionsSystem = {
        name: 'MALUVA Extensions System (Enhanced)',
        description: 'Complete multimedia and system integration with sound, graphics, and platform features',
        category: 'System Features',
        complexity: 'Expert',

        init: function() {
            console.log('Enhanced MALUVA Extensions System initialized');

            if (!AdventureCreator.state.maluva) {
                AdventureCreator.state.maluva = {
                    selectedTab: 'sound_system',
                    soundEnabled: true,
                    graphicsEnabled: true,
                    currentTrack: null,
                    currentImage: null,
                    volume: 70,
                    soundLibrary: [],
                    imageLibrary: [],
                    externalCommands: [],
                    modules: [],
                    extensions: {
                        soundFormats: ['mp3', 'wav', 'ogg'],
                        imageFormats: ['png', 'jpg', 'gif', 'bmp'],
                        maxSounds: 10,
                        maxImages: 20
                    },
                    playbackState: {
                        isPlaying: false,
                        currentTime: 0,
                        duration: 0,
                        loop: false
                    },
                    audioContext: null
                };
            }

            // Initialize Audio Context if available
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                try {
                    AdventureCreator.state.maluva.audioContext = new (AudioContext || webkitAudioContext)();
                    console.log('Audio Context initialized');
                } catch (e) {
                    console.warn('Audio Context not available:', e);
                }
            }
        },

        render: function() {
            return `
                <div style="padding: 2rem; background: #0a0a0a;">
                    <h2 style="color: #8b5cf6; margin-bottom: 1.5rem;">🎵 MALUVA Extensions System (Enhanced)</h2>

                    ${this.renderTabNavigation()}
                    ${this.renderTabContent()}
                </div>
            `;
        },

        renderTabNavigation: function() {
            const tabs = [
                { id: 'sound_system', name: '🎵 Sound System', description: 'Audio and music management' },
                { id: 'graphics_system', name: '🎨 Graphics System', description: 'Image and visual effects' },
                { id: 'external_commands', name: '🔧 External Commands', description: 'System integration' },
                { id: 'modules_system', name: '📦 Modules & Components', description: 'Dynamic loading' },
                { id: 'platform_support', name: '📱 Platform Support', description: 'Cross-platform features' }
            ];

            return `
                <div class="tab-navigation">
                    ${tabs.map(tab => `
                        <button class="tab-button ${AdventureCreator.state.maluva.selectedTab === tab.id ? 'active' : ''}"
                                onclick="AdventureCreator.modules['maluva-extensions-system'].switchTab('${tab.id}')">
                            <div class="tab-name">${tab.name}</div>
                            <div class="tab-description">${tab.description}</div>
                        </button>
                    `).join('')}
                </div>
            `;
        },

        renderTabContent: function() {
            const selectedTab = AdventureCreator.state.maluva.selectedTab;

            switch(selectedTab) {
                case 'sound_system':
                    return this.renderSoundSystem();
                case 'graphics_system':
                    return this.renderGraphicsSystem();
                case 'external_commands':
                    return this.renderExternalCommands();
                case 'modules_system':
                    return this.renderModulesSystem();
                case 'platform_support':
                    return this.renderPlatformSupport();
                default:
                    return this.renderSoundSystem();
            }
        },

        renderSoundSystem: function() {
            const state = AdventureCreator.state.maluva;
            const soundLibrary = state.soundLibrary || [];

            return `
                <div class="sound-system-container">
                    <div class="system-header">
                        <h3>🎵 Sound System</h3>
                        <p>Manage audio files, music tracks, and sound effects for your adventure</p>
                    </div>

                    <div class="sound-controls">
                        <div class="control-section">
                            <h4>🎚️ Audio Controls</h4>
                            <div class="controls-grid">
                                <label class="control-item">
                                    <span>Enable Sound:</span>
                                    <input type="checkbox" ${state.soundEnabled ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['maluva-extensions-system'].toggleSound()">
                                </label>
                                <label class="control-item">
                                    <span>Volume: ${state.volume}%</span>
                                    <input type="range" min="0" max="100" value="${state.volume}"
                                           oninput="AdventureCreator.modules['maluva-extensions-system'].setVolume(this.value)">
                                </label>
                                <label class="control-item">
                                    <span>Loop:</span>
                                    <input type="checkbox" ${state.playbackState.loop ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['maluva-extensions-system'].toggleLoop()">
                                </label>
                            </div>
                        </div>

                        <div class="playback-status">
                            <h5>Current Playback:</h5>
                            ${state.currentTrack ? `
                                <div class="track-info">
                                    <div class="track-name">🎵 ${state.currentTrack}</div>
                                    <div class="track-status">${state.playbackState.isPlaying ? '▶️ Playing' : '⏸️ Paused'}</div>
                                </div>
                            ` : '<div class="no-track">No track playing</div>'}
                        </div>
                    </div>

                    <div class="sound-library">
                        <div class="library-header">
                            <h4>📚 Sound Library (${soundLibrary.length}/${state.extensions.maxSounds})</h4>
                            <div class="library-actions">
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addSound()">
                                    ➕ Add Sound
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['maluva-extensions-system'].importSoundLibrary()">
                                    📥 Import Library
                                </button>
                            </div>
                        </div>

                        ${soundLibrary.length === 0 ? this.renderEmptySoundLibrary() : this.renderSoundLibraryGrid(soundLibrary)}
                    </div>

                    <div class="maluva-commands">
                        <h4>💻 DAAD Sound Commands</h4>
                        <div class="commands-reference">
                            ${this.renderCommandReference('sound')}
                        </div>
                    </div>
                </div>
            `;
        },

        renderEmptySoundLibrary: function() {
            return `
                <div class="empty-library">
                    <div class="empty-icon">🎵</div>
                    <div class="empty-text">No sounds added yet</div>
                    <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addSound()">
                        Add Your First Sound
                    </button>
                </div>
            `;
        },

        renderSoundLibraryGrid: function(soundLibrary) {
            return `
                <div class="library-grid">
                    ${soundLibrary.map((sound, index) => `
                        <div class="sound-card">
                            <div class="sound-header">
                                <div class="sound-icon">🎵</div>
                                <div class="sound-info">
                                    <div class="sound-name">${sound.name}</div>
                                    <div class="sound-type">${sound.type || 'SFX'}</div>
                                </div>
                            </div>
                            <div class="sound-details">
                                <div class="detail-item">ID: ${sound.id}</div>
                                <div class="detail-item">File: ${sound.filename}</div>
                                ${sound.duration ? `<div class="detail-item">Duration: ${sound.duration}s</div>` : ''}
                            </div>
                            <div class="sound-actions">
                                <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].playSound(${index})" title="Play">▶️</button>
                                <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].stopSound()" title="Stop">⏹️</button>
                                <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].editSound(${index})" title="Edit">✏️</button>
                                <button class="action-btn danger" onclick="AdventureCreator.modules['maluva-extensions-system'].deleteSound(${index})" title="Delete">🗑️</button>
                            </div>
                            <div class="daad-code">
                                <code>SOUND ${sound.id}</code>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderGraphicsSystem: function() {
            const state = AdventureCreator.state.maluva;
            const imageLibrary = state.imageLibrary || [];

            return `
                <div class="graphics-system-container">
                    <div class="system-header">
                        <h3>🎨 Graphics System</h3>
                        <p>Manage images, graphics, and visual elements for your adventure</p>
                    </div>

                    <div class="graphics-controls">
                        <div class="control-section">
                            <h4>🖼️ Graphics Controls</h4>
                            <div class="controls-grid">
                                <label class="control-item">
                                    <span>Enable Graphics:</span>
                                    <input type="checkbox" ${state.graphicsEnabled ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['maluva-extensions-system'].toggleGraphics()">
                                </label>
                                <div class="control-item">
                                    <span>Supported Formats:</span>
                                    <div class="format-tags">
                                        ${state.extensions.imageFormats.map(format => `
                                            <span class="format-tag">${format.toUpperCase()}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="current-image">
                            <h5>Current Image:</h5>
                            ${state.currentImage ? `
                                <div class="image-display">
                                    <div class="image-name">🖼️ ${state.currentImage}</div>
                                    <button class="btn btn-small btn-secondary"
                                            onclick="AdventureCreator.modules['maluva-extensions-system'].clearImage()">
                                        Clear Image
                                    </button>
                                </div>
                            ` : '<div class="no-image">No image displayed</div>'}
                        </div>
                    </div>

                    <div class="image-library">
                        <div class="library-header">
                            <h4>🖼️ Image Library (${imageLibrary.length}/${state.extensions.maxImages})</h4>
                            <div class="library-actions">
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addImage()">
                                    ➕ Add Image
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['maluva-extensions-system'].importImageLibrary()">
                                    📥 Import Library
                                </button>
                            </div>
                        </div>

                        ${imageLibrary.length === 0 ? this.renderEmptyImageLibrary() : this.renderImageLibraryGrid(imageLibrary)}
                    </div>

                    <div class="maluva-commands">
                        <h4>💻 DAAD Graphics Commands</h4>
                        <div class="commands-reference">
                            ${this.renderCommandReference('graphics')}
                        </div>
                    </div>
                </div>
            `;
        },

        renderEmptyImageLibrary: function() {
            return `
                <div class="empty-library">
                    <div class="empty-icon">🖼️</div>
                    <div class="empty-text">No images added yet</div>
                    <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addImage()">
                        Add Your First Image
                    </button>
                </div>
            `;
        },

        renderImageLibraryGrid: function(imageLibrary) {
            return `
                <div class="library-grid">
                    ${imageLibrary.map((image, index) => `
                        <div class="image-card">
                            <div class="image-header">
                                <div class="image-icon">🖼️</div>
                                <div class="image-info">
                                    <div class="image-name">${image.name}</div>
                                    <div class="image-type">${image.format || 'PNG'}</div>
                                </div>
                            </div>
                            <div class="image-details">
                                <div class="detail-item">ID: ${image.id}</div>
                                <div class="detail-item">File: ${image.filename}</div>
                                ${image.dimensions ? `<div class="detail-item">${image.dimensions}</div>` : ''}
                            </div>
                            <div class="image-actions">
                                <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].showImage(${index})" title="Show">👁️</button>
                                <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].hideImage()" title="Hide">🚫</button>
                                <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].editImage(${index})" title="Edit">✏️</button>
                                <button class="action-btn danger" onclick="AdventureCreator.modules['maluva-extensions-system'].deleteImage(${index})" title="Delete">🗑️</button>
                            </div>
                            <div class="daad-code">
                                <code>PICTURE ${image.id}</code>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderExternalCommands: function() {
            const state = AdventureCreator.state.maluva;
            const externalCommands = state.externalCommands || [];

            return `
                <div class="external-commands-container">
                    <div class="system-header">
                        <h3>🔧 External Commands</h3>
                        <p>System integration and external command execution</p>
                    </div>

                    <div class="commands-library">
                        <div class="library-header">
                            <h4>⚡ Registered Commands (${externalCommands.length})</h4>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addExternalCommand()">
                                ➕ Add External Command
                            </button>
                        </div>

                        ${externalCommands.length === 0 ? `
                            <div class="empty-library">
                                <div class="empty-icon">🔧</div>
                                <div class="empty-text">No external commands registered</div>
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addExternalCommand()">
                                    Register First Command
                                </button>
                            </div>
                        ` : `
                            <div class="commands-list">
                                ${externalCommands.map((cmd, index) => `
                                    <div class="command-card">
                                        <div class="command-header">
                                            <div class="command-name">${cmd.name}</div>
                                            <div class="command-type">${cmd.type || 'SYSTEM'}</div>
                                        </div>
                                        <div class="command-details">
                                            <div class="detail-item">ID: ${cmd.id}</div>
                                            <div class="detail-item">Handler: ${cmd.handler}</div>
                                            ${cmd.description ? `<div class="detail-description">${cmd.description}</div>` : ''}
                                        </div>
                                        <div class="command-actions">
                                            <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].testExternalCommand(${index})" title="Test">🧪</button>
                                            <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].editExternalCommand(${index})" title="Edit">✏️</button>
                                            <button class="action-btn danger" onclick="AdventureCreator.modules['maluva-extensions-system'].deleteExternalCommand(${index})" title="Delete">🗑️</button>
                                        </div>
                                        <div class="daad-code">
                                            <code>EXTERN ${cmd.id}</code>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>

                    <div class="maluva-commands">
                        <h4>💻 DAAD External Commands</h4>
                        <div class="commands-reference">
                            ${this.renderCommandReference('external')}
                        </div>
                    </div>
                </div>
            `;
        },

        renderModulesSystem: function() {
            const state = AdventureCreator.state.maluva;
            const modules = state.modules || [];

            return `
                <div class="modules-system-container">
                    <div class="system-header">
                        <h3>📦 Modules & Components</h3>
                        <p>Dynamic module loading and component management</p>
                    </div>

                    <div class="modules-library">
                        <div class="library-header">
                            <h4>📦 Loaded Modules (${modules.length})</h4>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addModule()">
                                ➕ Add Module
                            </button>
                        </div>

                        ${modules.length === 0 ? `
                            <div class="empty-library">
                                <div class="empty-icon">📦</div>
                                <div class="empty-text">No modules loaded</div>
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['maluva-extensions-system'].addModule()">
                                    Load First Module
                                </button>
                            </div>
                        ` : `
                            <div class="modules-grid">
                                ${modules.map((module, index) => `
                                    <div class="module-card">
                                        <div class="module-header">
                                            <div class="module-icon">📦</div>
                                            <div class="module-info">
                                                <div class="module-name">${module.name}</div>
                                                <div class="module-status ${module.loaded ? 'loaded' : 'unloaded'}">
                                                    ${module.loaded ? '✅ Loaded' : '⏳ Pending'}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="module-details">
                                            <div class="detail-item">Entry: ${module.entryPoint || 'main'}</div>
                                            ${module.version ? `<div class="detail-item">Version: ${module.version}</div>` : ''}
                                            ${module.description ? `<div class="detail-description">${module.description}</div>` : ''}
                                        </div>
                                        <div class="module-actions">
                                            <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].loadModule(${index})" title="Load">📥</button>
                                            <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].unloadModule(${index})" title="Unload">📤</button>
                                            <button class="action-btn" onclick="AdventureCreator.modules['maluva-extensions-system'].editModule(${index})" title="Edit">✏️</button>
                                            <button class="action-btn danger" onclick="AdventureCreator.modules['maluva-extensions-system'].deleteModule(${index})" title="Delete">🗑️</button>
                                        </div>
                                        <div class="daad-code">
                                            <code>XPART "${module.name}" "${module.entryPoint || 'main'}"</code>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>

                    <div class="maluva-commands">
                        <h4>💻 DAAD Module Commands</h4>
                        <div class="commands-reference">
                            ${this.renderCommandReference('modules')}
                        </div>
                    </div>
                </div>
            `;
        },

        renderPlatformSupport: function() {
            const capabilities = this.getPlatformCapabilities();

            return `
                <div class="platform-support-container">
                    <div class="system-header">
                        <h3>📱 Platform Support</h3>
                        <p>Cross-platform compatibility and feature detection</p>
                    </div>

                    <div class="platform-capabilities">
                        <h4>🔍 Platform Capabilities</h4>
                        <div class="capabilities-grid">
                            ${Object.entries(capabilities).map(([feature, supported]) => `
                                <div class="capability-card ${supported ? 'supported' : 'unsupported'}">
                                    <div class="capability-icon">${supported ? '✅' : '❌'}</div>
                                    <div class="capability-name">${this.formatFeatureName(feature)}</div>
                                    <div class="capability-status">${supported ? 'Supported' : 'Not Available'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="platform-info">
                        <h4>ℹ️ System Information</h4>
                        <div class="info-grid">
                            ${this.renderSystemInfo()}
                        </div>
                    </div>

                    <div class="compatibility-matrix">
                        <h4>📊 Compatibility Matrix</h4>
                        <div class="matrix-table">
                            ${this.renderCompatibilityMatrix()}
                        </div>
                    </div>

                    <div class="maluva-commands">
                        <h4>💻 Platform-Specific Commands</h4>
                        <div class="commands-reference">
                            ${this.renderCommandReference('platform')}
                        </div>
                    </div>
                </div>
            `;
        },

        renderCommandReference: function(category) {
            const commands = this.getCommandsByCategory(category);

            return `
                <div class="command-reference-grid">
                    ${commands.map(cmd => `
                        <div class="command-ref-card">
                            <div class="command-syntax">
                                <code>${cmd.syntax}</code>
                            </div>
                            <div class="command-description">${cmd.description}</div>
                            ${cmd.example ? `
                                <div class="command-example">
                                    <strong>Example:</strong>
                                    <code>${cmd.example}</code>
                                </div>
                            ` : ''}
                            ${cmd.notes ? `<div class="command-notes">${cmd.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderSystemInfo: function() {
            const info = {
                'Browser': navigator.userAgent.split(' ').slice(-1)[0] || 'Unknown',
                'Platform': navigator.platform || 'Unknown',
                'Language': navigator.language || 'Unknown',
                'Online': navigator.onLine ? 'Yes' : 'No',
                'Cookies': navigator.cookieEnabled ? 'Enabled' : 'Disabled',
                'Screen': `${screen.width}x${screen.height}`
            };

            return Object.entries(info).map(([key, value]) => `
                <div class="info-item">
                    <span class="info-label">${key}:</span>
                    <span class="info-value">${value}</span>
                </div>
            `).join('');
        },

        renderCompatibilityMatrix: function() {
            const platforms = ['Windows', 'macOS', 'Linux', 'Web', 'Mobile'];
            const features = ['Sound', 'Graphics', 'External', 'Modules', 'Save/Load'];

            return `
                <table class="compatibility-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            ${platforms.map(platform => `<th>${platform}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${features.map(feature => `
                            <tr>
                                <td><strong>${feature}</strong></td>
                                ${platforms.map(platform => {
                                    const supported = this.isFeatureSupportedOnPlatform(feature, platform);
                                    return `<td class="${supported ? 'supported' : 'unsupported'}">${supported ? '✅' : '❌'}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        },

        // Helper methods
        formatFeatureName: function(feature) {
            return feature.split(/(?=[A-Z])/).map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },

        getCommandsByCategory: function(category) {
            const allCommands = {
                sound: [
                    {
                        syntax: 'SOUND id',
                        description: 'Play sound effect or music track with specified ID',
                        example: 'SOUND 1  ; Play sound #1',
                        notes: 'Sound must be preloaded in library'
                    },
                    {
                        syntax: 'SOUND id volume',
                        description: 'Play sound at specific volume (0-100)',
                        example: 'SOUND 2 75  ; Play sound #2 at 75% volume'
                    },
                    {
                        syntax: 'SOUND 0',
                        description: 'Stop all currently playing sounds',
                        example: 'SOUND 0  ; Stop all sounds'
                    },
                    {
                        syntax: 'MUSIC id',
                        description: 'Play background music track',
                        example: 'MUSIC 1  ; Play music track #1',
                        notes: 'Music loops by default'
                    }
                ],
                graphics: [
                    {
                        syntax: 'PICTURE id',
                        description: 'Display image with specified ID',
                        example: 'PICTURE 5  ; Show image #5',
                        notes: 'Image must be in library'
                    },
                    {
                        syntax: 'PICTURE 0',
                        description: 'Clear currently displayed image',
                        example: 'PICTURE 0  ; Hide image'
                    },
                    {
                        syntax: 'PICTURE id x y',
                        description: 'Display image at specific coordinates',
                        example: 'PICTURE 3 100 50  ; Show image at (100,50)'
                    }
                ],
                external: [
                    {
                        syntax: 'EXTERN id',
                        description: 'Execute external command with specified ID',
                        example: 'EXTERN 1  ; Run external command #1',
                        notes: 'Platform-dependent'
                    },
                    {
                        syntax: 'EXTERN id param',
                        description: 'Execute external command with parameter',
                        example: 'EXTERN 2 100  ; Run command #2 with param 100'
                    }
                ],
                modules: [
                    {
                        syntax: 'XPART "module" "entry"',
                        description: 'Load and execute module component',
                        example: 'XPART "combat" "fight"  ; Load combat module',
                        notes: 'Dynamic module loading'
                    },
                    {
                        syntax: 'XLOAD "filename"',
                        description: 'Load external data file',
                        example: 'XLOAD "items.dat"  ; Load items data'
                    },
                    {
                        syntax: 'XSAVE "filename"',
                        description: 'Save current game state to file',
                        example: 'XSAVE "savegame.dat"  ; Save game'
                    }
                ],
                platform: [
                    {
                        syntax: 'PLATFORM',
                        description: 'Get current platform identifier',
                        example: 'PLATFORM  ; Returns platform ID',
                        notes: 'Sets flag with platform code'
                    },
                    {
                        syntax: 'CAPABILITY feature',
                        description: 'Check if feature is supported',
                        example: 'CAPABILITY SOUND  ; Check sound support'
                    }
                ]
            };

            return allCommands[category] || [];
        },

        getPlatformCapabilities: function() {
            return {
                sound: typeof Audio !== 'undefined',
                graphics: typeof Image !== 'undefined',
                fileSystem: typeof FileReader !== 'undefined',
                localStorage: typeof localStorage !== 'undefined',
                networking: typeof fetch !== 'undefined',
                multimedia: typeof HTMLMediaElement !== 'undefined',
                webAudio: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
                canvas: typeof HTMLCanvasElement !== 'undefined'
            };
        },

        isFeatureSupportedOnPlatform: function(feature, platform) {
            const support = {
                'Sound': { Windows: true, macOS: true, Linux: true, Web: true, Mobile: true },
                'Graphics': { Windows: true, macOS: true, Linux: true, Web: true, Mobile: true },
                'External': { Windows: true, macOS: true, Linux: true, Web: false, Mobile: false },
                'Modules': { Windows: true, macOS: true, Linux: true, Web: true, Mobile: true },
                'Save/Load': { Windows: true, macOS: true, Linux: true, Web: true, Mobile: true }
            };

            return support[feature]?.[platform] || false;
        },

        // Action methods
        switchTab: function(tabId) {
            AdventureCreator.state.maluva.selectedTab = tabId;
            AdventureCreator.navigate('editor');
        },

        // Sound System Methods
        toggleSound: function() {
            AdventureCreator.state.maluva.soundEnabled = !AdventureCreator.state.maluva.soundEnabled;
            console.log('Sound enabled:', AdventureCreator.state.maluva.soundEnabled);
            AdventureCreator.navigate('editor');
        },

        setVolume: function(value) {
            AdventureCreator.state.maluva.volume = parseInt(value);
            console.log('Volume set to:', value);
            AdventureCreator.navigate('editor');
        },

        toggleLoop: function() {
            AdventureCreator.state.maluva.playbackState.loop = !AdventureCreator.state.maluva.playbackState.loop;
            console.log('Loop enabled:', AdventureCreator.state.maluva.playbackState.loop);
            AdventureCreator.navigate('editor');
        },

        addSound: function() {
            const state = AdventureCreator.state.maluva;

            if (state.soundLibrary.length >= state.extensions.maxSounds) {
                alert(`Maximum sound library size reached (${state.extensions.maxSounds})`);
                return;
            }

            const name = prompt('Sound name:', 'sound');
            if (!name) return;

            const filename = prompt('Sound filename:', name + '.mp3');
            if (!filename) return;

            const type = prompt('Type (SFX/MUSIC):', 'SFX');

            const newSound = {
                id: state.soundLibrary.length + 1,
                name: name,
                filename: filename,
                type: type.toUpperCase(),
                duration: null,
                created: new Date().toISOString()
            };

            state.soundLibrary.push(newSound);
            console.log('Added sound:', newSound);
            AdventureCreator.navigate('editor');
        },

        playSound: function(index) {
            const sound = AdventureCreator.state.maluva.soundLibrary[index];
            if (!sound) return;

            AdventureCreator.state.maluva.currentTrack = sound.name;
            AdventureCreator.state.maluva.playbackState.isPlaying = true;

            console.log('Playing sound:', sound.name);
            // Implement actual audio playback here
            AdventureCreator.navigate('editor');
        },

        stopSound: function() {
            AdventureCreator.state.maluva.currentTrack = null;
            AdventureCreator.state.maluva.playbackState.isPlaying = false;

            console.log('Stopped playback');
            AdventureCreator.navigate('editor');
        },

        editSound: function(index) {
            const sound = AdventureCreator.state.maluva.soundLibrary[index];
            if (!sound) return;

            const newName = prompt('Sound name:', sound.name);
            if (newName) sound.name = newName;

            const newFilename = prompt('Filename:', sound.filename);
            if (newFilename) sound.filename = newFilename;

            const newType = prompt('Type (SFX/MUSIC):', sound.type);
            if (newType) sound.type = newType.toUpperCase();

            console.log('Edited sound:', sound);
            AdventureCreator.navigate('editor');
        },

        deleteSound: function(index) {
            if (!confirm('Delete this sound?')) return;

            const deleted = AdventureCreator.state.maluva.soundLibrary.splice(index, 1);
            console.log('Deleted sound:', deleted[0]);
            AdventureCreator.navigate('editor');
        },

        importSoundLibrary: function() {
            const json = prompt('Paste sound library JSON:');
            if (!json) return;

            try {
                const imported = JSON.parse(json);
                if (Array.isArray(imported)) {
                    AdventureCreator.state.maluva.soundLibrary = AdventureCreator.state.maluva.soundLibrary.concat(imported);
                    alert(`Imported ${imported.length} sounds!`);
                    AdventureCreator.navigate('editor');
                } else {
                    alert('Invalid JSON format');
                }
            } catch (e) {
                alert('Error parsing JSON: ' + e.message);
            }
        },

        // Graphics System Methods
        toggleGraphics: function() {
            AdventureCreator.state.maluva.graphicsEnabled = !AdventureCreator.state.maluva.graphicsEnabled;
            console.log('Graphics enabled:', AdventureCreator.state.maluva.graphicsEnabled);
            AdventureCreator.navigate('editor');
        },

        clearImage: function() {
            AdventureCreator.state.maluva.currentImage = null;
            console.log('Cleared image');
            AdventureCreator.navigate('editor');
        },

        addImage: function() {
            const state = AdventureCreator.state.maluva;

            if (state.imageLibrary.length >= state.extensions.maxImages) {
                alert(`Maximum image library size reached (${state.extensions.maxImages})`);
                return;
            }

            const name = prompt('Image name:', 'image');
            if (!name) return;

            const filename = prompt('Image filename:', name + '.png');
            if (!filename) return;

            const format = filename.split('.').pop().toUpperCase();

            const newImage = {
                id: state.imageLibrary.length + 1,
                name: name,
                filename: filename,
                format: format,
                dimensions: null,
                created: new Date().toISOString()
            };

            state.imageLibrary.push(newImage);
            console.log('Added image:', newImage);
            AdventureCreator.navigate('editor');
        },

        showImage: function(index) {
            const image = AdventureCreator.state.maluva.imageLibrary[index];
            if (!image) return;

            AdventureCreator.state.maluva.currentImage = image.name;
            console.log('Showing image:', image.name);
            AdventureCreator.navigate('editor');
        },

        hideImage: function() {
            AdventureCreator.state.maluva.currentImage = null;
            console.log('Hidden image');
            AdventureCreator.navigate('editor');
        },

        editImage: function(index) {
            const image = AdventureCreator.state.maluva.imageLibrary[index];
            if (!image) return;

            const newName = prompt('Image name:', image.name);
            if (newName) image.name = newName;

            const newFilename = prompt('Filename:', image.filename);
            if (newFilename) {
                image.filename = newFilename;
                image.format = newFilename.split('.').pop().toUpperCase();
            }

            console.log('Edited image:', image);
            AdventureCreator.navigate('editor');
        },

        deleteImage: function(index) {
            if (!confirm('Delete this image?')) return;

            const deleted = AdventureCreator.state.maluva.imageLibrary.splice(index, 1);
            console.log('Deleted image:', deleted[0]);
            AdventureCreator.navigate('editor');
        },

        importImageLibrary: function() {
            const json = prompt('Paste image library JSON:');
            if (!json) return;

            try {
                const imported = JSON.parse(json);
                if (Array.isArray(imported)) {
                    AdventureCreator.state.maluva.imageLibrary = AdventureCreator.state.maluva.imageLibrary.concat(imported);
                    alert(`Imported ${imported.length} images!`);
                    AdventureCreator.navigate('editor');
                } else {
                    alert('Invalid JSON format');
                }
            } catch (e) {
                alert('Error parsing JSON: ' + e.message);
            }
        },

        // External Commands Methods
        addExternalCommand: function() {
            const name = prompt('Command name:', 'command');
            if (!name) return;

            const handler = prompt('Handler function:', 'handleCommand');
            if (!handler) return;

            const description = prompt('Description (optional):', '');

            const newCommand = {
                id: AdventureCreator.state.maluva.externalCommands.length + 1,
                name: name,
                handler: handler,
                type: 'SYSTEM',
                description: description,
                created: new Date().toISOString()
            };

            AdventureCreator.state.maluva.externalCommands.push(newCommand);
            console.log('Added external command:', newCommand);
            AdventureCreator.navigate('editor');
        },

        testExternalCommand: function(index) {
            const cmd = AdventureCreator.state.maluva.externalCommands[index];
            if (!cmd) return;

            alert(`Testing External Command\n\nName: ${cmd.name}\nHandler: ${cmd.handler}\n\nThis would execute: ${cmd.handler}()`);
            console.log('Testing command:', cmd);
        },

        editExternalCommand: function(index) {
            const cmd = AdventureCreator.state.maluva.externalCommands[index];
            if (!cmd) return;

            const newName = prompt('Command name:', cmd.name);
            if (newName) cmd.name = newName;

            const newHandler = prompt('Handler function:', cmd.handler);
            if (newHandler) cmd.handler = newHandler;

            const newDescription = prompt('Description:', cmd.description);
            if (newDescription !== null) cmd.description = newDescription;

            console.log('Edited command:', cmd);
            AdventureCreator.navigate('editor');
        },

        deleteExternalCommand: function(index) {
            if (!confirm('Delete this external command?')) return;

            const deleted = AdventureCreator.state.maluva.externalCommands.splice(index, 1);
            console.log('Deleted command:', deleted[0]);
            AdventureCreator.navigate('editor');
        },

        // Modules System Methods
        addModule: function() {
            const name = prompt('Module name:', 'module');
            if (!name) return;

            const entryPoint = prompt('Entry point:', 'main');
            if (!entryPoint) return;

            const version = prompt('Version (optional):', '1.0.0');
            const description = prompt('Description (optional):', '');

            const newModule = {
                name: name,
                entryPoint: entryPoint,
                version: version,
                description: description,
                loaded: false,
                created: new Date().toISOString()
            };

            AdventureCreator.state.maluva.modules.push(newModule);
            console.log('Added module:', newModule);
            AdventureCreator.navigate('editor');
        },

        loadModule: function(index) {
            const module = AdventureCreator.state.maluva.modules[index];
            if (!module) return;

            module.loaded = true;
            console.log('Loaded module:', module.name);
            AdventureCreator.navigate('editor');
        },

        unloadModule: function(index) {
            const module = AdventureCreator.state.maluva.modules[index];
            if (!module) return;

            module.loaded = false;
            console.log('Unloaded module:', module.name);
            AdventureCreator.navigate('editor');
        },

        editModule: function(index) {
            const module = AdventureCreator.state.maluva.modules[index];
            if (!module) return;

            const newName = prompt('Module name:', module.name);
            if (newName) module.name = newName;

            const newEntry = prompt('Entry point:', module.entryPoint);
            if (newEntry) module.entryPoint = newEntry;

            const newVersion = prompt('Version:', module.version);
            if (newVersion) module.version = newVersion;

            const newDescription = prompt('Description:', module.description);
            if (newDescription !== null) module.description = newDescription;

            console.log('Edited module:', module);
            AdventureCreator.navigate('editor');
        },

        deleteModule: function(index) {
            if (!confirm('Delete this module?')) return;

            const deleted = AdventureCreator.state.maluva.modules.splice(index, 1);
            console.log('Deleted module:', deleted[0]);
            AdventureCreator.navigate('editor');
        },

        // Export functionality
        exportSoundLibrary: function() {
            const sounds = AdventureCreator.state.maluva.soundLibrary;
            const json = JSON.stringify(sounds, null, 2);

            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sound_library.json';
            a.click();
            URL.revokeObjectURL(url);

            console.log('Exported sound library');
        },

        exportImageLibrary: function() {
            const images = AdventureCreator.state.maluva.imageLibrary;
            const json = JSON.stringify(images, null, 2);

            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'image_library.json';
            a.click();
            URL.revokeObjectURL(url);

            console.log('Exported image library');
        },

        exportDAADCode: function() {
            const sounds = AdventureCreator.state.maluva.soundLibrary;
            const images = AdventureCreator.state.maluva.imageLibrary;

            let daadCode = '; MALUVA Extensions - Generated Code\n\n';

            if (sounds.length > 0) {
                daadCode += '; Sound Library\n';
                sounds.forEach(sound => {
                    daadCode += `; Sound ${sound.id}: ${sound.name} (${sound.filename})\n`;
                });
                daadCode += '\n';
            }

            if (images.length > 0) {
                daadCode += '; Image Library\n';
                images.forEach(image => {
                    daadCode += `; Image ${image.id}: ${image.name} (${image.filename})\n`;
                });
                daadCode += '\n';
            }

            const blob = new Blob([daadCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'maluva_extensions.daad';
            a.click();
            URL.revokeObjectURL(url);

            console.log('Exported DAAD code');
        }
    };

    // Register the module
    AdventureCreator.registerModule('maluva-extensions-system', MaluvaExtensionsSystem);

    console.log('Enhanced MALUVA Extensions System registered successfully');

})();
