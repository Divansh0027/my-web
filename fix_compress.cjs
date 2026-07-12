const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
  /async function compressToWebP\(file: File\): Promise<File> \{[\s\S]*?,\n        \)\n      \}\n    \}\n  \}\)\n\}/,
  `async function compressToWebP(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.8
    };
    const compressedFile = await imageCompression(file, options);
    return new File([compressedFile], file.name.replace(/\\.[^/.]+$/, ".webp"), {
      type: "image/webp",
    });
  } catch (error) {
    console.warn('Compression failed', error);
    return file;
  }
}`
);

fs.writeFileSync('src/firebase.ts', content);
