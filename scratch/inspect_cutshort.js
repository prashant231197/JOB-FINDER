const axios = require('axios');
const cheerio = require('cheerio');

async function inspectCutshort() {
  const res = await axios.get('https://cutshort.io/jobs/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  const results = [];
  $('a[href*="/job/"]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (href && !results.some(r => r.href === href)) {
      const fullUrl = href.startsWith('http') ? href : `https://cutshort.io${href}`;
      results.push({ text, href: fullUrl });
    }
  });

  console.log('Cutshort unique job links found:', results.length);
  results.slice(0, 10).forEach((r, idx) => console.log(idx, r.text, '->', r.href));
}

inspectCutshort();
