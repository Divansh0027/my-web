const fs = require('fs');
let content = fs.readFileSync('src/shared/components/Navbar.tsx', 'utf8');

content = content.replace(
  '<div\n          onClick={() => handleLinkClick(\'home\')}\n          className="flex items-center gap-2 cursor-pointer select-none shrink-0 w-[160px] sm:w-[180px]"\n        >',
  '<div\n          role="button"\n          tabIndex={0}\n          onKeyDown={(e) => { if(e.key==="Enter"||e.key===" ") handleLinkClick(\'home\') }}\n          onClick={() => handleLinkClick(\'home\')}\n          className="flex items-center gap-2 cursor-pointer select-none shrink-0 w-[160px] sm:w-[180px]"\n        >'
);

fs.writeFileSync('src/shared/components/Navbar.tsx', content);
