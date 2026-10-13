const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

async function testNaukriPublicApi() {
  console.log('--- Testing Naukri Job API v3 / v4 ---');
  try {
    const res = await axios.get('https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_keyword&searchType=adv&keyword=sdet&location=india', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'appid': '109',
        'systemid': '109',
        'clientid': 'd3skt0p'
      },
      timeout: 8000
    });
    console.log('Naukri API status:', res.status, 'Total jobs:', res.data?.noOfJobs);
    if (res.data?.jobDetails) {
      console.log('Got Naukri live jobs:', res.data.jobDetails.slice(0, 3).map(j => ({
        title: j.title,
        company: j.companyName,
        url: 'https://www.naukri.com' + j.jdURL
      })));
    }
  } catch (e) {
    console.log('Naukri API error:', e.response?.status || e.message);
  }
}

async function testNaukriPlaywright() {
  console.log('--- Testing Naukri via System Chrome ---');
  let browser = null;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    await page.goto('https://www.naukri.com/sdet-jobs-in-india?k=sdet&l=india', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);
    const jobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('.srp-jobtuple-wrapper, .cust-job-tuple');
      return Array.from(cards).slice(0, 5).map(c => {
        const titleEl = c.querySelector('a.title');
        const compEl = c.querySelector('a.comp-name');
        return {
          title: titleEl?.innerText?.trim(),
          company: compEl?.innerText?.trim(),
          url: titleEl?.href
        };
      });
    });
    console.log('Naukri Chrome scraped count:', jobs.length, jobs);
  } catch (e) {
    console.log('Naukri Chrome error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

async function testLinkedInMulti() {
  console.log('--- Testing LinkedIn Live multi-keywords ---');
  const queries = ['SDET', 'QA Automation', 'Manual Testing', 'Fintech QA'];
  for (const q of queries) {
    try {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(q)}&location=India&f_TPR=r604800&start=0`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 6000
      });
      const $ = cheerio.load(res.data);
      const count = $('li').length;
      console.log(`LinkedIn for "${q}": found ${count} jobs`);
    } catch (e) {
      console.log(`LinkedIn error for "${q}":`, e.message);
    }
  }
}

async function main() {
  await testNaukriPublicApi();
  await testNaukriPlaywright();
  await testLinkedInMulti();
}

main();
