const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

async function testIndeed() {
  console.log('--- Testing Indeed India ---');
  try {
    const res = await axios.get('https://in.indeed.com/jobs?q=SDET&l=Bengaluru%2C+Karnataka', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 8000
    });
    console.log('Indeed HTTP status:', res.status, 'length:', res.data.length);
    const $ = cheerio.load(res.data);
    const jks = [];
    $('[data-jk]').each((_, el) => {
      jks.push($(el).attr('data-jk'));
    });
    console.log('Found Indeed data-jks:', jks.slice(0, 5));
  } catch (e) {
    console.log('Indeed HTTP error:', e.message);
  }
}

async function testIndeedPlaywright() {
  console.log('--- Testing Indeed India via Playwright ---');
  let browser = null;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto('https://in.indeed.com/jobs?q=SDET&l=India', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    const jobs = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.job_seen_beacon, [data-jk]'));
      return cards.slice(0, 5).map(c => {
        const jk = c.getAttribute('data-jk') || c.querySelector('[data-jk]')?.getAttribute('data-jk');
        const titleEl = c.querySelector('h2.jobTitle span, h2.jobTitle a, a[data-jk]');
        const compEl = c.querySelector('[data-testid="company-name"], .companyName');
        return {
          jk,
          title: titleEl?.innerText?.trim(),
          company: compEl?.innerText?.trim(),
          url: jk ? `https://in.indeed.com/viewjob?jk=${jk}` : null
        };
      });
    });
    console.log('Indeed Playwright jobs:', jobs);
  } catch (e) {
    console.log('Indeed Playwright error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

async function testJobicy() {
  console.log('--- Testing Jobicy ---');
  try {
    const res = await axios.get('https://jobicy.com/api/v2/remote-jobs?count=20&tag=qa', { timeout: 8000 });
    const jobs = res.data?.jobs || [];
    console.log('Jobicy jobs count:', jobs.length);
    if (jobs.length > 0) {
      console.log('Sample Jobicy job:', {
        title: jobs[0].jobTitle,
        company: jobs[0].companyName,
        url: jobs[0].url
      });
    }
  } catch (e) {
    console.log('Jobicy error:', e.message);
  }
}

async function testGreenhouse() {
  console.log('--- Testing Razorpay / Greenhouse / Lever ATS direct jobs ---');
  try {
    const res = await axios.get('https://boards-api.greenhouse.io/v1/boards/razorpay/jobs', { timeout: 8000 });
    const jobs = res.data?.jobs || [];
    const sdetJobs = jobs.filter(j => /qa|sdet|quality|test/i.test(j.title));
    console.log('Razorpay Greenhouse QA jobs count:', sdetJobs.length);
    if (sdetJobs.length > 0) {
      console.log('Sample Razorpay job:', {
        title: sdetJobs[0].title,
        url: sdetJobs[0].absolute_url
      });
    }
  } catch (e) {
    console.log('Greenhouse error:', e.message);
  }
}

async function testLever() {
  console.log('--- Testing BrowserStack / Lever direct jobs ---');
  try {
    const res = await axios.get('https://api.lever.co/v0/postings/browserstack?mode=json', { timeout: 8000 });
    const jobs = res.data || [];
    const sdetJobs = jobs.filter(j => /qa|sdet|quality|test/i.test(j.text));
    console.log('BrowserStack Lever QA jobs count:', sdetJobs.length);
    if (sdetJobs.length > 0) {
      console.log('Sample BrowserStack job:', {
        title: sdetJobs[0].text,
        url: sdetJobs[0].hostedUrl
      });
    }
  } catch (e) {
    console.log('Lever error:', e.message);
  }
}

async function run() {
  await testIndeed();
  await testIndeedPlaywright();
  await testJobicy();
  await testGreenhouse();
  await testLever();
}

run();
