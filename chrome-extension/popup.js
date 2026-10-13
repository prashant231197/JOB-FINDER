/**
 * QA Job Hunter - Chrome Extension Popup Logic
 * Universal AI Form Filler Bot
 */

document.addEventListener('DOMContentLoaded', () => {
  let profile = window.DEFAULT_USER_PROFILE || {};

  // DOM Elements
  const notifyEl = document.getElementById('popup-notify');
  const btnAutofill = document.getElementById('btn-autofill-active');
  const btnSync = document.getElementById('btn-sync-local');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Fields mapping
  const profileFields = [
    'firstName', 'lastName', 'email', 'phone', 'currentLocation',
    'postalCode', 'currentSalary', 'expectedSalary', 'noticePeriodDays',
    'noticePeriod', 'linkedIn', 'github'
  ];

  const experienceFields = [
    'currentCompany', 'currentRole', 'yearsOfExperience', 'employmentType'
  ];

  // Settings Elements
  const inputGroqKey = document.getElementById('set-groq-key');
  const selectGroqModel = document.getElementById('set-groq-model');
  const checkAiCustom = document.getElementById('set-ai-custom-q');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnSaveProfile = document.getElementById('btn-save-profile');
  const btnSaveExperience = document.getElementById('btn-save-experience');

  // AI Assistant Elements
  const aiQuestionInput = document.getElementById('ai-question-input');
  const btnGenerateAi = document.getElementById('btn-generate-ai-answer');
  const aiOutputContainer = document.getElementById('ai-output-container');
  const aiOutputText = document.getElementById('ai-output-text');
  const aiCopyBtn = document.getElementById('ai-copy-btn');

  function showNotify(msg, type = 'success') {
    notifyEl.textContent = msg;
    notifyEl.className = `notification ${type}`;
    notifyEl.style.display = 'block';
    setTimeout(() => {
      notifyEl.style.display = 'none';
    }, 3500);
  }

  // 1. Tab Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // 2. Load stored profile & settings
  function loadStoredData() {
    chrome.storage.local.get(['qa_user_profile', 'groq_api_key', 'groq_model', 'ai_custom_q'], (res) => {
      if (res.qa_user_profile) {
        profile = { ...window.DEFAULT_USER_PROFILE, ...res.qa_user_profile };
      } else {
        profile = window.DEFAULT_USER_PROFILE || {};
      }

      // Populate Profile Tab Fields
      profileFields.forEach(f => {
        const el = document.getElementById(`prof-${f}`);
        if (el) el.value = profile[f] || '';
      });

      // Populate Experience Fields
      experienceFields.forEach(f => {
        const el = document.getElementById(`prof-${f}`);
        if (el) el.value = profile[f] || '';
      });

      // Populate Education Fields
      const eduSchoolEl = document.getElementById('prof-educationSchool');
      const eduDegreeEl = document.getElementById('prof-educationDegree');
      const eduGradEl = document.getElementById('prof-educationGradYear');

      if (eduSchoolEl) {
        eduSchoolEl.value = profile.education?.school || profile.education?.university || profile.educationSchool || '';
      }
      if (eduDegreeEl) {
        eduDegreeEl.value = profile.education?.degree || profile.education?.degreeFull || profile.educationDegree || '';
      }
      if (eduGradEl) {
        eduGradEl.value = profile.education?.graduationYear || profile.education?.endYear || profile.educationGradYear || '';
      }

      // Populate Skills
      const skillsEl = document.getElementById('prof-skills');
      if (skillsEl) {
        if (Array.isArray(profile.skills)) {
          skillsEl.value = profile.skills.join(', ');
        } else if (typeof profile.skills === 'string') {
          skillsEl.value = profile.skills;
        }
      }

      // Populate Settings
      if (inputGroqKey) inputGroqKey.value = res.groq_api_key || profile.groqApiKey || '';
      if (selectGroqModel) selectGroqModel.value = res.groq_model || profile.groqModel || 'qwen/qwen3.8-27b';
      if (checkAiCustom) checkAiCustom.checked = res.ai_custom_q !== false;
    });
  }
  loadStoredData();

  // 3. 1-Click Autofill Active Tab
  btnAutofill.addEventListener('click', async () => {
    btnAutofill.textContent = '⚡ Running AI Bot AutoFill...';
    btnAutofill.style.opacity = '0.7';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]?.id) {
        showNotify('No active tab detected', 'info');
        resetAutofillBtn();
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { action: 'AUTOFILL_PAGE' }, (response) => {
        if (chrome.runtime.lastError) {
          // If content script was not injected on tab, inject it dynamically
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['defaultProfile.js', 'content.js']
          }, () => {
            chrome.scripting.insertCSS({
              target: { tabId: tabs[0].id },
              files: ['content.css']
            }, () => {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'AUTOFILL_PAGE' }, () => {
                showNotify('✓ Bot started filling fields!');
                resetAutofillBtn();
              });
            });
          });
        } else {
          showNotify('✓ Bot started filling fields!');
          resetAutofillBtn();
        }
      });
    });
  });

  function resetAutofillBtn() {
    btnAutofill.textContent = '⚡ 1-Click AutoFill Current Tab';
    btnAutofill.style.opacity = '1';
  }

  // 4. Sync with Local App (http://localhost:5000/api/profile)
  btnSync.addEventListener('click', async () => {
    btnSync.textContent = '🔄 Syncing from localhost:5000...';
    try {
      const res = await fetch('http://localhost:5000/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          // Merge smoothly
          profile = { ...profile, ...p };
          if (Array.isArray(p.education) && p.education[0]) {
            profile.education = {
              ...profile.education,
              school: p.education[0].university || profile.education?.school,
              university: p.education[0].university || profile.education?.university,
              degree: p.education[0].degree || profile.education?.degree,
              graduationYear: p.education[0].graduationYear || profile.education?.graduationYear
            };
          }

          chrome.storage.local.set({ qa_user_profile: profile }, () => {
            loadStoredData();
            showNotify('✓ Profile synced from local app!');
          });
          btnSync.textContent = '🔄 Sync Latest Profile (localhost:5000)';
          return;
        }
      }
      showNotify('Server responded, but profile was empty.', 'info');
    } catch (e) {
      showNotify('Local server not reachable. Using saved profile.', 'info');
    }
    btnSync.textContent = '🔄 Sync Latest Profile (localhost:5000)';
  });

  // 5. Save Profile Changes
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', () => {
      profileFields.forEach(f => {
        const el = document.getElementById(`prof-${f}`);
        if (el) profile[f] = el.value.trim();
      });
      profile.fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

      chrome.storage.local.set({ qa_user_profile: profile }, () => {
        showNotify('✓ Profile changes saved!');
        broadcastProfileUpdate(profile);
      });
    });
  }

  // 6. Save Work & Education Changes
  if (btnSaveExperience) {
    btnSaveExperience.addEventListener('click', () => {
      experienceFields.forEach(f => {
        const el = document.getElementById(`prof-${f}`);
        if (el) profile[f] = el.value.trim();
      });

      const eduSchoolEl = document.getElementById('prof-educationSchool');
      const eduDegreeEl = document.getElementById('prof-educationDegree');
      const eduGradEl = document.getElementById('prof-educationGradYear');
      const skillsEl = document.getElementById('prof-skills');

      profile.education = profile.education || {};
      if (eduSchoolEl) {
        profile.education.school = eduSchoolEl.value.trim();
        profile.education.university = eduSchoolEl.value.trim();
      }
      if (eduDegreeEl) {
        profile.education.degree = eduDegreeEl.value.trim();
        profile.education.degreeFull = eduDegreeEl.value.trim();
      }
      if (eduGradEl) {
        profile.education.graduationYear = eduGradEl.value.trim();
        profile.education.endYear = eduGradEl.value.trim();
      }

      if (skillsEl) {
        profile.skills = skillsEl.value.split(',').map(s => s.trim()).filter(Boolean);
      }

      chrome.storage.local.set({ qa_user_profile: profile }, () => {
        showNotify('✓ Work & Education saved!');
        broadcastProfileUpdate(profile);
      });
    });
  }

  function broadcastProfileUpdate(updatedProf) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'UPDATE_PROFILE', profile: updatedProf });
      }
    });
  }

  // 7. Save Settings
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const groqKey = inputGroqKey.value.trim();
      const groqModel = selectGroqModel.value;
      const aiCustom = checkAiCustom.checked;

      chrome.storage.local.set({
        groq_api_key: groqKey,
        groq_model: groqModel,
        ai_custom_q: aiCustom
      }, () => {
        showNotify('✓ Settings saved!');
      });
    });
  }

  // 8. Groq AI Question Solver
  btnGenerateAi.addEventListener('click', async () => {
    const q = aiQuestionInput.value.trim();
    if (!q) {
      showNotify('Please enter a question first', 'info');
      return;
    }

    btnGenerateAi.textContent = '🤖 Thinking with Groq AI...';
    btnGenerateAi.style.opacity = '0.7';

    const apiKey = inputGroqKey.value.trim() || profile.groqApiKey || '';
    const model = selectGroqModel.value || 'qwen/qwen3.8-27b';

    let answer = '';

    // First attempt: local backend
    try {
      const bRes = await fetch('http://localhost:5000/api/ai/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        if (bData.answer) answer = bData.answer;
      }
    } catch (e) {}

    // Fallback: direct Groq API
    if (!answer) {
      try {
        const systemPrompt = `You are an AI application copilot for ${profile.fullName || 'Prashant Kumar Ary'}, a Senior QA Automation Engineer / SDET with 4.5 years of experience at Corecard India.
Specialties: Playwright, RestAssured, Python, Selenium, API Automation, CI/CD, ISO 8583 payment transactions.
Answer the question concisely, persuasively, and professionally in 2 to 3 sentences (or 1 short paragraph).
Provide only the final ready-to-paste answer without introductory remarks or markdown formatting.`;

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: q }
            ],
            max_tokens: 300,
            temperature: 0.3
          })
        });

        if (res.ok) {
          const json = await res.json();
          answer = json.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (err) {
        console.warn('Direct Groq error:', err);
      }
    }

    if (!answer) {
      answer = `With over 4.5 years of hands-on SDET experience specializing in Playwright, RestAssured, and Python test automation at Corecard India, I have consistently improved automated regression test coverage by over 60% and maintained 99.4% stability across mission-critical microservices.`;
    }

    aiOutputText.textContent = answer;
    aiOutputContainer.style.display = 'block';

    btnGenerateAi.textContent = '🤖 Generate Tailored SDET Answer';
    btnGenerateAi.style.opacity = '1';
  });

  // Copy AI answer to clipboard
  aiCopyBtn.addEventListener('click', () => {
    const text = aiOutputText.textContent;
    if (text) {
      navigator.clipboard.writeText(text);
      aiCopyBtn.textContent = '✓ Copied';
      setTimeout(() => {
        aiCopyBtn.textContent = 'Copy';
      }, 2000);
    }
  });

  // 9. Recruiter Contact Scraper & Deep OSINT Radar
  const btnScrapeActive = document.getElementById('btn-scrape-active');
  const scrapedResultsBox = document.getElementById('scraped-results-box');
  const scrapedStats = document.getElementById('scraped-stats');
  const scrapedItemsList = document.getElementById('scraped-items-list');

  const radarCompanyInput = document.getElementById('radar-company-input');
  const btnRadarLinkedIn = document.getElementById('btn-radar-linkedin');
  const btnRadarNaukri = document.getElementById('btn-radar-naukri');
  const btnRadarPosts = document.getElementById('btn-radar-posts');
  const btnRadarMailboxes = document.getElementById('btn-radar-mailboxes');

  if (btnScrapeActive) {
    btnScrapeActive.addEventListener('click', () => {
      btnScrapeActive.textContent = '⚡ Scanning Active Page...';
      btnScrapeActive.style.opacity = '0.7';

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]?.id) {
          showNotify('No active tab detected', 'info');
          resetScrapeBtn();
          return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: 'SCRAPE_PAGE_CONTACTS' }, (response) => {
          resetScrapeBtn();
          if (chrome.runtime.lastError || !response) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['defaultProfile.js', 'content.js']
            }, () => {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'SCRAPE_PAGE_CONTACTS' }, (res2) => {
                if (res2) displayScrapedContacts(res2);
                else showNotify('Could not inspect contacts on this page', 'info');
              });
            });
            return;
          }
          displayScrapedContacts(response);
        });
      });
    });
  }

  function resetScrapeBtn() {
    if (btnScrapeActive) {
      btnScrapeActive.textContent = '⚡ Scrape Contacts from Current Page';
      btnScrapeActive.style.opacity = '1';
    }
  }

  function displayScrapedContacts(data) {
    const emails = data.emails || [];
    const phones = data.phones || [];

    if (emails.length === 0 && phones.length === 0) {
      scrapedStats.textContent = 'No direct recruiter contacts found on this page.';
      scrapedStats.style.color = '#94a3b8';
      scrapedItemsList.innerHTML = '<p style="color: #64748b; font-size: 10px;">Try the Deep Recruiter Radar below to search HRs for this company on LinkedIn & Naukri.</p>';
      scrapedResultsBox.style.display = 'block';
      return;
    }

    scrapedStats.textContent = `Found ${emails.length} Email(s) & ${phones.length} Phone Number(s)!`;
    scrapedStats.style.color = '#34d399';
    scrapedItemsList.innerHTML = '';

    emails.forEach(email => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 5px 8px; font-size: 10px;';
      
      const sub = encodeURIComponent(`Application: SDET-I (${profile.yearsOfExperience || '3.5'}Yrs Exp | Corecard | 60 Days Notice) - ${profile.fullName || 'Prashant Kumar Ary'}`);
      const driveSnippet = (profile.resumeDriveLink || profile.website || profile.github) ? `\n• Portfolio / Resume Link: ${profile.resumeDriveLink || profile.website || profile.github}` : '';
      const body = encodeURIComponent(`Hi Recruiter,\n\nI am applying for the SDET / QA Automation Engineer role. With ${profile.yearsOfExperience || '3.5'} years experience at Corecard specializing in Playwright, RestAssured, Python, and microservices automation, I have a 60-day notice period and am available for immediate interviews.\n\nLinkedIn: ${profile.linkedIn || ''}${driveSnippet}\nPhone: ${profile.phone || ''}\n\nBest regards,\n${profile.fullName || 'Prashant Kumar Ary'}`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${sub}&body=${body}`;

      row.innerHTML = `
        <span style="font-family: monospace; color: #38bdf8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;" title="${email}">${email}</span>
        <div style="display: flex; gap: 4px;">
          <button class="mini-copy-btn" data-text="${email}" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 4px; padding: 2px 6px; font-size: 9px; cursor: pointer;">Copy</button>
          <a href="${gmailUrl}" target="_blank" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; border-radius: 4px; padding: 2px 6px; font-size: 9px; text-decoration: none;">✉️ Gmail</a>
        </div>
      `;
      scrapedItemsList.appendChild(row);
    });

    phones.forEach(phone => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 5px 8px; font-size: 10px;';
      
      const rawDigits = phone.replace(/\D/g, '');
      const last10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
      const targetNum = (last10.length === 10 && /^[6789]/.test(last10)) ? `91${last10}` : (rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`);

      const savedCustomMsg = localStorage.getItem('recruiter_custom_whatsapp_message');
      const waMode = localStorage.getItem('recruiter_whatsapp_mode') || 'default';
      let messageToSend = `Hi, I am ${profile.fullName || 'Prashant Kumar Ary'} (SDET with ${profile.yearsOfExperience || '3.5'}y exp at Corecard). Saw your hiring post for SDET / QA Automation. I specialize in Playwright, RestAssured & Python with 60-day notice. Would love to share my CV. Thanks!`;
      
      if (waMode === 'custom' && savedCustomMsg && savedCustomMsg.trim()) {
        messageToSend = savedCustomMsg
          .replace(/{name}/gi, profile.fullName || 'Prashant Kumar Ary')
          .replace(/{exp}/gi, profile.yearsOfExperience || '3.5')
          .replace(/{company}/gi, 'your team')
          .replace(/{role}/gi, 'SDET / QA Automation')
          .replace(/{notice}/gi, profile.noticePeriod || '60 days')
          .replace(/{driveLink}|{cv}|{resume}/gi, profile.resumeDriveLink || '')
          .replace(/{phone}/gi, profile.phone || '')
          .replace(/{email}/gi, profile.email || '');
      }

      const waMsg = encodeURIComponent(messageToSend);
      const waWebUrl = `https://web.whatsapp.com/send?phone=${targetNum}&text=${waMsg}`;
      const waAppUrl = `whatsapp://send?phone=${targetNum}&text=${waMsg}`;

      row.innerHTML = `
        <span style="font-family: monospace; color: #34d399; font-weight: 600;">${phone}</span>
        <div style="display: flex; gap: 4px;">
          <button class="mini-copy-btn" data-text="${phone}" style="background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.3); color: #34d399; border-radius: 4px; padding: 2px 6px; font-size: 9px; cursor: pointer;">Copy</button>
          <a href="${waWebUrl}" target="_blank" title="Direct WhatsApp Web" style="background: rgba(37, 211, 102, 0.15); border: 1px solid rgba(37, 211, 102, 0.3); color: #25d366; border-radius: 4px; padding: 2px 6px; font-size: 9px; text-decoration: none;">💬 Web</a>
          <a href="${waAppUrl}" target="_blank" title="Open in WhatsApp Desktop App" style="background: rgba(148, 163, 184, 0.15); border: 1px solid rgba(148, 163, 184, 0.3); color: #94a3b8; border-radius: 4px; padding: 2px 5px; font-size: 9px; text-decoration: none;">App ↗</a>
        </div>
      `;
      scrapedItemsList.appendChild(row);
    });

    scrapedItemsList.querySelectorAll('.mini-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        navigator.clipboard.writeText(e.target.dataset.text);
        e.target.textContent = '✓';
        setTimeout(() => { e.target.textContent = 'Copy'; }, 1800);
      });
    });

    scrapedResultsBox.style.display = 'block';
  }

  function getTargetCompany() {
    return (radarCompanyInput?.value || '').trim() || 'Razorpay';
  }

  if (btnRadarLinkedIn) {
    btnRadarLinkedIn.addEventListener('click', () => {
      const comp = getTargetCompany();
      const q = encodeURIComponent(`site:linkedin.com/in ("technical recruiter" OR "talent acquisition" OR "hiring") "${comp}" ("@gmail.com" OR "@" OR "contact" OR "+91") "Bengaluru"`);
      chrome.tabs.create({ url: `https://www.google.com/search?q=${q}` });
    });
  }

  if (btnRadarNaukri) {
    btnRadarNaukri.addEventListener('click', () => {
      const comp = getTargetCompany();
      const q = encodeURIComponent(`site:naukri.com/recruiters "${comp}" ("SDET" OR "QA" OR "Automation")`);
      chrome.tabs.create({ url: `https://www.google.com/search?q=${q}` });
    });
  }

  if (btnRadarPosts) {
    btnRadarPosts.addEventListener('click', () => {
      const comp = getTargetCompany();
      const q = encodeURIComponent(`site:linkedin.com/feed ("hiring SDET" OR "hiring QA") "${comp}" ("email" OR "send resume" OR "DM")`);
      chrome.tabs.create({ url: `https://www.google.com/search?q=${q}` });
    });
  }

  if (btnRadarMailboxes) {
    btnRadarMailboxes.addEventListener('click', () => {
      const comp = getTargetCompany();
      const q = encodeURIComponent(`"${comp}" ("careers@" OR "hiring@" OR "talent@" OR "hr email") ("phone" OR "+91" OR "contact")`);
      chrome.tabs.create({ url: `https://www.google.com/search?q=${q}` });
    });
  }

});
