const fs = require('fs');
const path = require('path');

const jobsFile = path.join(__dirname, '..', 'backend', 'data', 'jobs.json');
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));

console.log('Total jobs in Radar (jobs.json):', jobs.length);

const problematic = [];
jobs.forEach((j, i) => {
  const url = (j.applicationUrl || j.url || '').toLowerCase();
  const rawUrl = j.applicationUrl || j.url || '';
  const isGeneric = !url.startsWith('http') ||
    url.includes('?q=') ||
    url.includes('?k=') ||
    url.includes('?query=') ||
    url.includes('?search=') ||
    url.includes('/search') ||
    url.includes('/sdet-jobs') ||
    url.includes('/jobs/sdet') ||
    url.endsWith('.com/') ||
    url.endsWith('.in/') ||
    url.endsWith('.org/') ||
    url.includes('role=') ||
    url.includes('849201') ||
    !rawUrl.match(/\/[a-zA-Z0-9_\-\.]{5,}/);

  if (isGeneric) {
    problematic.push({ index: i, company: j.company, title: j.title, url: rawUrl });
  }
});

console.log('Problematic or generic URLs count in Radar:', problematic.length);
problematic.forEach(p => console.log(`[${p.index}] ${p.company} - ${p.title} -> ${p.url}`));
