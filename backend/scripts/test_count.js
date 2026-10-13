const multiPlatformJobsService = require('../services/multiPlatformJobsService');

async function testCount() {
  console.log('Testing how many jobs are returned when location is "India / Worldwide"...');
  
  const res1 = await multiPlatformJobsService.searchJobs({
    platform: 'all',
    category: 'all',
    query: 'SDET',
    location: 'India / Worldwide',
    datePosted: 'anytime',
    limit: 150
  });

  console.log(`With datePosted='anytime', totalFound=${res1.totalFound}, returned=${res1.jobs.length}`);

  const res2 = await multiPlatformJobsService.searchJobs({
    platform: 'all',
    category: 'all',
    query: 'SDET',
    location: 'India / Worldwide',
    datePosted: 'under-24h',
    limit: 150
  });

  console.log(`With datePosted='under-24h', totalFound=${res2.totalFound}, returned=${res2.jobs.length}`);
}

testCount();
