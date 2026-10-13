const axios = require('axios');
const cheerio = require('cheerio');

async function inspectShine() {
  const res = await axios.get('https://www.shine.com/job-search/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  const results = [];
  $('a[href*="/jobs/"]').each((i, el) => {
    let href = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (href && href.includes('/jobs/') && !href.includes('/job-search/')) {
      if (href.includes('?')) href = href.split('?')[0];
      const fullUrl = href.startsWith('http') ? href : `https://www.shine.com${href}`;
      if (!results.some(r => r.href === fullUrl)) {
        results.push({ text, href: fullUrl });
      }
    }
  });

  console.log('Shine unique job links found:', results.length);
  results.slice(0, 10).forEach((r, idx) => console.log(idx, r.text, '->', r.href));
}

inspectShine();
