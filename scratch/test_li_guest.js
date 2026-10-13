const axios = require('axios');
const cheerio = require('cheerio');

async function testLinkedInGuest() {
  const url = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=SDET&location=Bangalore&f_TPR=r604800&f_AL=true&start=0';
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  const $ = cheerio.load(res.data);
  const jobs = [];
  $('li').each((i, el) => {
    const title = $(el).find('.base-search-card__title').text().trim();
    const company = $(el).find('.base-search-card__subtitle').text().trim();
    const location = $(el).find('.job-search-card__location').text().trim();
    const link = $(el).find('a.base-card__full-link').attr('href');
    if (title && company) {
      jobs.push({ title, company, location, link: link ? link.split('?')[0] : '' });
    }
  });
  console.log('Successfully scraped LinkedIn guest jobs count:', jobs.length);
  if (jobs.length > 0) {
    console.log('Sample Job:', jobs[0]);
  }
}
testLinkedInGuest();
