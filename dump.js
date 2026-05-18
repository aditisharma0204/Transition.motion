const puppeteer = require('playwright');
(async () => {
  const browser = await puppeteer.chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5175/?dump');
  await page.waitForTimeout(500);
  const html = await page.content();
  console.log(html.match(/<linearGradient[\s\S]*?<\/linearGradient>/g).join('\n'));
  await browser.close();
})();
