const axios = require('axios');

async function testFounditApi() {
  const urls = [
    'https://www.foundit.in/middleware/jobsearch?query=sdet&locations=india',
    'https://api.foundit.in/search/v1/jobs?query=sdet',
    'https://www.foundit.in/api/jobsearch?query=sdet'
  ];

  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      console.log('Success:', url, 'data keys:', Object.keys(res.data));
    } catch (e) {
      console.log('Failed:', url, e.response?.status || e.message);
    }
  }
}

testFounditApi();
