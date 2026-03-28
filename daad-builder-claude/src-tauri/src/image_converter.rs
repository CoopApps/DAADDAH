use image::{DynamicImage, GenericImageView};

/// Platform-specific image converter
pub struct ImageConverter;

impl ImageConverter {
    /// Decode base64 image data to DynamicImage
    pub fn decode_base64(base64_data: &str) -> Result<DynamicImage, String> {
        // Remove data URL prefix if present (e.g., "data:image/png;base64,")
        let data = if base64_data.starts_with("data:") {
            base64_data
                .split(',')
                .nth(1)
                .ok_or("Invalid base64 data URL")?
        } else {
            base64_data
        };

        use base64::Engine;
        let bytes = base64::engine::general_purpose::STANDARD
            .decode(data)
            .map_err(|e| format!("Base64 decode error: {}", e))?;
        let img =
            image::load_from_memory(&bytes).map_err(|e| format!("Image load error: {}", e))?;
        Ok(img)
    }

    /// Convert image to ZX Spectrum SCR format (256x192, 15 colors)
    pub fn to_zx_spectrum(img: &DynamicImage, height: u16) -> Vec<u8> {
        const WIDTH: u32 = 256;
        const HEIGHT: u32 = 192;

        let palette = Self::zx_spectrum_palette();
        let resized = img.resize_exact(
            WIDTH,
            height as u32,
            image::imageops::FilterType::Nearest,
        );

        let mut scr_data = vec![0u8; 6912]; // 6144 pixels + 768 attributes

        // Convert pixels to SCR format
        for y in 0..height.min(HEIGHT as u16) {
            for x in 0..WIDTH {
                let pixel = resized.get_pixel(x, y as u32);
                let rgb = [pixel[0], pixel[1], pixel[2]];
                let color_idx = Self::find_closest_color(&rgb, &palette);

                let byte_offset = (y as usize / 8) * 256 + (y as usize % 8) * 32 + x as usize / 8;
                let bit_pos = 7 - (x % 8);

                if color_idx > 0 {
                    scr_data[byte_offset] |= 1 << bit_pos;
                }
            }
        }

        scr_data
    }

    /// Convert image to Commodore 64 format (320x200, 16 colors)
    pub fn to_c64(img: &DynamicImage, height: u16) -> Vec<u8> {
        Self::convert_to_indexed_format(img, height, 320, 200, &Self::c64_palette())
    }

    /// Convert image to Amstrad CPC Mode 0 format (160x200, 16 colors)
    pub fn to_amstrad_cpc_mode0(img: &DynamicImage, height: u16) -> Vec<u8> {
        Self::convert_to_indexed_format(img, height, 160, 200, &Self::amstrad_cpc_palette())
    }

    /// Convert image to Amstrad CPC Mode 1 format (320x200, 4 colors)
    pub fn to_amstrad_cpc_mode1(img: &DynamicImage, height: u16) -> Vec<u8> {
        let palette = vec![
            [0, 0, 0],       // Black
            [0, 128, 128],   // Cyan
            [255, 0, 128],   // Magenta
            [255, 255, 255], // White
        ];
        Self::convert_to_indexed_format(img, height, 320, 200, &palette)
    }

    /// Convert image to MSX format (256x192, 15 colors)
    pub fn to_msx(img: &DynamicImage, height: u16) -> Vec<u8> {
        Self::to_zx_spectrum(img, height)
    }

    /// Convert image to Amiga format (320x200, 32 colors)
    pub fn to_amiga(img: &DynamicImage, height: u16) -> Vec<u8> {
        Self::convert_to_indexed_format(img, height, 320, 200, &Self::amiga_palette())
    }

    /// Convert image to Atari ST format (320x200, 16 colors)
    pub fn to_atari_st(img: &DynamicImage, height: u16) -> Vec<u8> {
        let palette = vec![
            [0, 0, 0],       [255, 0, 0],     [0, 255, 0],     [255, 255, 0],
            [0, 0, 255],     [255, 0, 255],   [0, 255, 255],   [255, 255, 255],
            [136, 136, 136], [255, 136, 136], [136, 255, 136], [255, 255, 136],
            [136, 136, 255], [255, 136, 255], [136, 255, 255], [248, 248, 248],
        ];
        Self::convert_to_indexed_format(img, height, 320, 200, &palette)
    }

    /// Convert image to MS-DOS VGA format (320x200, 256 colors)
    pub fn to_msdos_vga(img: &DynamicImage, height: u16) -> Vec<u8> {
        Self::convert_to_indexed_format(img, height, 320, 200, &Self::vga_palette())
    }

