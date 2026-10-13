const axios = require('axios');
const cheerio = require('cheerio');

async function inspectShineCards() {
  const res = await axios.get('https://www.shine.com/job-search/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(res.data);
  const jobs = [];
  
  $('div[class*="jobCard"], div[class*="parentClass"]').each((i, el) => {
    const linkEl = $(el).find('a[href*="/jobs/"]').first();
    const href = linkEl.attr('href');
    if (!href || !href.includes('/jobs/') || href.includes('/job-search/')) return;
    
    const title = linkEl.text().trim() || $(el).find('h2, h3').first().text().trim();
    const comp = $(el).find('div[class*="jobCard_jobCard_cName"], span[class*="companyName"], div[class*="cName"]').first().text().trim();
    const loc = $(el).find('div[class*="jobCard_jobCard_lists"], span[class*="loc"]').text().trim();
    const exp = $(el).find('div[class*="jobCard_jobCard_lists"]').first().text().trim();
    
    if (title && href) {
      jobs.push({
        title,
        comp: comp || 'Top Tech Firm',
        loc: loc || 'India',
        exp,
        url: href.startsWith('http') ? href : `https://www.shine.com${href.split('?')[0]}`
      });
    }
  });

  console.log('Parsed Shine jobs:', jobs.slice(0, 5));
}

inspectShineCards();
