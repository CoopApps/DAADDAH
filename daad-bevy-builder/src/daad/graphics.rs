// Graphics and media management system
use std::path::Path;
use std::fs;
use std::collections::HashMap;

/// Graphics database for bundling game images
pub struct GraphicsDatabase {
    pub images: HashMap<u8, ImageEntry>,
    pub sounds: HashMap<u8, SoundEntry>,
    pub music: HashMap<u8, MusicEntry>,
}

#[derive(Debug, Clone)]
pub struct ImageEntry {
    pub picture_id: u8,
    pub file_path: String,
    pub file_exists: bool,
    pub file_size: Option<u64>,
    pub format: ImageFormat,
}

#[derive(Debug, Clone)]
pub struct SoundEntry {
    pub sound_id: u8,
    pub file_path: String,
    pub file_exists: bool,
    pub file_size: Option<u64>,
}

#[derive(Debug, Clone)]
pub struct MusicEntry {
    pub music_id: u8,
    pub file_path: String,
    pub file_exists: bool,
    pub file_size: Option<u64>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ImageFormat {
    PNG,
    JPG,
    GIF,
    BMP,
    Unknown,
}

impl ImageFormat {
    pub fn from_path(path: &str) -> Self {
        let path_lower = path.to_lowercase();
        if path_lower.ends_with(".png") {
            ImageFormat::PNG
        } else if path_lower.ends_with(".jpg") || path_lower.ends_with(".jpeg") {
            ImageFormat::JPG
        } else if path_lower.ends_with(".gif") {
            ImageFormat::GIF
        } else if path_lower.ends_with(".bmp") {
            ImageFormat::BMP
        } else {
            ImageFormat::Unknown
        }
    }
}

impl GraphicsDatabase {
    pub fn new() -> Self {
        Self {
            images: HashMap::new(),
            sounds: HashMap::new(),
            music: HashMap::new(),
        }
    }

    /// Build database from game data
    pub fn from_game(game: &crate::daad::game::DaadGame) -> Self {
        let mut db = Self::new();

        // Collect all images from locations
        for location in &game.locations {
            if let (Some(ref path), Some(picture_id)) = (&location.image_file, location.picture_id) {
                let file_exists = Path::new(path).exists();
                let file_size = if file_exists {
                    fs::metadata(path).ok().map(|m| m.len())
                } else {
                    None
                };

                db.images.insert(picture_id, ImageEntry {
                    picture_id,
                    file_path: path.clone(),
                    file_exists,
                    file_size,
                    format: ImageFormat::from_path(path),
                });
            }
        }

        // TODO: Collect sounds and music from rules/actions

        db
    }

    /// Export graphics database to directory
    pub fn export(&self, output_dir: &str) -> Result<GraphicsExportReport, std::io::Error> {
        let output_path = Path::new(output_dir);
        fs::create_dir_all(output_path)?;

        let mut report = GraphicsExportReport {
            images_copied: 0,
            images_missing: 0,
            sounds_copied: 0,
            sounds_missing: 0,
            music_copied: 0,
            music_missing: 0,
            total_size: 0,
            errors: Vec::new(),
        };

        // Export images
        let images_dir = output_path.join("images");
        fs::create_dir_all(&images_dir)?;

        for (id, entry) in &self.images {
            if entry.file_exists {
                let source = Path::new(&entry.file_path);
                let fallback_filename = format!("picture_{}.png", id);
                let filename = source.file_name().unwrap_or(std::ffi::OsStr::new(&fallback_filename));
                let dest = images_dir.join(filename);

                match fs::copy(source, dest) {
                    Ok(size) => {
                        report.images_copied += 1;
                        report.total_size += size;
                    }
                    Err(e) => {
                        report.errors.push(format!("Failed to copy image {}: {}", id, e));
                    }
                }
            } else {
                report.images_missing += 1;
                report.errors.push(format!("Image {} not found: {}", id, entry.file_path));
            }
        }

        // Export sounds
        let sounds_dir = output_path.join("sounds");
        fs::create_dir_all(&sounds_dir)?;

        for (id, entry) in &self.sounds {
            if entry.file_exists {
                let source = Path::new(&entry.file_path);
                let fallback_filename = format!("sound_{}.wav", id);
                let filename = source.file_name().unwrap_or(std::ffi::OsStr::new(&fallback_filename));
                let dest = sounds_dir.join(filename);

                match fs::copy(source, dest) {
                    Ok(size) => {
                        report.sounds_copied += 1;
                        report.total_size += size;
                    }
                    Err(e) => {
                        report.errors.push(format!("Failed to copy sound {}: {}", id, e));
                    }
                }
            } else {
                report.sounds_missing += 1;
            }
        }

        // Export music
        let music_dir = output_path.join("music");
        fs::create_dir_all(&music_dir)?;

        for (id, entry) in &self.music {
            if entry.file_exists {
                let source = Path::new(&entry.file_path);
                let fallback_filename = format!("music_{}.mp3", id);
                let filename = source.file_name().unwrap_or(std::ffi::OsStr::new(&fallback_filename));
                let dest = music_dir.join(filename);

                match fs::copy(source, dest) {
                    Ok(size) => {
                        report.music_copied += 1;
                        report.total_size += size;
                    }
                    Err(e) => {
                        report.errors.push(format!("Failed to copy music {}: {}", id, e));
                    }
                }
            } else {
                report.music_missing += 1;
            }
        }

        Ok(report)
    }

    /// Validate all media files exist
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        for (id, entry) in &self.images {
            if !entry.file_exists {
                errors.push(format!("Image {}: File not found: {}", id, entry.file_path));
            }
        }

        for (id, entry) in &self.sounds {
            if !entry.file_exists {
                errors.push(format!("Sound {}: File not found: {}", id, entry.file_path));
            }
        }

        for (id, entry) in &self.music {
            if !entry.file_exists {
                errors.push(format!("Music {}: File not found: {}", id, entry.file_path));
            }
        }

        errors
    }
}

#[derive(Debug)]
pub struct GraphicsExportReport {
    pub images_copied: usize,
    pub images_missing: usize,
    pub sounds_copied: usize,
    pub sounds_missing: usize,
    pub music_copied: usize,
    pub music_missing: usize,
    pub total_size: u64,
    pub errors: Vec<String>,
}

impl GraphicsExportReport {
    pub fn summary(&self) -> String {
        format!(
            "Graphics Export Summary:\n\
             Images: {} copied, {} missing\n\
             Sounds: {} copied, {} missing\n\
             Music: {} copied, {} missing\n\
             Total size: {} KB\n\
             Errors: {}",
            self.images_copied,
            self.images_missing,
            self.sounds_copied,
            self.sounds_missing,
            self.music_copied,
            self.music_missing,
            self.total_size / 1024,
            self.errors.len()
        )
    }
}