    /// Generic indexed color format converter
    fn convert_to_indexed_format(
        img: &DynamicImage,
        height: u16,
        width: u32,
        max_height: u32,
        palette: &[[u8; 3]],
    ) -> Vec<u8> {
        let resized = img.resize_exact(
            width,
            height as u32,
            image::imageops::FilterType::Nearest,
        );

        let mut data = Vec::new();

        for y in 0..height.min(max_height as u16) {
            for x in 0..width {
                let pixel = resized.get_pixel(x, y as u32);
                let rgb = [pixel[0], pixel[1], pixel[2]];
                let color_idx = Self::find_closest_color(&rgb, palette);
                data.push(color_idx);
            }
        }

        data
    }

    /// Find closest color in palette using Euclidean distance
    fn find_closest_color(rgb: &[u8; 3], palette: &[[u8; 3]]) -> u8 {
        let mut min_distance = std::f32::MAX;
        let mut closest_idx = 0;

        for (idx, pal_color) in palette.iter().enumerate() {
            let distance = (
                (rgb[0] as f32 - pal_color[0] as f32).powi(2) +
                (rgb[1] as f32 - pal_color[1] as f32).powi(2) +
                (rgb[2] as f32 - pal_color[2] as f32).powi(2)
            ).sqrt();

            if distance < min_distance {
                min_distance = distance;
                closest_idx = idx;
            }
        }

        closest_idx as u8
    }

    // Platform palettes
    fn zx_spectrum_palette() -> Vec<[u8; 3]> {
        vec![
            [0, 0, 0],       [0, 0, 205],     [205, 0, 0],     [205, 0, 205],
            [0, 205, 0],     [0, 205, 205],   [205, 205, 0],   [205, 205, 205],
            [0, 0, 0],       [0, 0, 255],     [255, 0, 0],     [255, 0, 255],
            [0, 255, 0],     [0, 255, 255],   [255, 255, 0],   [255, 255, 255],
        ]
    }

    fn c64_palette() -> Vec<[u8; 3]> {
        vec![
            [0, 0, 0],       [255, 255, 255], [136, 0, 0],     [170, 255, 238],
            [204, 68, 204],  [0, 204, 85],    [0, 0, 170],     [238, 238, 119],
            [221, 136, 85],  [102, 68, 0],    [255, 119, 119], [51, 51, 51],
            [119, 119, 119], [170, 255, 102], [0, 136, 255],   [187, 187, 187],
        ]
    }

    fn amstrad_cpc_palette() -> Vec<[u8; 3]> {
        vec![
            [0, 0, 0],       [0, 0, 128],     [0, 0, 255],     [128, 0, 0],
            [128, 0, 128],   [128, 0, 255],   [255, 0, 0],     [255, 0, 128],
            [255, 0, 255],   [0, 128, 0],     [0, 128, 128],   [0, 128, 255],
            [128, 128, 0],   [128, 128, 128], [128, 128, 255], [255, 255, 255],
        ]
    }

    fn amiga_palette() -> Vec<[u8; 3]> {
        vec![
            [0, 0, 0],       [17, 17, 17],    [34, 34, 34],    [51, 51, 51],
            [68, 68, 68],    [85, 85, 85],    [102, 102, 102], [119, 119, 119],
            [136, 136, 136], [153, 153, 153], [170, 170, 170], [187, 187, 187],
            [204, 204, 204], [221, 221, 221], [238, 238, 238], [255, 255, 255],
            [255, 0, 0],     [0, 255, 0],     [0, 0, 255],     [255, 255, 0],
            [255, 0, 255],   [0, 255, 255],   [255, 136, 0],   [136, 255, 0],
            [0, 255, 136],   [0, 136, 255],   [136, 0, 255],   [255, 0, 136],
            [136, 68, 0],    [68, 136, 0],    [0, 68, 136],    [136, 0, 68],
        ]
    }

    fn vga_palette() -> Vec<[u8; 3]> {
        let mut palette = Vec::new();

        // EGA colors (first 16)
        let ega_colors = vec![
            [0, 0, 0],       [0, 0, 170],     [0, 170, 0],     [0, 170, 170],
            [170, 0, 0],     [170, 0, 170],   [170, 85, 0],    [170, 170, 170],
            [85, 85, 85],    [85, 85, 255],   [85, 255, 85],   [85, 255, 255],
            [255, 85, 85],   [255, 85, 255],  [255, 255, 85],  [255, 255, 255],
        ];
        palette.extend_from_slice(&ega_colors);

        // Generate remaining 240 colors (simplified palette)
        for i in 16..256 {
            let r = ((i & 0xE0) >> 5) * 36;
            let g = ((i & 0x1C) >> 2) * 36;
            let b = (i & 0x03) * 85;
            palette.push([r as u8, g as u8, b as u8]);
        }

        palette
    }
}
