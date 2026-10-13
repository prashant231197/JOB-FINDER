const axios = require('axios');
const cheerio = require('cheerio');

async function inspectArticle() {
  const res = await axios.get('https://www.shine.com/job-search/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  $('article').slice(0, 5).each((i, el) => {
    const link = $(el).find('meta[itemprop="url"]').attr('content') || $(el).find('a[href*="/jobs/"]').attr('href');
    const hit = $(el).find('a[aria-label]').attr('aria-label') || '';
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    console.log(`Job ${i}:`, { link, hit, textSnippet: text.slice(0, 150) });
  });
}

inspectArticle();
