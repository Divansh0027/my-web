const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    const originalString = window.String;
    window.String = function(arg) {
      if (typeof arg === 'object' && arg !== null) {
        if (!arg.toString || arg.toString === Object.prototype.toString) {
           console.log('STRING_CALLED_ON_WEIRD_OBJECT:', arg);
        }
      }
      return originalString(arg);
    };
  });

  page.on('console', msg => {
    if (msg.text().includes('STRING_CALLED_ON_WEIRD_OBJECT')) {
      console.log('GOTCHA:', msg.args().map(a => a._remoteObject));
    }
  });

  await page.goto(`http://localhost:3000/properties`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
