const fs = require('fs');
const html = fs.readFileSync('/app/applet/coverage/src/features/properties/ListingsView.tsx.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
const text = $('.text').text(); // istanbul generates <pre class="text">
fs.writeFileSync('src/features/properties/ListingsView.tsx', text);
