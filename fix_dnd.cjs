const fs = require('fs');
let content = fs.readFileSync('src/features/properties/ListPropertyView.tsx', 'utf8');

content = content.replace(
  'id="media-upload-zone"\n                        onDragOver={(e) => e.preventDefault()}',
  'id="media-upload-zone"\n                        role="button"\n                        tabIndex={0}\n                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("property-image-file-input")?.click() }}\n                        onDragOver={(e) => e.preventDefault()}'
);

fs.writeFileSync('src/features/properties/ListPropertyView.tsx', content);
