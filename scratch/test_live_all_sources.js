const axios = require('axios');
const cheerio = require('cheerio');

async function testAll() {
  console.log('--- Testing Live Sources ---');

  // 1. Himalayas
  try {
    const res = await axios.get('https://himalayas.app/jobs/api?limit=15', { timeout: 7000 });
    const jobs = res.data?.jobs || [];
    console.log('1. Himalayas count:', jobs.length);
    if (jobs.length > 0) {
      console.log('   Sample Himalayas URL:', jobs[0].applicationLink || jobs[0].guid || jobs[0].url);
      console.log('   Sample Himalayas Title:', jobs[0].title, 'at', jobs[0].companyName);
    }
  } catch (e) {
    console.log('1. Himalayas failed:', e.message);
  }

  // 2. RemoteOK
  try {
    const res = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 7000
    });
    const jobs = (Array.isArray(res.data) ? res.data : []).filter(j => j.position);
    console.log('2. RemoteOK count:', jobs.length);
    if (jobs.length > 0) {
      console.log('   Sample RemoteOK URL:', jobs[0].url);
      console.log('   Sample RemoteOK Title:', jobs[0].position, 'at', jobs[0].company);
    }
  } catch (e) {
    console.log('2. RemoteOK failed:', e.message);
  }

  // 3. WeWorkRemotely RSS
  try {
    const res = await axios.get('https://weworkremotely.com/categories/remote-programming-jobs.rss', { timeout: 7000 });
    const $ = cheerio.load(res.data, { xmlMode: true });
    const items = $('item');
    console.log('3. WWR items count:', items.length);
    if (items.length > 0) {
      console.log('   Sample WWR link:', $(items[0]).find('link').text());
      console.log('   Sample WWR title:', $(items[0]).find('title').text());
    }
  } catch (e) {
    console.log('3. WWR failed:', e.message);
  }

  // 4. Remotive API
  try {
    const res = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=15', { timeout: 7000 });
    const jobs = res.data?.jobs || [];
    console.log('4. Remotive count:', jobs.length);
    if (jobs.length > 0) {
      console.log('   Sample Remotive URL:', jobs[0].url);
      console.log('   Sample Remotive Title:', jobs[0].title, 'at', jobs[0].company_name);
    }
  } catch (e) {
    console.log('4. Remotive failed:', e.message);
  }

  // 5. Y Combinator / HN
  try {
    const res = await axios.get('https://hn.algolia.com/api/v1/search_by_date?tags=job&hitsPerPage=10', { timeout: 7000 });
    const hits = res.data?.hits || [];
    console.log('5. YC / HN count:', hits.length);
    if (hits.length > 0) {
      console.log('   Sample YC URL:', hits[0].url || `https://news.ycombinator.com/item?id=${hits[0].objectID}`);
      console.log('   Sample YC Title:', hits[0].title);
    }
  } catch (e) {
    console.log('5. YC / HN failed:', e.message);
  }

  // 6. Arbeitnow
  try {
    const res = await axios.get('https://www.arbeitnow.com/api/job-board-api', { timeout: 7000 });
    const jobs = res.data?.data || [];
    console.log('6. Arbeitnow count:', jobs.length);
    if (jobs.length > 0) {
      console.log('   Sample Arbeitnow URL:', jobs[0].url);
      console.log('   Sample Arbeitnow Title:', jobs[0].title, 'at', jobs[0].company_name);
    }
  } catch (e) {
    console.log('6. Arbeitnow failed:', e.message);
  }

  // 7. Foundit India search test
  try {
    const res = await axios.get('https://www.foundit.in/srp/results?query=sdet&locations=India', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 7000
    });
    console.log('7. Foundit status:', res.status, 'length:', res.data.length);
    const $ = cheerio.load(res.data);
    const cards = $('.srpResultCard, [data-job-id]');
    console.log('   Foundit cards detected:', cards.length);
  } catch (e) {
    console.log('7. Foundit failed:', e.message);
  }

  // 8. Shine India search test
  try {
    const res = await axios.get('https://www.shine.com/job-search/sdet-jobs', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 7000
    });
    console.log('8. Shine status:', res.status, 'length:', res.data.length);
    const $ = cheerio.load(res.data);
    const links = $('a[href*="/jobs/"]');
    console.log('   Shine job links detected:', links.length);
    if (links.length > 0) {
      console.log('   Sample Shine link:', $(links[0]).attr('href'));
    }
  } catch (e) {
    console.log('8. Shine failed:', e.message);
  }

  // 9. Cutshort search test
  try {
    const res = await axios.get('https://cutshort.io/jobs/sdet-jobs', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 7000
    });
    console.log('9. Cutshort status:', res.status, 'length:', res.data.length);
    const $ = cheerio.load(res.data);
    const links = $('a[href*="/job/"]');
    console.log('   Cutshort job links detected:', links.length);
    if (links.length > 0) {
      console.log('   Sample Cutshort link:', $(links[0]).attr('href'));
    }
  } catch (e) {
    console.log('9. Cutshort failed:', e.message);
  }

  // 10. Instahyre search test
  try {
    const res = await axios.get('https://www.instahyre.com/api/v1/job_search?designation=sdet', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 7000
    });
    console.log('10. Instahyre status:', res.status);
  } catch (e) {
    console.log('10. Instahyre failed:', e.message);
  }
}

testAll();
