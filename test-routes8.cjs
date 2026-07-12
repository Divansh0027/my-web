const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    // Intercept console.error to print full prop object if it's rendered somewhere
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('ERR:', msg.text());
  });

  await page.goto(`http://localhost:3000/properties`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
