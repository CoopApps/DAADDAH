const fs = require('fs');

const codegenPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/codegen.rs';
let content = fs.readFileSync(codegenPath, 'utf8');

// 1. Update generate() to call new picture generation method
content = content.replace(
  `        // Connections
        code.push_str(&Self::generate_connections(&game.locations));

        // Objects
        code.push_str(&Self::generate_objects(&game.objects));`,
  `        // Connections
        code.push_str(&Self::generate_connections(&game.locations));

        // Pictures (images for locations)
        code.push_str(&Self::generate_pictures(&game.locations));

        // Objects
        code.push_str(&Self::generate_objects(&game.objects));`
);

// 2. Update generate_locations to add DARK command instead of just comment
content = content.replace(
  `        for loc in locations {
            code.push_str(&format!("; Location {}: {}\\n", loc.id, loc.name));
            if loc.is_dark {
                code.push_str("; DARK LOCATION\\n");
            }
            code.push_str(&format!("{}\\n", loc.description));`,
  `        for loc in locations {
            code.push_str(&format!("; Location {}: {}\\n", loc.id, loc.name));
            if loc.is_dark {
                code.push_str("; DARK LOCATION\\n");
                code.push_str("DARK\\n");
            }
            code.push_str(&format!("{}\\n", loc.description));`
);

// 3. Add generate_pictures method before generate_objects
const generatePicturesMethod = `
    fn generate_pictures(locations: &[Location]) -> String {
        let mut code = String::from("/PIC ; Pictures (Images)\\n\\n");

        let mut has_pictures = false;

        for loc in locations {
            if let Some(image) = &loc.image {
                has_pictures = true;
                code.push_str(&format!("; Location {}: {}\\n", loc.id, loc.name));
                code.push_str(&format!(
                    "PICTURE {} {} {} ; y_pos={}, height={}\\n",
                    loc.id,
                    image.y_position,
                    image.height,
                    image.y_position,
                    image.height
                ));

                // Note: Actual image data conversion to platform formats
                // would happen in export process, generating .SCR, .PRG, etc.
                code.push_str(&format!("; Source image: {} bytes\\n",
                    image.source_data.len()));

                if let Some(ref platform_images) = image.platform_images {
                    code.push_str(&format!("; Platform images: {}\\n",
                        platform_images.len()));
                }

                code.push('\\n');
            }
        }

        if !has_pictures {
            code.push_str("; No pictures defined\\n\\n");
        }

        code
    }
`;

content = content.replace(
  `    fn generate_objects(objects: &[Object]) -> String {`,
  generatePicturesMethod + `\n    fn generate_objects(objects: &[Object]) -> String {`
);

fs.writeFileSync(codegenPath, content);
console.log('Added PICTURE and DARK command generation to codegen');
