const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = 'http://localhost:3000/admin-signin';

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@example.com');
  await page.type('input[type="password"]', 'ChangeMe123!');

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  const dashUrl = 'http://localhost:3000/admin/dashboard';
  await new Promise((res) => setTimeout(res, 500)); // allow any client-side fetches
  await page.goto(dashUrl, { waitUntil: 'networkidle2' });

  const outDir = path.resolve(process.cwd(), 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, 'admin-dashboard.png');
  await page.screenshot({ path: outFile, fullPage: true });
  console.log('Saved screenshot to', outFile);

  await browser.close();
})();
