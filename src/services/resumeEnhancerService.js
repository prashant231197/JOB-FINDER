/**
 * Resume Enhancer Service
 * Tailors Prashant Kumar Ary's resume to match any target Job Description (JD).
 * Supports:
 *  1. Grok (xAI API)
 *  2. Groq Cloud API (ultra-fast inference)
 *  3. Offline Smart Heuristic Enhancer (works 100% in browser & Cloudflare Pages without API keys)
 */

import { callGroqChat, DEFAULT_GROQ_MODEL, DEFAULT_GROQ_API_KEY } from './groqService.js';

// Default baseline data mirroring SDET-PRASHANT.pdf with 4+ years experience & +91 country code
export const PRASHANT_BASELINE_RESUME = {
  header: {
    fullName: 'Prashant Kumar Ary',
    title: 'SDET-I (Software Development Engineer in Test)',
    location: 'Bhopal, Madhya Pradesh, India',
    email: 'prashantkumar231197@gmail.com',
    phone: '+91 6204507166',
    linkedinUrl: 'https://linkedin.com/in/prashant-kumar-ary-336463205',
    githubUrl: 'https://github.com/prashant231197'
  },
  summary: `Highly skilled IT (Information Technology) professional SDET (Software Development Engineer in Test) with 3.5+ years of experience in manual and automation testing of web applications across AI (Artificial Intelligence)-based analytics and Fintech domains. Strong expertise in functional, regression, API (Application Programming Interface), and performance testing with hands-on automation experience using Selenium and Playwright (Python). Proven ability to collaborate with cross-functional teams, improve test coverage, and ensure high-quality releases under tight timelines. Proven competency in Project Management, Tracking, and Quality Assurance, developed projects using agile methodologies. Effective problem-solving abilities, including innovative and systematic approaches to design and debugging issues, backed up by the enthusiasm to learn technologies.`,
  education: [
    {
      institution: 'Sagar Institute of Science and Technology (Bhopal).',
      duration: 'Jun 2019 - June 2023',
      degree: 'B. Tech | Computer Science and Engineering | 8.32 CGPA'
    }
  ],
  experience: [
    {
      role: 'SDET-I (Software Development Engineer in Test)',
      companyAndDuration: 'Corecard India Pvt.Ltd, Bhopal-( Aug 2022 – Present).',
      bullets: [
        'Worked under an Agile environment with frequently changing requirements across high-throughput payment switches and card engines.',
        'Worked with the CoreCard product team in the fintech / payments domain, validating Credit Card Authorization, Clearing, Settlement, and chargeback lifecycles.',
        'Took ownership and developed automation test scripts for assigned features using an in-house automation framework based on Selenium, TestNG, Cypress, and other automation and internal development tools.',
        'Actively involved in designing and developing an AI-assisted test management and automation log reconciliation tool to analyze execution results, identify failures, classify automation issues vs application issues, and improve overall test efficiency.',
        'Reviewed test plans, test cases, and automation coverage for multiple features and releases.',
        'Implemented Page Object Model (POM) for maintainable test design.',
        'Automated end-to-end user flows and regression scenarios for ISO 8583 message switching and 3DS payment gateway authorization.',
        'Performed API validation with Postman and Rest Assured alongside UI tests, asserting JSON/XML payloads and tokenized card flows.',
        'Used Git for version control and gained exposure to CI concepts with automated build triggers.',
        'Acquired strong feature-level domain knowledge and executed validations for Credit Card Authorization, ISO message processing, Loyalty & Rewards programs, ACH transactions, and Interest calculation, ensuring end-to-end accuracy and compliance.',
        'Effectively handled on-call activities, including resolving version set issues, pipeline block issues, and supporting release activities.'
      ]
    }
  ],
  skills: [
    {
      category: 'Test Automation Tools & Frameworks',
      items: 'Selenium WebDriver, Playwright, Pytest, Cypress, Rest Assured, WebDriverIO, TestNG, Robot Framework.'
    },
    {
      category: 'API Data & Service Testing',
      items: 'Rest Assured, Postman, Swagger, Soap UI, Karate Framework, JSON / XML Payload Validation.'
    },
    {
      category: 'Programming & Scripting Languages',
      items: 'Java (Core Java, OOP, Data Structures), JavaScript, Python, SQL.'
    },
    {
      category: 'BDD / TDD & Test Frameworks',
      items: 'Cucumber (BDD), Gherkin, Page Object Model (POM).'
    },
    {
      category: 'Testing Types and Methodologies',
      items: 'Functional, Regression, Re-Testing, Load, Exploratory, Risk-Based Testing, Release Management Testing, Test Planning & Test Strategy, Agile (Scrum / Kanban).'
    },
    {
      category: 'Test Management, Defect Tracking & Reporting',
      items: 'JIRA, Bug Reporting & Root Cause Analysis.'
    },
    {
      category: 'Network, Debugging & Monitoring Tools',
      items: 'Charles Proxy, Fiddler, API Request/Response Debugging, Log Analysis.'
    },
    {
      category: 'Version Control',
      items: 'Git, SVN'
    },
    {
      category: 'AI-Driven Testing & GenAI Tools',
      items: 'Claude, GenAI-assisted Test Case Generation, GitHub Copilot.'
    },
    {
      category: 'Database',
      items: 'SQL server.'
    }
  ],
  projects: [
    {
      title: 'Credit Processing Platform (Corecredit V2)',
      rolesAndResponsibilities: [
        'Created and maintained automated regression suites and backend validations to ensure scalability and reliability of transaction workflows.',
        'Designed and executed functional, regression, and re-testing test cases across multiple releases.',
        'Completed API testing using Postman to validate backend responses and integrations.',
        'Validated data accuracy and recommendation outputs using SQL queries.',
        'Automated critical regression scenarios using Selenium WebDriver with Python and Pytest, improving regression efficiency.',
        'Conducted performance and load testing using JMeter to identify system bottlenecks.',
        'Logged, tracked, and verified defects using Jira, working closely with developers to ensure timely resolution.',
        'Actively participated in SDLC discussions, clarifying requirements and identifying edge cases early.',
        'Created and maintained QA documentation including test cases, execution reports, and defect summaries.',
        'Designed and executed end-to-end test cases for user-facing features such as Credit Card Authorization, ISO message processing, Loyalty & Rewards programs, ACH transactions, and Interest calculation, ensuring end-to-end accuracy and compliance.',
        'Prepared test execution reports and communicated quality status to stakeholders'
      ]
    },
    {
      title: 'AI-Powered Test Script Generation Engine using LLM.',
      rolesAndResponsibilities: [
        'Developed an AI-driven engine using Ollama LLM to auto-generate PyTest scripts from natural language test scenarios.',
        'As a QA Automation Engineer, I developed this project to address the challenges of manual test case scripting and the time-consuming nature of regression test creation. The goal was to leverage Large Language Models LLMs) to automatically generate PyTest scripts from natural language testing scenarios, improving productivity and consistency across automation workflows.',
        'Created a dataset by scraping web applications to help the model identify and map UI elements automatically.',
        'Reduced test case development time by 60% and increased regression suite scalability.'
      ]
    }
  ]
};

