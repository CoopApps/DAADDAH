# HTML Export Integration for DAAD Builder

## Overview

The DAAD Builder now supports compiling games directly to HTML format using the DAAD Ready tools. This creates a standalone web game that can run in any modern browser without emulators or special software.

## How It Works

### The Compilation Pipeline

```
Game JSON → DSF (DAAD Source) → JSON (Frontend) → JDDB (Backend) → HTML Package
     ↓              ↓                    ↓                ↓              ↓
  Builder        DRF.exe             drb.php        jDAAD Engine    Playable Web Game
```

### Components Used

1. **DAAD Ready Tools** (in `daadready/` folder):
   - `DRF.exe` - DAAD frontend compiler (DSF → JSON)
   - `drb.php` - DAAD backend compiler (JSON → JDDB)
   - `jDAADImager.php` - Image processor for web format
   - `jDAADFontMaker.php` - Font generator for web
   - `jDAADMultimedia.php` - Sound/video processor

2. **HTML Template** (in `daadready/ASSETS/HTML/`):
   - `index.html` - Game HTML page
   - `jdaad.js` - JavaScript DAAD interpreter
   - `jdaad.css` - Styling
   - `jquery-3.6.0.min.js` - jQuery library

3. **Runtime Files**:
   - `daad.jddb` - Compiled game database
   - `images.js` - Game images as base64
   - `font.js` - Character font data
   - `sounds.js` - Audio files (if any)
   - `videos.js` - Video files (if any)

## API Function

### `compile_to_html`

```rust
pub async fn compile_to_html(
    game: serde_json::Value,
    output_dir: String,
) -> Result<String, CommandError>
```

**Parameters:**
- `game` - The game data in JSON format
- `output_dir` - Directory where the HTML package will be created

**Returns:**
- Success: Path to the generated HTML folder
- Error: Compilation error message

**Process:**
1. Validates game data (DRC requirements)
2. Exports game to DSF file
3. Compiles DSF → JSON (via DRF.exe)
4. Compiles JSON → JDDB (via drb.php)
5. Copies HTML template files
6. Processes images to PNG format
7. Generates font.js from charset
8. Creates multimedia placeholder files
9. Packages everything into output folder

## Output Structure

```
output_dir/html/
├── index.html              # Main game page (open this to play)
├── jdaad.js               # JavaScript DAAD interpreter
├── jdaad.css              # Styling
├── jquery-3.6.0.min.js    # jQuery library
├── daad.jddb              # Your compiled game data
├── images.js              # Game images (base64 encoded)
├── font.js                # Character font
├── sounds.js              # Sound effects placeholder
├── videos.js              # Video files placeholder
└── extern.js              # External data
```

## Comparison: DSF vs HTML

| Aspect | DSF File | HTML Package |
|--------|----------|--------------|
| **Format** | Plain text source | Complete web application |
| **Size** | ~50-100 KB | 1-2 MB (includes engine) |
| **Runs On** | Needs compiler/interpreter | Any web browser |
| **Distribution** | Source code | End-user ready |
| **Images** | Separate platform files | Embedded base64 |
| **Portability** | Requires DAAD tools | Universal (Windows/Mac/Linux/Mobile) |

## How to Use from Frontend

### Example JavaScript Call:

```javascript
import { invoke } from '@tauri-apps/api/core';

async function exportToHTML(gameData) {
    try {
        const result = await invoke('compile_to_html', {
            game: gameData,
            outputDir: 'D:/exports/my_game'
        });

        console.log(result);
        // "HTML game compiled successfully to: D:/exports/my_game/html
        //  Open index.html in a web browser to play!"

    } catch (error) {
        console.error('HTML compilation failed:', error);
    }
}
```

## Adding HTML Export to UI

To add HTML export to the DAAD Builder UI, you'll want to:

1. **Add Export Button** in the export dialog:
```svelte
<button on:click={exportToHTML}>
    Export to HTML (Web Browser)
</button>
```

2. **Implement Export Handler**:
```javascript
async function exportToHTML() {
    const outputDir = await selectDirectory();
    if (!outputDir) return;

    try {
        showLoading('Compiling to HTML...');
        const result = await invoke('compile_to_html', {
            game: $gameStore,
            outputDir
        });
        showSuccess(result);
    } catch (err) {
        showError(`HTML compilation failed: ${err}`);
    }
}
```

