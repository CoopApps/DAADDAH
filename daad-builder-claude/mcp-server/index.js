#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const APP_API_URL = 'http://localhost:3042/api';

class DAADBuilderServer {
  constructor() {
    this.server = new Server(
      {
        name: 'daad-builder-mcp-server',
        version: '3.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async callAppAPI(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${APP_API_URL}${endpoint}`, options);
      return await response.json();
    } catch (error) {
      console.error(`API call failed: ${error.message}`);
      throw new Error(`Failed to communicate with DAAD Builder app. Make sure the app is running!`);
    }
  }

  // Convert location number to string format expected by Rust API
  convertLocationToString(location) {
    if (typeof location === 'string') return location;
    const loc = parseInt(location, 10);
    if (loc === 252 || isNaN(loc)) return 'limbo';
    if (loc === 253) return 'worn';
    if (loc === 254) return 'carried';
    return String(loc);  // Regular location ID as string
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // ==================== APP STATUS ====================
        {
          name: 'check_app_status',
          description: 'Check if the DAAD Builder app is running and ready to receive commands.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== LOCATION OPERATIONS ====================
        {
          name: 'create_location',
          description: 'Create a new location in the DAAD game.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name of the location' },
              description: { type: 'string', description: 'Description shown when entering' },
              x: { type: 'number', description: 'X coordinate for visual map', default: 0 },
              y: { type: 'number', description: 'Y coordinate for visual map', default: 0 },
              is_dark: { type: 'boolean', description: 'Whether location is dark', default: false },
            },
            required: ['name', 'description'],
          },
        },
        {
          name: 'update_location',
          description: 'Update an existing location.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Location ID to update' },
              name: { type: 'string', description: 'New name (optional)' },
              description: { type: 'string', description: 'New description (optional)' },
              x: { type: 'number', description: 'New X coordinate (optional)' },
              y: { type: 'number', description: 'New Y coordinate (optional)' },
              is_dark: { type: 'boolean', description: 'Whether location is dark (optional)' },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_location',
          description: 'Delete a location from the game.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Location ID to delete' },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_locations',
          description: 'Get a list of all locations in the game.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== OBJECT OPERATIONS ====================
        {
          name: 'create_object',
          description: 'Create a new object in the DAAD game.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name of the object' },
              description: { type: 'string', description: 'Description when examining' },
              noun: { type: 'string', description: 'Noun word for vocabulary (e.g., "key")' },
              adjective: { type: 'string', description: 'Adjective (optional)', default: '' },
              location: { type: 'number', description: 'Location ID (252=limbo, 253=worn, 254=carried)', default: 252 },
              weight: { type: 'number', description: 'Object weight', default: 1 },
              is_container: { type: 'boolean', description: 'Can hold other objects', default: false },
              is_wearable: { type: 'boolean', description: 'Can be worn', default: false },
              is_takeable: { type: 'boolean', description: 'Can be picked up', default: true },
              is_light_source: { type: 'boolean', description: 'Provides light in dark rooms', default: false },
              otx_text: { type: 'string', description: 'Display name for LISTOBJ (e.g. "the wooden ruler"). Auto-generated if absent.' },
              attributes: { type: 'array', items: { type: 'number' }, description: 'Attribute bit indices (0-15) for HASAT/HASNAT condacts' },
            },
            required: ['name', 'description', 'noun'],
          },
        },
        {
          name: 'update_object',
          description: 'Update an existing object. Use move_object to change location.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Object ID to update' },
              name: { type: 'string', description: 'New name (optional)' },
              description: { type: 'string', description: 'New description (optional)' },
              noun: { type: 'string', description: 'New noun (optional)' },
              adjective: { type: 'string', description: 'New adjective (optional)' },
              weight: { type: 'number', description: 'New weight (optional)' },
              is_container: { type: 'boolean', description: 'Is container (optional)' },
              is_wearable: { type: 'boolean', description: 'Is wearable (optional)' },
              is_takeable: { type: 'boolean', description: 'Is takeable (optional)' },
              is_light_source: { type: 'boolean', description: 'Is light source (optional)' },
              otx_text: { type: 'string', description: 'Display name for LISTOBJ (optional)' },
              attributes: { type: 'array', items: { type: 'number' }, description: 'Attribute bit indices (0-15) (optional)' },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_object',
          description: 'Delete an object from the game.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Object ID to delete' },
            },
            required: ['id'],
          },
        },
        {
          name: 'move_object',
          description: 'Move an object to a new location.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Object ID to move' },
              location: { type: 'number', description: 'New location ID (252=limbo, 253=worn, 254=carried)' },
            },
            required: ['id', 'location'],
          },
        },
        {
          name: 'list_objects',
          description: 'Get a list of all objects in the game.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== CONNECTION OPERATIONS ====================
        {
          name: 'create_connection',
          description: 'Create a connection between two locations.',
          inputSchema: {
            type: 'object',
            properties: {
              from_location: { type: 'number', description: 'Source location ID' },
              to_location: { type: 'number', description: 'Destination location ID' },
              direction: {
                type: 'string',
                description: 'Direction (n, s, e, w, ne, nw, se, sw, u, d, in, out)',
                enum: ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd', 'in', 'out'],
              },
            },
            required: ['from_location', 'to_location', 'direction'],
          },
        },
        {
          name: 'delete_connection',
          description: 'Delete a connection between locations.',
          inputSchema: {
            type: 'object',
            properties: {
              from_location: { type: 'number', description: 'Source location ID' },
              direction: { type: 'string', description: 'Direction to remove' },
            },
            required: ['from_location', 'direction'],
          },
        },

        // ==================== VOCABULARY OPERATIONS ====================
        {
          name: 'create_vocabulary',
          description: 'Add a word to the game vocabulary.',
          inputSchema: {
            type: 'object',
            properties: {
              word: { type: 'string', description: 'The word to add' },
              word_type: {
                type: 'string',
                description: 'Type of word',
                enum: ['verb', 'noun', 'adjective'],
              },
              id: { type: 'number', description: 'Associated verb/noun/adjective ID' },
            },
            required: ['word', 'word_type', 'id'],
          },
        },
        {
          name: 'delete_vocabulary',
          description: 'Remove a word from the vocabulary.',
          inputSchema: {
            type: 'object',
            properties: {
              word: { type: 'string', description: 'The word to remove' },
            },
            required: ['word'],
          },
        },
        {
          name: 'list_vocabulary',
          description: 'Get all vocabulary words.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== FLAG OPERATIONS ====================
        {
          name: 'create_flag',
          description: 'Create a game flag/variable.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Flag name' },
              description: { type: 'string', description: 'What the flag represents' },
              initial_value: { type: 'number', description: 'Starting value', default: 0 },
            },
            required: ['name', 'description'],
          },
        },
        {
          name: 'update_flag',
          description: 'Update a flag.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Flag ID to update' },
              name: { type: 'string', description: 'New name (optional)' },
              description: { type: 'string', description: 'New description (optional)' },
              initial_value: { type: 'number', description: 'New initial value (optional)' },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_flag',
          description: 'Delete a flag.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Flag ID to delete' },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_flags',
          description: 'Get all flags.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== RULE OPERATIONS ====================
        {
          name: 'create_rule',
          description: 'Create a game rule with conditions and actions. PRO5 = response table (verb/noun commands), PRO0 = per-turn events, PRO4 = auto-events (timers). PRO13-255 are custom tables.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Rule name' },
              process: {
                type: 'string',
                description: 'Process table (PRO0-PRO255). PRO5=responses, PRO0=per-turn, PRO4=auto-events',
                default: 'PRO5',
              },
              verb: { type: 'string', description: 'Verb to match (e.g. "EXAMINE", "GET"). Use "_" for wildcard.' },
              noun: { type: 'string', description: 'Noun to match (e.g. "KEY", "DOOR"). Use "_" for wildcard.' },
              conditions: {
                type: 'array',
                description: 'Conditions to check. Each has type (e.g. AT, PRESENT, ZERO, NOTZERO, EQ, GT, LT, CARRIED, WORN, CHANCE) and params object.',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', description: 'Condition type (e.g., AT, CARRIED, ZERO, PRESENT, ABSENT, EQ, GT, LT, CHANCE)' },
                    params: { type: 'object', description: 'Condition parameters (e.g. {locno: 5}, {objno: 2}, {flagno: 64, value: 1})' },
                  },
                  required: ['type', 'params'],
                },
                default: [],
              },
              actions: {
                type: 'array',
                description: 'Actions to perform. Each has type and params. Use text field for inline MESSAGE text.',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', description: 'Action type (e.g., MESSAGE, GOTO, SET, CLEAR, LET, PLUS, PLACE, CREATE, DESTROY, GET, DROP, DONE, END, RESTART, PROCESS, DESC, SYSMESS)' },
                    params: { type: 'object', description: 'Action parameters (e.g. {mesno: 0}, {locno: 5}, {flagno: 64}, {objno: 2})' },
                    text: { type: 'string', description: 'Inline message text for MESSAGE/MES actions (optional, replaces mesno)' },
                  },
                  required: ['type', 'params'],
                },
                default: [],
              },
              enabled: { type: 'boolean', description: 'Is rule enabled', default: true },
            },
            required: ['name'],
          },
        },
        {
          name: 'update_rule',
          description: 'Update a rule.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Rule ID to update' },
              name: { type: 'string', description: 'New name (optional)' },
              process: { type: 'string', description: 'New process (optional)' },
              conditions: {
                type: 'array',
                description: 'New conditions (optional)',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    params: { type: 'object' },
                  },
                },
              },
              actions: {
                type: 'array',
                description: 'New actions (optional)',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    params: { type: 'object' },
                  },
                },
              },
              enabled: { type: 'boolean', description: 'Enabled status (optional)' },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_rule',
          description: 'Delete a rule.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Rule ID to delete' },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_rules',
          description: 'Get all rules.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== MESSAGE OPERATIONS ====================
        {
          name: 'create_message',
          description: 'Add a message text.',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'Message text' },
            },
            required: ['text'],
          },
        },
        {
          name: 'update_message',
          description: 'Update a message.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Message index' },
              text: { type: 'string', description: 'New message text' },
            },
            required: ['id', 'text'],
          },
        },
        {
          name: 'delete_message',
          description: 'Delete a message.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Message index to delete' },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_messages',
          description: 'Get all messages.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== MUSIC OPERATIONS ====================
        {
          name: 'create_music',
          description: 'Create a music track.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Track name' },
              tempo: { type: 'number', description: 'BPM (40-240)', default: 120 },
              shape: { type: 'number', description: 'Waveform shape (0-7)', default: 0 },
              volume: { type: 'number', description: 'Volume (0-15000)', default: 10000 },
            },
            required: ['name'],
          },
        },
        {
          name: 'update_music',
          description: 'Update a music track.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Music ID to update' },
              name: { type: 'string', description: 'New name (optional)' },
              tempo: { type: 'number', description: 'New tempo (optional)' },
              shape: { type: 'number', description: 'New shape (optional)' },
              volume: { type: 'number', description: 'New volume (optional)' },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_music',
          description: 'Delete a music track.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Music ID to delete' },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_music',
          description: 'Get all music tracks.',
          inputSchema: { type: 'object', properties: {} },
        },

        // ==================== GAME SETTINGS ====================
        {
          name: 'update_game_settings',
          description: 'Update game metadata (title, author, version, intro text).',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Game title (optional)' },
              author: { type: 'string', description: 'Author name (optional)' },
              version: { type: 'string', description: 'Version string (optional)' },
              intro_text: { type: 'string', description: 'Intro text (optional)' },
              part_number: { type: 'number', description: 'Part number (optional)' },
            },
          },
        },

        // ==================== READ OPERATIONS ====================
        {
          name: 'get_game',
          description: 'Get the complete game state.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_location',
          description: 'Get a specific location by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Location ID' },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_object',
          description: 'Get a specific object by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Object ID' },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_rule',
          description: 'Get a specific rule by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Rule ID' },
            },
            required: ['id'],
          },
        },

        // ==================== GAME SETTINGS (EXTENDED) ====================
        {
          name: 'update_game_settings',
          description: 'Update game metadata (title, author, version, intro text, part number, system messages, status bar config).',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Game title (optional)' },
              author: { type: 'string', description: 'Author name (optional)' },
              version: { type: 'string', description: 'Version string (optional)' },
              intro_text: { type: 'string', description: 'Intro text (optional)' },
              part_number: { type: 'number', description: 'Part number (optional)' },
              system_messages: {
                type: 'object',
                description: 'Custom system messages (STX overrides). Key = message index (0-64), value = custom text. Example: {"0": "You cannot see!", "7": "No way to go there."}',
              },
              status_bar_config: {
                type: 'object',
                description: 'Status bar configuration',
                properties: {
                  paper_color: { type: 'number', description: 'Background color 0-15 (default: 4=red)' },
                  ink_color: { type: 'number', description: 'Text color 0-15 (default: 15=white)' },
                  show_turns: { type: 'boolean', description: 'Show turns counter' },
                  show_location_name: { type: 'boolean', description: 'Show location name' },
                  right_content: { type: 'string', description: '"turns", "score", "custom", or "none"' },
                  right_flag_id: { type: 'number', description: 'Flag ID for score/custom display' },
                  right_label: { type: 'string', description: 'Label text e.g. "Score: "' },
                },
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // ==================== APP STATUS ====================
          case 'check_app_status': {
            try {
              const result = await fetch('http://localhost:3042/health');
              const data = await result.json();
              return {
                content: [{
                  type: 'text',
                  text: `✅ DAAD Builder app is running and ready!\n\nYou can now use all MCP tools to create and edit your game.`,
                }],
              };
            } catch (error) {
              return {
                content: [{
                  type: 'text',
                  text: `❌ DAAD Builder app is NOT running.\n\nPlease start it with:\ncd D:/projects/daadah/daad-builder-claude\nnpm run tauri:dev`,
                }],
              };
            }
          }

          // ==================== LOCATION OPERATIONS ====================
          case 'create_location': {
            const result = await this.callAppAPI('/location', 'POST', {
              name: args.name,
              description: args.description,
              editor_x: args.x || 0,
              editor_y: args.y || 0,
              is_dark: args.is_dark || false,
            });
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `✅ ${result.message} (ID: ${result.id})`
                  : `❌ ${result.message}`,
              }],
            };
          }

          case 'update_location': {
            const body = { ...args };
            if (body.x !== undefined) { body.editor_x = body.x; delete body.x; }
            if (body.y !== undefined) { body.editor_y = body.y; delete body.y; }
            const result = await this.callAppAPI(`/location/${args.id}`, 'PUT', body);
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_location': {
            const result = await this.callAppAPI(`/location/${args.id}`, 'DELETE');
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'list_locations': {
            const result = await this.callAppAPI('/locations', 'GET');
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `📍 Locations (${result.data.length}):\n\n` +
                    result.data.map(l => `${l.id}: ${l.name}\n   "${l.description}"`).join('\n\n')
                  : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== OBJECT OPERATIONS ====================
          case 'create_object': {
            const result = await this.callAppAPI('/object', 'POST', {
              name: args.name,
              description: args.description,
              noun: args.noun,
              adjective: args.adjective || '',
              location: this.convertLocationToString(args.location ?? 252),
              weight: args.weight || 1,
              is_container: args.is_container || false,
              is_wearable: args.is_wearable || false,
              is_takeable: args.is_takeable !== undefined ? args.is_takeable : true,
              is_light_source: args.is_light_source || false,
            });
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `✅ ${result.message} (ID: ${result.id})`
                  : `❌ ${result.message}`,
              }],
            };
          }

          case 'update_object': {
            const result = await this.callAppAPI(`/object/${args.id}`, 'PUT', args);
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_object': {
            const result = await this.callAppAPI(`/object/${args.id}`, 'DELETE');
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'move_object': {
            const result = await this.callAppAPI(`/object/${args.id}/move`, 'PUT', {
              location: this.convertLocationToString(args.location),
            });
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'list_objects': {
            const result = await this.callAppAPI('/objects', 'GET');
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `📦 Objects (${result.data.length}):\n\n` +
                    result.data.map(o => `${o.id}: ${o.name} (${o.noun})\n   "${o.description}"`).join('\n\n')
                  : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== CONNECTION OPERATIONS ====================
          case 'create_connection': {
            const result = await this.callAppAPI('/connection', 'POST', {
              from_location: args.from_location,
              to_location: args.to_location,
              direction: args.direction,
            });
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_connection': {
            const result = await this.callAppAPI('/connection', 'DELETE', {
              from_location: args.from_location,
              direction: args.direction,
            });
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== VOCABULARY OPERATIONS ====================
          case 'create_vocabulary': {
            const result = await this.callAppAPI('/vocabulary', 'POST', {
              word: args.word,
              word_type: args.word_type,
              id: args.id,
            });
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_vocabulary': {
            const result = await this.callAppAPI(`/vocabulary/${encodeURIComponent(args.word)}`, 'DELETE');
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'list_vocabulary': {
            const result = await this.callAppAPI('/vocabulary', 'GET');
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `📖 Vocabulary (${result.data.length}):\n\n` +
                    result.data.map(v => `${v.word} (${v.word_type}) -> ID ${v.id}`).join('\n')
                  : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== FLAG OPERATIONS ====================
          case 'create_flag': {
            const result = await this.callAppAPI('/flag', 'POST', {
              name: args.name,
              description: args.description,
              initial_value: args.initial_value || 0,
            });
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `✅ ${result.message} (ID: ${result.id})`
                  : `❌ ${result.message}`,
              }],
            };
          }

          case 'update_flag': {
            const result = await this.callAppAPI(`/flag/${args.id}`, 'PUT', args);
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_flag': {
            const result = await this.callAppAPI(`/flag/${args.id}`, 'DELETE');
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'list_flags': {
            const result = await this.callAppAPI('/flags', 'GET');
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `🚩 Flags (${result.data.length}):\n\n` +
                    result.data.map(f => `${f.id}: ${f.name} = ${f.initial_value}\n   "${f.description}"`).join('\n\n')
                  : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== RULE OPERATIONS ====================
          case 'create_rule': {
            const result = await this.callAppAPI('/rule', 'POST', {
              name: args.name,
              process: args.process || 'PRO5',
              verb: args.verb || '_',
              noun: args.noun || '_',
              conditions: args.conditions || [],
              actions: args.actions || [],
              enabled: args.enabled !== undefined ? args.enabled : true,
            });
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `✅ ${result.message} (ID: ${result.id})`
                  : `❌ ${result.message}`,
              }],
            };
          }

          case 'update_rule': {
            const result = await this.callAppAPI(`/rule/${args.id}`, 'PUT', args);
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_rule': {
            const result = await this.callAppAPI(`/rule/${args.id}`, 'DELETE');
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'list_rules': {
            const result = await this.callAppAPI('/rules', 'GET');
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `⚙️ Rules (${result.data.length}):\n\n` +
                    result.data.map(r => `${r.id}: ${r.name} (${r.process}) ${r.enabled ? '✓' : '✗'}`).join('\n')
                  : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== MESSAGE OPERATIONS ====================
          case 'create_message': {
            const result = await this.callAppAPI('/message', 'POST', {
              text: args.text,
            });
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `✅ ${result.message} (ID: ${result.id})`
                  : `❌ ${result.message}`,
              }],
            };
          }

          case 'update_message': {
            const result = await this.callAppAPI(`/message/${args.id}`, 'PUT', {
              text: args.text,
            });
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_message': {
            const result = await this.callAppAPI(`/message/${args.id}`, 'DELETE');
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'list_messages': {
            const result = await this.callAppAPI('/messages', 'GET');
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `💬 Messages (${result.data.length}):\n\n` +
                    result.data.map((m, i) => `${i}: "${m}"`).join('\n')
                  : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== MUSIC OPERATIONS ====================
          case 'create_music': {
            const result = await this.callAppAPI('/music', 'POST', {
              name: args.name,
              tempo: args.tempo || 120,
              shape: args.shape || 0,
              volume: args.volume || 10000,
            });
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `✅ ${result.message} (ID: ${result.id})`
                  : `❌ ${result.message}`,
              }],
            };
          }

          case 'update_music': {
            const result = await this.callAppAPI(`/music/${args.id}`, 'PUT', args);
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'delete_music': {
            const result = await this.callAppAPI(`/music/${args.id}`, 'DELETE');
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          case 'list_music': {
            const result = await this.callAppAPI('/music', 'GET');
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `🎵 Music (${result.data.length}):\n\n` +
                    result.data.map(m => `${m.id}: ${m.name} (tempo: ${m.tempo})`).join('\n')
                  : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== GAME SETTINGS ====================
          case 'update_game_settings': {
            const result = await this.callAppAPI('/game/settings', 'PUT', args);
            return {
              content: [{
                type: 'text',
                text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
              }],
            };
          }

          // ==================== READ OPERATIONS ====================
          case 'get_game': {
            const result = await this.callAppAPI('/game', 'GET');
            if (result.success) {
              const game = result.data;
              return {
                content: [{
                  type: 'text',
                  text: `🎮 ${game.title} by ${game.author}\n\n` +
                    `📍 Locations: ${game.locations.length}\n` +
                    `📦 Objects: ${game.objects.length}\n` +
                    `⚙️ Rules: ${game.rules.length}\n` +
                    `🚩 Flags: ${game.flags.length}\n` +
                    `📖 Vocabulary: ${game.vocabulary.length} words\n` +
                    `🎵 Music: ${game.music.length} tracks`,
                }],
              };
            }
            return {
              content: [{
                type: 'text',
                text: `❌ ${result.message}`,
              }],
            };
          }

          case 'get_location': {
            const result = await this.callAppAPI(`/location/${args.id}`, 'GET');
            if (result.success) {
              const loc = result.data;
              return {
                content: [{
                  type: 'text',
                  text: `📍 Location ${loc.id}: ${loc.name}\n\n` +
                    `Description: "${loc.description}"\n` +
                    `Dark: ${loc.is_dark ? 'Yes' : 'No'}\n` +
                    `Connections: ${loc.connections.length}\n` +
                    `Position: (${loc.editor_x}, ${loc.editor_y})`,
                }],
              };
            }
            return {
              content: [{
                type: 'text',
                text: `❌ ${result.message}`,
              }],
            };
          }

          case 'get_object': {
            const result = await this.callAppAPI(`/object/${args.id}`, 'GET');
            if (result.success) {
              const obj = result.data;
              return {
                content: [{
                  type: 'text',
                  text: `📦 Object ${obj.id}: ${obj.name}\n\n` +
                    `Description: "${obj.description}"\n` +
                    `Noun: ${obj.noun}${obj.adjective ? ` (${obj.adjective})` : ''}\n` +
                    `Weight: ${obj.weight}\n` +
                    `Properties: ${[
                      obj.is_takeable && 'takeable',
                      obj.is_wearable && 'wearable',
                      obj.is_container && 'container',
                      obj.is_light_source && 'light',
                    ].filter(Boolean).join(', ') || 'none'}`,
                }],
              };
            }
            return {
              content: [{
                type: 'text',
                text: `❌ ${result.message}`,
              }],
            };
          }

          case 'get_rule': {
            const result = await this.callAppAPI(`/rule/${args.id}`, 'GET');
            if (result.success) {
              const rule = result.data;
              return {
                content: [{
                  type: 'text',
                  text: `⚙️ Rule ${rule.id}: ${rule.name}\n\n` +
                    `Process: ${rule.process}\n` +
                    `Enabled: ${rule.enabled ? 'Yes' : 'No'}\n` +
                    `Conditions: ${rule.conditions.length}\n` +
                    `Actions: ${rule.actions.length}`,
                }],
              };
            }
            return {
              content: [{
                type: 'text',
                text: `❌ ${result.message}`,
              }],
            };
          }

          // ==================== GAME SETTINGS (EXTENDED) ====================
          case 'update_game_settings': {
            const body = {};
            if (args.title !== undefined) body.title = args.title;
            if (args.author !== undefined) body.author = args.author;
            if (args.version !== undefined) body.version = args.version;
            if (args.intro_text !== undefined) body.intro_text = args.intro_text;
            if (args.part_number !== undefined) body.part_number = args.part_number;
            if (args.system_messages !== undefined) body.system_messages = args.system_messages;
            if (args.status_bar_config !== undefined) body.status_bar_config = args.status_bar_config;
            const result = await this.callAppAPI('/game/settings', 'PUT', body);
            const updated = Object.keys(body).join(', ') || 'nothing';
            return {
              content: [{
                type: 'text',
                text: result.success
                  ? `✅ Game settings updated: ${updated}`
                  : `❌ ${result.message}`,
              }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error: ${error.message}\n\nMake sure the DAAD Builder app is running!`,
          }],
          isError: true,
        };
      }
    });
  }

  setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: `daad://app-status`,
          mimeType: 'text/plain',
          name: 'DAAD Builder App Status',
          description: 'Check if the DAAD Builder app is running',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      if (uri === 'daad://app-status') {
        try {
          await fetch('http://localhost:3042/health');
          return {
            contents: [{
              uri,
              mimeType: 'text/plain',
              text: 'DAAD Builder app is running and ready!',
            }],
          };
        } catch (error) {
          return {
            contents: [{
              uri,
              mimeType: 'text/plain',
              text: 'DAAD Builder app is NOT running. Please start it first.',
            }],
          };
        }
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 DAAD Builder MCP server v3.0.0 running');
    console.error('📡 Full feature set: All CRUD operations enabled');
    console.error('🔗 Connecting to app at http://localhost:3042');
  }
}

const server = new DAADBuilderServer();
server.run().catch(console.error);
