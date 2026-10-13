const axios = require('axios');
const cheerio = require('cheerio');

async function testIndeed() {
  console.log('Testing Indeed live scraping...');
  const url = 'https://in.indeed.com/jobs?q=SDET&l=India';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 8000
    });
    console.log('Indeed status:', res.status, 'HTML length:', res.data.length);
    const $ = cheerio.load(res.data);
    const jobs = [];
    $('.job_seen_beacon, .result, .cardOutline').each((i, el) => {
      const title = $(el).find('h2.jobTitle, .jcs-JobTitle').text().trim();
      const company = $(el).find('[data-testid="company-name"], .companyName').text().trim();
      const loc = $(el).find('[data-testid="text-location"], .companyLocation').text().trim();
      const jk = $(el).find('a[data-jk]').attr('data-jk') || $(el).attr('data-jk');
      if (title && company) {
        jobs.push({
          title,
          company,
          location: loc,
          url: jk ? `https://in.indeed.com/viewjob?jk=${jk}` : `https://in.indeed.com/jobs?q=${encodeURIComponent(company + ' ' + title)}`
        });
      }
    });
    console.log('Indeed scraped count:', jobs.length);
    if (jobs.length > 0) {
      console.log('Sample Indeed job 1:', jobs[0]);
    }
  } catch(e) {
    console.log('Indeed error:', e.message);
  }
}

testIndeed();
