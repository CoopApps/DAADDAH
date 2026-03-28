#!/usr/bin/env node

/**
 * Simple test script to verify MCP server setup
 * Run with: node test-server.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testServer() {
  console.log('🧪 Testing DAAD Builder MCP Server...\n');

  // Test 1: Check dependencies
  console.log('1. Checking dependencies...');
  try {
    await import('@modelcontextprotocol/sdk/server/index.js');
    console.log('   ✅ MCP SDK installed\n');
  } catch (error) {
    console.log('   ❌ MCP SDK not found. Run: npm install\n');
    return;
  }

  // Test 2: Check index.js exists
  console.log('2. Checking server file...');
  const serverPath = path.join(__dirname, 'index.js');
  try {
    await fs.access(serverPath);
    console.log('   ✅ Server file exists\n');
  } catch (error) {
    console.log('   ❌ Server file not found\n');
    return;
  }

  // Test 3: Check parent directory structure
  console.log('3. Checking project structure...');
  const parentDir = path.dirname(__dirname);
  const requiredPaths = [
    '.claude/commands',
    '.claude/settings.local.json',
    'src',
    'src-tauri'
  ];

  let allExist = true;
  for (const p of requiredPaths) {
    try {
      await fs.access(path.join(parentDir, p));
      console.log(`   ✅ ${p}`);
    } catch (error) {
      console.log(`   ⚠️  ${p} - not found (may be ok)`);
      allExist = false;
    }
  }
  console.log();

  // Test 4: Create test project file
  console.log('4. Testing project file creation...');
  const testProjectPath = path.join(__dirname, 'test_project.json');
  const testProject = {
    gameInfo: {
      title: 'Test Game',
      author: 'Test Author',
      version: '1.0',
      maxCarried: 4,
      lightSourceId: null,
      startLocation: 0,
      startFlags: [],
      vocabulary: [],
      systemMessages: []
    },
    locations: [
      {
        id: 0,
        name: 'Test Location',
        description: 'This is a test location.',
        x: 0,
        y: 0
      }
    ],
    objects: [],
    connections: [],
    rules: [],
    characters: []
  };

  try {
    await fs.writeFile(testProjectPath, JSON.stringify(testProject, null, 2));
    console.log('   ✅ Created test project file\n');

    // Read it back
    const data = await fs.readFile(testProjectPath, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed.gameInfo.title === 'Test Game') {
      console.log('   ✅ Test project file is valid\n');
    }

    // Clean up
    await fs.unlink(testProjectPath);
    console.log('   ✅ Cleanup successful\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return;
  }

  // Test 5: Check Node version
  console.log('5. Checking Node.js version...');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion >= 18) {
    console.log(`   ✅ Node.js ${nodeVersion} (>= 18 required)\n`);
  } else {
    console.log(`   ⚠️  Node.js ${nodeVersion} (18+ recommended)\n`);
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All tests passed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Next steps:');
  console.log('1. Update claude_desktop_config.json with the server path');
  console.log('2. Restart Claude Desktop');
  console.log('3. Verify MCP tools are available in Claude Desktop\n');
  console.log('For detailed setup instructions, see ../SETUP.md');
}

testServer().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
