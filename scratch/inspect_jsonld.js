const axios = require('axios');
const cheerio = require('cheerio');

async function inspectJsonLd() {
  const res = await axios.get('https://www.shine.com/job-search/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      console.log(`JSON-LD ${i}:`, data['@type'] || (Array.isArray(data) ? 'Array' : typeof data));
      if (data.itemListElement) {
        console.log('itemListElement count:', data.itemListElement.length);
        console.log('Sample item:', data.itemListElement[0]);
      }
    } catch (e) {}
  });
}

inspectJsonLd();
