const fs = require('fs');

const commandsPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/commands.rs';
let content = fs.readFileSync(commandsPath, 'utf8');

// Replace the platform export section to include all 8 platforms
content = content.replace(
  `                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "amiga",
                        "iff",
                        &ImageConverter::to_amiga,
                    )?;`,
  `                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "amiga",
                        "iff",
                        &ImageConverter::to_amiga,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "atari_st",
                        "neo",
                        &ImageConverter::to_atari_st,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "msdos",
                        "vga",
                        &ImageConverter::to_msdos_vga,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "amstrad_cpc_mode1",
                        "m1",
                        &ImageConverter::to_amstrad_cpc_mode1,
                    )?;`
);

fs.writeFileSync(commandsPath, content);
console.log('Added remaining 3 platforms to export (8 total platforms now)');
