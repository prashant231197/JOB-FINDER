const axios = require('axios');

async function testFoundit() {
  try {
    const res = await axios.get('https://www.foundit.in/middleware/jobsearch', {
      params: {
        sort: '1',
        limit: '20',
        query: 'sdet',
        locations: 'India'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    console.log('Foundit middleware keys:', Object.keys(res.data));
    if (res.data.jobSearchResult) {
      console.log('jobSearchResult keys:', Object.keys(res.data.jobSearchResult));
      console.log('Jobs count:', res.data.jobSearchResult.jobs?.length);
      const sample = res.data.jobSearchResult.jobs?.[0];
      if (sample) {
        console.log('Sample job:', {
          title: sample.title,
          company: sample.company?.name,
          url: sample.redirectUrl || sample.jobUrl || sample.seoJdUrl
        });
      }
    }
  } catch (e) {
    console.log('Foundit error:', e.response?.status, e.response?.data || e.message);
  }
}

testFoundit();
