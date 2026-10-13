const axios = require('axios');
const cheerio = require('cheerio');

async function inspectFreshersworld() {
  const res = await axios.get('https://www.freshersworld.com/jobs/jobsearch/sdet-jobs', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  const jobs = [];
  $('div.job-container, div.col-md-12.bold-font, [data-job-id]').each((i, el) => {
    const linkEl = $(el).find('a[href*="/jobs/"]').first();
    const href = linkEl.attr('href');
    const title = linkEl.text().trim() || $(el).find('.seo_title, h3').text().trim();
    const comp = $(el).find('.company-name, .latest-jobs-title').first().text().trim();
    if (href && title && !href.includes('/jobsearch/')) {
      jobs.push({
        title,
        comp: comp || 'Tech Firm',
        url: href.startsWith('http') ? href : `https://www.freshersworld.com${href}`
      });
    }
  });

  console.log('Freshersworld jobs found:', jobs.length);
  jobs.slice(0, 5).forEach((j, i) => console.log(i, j.title, 'at', j.comp, '->', j.url));
}

inspectFreshersworld();
