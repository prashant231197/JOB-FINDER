const { chromium } = require('playwright');

async function testWithInstalledChrome() {
  console.log('Testing with channel: chrome');
  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox']
    });
    console.log('Successfully launched installed Chrome!');
    const page = await browser.newPage();
    await page.goto('https://in.indeed.com/jobs?q=SDET&l=India', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    const title = await page.title();
    console.log('Indeed Page Title:', title);

    const jobs = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.job_seen_beacon, [data-jk], div.jobsearch-SerpJobCard'));
      return cards.slice(0, 10).map(c => {
        const jk = c.getAttribute('data-jk') || c.querySelector('[data-jk]')?.getAttribute('data-jk');
        const titleEl = c.querySelector('h2.jobTitle span, h2.jobTitle a, a[data-jk]');
        const compEl = c.querySelector('[data-testid="company-name"], .companyName');
        const locEl = c.querySelector('[data-testid="text-location"], .companyLocation');
        return {
          jk,
          title: titleEl?.innerText?.trim(),
          company: compEl?.innerText?.trim(),
          location: locEl?.innerText?.trim(),
          url: jk ? `https://in.indeed.com/viewjob?jk=${jk}` : null
        };
      }).filter(j => j.title && j.url);
    });
    console.log('Scraped Indeed Jobs count:', jobs.length);
    console.log('Sample jobs:', jobs.slice(0, 3));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

testWithInstalledChrome();
