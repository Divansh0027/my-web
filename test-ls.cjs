const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto(`http://localhost:3000`, { waitUntil: 'networkidle0' });
  
  const ls = await page.evaluate(() => localStorage.getItem('ssp_properties'));
  console.log(ls);
  await browser.close();
})();