3. **Add to Export Options**:
```javascript
const exportFormats = [
    { name: 'DAAD Source (.dsf)', extension: 'dsf' },
    { name: 'ZX Spectrum (.tap)', platform: 'zx_spectrum_48k' },
    { name: 'HTML (Web Browser)', action: 'html' },
    // ... other formats
];
```

## Benefits of HTML Export

### For Developers:
- **Instant Testing** - Double-click HTML file to test
- **Easy Sharing** - Send single folder or zip file
- **Cross-Platform** - Works everywhere
- **No Emulators** - Just a web browser

### For Players:
- **Accessibility** - Play on any device
- **Modern UX** - Virtual keyboard for mobile
- **No Installation** - Just open and play
- **Responsive** - Adapts to screen size

## Technical Details

### Image Processing
- Game images are converted to PNG format
- PNG files are processed by jDAADImager.php
- Images are embedded as base64 in images.js
- Maximum 256 images supported (0-255)

### Font Generation
- Default font: AD8x6.CHR (8x6 pixel charset)
- Converted to JavaScript array format
- Supports ASCII and extended characters
- Can be customized by changing FONT6 in CONFIG.BAT

### Game Database Format
The JDDB (jDAAD Database) format:
- JSON-based game data
- Compressed and encoded
- Contains all vocabulary, locations, objects, messages
- Includes process tables and condacts
- Compatible with original DAAD semantics

## Troubleshooting

### "DRF compilation failed"
- Check game has valid DSF syntax
- Ensure all locations/objects are consecutively numbered
- Verify no vocabulary words exceed 5 characters

### "DRB compilation failed"
- PHP.exe might not be found
- Check daadready/PHP/PHP.exe exists
- Verify JSON output from DRF is valid

### "Images not showing"
- Ensure images are valid PNG/JPEG
- Check base64 encoding is correct
- Verify image IDs match location IDs

### "HTML page blank"
- Open browser console (F12) for errors
- Check daad.jddb was copied correctly
- Verify all JS files loaded properly

## Future Enhancements

Potential improvements:
- [ ] Single-file HTML output (embed all resources)
- [ ] Audio support (MP3/OGG files)
- [ ] Custom themes/styling
- [ ] Save/load game state to localStorage
- [ ] Mobile-optimized controls
- [ ] Progress/achievement tracking
- [ ] Social sharing features

## References

- [DAAD Ready Documentation](https://www.ngpaws.com/daadready/doc_en.html)
- [ngPAWS Project](https://www.ngpaws.com/)
- [jDAAD JavaScript Interpreter](https://github.com/Utodev/ngPAWS)
- [Original DAAD System](https://wiki.caad.es/DAAD)

## Example Usage

Here's a complete workflow:

1. **Create Game** in DAAD Builder
2. **Add Locations, Objects, Rules**
3. **Test with Emulator** (optional)
4. **Export to HTML**:
   ```
   invoke('compile_to_html', {
       game: gameData,
       outputDir: 'C:/Games/MyAdventure'
   })
   ```
5. **Result**: `C:/Games/MyAdventure/html/index.html`
6. **Distribute**: Zip the `html` folder and share!
7. **Play**: Unzip and open `index.html` in any browser

## File Size Estimates

Typical HTML export sizes:
- Minimal game (no images): ~250 KB
- Small game (5 images): ~500 KB
- Medium game (20 images): ~1.2 MB
- Large game (50 images): ~2.5 MB

Most size comes from:
- jdaad.js interpreter: ~150 KB
- jQuery library: ~90 KB
- Base64-encoded images: varies
- Game database: 20-100 KB

## License Compatibility

The HTML export uses:
- **jDAAD** - JavaScript DAAD interpreter (Open Source)
- **jQuery** - MIT License
- **Your game** - Your own copyright

Distribution is free and unrestricted. Games can be hosted on any web server or distributed as offline HTML packages.

## Summary

The HTML export feature seamlessly integrates DAAD Ready tools into DAAD Builder, enabling one-click compilation of text adventure games to web-playable format. This makes game distribution and testing much easier, opening up DAAD game development to a wider audience.
