const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Fix the broken JSX structure - remove the duplicate closing div
content = content.replace(
  `      </div>
    </div>

      {/* Image Dialog */}
      {imageDialogLocation && (
        <ImageDialog
          location={imageDialogLocation}
          onClose={() => setImageDialogLocation(null)}
          onSave={(imageData) => handleSaveImage(imageDialogLocation.id, imageData)}
        />
      )}
    </div>
  );
}`,
  `      </div>

      {/* Image Dialog */}
      {imageDialogLocation && (
        <ImageDialog
          location={imageDialogLocation}
          onClose={() => setImageDialogLocation(null)}
          onSave={(imageData) => handleSaveImage(imageDialogLocation.id, imageData)}
        />
      )}
    </div>
  );
}`
);

fs.writeFileSync(panelPath, content);
console.log('Fixed ImageDialog JSX structure');
