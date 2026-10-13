const multiPlatformJobsService = require('../backend/services/multiPlatformJobsService');

async function testService() {
  console.log('Testing multiPlatformJobsService.searchJobs({ platform: "all", category: "all" })...');
  const start = Date.now();
  const res = await multiPlatformJobsService.searchJobs({
    platform: 'all',
    category: 'all',
    query: 'SDET',
    location: 'India / Worldwide',
    limit: 150
  });

  console.log('Search finished in', Date.now() - start, 'ms');
  console.log('Total found:', res.totalFound);
  console.log('Jobs returned:', res.jobs.length);

  const sample = res.jobs.slice(0, 15);
  sample.forEach((j, i) => {
    console.log(`[${i}] ${j.platformName} | ${j.company} - "${j.title}" -> ${j.applicationUrl}`);
  });

  // Verify 0 generic URLs
  const generic = res.jobs.filter(j => {
    const u = j.applicationUrl.toLowerCase();
    return u.includes('?q=') || u.includes('?k=') || u.includes('/search') || u.includes('849201');
  });
  console.log('Any generic/search/fake-id URLs remaining?', generic.length);
  if (generic.length > 0) {
    console.log('Generic sample:', generic.slice(0, 5).map(x => ({ comp: x.company, url: x.applicationUrl })));
  }
}

testService();
