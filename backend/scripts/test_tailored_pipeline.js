const path = require('path');
const fs = require('fs');
const resumePdfGeneratorService = require('../services/resumePdfGeneratorService');
const profileService = require('../services/profileService');

async function runTest() {
  console.log('=== Testing Automated JD-Tailored Resume Generation Pipeline ===\n');

  const profile = profileService.getProfile();
  if (!profile) {
    console.error('FAILED: Profile not found');
    process.exit(1);
  }
  console.log('1. Loaded Candidate Profile:', profile.fullName, `(${profile.email})`);

  // Target Job: onsemi SDET
  const testJob = {
    id: 'test-onsemi-sdet',
    title: 'Software Development Engineer in Test (SDET)',
    company: 'onsemi',
    sector: 'Semiconductor / AI Native SaaS',
    location: 'Bengaluru / Remote',
    requiredSkills: [
      'Playwright', 'TypeScript', 'Python', 'Next.js', 'Django',
      'PostgreSQL', 'Redis', 'GraphQL', 'AI-agents', 'Docker', 'Kubernetes'
    ],
    description: `We are looking for a hands-on Software Development Engineer in Test (SDET) to join our AI-native product development team at onsemi and own end-to-end quality and release certification for a full-stack platform built on Next.js, React, TypeScript, Django, PostgreSQL, Redis, GraphQL, Airflow, MCP-based AI agents, Kubernetes, Helm, and Docker. This is a full-stack testing role covering UI, API, data, async job, and AI-agent layers.`
  };

  console.log('2. Target Job:', testJob.title, 'at', testJob.company);
  console.log('3. Generating tailored ATS resume PDF...');

  const startTime = Date.now();
  const result = await resumePdfGeneratorService.generateTailoredResumePdf(profile, testJob);
  const elapsed = Date.now() - startTime;

  console.log('\n--- Results ---');
  console.log('Success:', result.success);
  console.log('Time Taken:', `${elapsed}ms`);
  console.log('File Name:', result.fileName);
  console.log('File Path:', result.filePath);
  console.log('File Exists:', fs.existsSync(result.filePath));
  if (fs.existsSync(result.filePath)) {
    const stats = fs.statSync(result.filePath);
    console.log('File Size:', `${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  console.log('\n--- Tailored Content Preview ---');
  console.log('Target Title:', result.tailoredData?.tailoredJobTitle);
  console.log('Tailored Summary:', result.tailoredData?.tailoredSummary);
  console.log('Top Prioritized Skills:', result.tailoredData?.topSkills?.slice(0, 8).join(', '));
  console.log('Tailored Experience Bullets:');
  (result.tailoredData?.tailoredBullets || []).forEach((b, idx) => {
    console.log(`  [${idx + 1}] ${b}`);
  });

  if (result.success && fs.existsSync(result.filePath) && fs.statSync(result.filePath).size > 20000) {
    console.log('\n[PASS] Automated JD-Tailored Resume Pipeline is 100% OPERATIONAL!');
  } else {
    console.error('\n[FAIL] Pipeline test did not produce expected PDF.');
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
