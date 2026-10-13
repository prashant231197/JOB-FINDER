const { chromium } = require('playwright');

async function extractIndeedJobs() {
  let browser = null;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox'
      ]
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto('https://in.indeed.com/jobs?q=SDET&l=Bengaluru', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);

    const jobs = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.job_seen_beacon, [data-jk]'));
      const list = [];
      for (const card of cards) {
        const jk = card.getAttribute('data-jk') || card.querySelector('[data-jk]')?.getAttribute('data-jk');
        if (!jk) continue;
        const titleEl = card.querySelector('h2.jobTitle span, h2.jobTitle a, [data-testid="job-title"]');
        const compEl = card.querySelector('[data-testid="company-name"], .companyName');
        const locEl = card.querySelector('[data-testid="text-location"], .companyLocation');
        const salaryEl = card.querySelector('.salary-snippet-container, [data-testid="attribute_snippet_testid"]');

        const title = titleEl ? titleEl.innerText.trim() : '';
        const comp = compEl ? compEl.innerText.trim() : '';
        const loc = locEl ? locEl.innerText.trim() : 'Bengaluru';
        const salary = salaryEl ? salaryEl.innerText.trim() : 'Competitive';

        if (title && !list.some(x => x.jk === jk)) {
          list.push({
            jk,
            title,
            company: comp || 'Leading Tech Firm',
            location: loc,
            salary,
            url: `https://in.indeed.com/viewjob?jk=${jk}`
          });
        }
      }
      return list;
    });

    console.log('Extracted Indeed Jobs count:', jobs.length);
    jobs.slice(0, 10).forEach((j, i) => console.log(i, j.title, 'at', j.company, '->', j.url));
  } catch (e) {
    console.error('Extraction error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

extractIndeedJobs();