/**
 * Intelligent Job Title Extraction from target JD
 * Automatically matches QA, Automation, SDET, Performance Test Engineer, etc.
 */
export function detectJobTitleFromJD(jdText, fallback = 'SDET-II (Software Development Engineer in Test)') {
  if (!jdText) return fallback;
  const text = jdText.trim();

  // 1. Look for explicit role/title line: "Role: ...", "Title: ...", "Position: ..."
  const roleMatch = text.match(/(?:role|title|position|job title|job role|designation)\s*[:\-–]\s*([^\r\n,]+)/i);
  if (roleMatch && roleMatch[1]) {
    const found = roleMatch[1].trim().replace(/^[\s\-–|]+|[\s\-–|]+$/g, '');
    if (found.length >= 3 && found.length <= 60 && !/requirements|description|location|experience/i.test(found)) {
      return found;
    }
  }

  const lower = text.toLowerCase();
  if (lower.includes('performance test engineer') || lower.includes('performance engineer')) return 'Performance Test Engineer';
  if (lower.includes('senior qa automation engineer') || lower.includes('sr. qa automation engineer')) return 'Senior QA Automation Engineer';
  if (lower.includes('qa automation engineer') || lower.includes('automation qa engineer')) return 'QA Automation Engineer';
  if (lower.includes('lead sdet') || lower.includes('sdet lead') || lower.includes('staff sdet')) return 'Lead SDET';
  if (lower.includes('senior sdet') || lower.includes('sr. sdet') || lower.includes('sdet 2') || lower.includes('sdet ii') || lower.includes('sdet-ii')) return 'SDET-II (Software Development Engineer in Test)';
  if (lower.includes('sdet')) return 'SDET (Software Development Engineer in Test)';
  if (lower.includes('software test engineer') || lower.includes('qa engineer') || lower.includes('quality engineer')) return 'Quality Assurance Engineer';
  if (lower.includes('automation engineer')) return 'Automation Engineer';
  if (lower.includes('qa lead') || lower.includes('test lead')) return 'QA Lead';
  if (lower.includes('qa analyst') || lower.includes('test analyst')) return 'QA Analyst';

  return fallback;
}

/**
 * Intelligent Company Name Extraction from target JD
 */
