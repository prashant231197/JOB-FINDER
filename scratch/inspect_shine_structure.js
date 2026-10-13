const axios = require('axios');
const cheerio = require('cheerio');

async function inspectCardStructure() {
  const res = await axios.get('https://www.shine.com/job-search/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  const firstA = $('a[href*="/jobs/"]').first();
  console.log('parent parent html:', firstA.parent().parent().html().slice(0, 800));
}

inspectCardStructure();
