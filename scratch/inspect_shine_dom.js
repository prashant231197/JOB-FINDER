const axios = require('axios');
const cheerio = require('cheerio');

async function inspectShineDOM() {
  const res = await axios.get('https://www.shine.com/job-search/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  $('div[class*="result-card_card"]').slice(0, 3).each((i, el) => {
    console.log(`--- Card ${i} ---`);
    console.log('HTML snippet:', $(el).html().slice(0, 500));
    console.log('Text content:', $(el).text().replace(/\s+/g, ' ').trim());
  });
}

inspectShineDOM();
