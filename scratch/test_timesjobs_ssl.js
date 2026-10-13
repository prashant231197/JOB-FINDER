const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

async function testTimesJobsSsl() {
  const agent = new https.Agent({ rejectUnauthorized: false });
  try {
    const res = await axios.get('https://www.timesjobs.com/candidate/job-search.html?searchType=personalizedSearch&from=submit&txtKeywords=sdet&txtLocation=India', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      httpsAgent: agent,
      timeout: 10000
    });
    console.log('TimesJobs status:', res.status, 'length:', res.data.length);
    const $ = cheerio.load(res.data);
    const links = [];
    $('.job-bx h2 a').each((_, el) => {
      links.push({
        title: $(el).text().trim().replace(/\s+/g, ' '),
        url: $(el).attr('href')
      });
    });
    console.log('TimesJobs found live links count:', links.length);
    links.slice(0, 5).forEach((l, i) => console.log(i, l.title, '->', l.url));
  } catch (e) {
    console.log('TimesJobs error:', e.message);
  }
}

testTimesJobsSsl();
