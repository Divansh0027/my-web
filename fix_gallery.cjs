const fs = require('fs');
let content = fs.readFileSync('src/features/properties/detail/DetailGallery.tsx', 'utf8');

content = content.replace(
  '<div\n          onClick={() => {\n            setIsLightboxOpen(true)\n            setIsZoomed(false)\n          }}\n          className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden cursor-pointer group border border-outline-variant/50 shadow-md"\n        >',
  '<div\n          role="button"\n          tabIndex={0}\n          onKeyDown={(e) => { if(e.key==="Enter"||e.key===" ") { setIsLightboxOpen(true); setIsZoomed(false); } }}\n          onClick={() => {\n            setIsLightboxOpen(true)\n            setIsZoomed(false)\n          }}\n          className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden cursor-pointer group border border-outline-variant/50 shadow-md"\n        >'
);

content = content.replace(
  '<div\n              className="flex-1 flex items-center justify-center p-4 cursor-zoom-in mt-16 mb-24"\n              onClick={() => setIsZoomed(!isZoomed)}\n            >',
  '<div\n              role="button"\n              tabIndex={0}\n              onKeyDown={(e) => { if(e.key==="Enter"||e.key===" ") setIsZoomed(!isZoomed) }}\n              className="flex-1 flex items-center justify-center p-4 cursor-zoom-in mt-16 mb-24"\n              onClick={() => setIsZoomed(!isZoomed)}\n            >'
);

fs.writeFileSync('src/features/properties/detail/DetailGallery.tsx', content);
