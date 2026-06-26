import fs from 'fs';

let content = fs.readFileSync('./src/components/Navbar.tsx', 'utf8');

// Remove Admin Panel from desktop links
content = content.replace(/\s*\{isAdmin && \(\s*<button\s*onClick=\{\(\) => handleLinkClick\("admin"\)\}\s*className=\{[\s\S]*?\}\s*>\s*<Shield[\s\S]*?\/>\s*Admin Panel\s*<\/button>\s*\)\}/s, '');

// Remove Saved Badges
content = content.replace(/\s*\{\/\* Saved Badges \*\/\}\s*<button\s*onClick=\{\(\) => handleLinkClick\("saved"\)\}[\s\S]*?<\/button>/s, '');

// Remove WhatsApp CTA
content = content.replace(/\s*\{\/\* WhatsApp CTA with Pulse \*\/\}\s*<a\s*href=\{[\s\S]*?<\/a>/s, '');

// Replace old dropdown items
const newDropdownItems = `                      <button 
                        onClick={() => { setIsDropdownOpen(false); handleLinkClick("profile"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-left cursor-pointer"
                      >
                        <UserIcon className="h-4 w-4 text-gold-accent" />
                        My Profile
                      </button>
                      <button 
                        onClick={() => { setIsDropdownOpen(false); handleLinkClick("saved"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-left cursor-pointer"
                      >
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                        Saved ({savedCount})
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => { setIsDropdownOpen(false); handleLinkClick("admin"); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-left cursor-pointer"
                        >
                          <Shield className="h-4 w-4 text-gold-accent" />
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-outline-variant/50 my-1" />`;

content = content.replace(/<button \s*onClick=\{\(\) => \{ setIsDropdownOpen\(false\); handleLinkClick\("profile"\); \}\}[\s\S]*?<div className="border-t border-outline-variant\/50 my-1" \/>/s, newDropdownItems);

content = content.replace(/bg-slate-905/g, 'bg-surface');

fs.writeFileSync('./src/components/Navbar.tsx', content);
