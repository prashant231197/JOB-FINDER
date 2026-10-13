const axios = require('axios');
const cheerio = require('cheerio');

async function testIndeedRss() {
  const rssUrls = [
    'https://in.indeed.com/rss?q=SDET&l=India',
    'https://in.indeed.com/rss?q=QA+Automation&l=Bengaluru',
    'https://www.indeed.co.in/rss?q=SDET'
  ];

  for (const url of rssUrls) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        timeout: 7000
      });
      console.log('RSS status:', res.status, 'length:', res.data.length);
      const $ = cheerio.load(res.data, { xmlMode: true });
      const items = $('item');
      console.log('RSS items found:', items.length);
      if (items.length > 0) {
        console.log('Sample RSS item:', {
          title: $(items[0]).find('title').text(),
          link: $(items[0]).find('link').text(),
          source: $(items[0]).find('source').text()
        });
      }
    } catch (e) {
      console.log('RSS failed:', url, e.response?.status || e.message);
    }
  }
}

testIndeedRss();
