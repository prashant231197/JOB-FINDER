const axios = require('axios');

async function testApiEndpoints() {
  console.log('Testing live API endpoints on http://localhost:5000...');

  // 1. GET /api/jobs
  try {
    const res = await axios.get('http://localhost:5000/api/jobs');
    console.log('1. /api/jobs total:', res.data.total);
    console.log('   First 3 jobs on Radar:');
    res.data.jobs.slice(0, 3).forEach((j, i) => {
      console.log(`   [${i}] ${j.company} - "${j.title}" (${j.matchScore}% Match) -> ${j.applicationUrl}`);
    });
  } catch (e) {
    console.log('1. /api/jobs error:', e.message);
  }

  // 2. POST /api/platforms/search
  try {
    const res = await axios.post('http://localhost:5000/api/platforms/search', {
      platform: 'all',
      category: 'all',
      query: 'SDET',
      location: 'India / Worldwide',
      limit: 50
    });
    console.log('2. /api/platforms/search total found:', res.data.totalFound);
    console.log('   First 3 jobs in Multi-Platform Hub:');
    res.data.jobs.slice(0, 3).forEach((j, i) => {
      console.log(`   [${i}] ${j.platformName} | ${j.company} - "${j.title}" (${j.matchScore}% Match) -> ${j.applicationUrl}`);
    });
  } catch (e) {
    console.log('2. /api/platforms/search error:', e.message);
  }
}

testApiEndpoints();
