const fs = require('fs');
let content = fs.readFileSync('src/shared/components/Footer.tsx', 'utf8');

content = content.replace(
  '<div\n              className="flex items-center gap-2 cursor-pointer"\n              onClick={() => handleLinkClick(\'home\')}\n            >',
  '<div\n              role="button"\n              tabIndex={0}\n              onKeyDown={(e) => { if(e.key==="Enter"||e.key===" ") handleLinkClick(\'home\') }}\n              className="flex items-center gap-2 cursor-pointer"\n              onClick={() => handleLinkClick(\'home\')}\n            >'
);

fs.writeFileSync('src/shared/components/Footer.tsx', content);
