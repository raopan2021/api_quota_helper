const puppeteer = require('puppeteer');
const path = require('path');
const firefoxPath = '/home/rao/.cache/puppeteer/firefox/linux-stable_148.0.2/firefox/firefox';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: firefoxPath,
    dumpio: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  // Load the HTML file
  const htmlPath = 'file://' + path.resolve('/home/rao/.openclaw/workspace/bus_report.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
  
  // Generate PDF
  const outputPath = '/home/rao/.openclaw/workspace/中国客车企业财务报告2021-2025.pdf';
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  
  console.log('PDF generated successfully:', outputPath);
  await browser.close();
})();
