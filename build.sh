#!/bin/bash
# Build script for DAADDAH (macOS/Linux)

echo "═══════════════════════════════════════════"
echo "  DAADDAH Build Script"
echo "═══════════════════════════════════════════"
echo ""

# Build the Builder
echo "📦 Building DAAD Builder..."
cd daad-bevy-builder
cargo build --release
if [ $? -eq 0 ]; then
    echo "✅ Builder compiled successfully!"
    echo "   Location: daad-bevy-builder/target/release/daad-bevy-builder"
else
    echo "❌ Builder compilation failed!"
    exit 1
fi
echo ""

# Build the Player
echo "🎮 Building DAAD Player..."
cd ../daad-player
cargo build --release
if [ $? -eq 0 ]; then
    echo "✅ Player compiled successfully!"
    echo "   Location: daad-player/target/release/daad-player"
else
    echo "❌ Player compilation failed!"
    exit 1
fi
echo ""

# Create distribution directory
echo "📁 Creating distribution directory..."
cd ..
mkdir -p dist
cp daad-bevy-builder/target/release/daad-bevy-builder dist/
cp daad-player/target/release/daad-player dist/
echo "✅ Executables copied to dist/ directory"
echo ""

echo "═══════════════════════════════════════════"
echo "  Build Complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "Run the builder:"
echo "  ./dist/daad-bevy-builder"
echo ""
echo "Run a game with the player:"
echo "  ./dist/daad-player mygame.json"
echo ""
