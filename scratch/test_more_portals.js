const axios = require('axios');
const cheerio = require('cheerio');

async function inspectMore() {
  // 1. Instahyre
  try {
    const res = await axios.get('https://www.instahyre.com/api/v1/job_search?designation=sdet', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 7000
    });
    console.log('Instahyre keys:', Object.keys(res.data));
    if (res.data.objects) {
      console.log('Instahyre count:', res.data.objects.length);
      console.log('Instahyre sample:', {
        title: res.data.objects[0].title,
        employer: res.data.objects[0].employer?.company_name,
        slug: res.data.objects[0].slug,
        id: res.data.objects[0].id
      });
    }
  } catch (e) {
    console.log('Instahyre err:', e.message);
  }

  // 2. Hirist
  try {
    const res = await axios.get('https://www.hirist.tech/search?keyword=sdet', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 7000
    });
    const $ = cheerio.load(res.data);
    const links = $('a[href*="/j/"]');
    console.log('Hirist job links count:', links.length);
    if (links.length > 0) {
      console.log('Hirist sample:', $(links[0]).attr('href'), $(links[0]).text().trim());
    }
  } catch (e) {
    console.log('Hirist err:', e.message);
  }

  // 3. TimesJobs
  try {
    const res = await axios.get('https://www.timesjobs.com/candidate/job-search.html?searchType=personalizedSearch&from=submit&txtKeywords=sdet&txtLocation=India', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 7000
    });
    const $ = cheerio.load(res.data);
    const jobCards = $('.job-bx');
    console.log('TimesJobs cards count:', jobCards.length);
    if (jobCards.length > 0) {
      const firstA = $(jobCards[0]).find('h2 a');
      console.log('TimesJobs sample:', firstA.attr('href'), firstA.text().trim());
    }
  } catch (e) {
    console.log('TimesJobs err:', e.message);
  }

  // 4. Freshersworld
  try {
    const res = await axios.get('https://www.freshersworld.com/jobs/jobsearch/sdet-jobs', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 7000
    });
    const $ = cheerio.load(res.data);
    const links = $('a[href*="/jobs/"]');
    console.log('Freshersworld links count:', links.length);
    if (links.length > 0) {
      console.log('Freshersworld sample:', $(links[0]).attr('href'));
    }
  } catch (e) {
    console.log('Freshersworld err:', e.message);
  }
}

inspectMore();
