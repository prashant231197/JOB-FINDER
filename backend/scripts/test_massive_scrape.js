const axios = require('axios');
const cheerio = require('cheerio');

async function testMassiveScrape() {
  console.log('Testing Massive Live Scraping...');
  
  // 1. LinkedIn Live Search (Multiple pages: start 0, 10, 20, 30)
  const liJobs = [];
  const starts = [0, 10, 20, 30];
  for (const s of starts) {
    try {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=SDET&location=India&start=${s}`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 6000
      });
      const $ = cheerio.load(res.data);
      $('li').each((i, el) => {
        const title = $(el).find('.base-search-card__title, h3').text().trim();
        const company = $(el).find('.base-search-card__subtitle, h4').text().trim();
        let link = $(el).find('a.base-card__full-link, a').attr('href') || '';
        const loc = $(el).find('.job-search-card__location').text().trim();
        const time = $(el).find('time').text().trim() || 'Recent';
        if (title && company && link) {
          liJobs.push({
            platform: 'linkedin',
            platformName: 'LinkedIn India',
            title,
            company,
            location: loc || 'India / Remote',
            applicationUrl: link.split('?')[0],
            postedTime: time
          });
        }
      });
    } catch(e) {
      break;
    }
  }
  console.log('LinkedIn live jobs scraped:', liJobs.length);

  // 2. RemoteOK API
  let rokJobs = [];
  try {
    const res = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 6000
    });
    if (Array.isArray(res.data)) {
      rokJobs = res.data.slice(1, 40).map(j => ({
        platform: 'remoteok',
        platformName: 'Remote OK',
        title: j.position,
        company: j.company,
        location: j.location || 'Remote (Worldwide)',
        applicationUrl: j.url,
        postedTime: 'Recent'
      }));
    }
  } catch(e) {}
  console.log('RemoteOK jobs:', rokJobs.length);

  // 3. WWR RSS
  let wwrJobs = [];
  try {
    const res = await axios.get('https://weworkremotely.com/categories/remote-programming-jobs.rss', { timeout: 6000 });
    const $ = cheerio.load(res.data, { xmlMode: true });
    $('item').each((_, el) => {
      const fullTitle = $(el).find('title').text().trim();
      const link = $(el).find('link').text().trim();
      if (link && link.startsWith('http')) {
        wwrJobs.push({
          platform: 'weworkremotely',
          platformName: 'We Work Remotely',
          title: fullTitle,
          applicationUrl: link
        });
      }
    });
  } catch(e) {}
  console.log('WWR jobs:', wwrJobs.length);

  console.log(`TOTAL REAL LIVE JOBS FROM JUST 3 SOURCES: ${liJobs.length + rokJobs.length + wwrJobs.length}`);
}

testMassiveScrape();