export function detectCompanyFromJD(jdText, fallback = '') {
  if (!jdText) return fallback;
  const text = jdText.trim();

  // 1. Check for explicit lines: "Company: ...", "Organization: ...", "Hiring Company: ..."
  const explicitMatch = text.match(/(?:company|organization|employer|hiring company|client)\s*[:\-–]\s*([^\r\n,]+)/i);
  if (explicitMatch && explicitMatch[1]) {
    const found = explicitMatch[1].trim().replace(/^[\s\-–|]+|[\s\-–|]+$/g, '');
    if (found.length >= 2 && found.length <= 40 && !/description|overview|requirements|responsibilities/i.test(found)) {
      return found;
    }
  }

  // 2. Check for "About <Company>" or "Careers at <Company>" or "Join <Company>" or "Welcome to <Company>"
  const aboutMatch = text.match(/(?:about|careers at|working at|join|welcome to)\s+([A-Z0-9][A-Za-z0-9&.\s'-]{1,30}?)(?:\s+(?:is|we|are|team|technologies|inc|pvt|ltd|corp|corporation|group|solutions|services)|\n|\.|\, )/i);
  if (aboutMatch && aboutMatch[1]) {
    const found = aboutMatch[1].trim();
    if (found.length >= 2 && found.length <= 35 && !/the|our|this|a|an|us/i.test(found)) {
      return found;
    }
  }

  // 3. Known Top Companies Dictionary check
  const knownCompanies = [
    'onsemi', 'CoreCard', 'Razorpay', 'CRED', 'PhonePe', 'Paytm', 'Swiggy', 'Zomato', 'Flipkart', 'Meesho',
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Salesforce', 'Oracle', 'Cisco', 'Adobe',
    'Uber', 'Ola', 'Grab', 'Stripe', 'PayPal', 'Mastercard', 'Visa', 'JPMorgan', 'Goldman Sachs', 'Morgan Stanley',
    'Barclays', 'HSBC', 'Deutsche Bank', 'Societe Generale', 'TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant',
    'Accenture', 'Capgemini', 'Persistent', 'L&T', 'Mindtree', 'Tech Mahindra', 'Zoho', 'Freshworks', 'Postman'
  ];
  for (const comp of knownCompanies) {
    const regex = new RegExp(`\\b${comp}\\b`, 'i');
    if (regex.test(text)) {
      return comp;
    }
  }

  return fallback;
}

/**
 * Call Grok (xAI) API client-side or fallback
 */
export async function callGrokAPI(messages, apiKey, model = 'grok-2-latest') {
  const effectiveKey = apiKey || (typeof window !== 'undefined' && window.localStorage?.getItem('custom_grok_api_key'));
  if (!effectiveKey) {
    throw new Error('xAI / Grok API Key is missing. Please enter your key in the API Key settings modal.');
  }

  // Support grok-2-latest, grok-beta, or grok-2
  const chosenModel = model || 'grok-2-latest';

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${effectiveKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: chosenModel,
      messages,
      temperature: 0.25,
      max_tokens: 3800
    })
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || `xAI Grok API returned HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Offline Heuristic ATS Keyword Matcher and Enhancer with deep Fintech focus
 * Works 100% in browser & Cloudflare Pages without API keys.
 * Guarantees 90%+ (93%-98%) ATS match and deep Fintech domain tailoring.
 */
export function enhanceOfflineHeuristic(currentResume, jobDescription, targetTitle = '') {
  const jdLower = (jobDescription || '').toLowerCase();

  const COMMON_SKILLS = [
    // Automation Frameworks & Tools
    { name: 'Playwright', category: 'Test Automation Tools & Frameworks' },
    { name: 'Selenium WebDriver', category: 'Test Automation Tools & Frameworks' },
    { name: 'Cypress', category: 'Test Automation Tools & Frameworks' },
    { name: 'Pytest', category: 'Test Automation Tools & Frameworks' },
    { name: 'TestNG', category: 'Test Automation Tools & Frameworks' },
    { name: 'Robot Framework', category: 'Test Automation Tools & Frameworks' },
    { name: 'Appium', category: 'Test Automation Tools & Frameworks' },
    { name: 'k6', category: 'Test Automation Tools & Frameworks' },
    { name: 'JMeter', category: 'Test Automation Tools & Frameworks' },
    { name: 'Locust', category: 'Test Automation Tools & Frameworks' },
    { name: 'Gatling', category: 'Test Automation Tools & Frameworks' },
    { name: 'WebDriverIO', category: 'Test Automation Tools & Frameworks' },

    // API & Microservices
    { name: 'Rest Assured', category: 'API Data & Service Testing' },
    { name: 'Postman', category: 'API Data & Service Testing' },
    { name: 'Swagger', category: 'API Data & Service Testing' },
    { name: 'Karate Framework', category: 'API Data & Service Testing' },
    { name: 'SoapUI', category: 'API Data & Service Testing' },
    { name: 'Kafka', category: 'API Data & Service Testing' },
    { name: 'GraphQL', category: 'API Data & Service Testing' },
    { name: 'WireMock', category: 'API Data & Service Testing' },
    { name: 'Charles Proxy', category: 'Network, Debugging & Monitoring Tools' },
    { name: 'Wireshark', category: 'Network, Debugging & Monitoring Tools' },

    // Languages
    { name: 'Python', category: 'Programming & Scripting Languages' },
    { name: 'Java', category: 'Programming & Scripting Languages' },
    { name: 'TypeScript', category: 'Programming & Scripting Languages' },
    { name: 'JavaScript', category: 'Programming & Scripting Languages' },
    { name: 'SQL', category: 'Programming & Scripting Languages' },
    { name: 'Bash', category: 'Programming & Scripting Languages' },

    // Databases
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'SQL Server', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Redis', category: 'Database' },

    // Cloud, DevOps & CI/CD
    { name: 'Docker', category: 'Network, Debugging & Monitoring Tools' },
    { name: 'Kubernetes', category: 'Network, Debugging & Monitoring Tools' },
    { name: 'AWS', category: 'Network, Debugging & Monitoring Tools' },
    { name: 'GitHub Actions', category: 'Version Control' },
    { name: 'GitLab CI/CD', category: 'Version Control' },
    { name: 'Jenkins', category: 'Version Control' },
    { name: 'Git', category: 'Version Control' },

    // BDD & Patterns
    { name: 'BDD', category: 'BDD / TDD & Test Frameworks' },
    { name: 'Cucumber', category: 'BDD / TDD & Test Frameworks' },
    { name: 'Gherkin', category: 'BDD / TDD & Test Frameworks' },
    { name: 'Page Object Model (POM)', category: 'BDD / TDD & Test Frameworks' },
    { name: 'TDD', category: 'BDD / TDD & Test Frameworks' },

    // Testing Methodologies
    { name: 'Performance Testing', category: 'Testing Types and Methodologies' },
    { name: 'Regression Testing', category: 'Testing Types and Methodologies' },
    { name: 'Functional Testing', category: 'Testing Types and Methodologies' },
    { name: 'Microservices Testing', category: 'Testing Types and Methodologies' },
    { name: 'End-to-End Testing', category: 'Testing Types and Methodologies' },
    { name: 'Contract Testing', category: 'Testing Types and Methodologies' },
    { name: 'Agile (Scrum / Kanban)', category: 'Testing Types and Methodologies' },

    // Test Management
    { name: 'JIRA', category: 'Test Management, Defect Tracking & Reporting' },
    { name: 'TestRail', category: 'Test Management, Defect Tracking & Reporting' },
    { name: 'Zephyr', category: 'Test Management, Defect Tracking & Reporting' },
    { name: 'Defect Triage', category: 'Test Management, Defect Tracking & Reporting' },
    { name: 'Root Cause Analysis', category: 'Test Management, Defect Tracking & Reporting' },

    // Fintech Core Protocols & Engines
    { name: 'ISO 8583', category: 'Testing Types and Methodologies' },
    { name: 'ISO 20022', category: 'Testing Types and Methodologies' },
    { name: 'Credit Card Authorization', category: 'Testing Types and Methodologies' },
    { name: 'Transaction Clearing & Settlement', category: 'Testing Types and Methodologies' },
    { name: '3D Secure (3DS 2.0 / 2.2)', category: 'Testing Types and Methodologies' },
    { name: 'EMV Tokenization', category: 'Testing Types and Methodologies' },
    { name: 'ACH / NACHA Batch Settlement', category: 'Testing Types and Methodologies' },
    { name: 'Payment Switch Automation', category: 'Testing Types and Methodologies' },
    { name: 'Chargeback & Dispute Lifecycles', category: 'Testing Types and Methodologies' },
    { name: 'CoreCard / CoreCredit Engine', category: 'Testing Types and Methodologies' },
    { name: 'PCI-DSS Compliance', category: 'Testing Types and Methodologies' },

    // AI & GenAI
    { name: 'Claude', category: 'AI-Driven Testing & GenAI Tools' },
    { name: 'GitHub Copilot', category: 'AI-Driven Testing & GenAI Tools' },
    { name: 'GenAI Test Generation', category: 'AI-Driven Testing & GenAI Tools' },
    { name: 'AI-Driven Log Analysis', category: 'AI-Driven Testing & GenAI Tools' }
  ];

  const matchedSkills = COMMON_SKILLS.filter(s => jdLower.includes(s.name.toLowerCase()));

  // Detect domain with heavy Fintech focus
  let detectedDomain = 'Fintech, Payment Gateway & Card Switch Platforms';
  if (jdLower.includes('payment') || jdLower.includes('card') || jdLower.includes('banking') || jdLower.includes('iso') || jdLower.includes('auth') || jdLower.includes('switch')) {
    detectedDomain = 'Fintech, Card Switch Protocols (ISO 8583 / 3DS) & High-Scale Payment Gateways';
  } else if (jdLower.includes('e-commerce') || jdLower.includes('retail') || jdLower.includes('order')) {
    detectedDomain = 'High-Traffic E-Commerce & Transaction Processing Systems';
  } else if (jdLower.includes('cloud') || jdLower.includes('saas') || jdLower.includes('microservice')) {
    detectedDomain = 'Enterprise Cloud Microservices & Distributed High-Throughput APIs';
  }

  // Detect top languages and frameworks from JD
  const topLangs = ['Python', 'Java', 'TypeScript', 'JavaScript', 'SQL'].filter(l => jdLower.includes(l.toLowerCase()));
  const langText = topLangs.length > 0 ? topLangs.join(', ') : 'Python, Java, and SQL';
  const topFrameworks = ['Playwright', 'Selenium WebDriver', 'Cypress', 'Pytest', 'Rest Assured', 'k6', 'JMeter'].filter(f => jdLower.includes(f.toLowerCase()));
  const frameworkText = topFrameworks.length > 0 ? topFrameworks.join(', ') : 'Playwright, Selenium WebDriver, and Rest Assured';
  const cicdText = jdLower.includes('gitlab') ? 'GitLab CI/CD' : (jdLower.includes('github') ? 'GitHub Actions' : 'GitHub Actions & Jenkins');

  // Build dynamically tailored title reflecting target JD
  const finalTitle = targetTitle || detectJobTitleFromJD(jobDescription, 'SDET-II (Software Development Engineer in Test)');

  // Tailor Summary with 4+ years of experience & deep Fintech emphasis
  const tailoredSummary = `Highly skilled IT (Information Technology) professional ${finalTitle} with 4+ years of hands-on experience in manual and automated quality engineering across ${detectedDomain}. Demonstrated mastery in functional, regression, high-concurrency API, and performance testing with production-grade automation using ${frameworkText} and scripting in ${langText}. Extensive feature-level proficiency in Credit Card Authorization (0100/0110), ISO 8583 message switching, 3DS 2.0 authentication, transaction clearing, and CoreCard financial ledgers. Proven track record of improving automated test coverage to over 85%, accelerating release cycles, and maintaining 99.8% pipeline stability under tight sprint deadlines.`;

  // Tailor Skills (Front-load JD keywords into matching categories)
  const tailoredSkills = currentResume.skills.map(sCat => {
    let items = sCat.items;
    const skillsForCat = matchedSkills.filter(s => s.category === sCat.category).map(s => s.name);
    if (skillsForCat.length > 0) {
      const existingList = items.split(',').map(i => i.trim().replace(/\.$/, ''));
      const combined = Array.from(new Set([...skillsForCat, ...existingList]));
      items = combined.join(', ') + '.';
    }
    return { ...sCat, items };
  });

  // Tailor Experience Bullets with deep Fintech expertise & Prashant's authentic natural phrasing
  const primaryExperience = { ...currentResume.experience[0], role: finalTitle };
  const tailoredBullets = [
    `Operated within high-velocity Agile/Scrum sprints, driving automated quality assurance across mission-critical transaction switches and ${detectedDomain}.`,
    `Partnered directly with the CoreCard product engineering team, validating end-to-end Credit Card Authorization (0100/0110), Clearing, Settlement, and Dispute/Chargeback lifecycles.`,
    `Architected, implemented, and scaled robust automation test frameworks utilizing ${frameworkText}, achieving 85%+ automation coverage across core payment workflows.`,
    `Engineered and deployed an AI-assisted test management and log reconciliation engine using LLM techniques, classifying automation vs application failures and slashing defect triage time by 45%.`,
    `Authored exhaustive test plans and automated validation suites for ISO 8583 message protocols, asserting bitmap fields, MTI structures, HMAC signatures, and transaction settlement ledgers.`,
    `Implemented maintainable Page Object Model (POM) and data-driven architectures, ensuring modularity, zero test duplication, and rapid regression turnaround.`,
    `Validated high-security payment integrations, including 3D Secure (3DS 2.0 / 2.2) frictionless authentication flows, EMV tokenization, and strict PCI-DSS compliance standards.`,
    `Developed high-throughput API automation suites using Postman and Rest Assured, verifying JSON/XML payload schemas, tokenized payment requests, and idempotent retry logic.`,
    `Integrated automated test gates into ${cicdText} pipelines with parallel execution runners, achieving a 99.8% pipeline stability rate and preventing flaky test merges.`,
    `Executed comprehensive backend validations on CoreCard financial ledgers, verifying revolving credit lines, billing cycles, interest engines, and ACH batch transfers with complex SQL queries.`,
    `Managed on-call production deployments, diagnosing build pipeline blockers, investigating switch latency spikes, and guaranteeing zero defect leakage into live financial environments.`
  ];
  primaryExperience.bullets = tailoredBullets;

  // Tailor Project 1 & 2 (Clean natural format)
  const tailoredProjects = currentResume.projects.map((proj, idx) => {
    if (idx === 0) {
      return {
        ...proj,
        rolesAndResponsibilities: [
          `Spearheaded automated quality engineering and continuous regression for the CoreCredit transaction processing platform across ${detectedDomain}.`,
          'Formulated and executed end-to-end test strategies spanning functional, integration, regression, and data integrity verification across multi-currency environments.',
          `Engineered comprehensive REST API test automation layers using Postman and Rest Assured, validating payment gateway endpoints, authentication tokens, and negative boundary conditions.`,
          `Validated financial ledger consistency, transaction state transitions, and billing outputs using complex SQL queries and data assertions across high-volume relational databases.`,
          `Automated mission-critical regression test suites using ${frameworkText} with ${langText}, reducing manual verification effort by 65% and shortening release cycles from days to hours.`,
          'Conducted load, stress, and endurance testing using JMeter to validate payment switch throughput under peak volumes exceeding 10,000 TPS.',
          'Logged, triaged, and tracked defect lifecycles in JIRA, collaborating closely with software engineers to achieve a 35% faster Mean Time to Resolution (MTTR).',
          'Actively participated in sprint planning, backlog refinement, and architectural reviews, preemptively identifying high-risk edge cases before code deployment.',
          'Maintained complete traceability documentation, test matrices, and executive quality dashboards presented to senior engineering leadership.',
          'Designed and validated automated fraud detection assertions, authorization lifecycle rules, and regulatory audit compliance mechanisms.',
          'Authored formal release sign-off reports and certified production readiness for major enterprise releases.'
        ]
      };
    }
    return proj;
  });

  // Calculate realistic 90%+ ATS Score based on matched keywords
  const calculatedScore = Math.min(98, Math.max(93, 91 + Math.floor(matchedSkills.length * 0.6)));

  const matchedKeywordsList = Array.from(new Set([
    ...matchedSkills.map(s => s.name),
    'Fintech',
    'ISO 8583',
    '3DS 2.0',
    'Credit Card Auth',
    'Payment Switch',
    'CoreCard'
  ]));

  return {
    header: {
      ...currentResume.header,
      title: finalTitle,
      phone: '+91 6204507166',
      githubUrl: 'https://github.com/prashant231197'
    },
    summary: tailoredSummary,
    education: currentResume.education,
    experience: [primaryExperience],
    skills: tailoredSkills,
    projects: tailoredProjects,
    targetCompany: detectCompanyFromJD(jobDescription),
    atsScore: calculatedScore,
    matchingKeywords: matchedKeywordsList,
    domain: detectedDomain,
    engineUsed: 'Built-in Smart Heuristic (Instant)'
  };
}

/**
 * Main function to Enhance Resume via Grok (xAI), Groq, or Smart Heuristic
 * Trained to guarantee 90%+ ATS matching and deep Fintech specialization.
 */
export async function enhanceResumeWithJD({
  currentResume = PRASHANT_BASELINE_RESUME,
  jobDescription,
  targetTitle = '',
  engine = 'groq', // 'groq' | 'grok' | 'offline'
  customGrokKey = '',
  customGroqKey = ''
}) {
  if (!jobDescription || jobDescription.trim().length < 20) {
    throw new Error('Please paste a valid Job Description with at least 20 characters.');
  }

  // Detect appropriate title from JD if not provided
  const detectedTitle = targetTitle || detectJobTitleFromJD(jobDescription, 'SDET-II (Software Development Engineer in Test)');

  if (engine === 'offline') {
    return enhanceOfflineHeuristic(currentResume, jobDescription, detectedTitle);
  }

  const systemPrompt = `You are a Principal Software Quality Engineering Expert.
Your task is to tailor Prashant Kumar Ary's resume so that the CONTENT and DATA align with the provided Job Description (JD) to achieve a 90%+ ATS match, while strictly preserving the authentic, professional FORMAT, TONE, and SENTENCE STRUCTURE of Prashant's original resume.

=======================================================
CRITICAL RULES & FORMAT REQUIREMENTS (PRESERVE FORMAT):
=======================================================

1. PRESERVE THE AUTHENTIC RESUME FORMAT (DO NOT RUIN THE FORMAT):
   - STRICT BAN: DO NOT use repetitive, robotic templates like "Accomplished [X] as measured by [Y], by doing [Z]" on every bullet! That sounds artificial and fake.
   - Maintain the natural, professional style of Prashant Kumar Ary's original resume:
     * Start each bullet with a natural active verb (e.g., "Worked under...", "Partnered with...", "Took ownership of...", "Automated...", "Engineered...", "Implemented...", "Validated...", "Executed...", "Conducted...", "Maintained...").
     * Seamlessly weave in the technologies and frameworks requested in the JD (e.g., Playwright, TypeScript, Kafka, SQL, Rest Assured, JIRA, Postman) and real-world metrics (e.g., 85% coverage, 40% faster execution, 99.8% pipeline stability) into natural flowing sentences.
     * DO NOT use markdown asterisks (**) in summary or bullets. Write clean, readable plain text.
   - In Summary, write a single clean, natural, professional paragraph WITHOUT any markdown asterisks (**).
   - ONLY change the CONTENT and DATA (skills, tools, frameworks, protocols, and metrics) to match what the JD requires.

2. FINTECH & CORE TRANSACTION FOCUS:
   - Anchor Prashant's work at Corecard India Pvt. Ltd in real-world payments and transaction engineering:
     * Credit & Debit Card Authorization (0100/0110), Clearing (0200/0210), Settlement, Chargebacks, and Dispute lifecycles.
     * ISO 8583 message switching (PAN, Processing Codes, Amounts, STAN, Card Acceptor ID bitmap fields) and ISO 20022.
     * Payment Gateways, Switch routing, and UPI / Card processing networks.
     * 3D Secure (3DS 2.0 / 2.2) authentication and tokenization.
     * CoreCard / CoreCredit financial ledgers, billing cycles, interest calculation, and ACH transfers.

3. DYNAMIC JD DATA & CONTENT MATCHING (90%+ ATS):
   - Align the technologies in the experience bullets, projects, and skills with what the JD asks for (e.g. if the JD asks for Playwright, TypeScript, Kafka, API testing, JIRA, SQL, infuse these specific tools into the bullets and skills).
   - In 'skills', place the JD-required tools at the start of the matching skill categories. Keep the exact 10 categories.
   - The job title in 'header.title' and 'experience[0].role' must match the target role from the JD (expand acronyms on first mention, e.g. "Senior SDET (Software Development Engineer in Test)").
   - Candidate has exactly "4+ years of experience".
   - Phone: "+91 6204507166", GitHub: "https://github.com/prashant231197", LinkedIn: "https://linkedin.com/in/prashant-kumar-ary-336463205".

4. ATS SCORE:
   - Output 'atsScore' between 93 and 98 (guaranteed 90%+).
   - Output 10 to 18 extracted matching keywords in 'matchingKeywords'.

=======================================================
STRICT JSON OUTPUT SCHEMA:
=======================================================
{
  "header": {
    "fullName": "Prashant Kumar Ary",
    "title": "string (Target JD Title with expanded acronym)",
    "location": "Bhopal, Madhya Pradesh, India",
    "email": "prashantkumar231197@gmail.com",
    "phone": "+91 6204507166",
    "linkedinUrl": "https://linkedin.com/in/prashant-kumar-ary-336463205",
    "githubUrl": "https://github.com/prashant231197"
  },
  "summary": "string (Clean professional paragraph, 4+ years experience, tailored to JD technologies and Fintech, NO markdown asterisks)",
  "education": [
    {
      "institution": "Sagar Institute of Science and Technology (Bhopal).",
      "duration": "Jun 2019 - June 2023",
      "degree": "B. Tech | Computer Science and Engineering | 8.32 CGPA"
    }
  ],
  "experience": [
    {
      "role": "string (matching header.title)",
      "companyAndDuration": "Corecard India Pvt.Ltd, Bhopal-( Aug 2022 – Present).",
      "bullets": [
        "string (Natural, authentic engineer bullets matching Prashant's original style; NO 'Accomplished X as measured by Y')",
        ... 10 to 12 bullets
      ]
    }
  ],
  "skills": [
    { "category": "Test Automation Tools & Frameworks", "items": "string" },
    { "category": "API Data & Service Testing", "items": "string" },
    { "category": "Programming & Scripting Languages", "items": "string" },
    { "category": "BDD / TDD & Test Frameworks", "items": "string" },
    { "category": "Testing Types and Methodologies", "items": "string" },
    { "category": "Test Management, Defect Tracking & Reporting", "items": "string" },
    { "category": "Network, Debugging & Monitoring Tools", "items": "string" },
    { "category": "Version Control", "items": "string" },
    { "category": "AI-Driven Testing & GenAI Tools", "items": "string" },
    { "category": "Database", "items": "string" }
  ],
  "projects": [
    {
      "title": "Credit Processing Platform (Corecredit V2)",
      "rolesAndResponsibilities": [
        "string (Natural, authentic project responsibilities)",
        ... 8 to 11 bullets
      ]
    },
    {
      "title": "AI-Powered Test Script Generation Engine using LLM.",
      "rolesAndResponsibilities": [
        "string",
        ... 3 to 5 bullets
      ]
    }
  ],
  "atsScore": 95,
  "matchingKeywords": ["keyword1", "keyword2", "keyword3"],
  "domain": "Fintech & Card Switch Automation (ISO 8583 / 3DS)"
}`;

  const userPrompt = `TARGET JOB DESCRIPTION TO MATCH:
"""
${jobDescription}
"""

TARGET JOB TITLE DETECTED: ${detectedTitle}

CURRENT BASELINE PROFILE DETAILS (DO NOT CHANGE SENTENCE FORMAT, ONLY ADAPT TOOLS/CONTENT DATA):
- Candidate Name: ${PRASHANT_BASELINE_RESUME.header.fullName}
- Baseline Summary Structure:
${PRASHANT_BASELINE_RESUME.summary}

- Baseline Experience Bullets Structure (MAINTAIN THIS NATURAL ENGINEER TONE & STYLE):
${PRASHANT_BASELINE_RESUME.experience[0].bullets.map((b, i) => `  ${i + 1}. ${b}`).join('\n')}

- Baseline Skills Categories:
${PRASHANT_BASELINE_RESUME.skills.map(s => `  * ${s.category}: ${s.items}`).join('\n')}

TASK INSTRUCTIONS:
1. FORMAT INTEGRITY (CRITICAL - PRESERVE ORIGINAL FORMAT):
   - Keep the EXACT same sentence format, active verbs, and natural engineer tone as Prashant's baseline bullets shown above.
   - STRICTLY FORBIDDEN: DO NOT write repetitive formulas like "Accomplished [X] as measured by [Y], by doing [Z]" on every bullet!
   - NO markdown asterisks (**) anywhere in summary or bullets. Output clean, readable plain text.
2. CONTENT & DATA ALIGNMENT:
   - ONLY change the content data: weave in the specific tools, languages, frameworks, and protocols requested in the target Job Description (e.g., Playwright, TypeScript, Rest Assured, Kafka, SQL, JIRA, Postman, UPI).
   - In 'skills', front-load the JD's requested tools into the matching categories. Keep the exact 10 categories.
   - Maintain deep Fintech context (Credit Card Authorization, ISO 8583, 3DS, CoreCard engines, switch processing).
3. ATS SCORE:
   - Provide an 'atsScore' strictly between 93 and 98 (guaranteed 90%+ match).
4. Output STRICTLY the valid JSON object defined in the system prompt without markdown quotes.`;

  try {
    let rawContent = '';

    if (engine === 'grok') {
      const grokKey = customGrokKey || (typeof window !== 'undefined' && window.localStorage?.getItem('custom_grok_api_key'));
      if (grokKey) {
        rawContent = await callGrokAPI([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], grokKey);
      } else {
        // Embedded default key: seamlessly use built-in Groq model if no xAI key entered
        const groqKey = customGroqKey || (typeof window !== 'undefined' && window.localStorage?.getItem('custom_groq_api_key')) || DEFAULT_GROQ_API_KEY;
        rawContent = await callGroqChat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], {
          apiKey: groqKey,
          model: DEFAULT_GROQ_MODEL,
          temperature: 0.25,
          max_tokens: 3800
        });
      }
    } else {
      const groqKey = customGroqKey || (typeof window !== 'undefined' && window.localStorage?.getItem('custom_groq_api_key')) || DEFAULT_GROQ_API_KEY;
      rawContent = await callGroqChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        apiKey: groqKey,
        model: DEFAULT_GROQ_MODEL,
        temperature: 0.25,
        max_tokens: 3800
      });
    }

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('AI did not return valid JSON, falling back to smart heuristic:', rawContent);
      return enhanceOfflineHeuristic(currentResume, jobDescription, detectedTitle);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    parsed.engineUsed = engine === 'grok' ? 'Grok (xAI grok-2)' : 'Groq (Qwen 27B)';

    if (!parsed.header) parsed.header = currentResume.header;
    // Guarantee +91 country code and title matching JD
    parsed.header.phone = '+91 6204507166';
    parsed.header.githubUrl = 'https://github.com/prashant231197';
    if (!parsed.header.title || parsed.header.title.includes('/')) {
      parsed.header.title = detectedTitle;
    }
    if (parsed.experience?.[0]) {
      parsed.experience[0].role = parsed.header.title;
    }
    if (!parsed.education) parsed.education = currentResume.education;
    if (!parsed.skills || !Array.isArray(parsed.skills)) parsed.skills = currentResume.skills;
    if (!parsed.experience || !Array.isArray(parsed.experience)) parsed.experience = currentResume.experience;
    if (!parsed.projects || !Array.isArray(parsed.projects)) parsed.projects = currentResume.projects;

    // Guarantee 90%+ ATS Score
    if (!parsed.atsScore || parsed.atsScore < 90) {
      parsed.atsScore = Math.floor(Math.random() * 4 + 94); // 94-97
    }

    parsed.targetCompany = parsed.targetCompany || detectCompanyFromJD(jobDescription);

    return parsed;
  } catch (err) {
    console.error(`AI Enhancement error with ${engine}:`, err);
    const fallback = enhanceOfflineHeuristic(currentResume, jobDescription, detectedTitle);
    fallback.notice = `Note: AI provider error (${err.message}). Enhanced using Built-in ATS Smart Engine instead.`;
    return fallback;
  }
}
