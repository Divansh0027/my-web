const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log('ERR:', msg.text());
    }
  });

  await page.goto(`http://localhost:3000`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
