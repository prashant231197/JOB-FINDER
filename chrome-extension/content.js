/**
 * QA Job Hunter - AI ATS Form Filler & Universal Question Answerer Bot
 * Fully autonomous form detection, React/Workday/Greenhouse/Lever compatibility,
 * and Groq AI-powered question answering.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__qaHunterInjected) return;
  window.__qaHunterInjected = true;

  let currentProfile = window.DEFAULT_USER_PROFILE || {};
  let isBotRunning = false;

  // Load saved profile from Chrome Storage
  function loadProfile() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['qa_user_profile', 'groq_api_key', 'groq_model'], (result) => {
        if (result.qa_user_profile) {
          currentProfile = { ...window.DEFAULT_USER_PROFILE, ...result.qa_user_profile };
        } else {
          currentProfile = window.DEFAULT_USER_PROFILE || {};
        }
        if (result.groq_api_key) currentProfile.groqApiKey = result.groq_api_key;
        if (result.groq_model) currentProfile.groqModel = result.groq_model;
      });
    }
  }
  loadProfile();

  // -------------------------------------------------------------
  // 1. Prototype Value Setter (React 16+, Vue, Angular, Workday, Ashby)
  // -------------------------------------------------------------
  function setNativeValue(el, val) {
    if (!el || val === undefined || val === null) return false;
    try {
      const isTextArea = el instanceof HTMLTextAreaElement || el.tagName === 'TEXTAREA';
      const prototype = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      const ownValueSetter = Object.getOwnPropertyDescriptor(el, 'value')?.set;

      el.focus();

      if (valueSetter && ownValueSetter !== valueSetter) {
        valueSetter.call(el, val);
      } else if (ownValueSetter) {
        ownValueSetter.call(el, val);
      } else {
        el.value = val;
      }

      // Dispatch comprehensive event chain for modern reactive frameworks
      el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter' }));
      el.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

      el.classList.add('qa-hunter-filled-field');
      return true;
    } catch (e) {
      try {
        el.value = val;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  // -------------------------------------------------------------
  // 2. Select & Custom Combobox Handling
  // -------------------------------------------------------------
  function selectOption(selectEl, matchTextOrArray) {
    if (!selectEl || !matchTextOrArray) return false;
    const targets = (Array.isArray(matchTextOrArray) ? matchTextOrArray : [matchTextOrArray]).map(t => String(t).toLowerCase());

    // 1. Try exact or partial match on options
    for (let i = 0; i < selectEl.options.length; i++) {
      const opt = selectEl.options[i];
      const optText = (opt.textContent || '').toLowerCase().trim();
      const optVal = (opt.value || '').toLowerCase().trim();

      for (const t of targets) {
        if (optText === t || optVal === t || optText.includes(t) || t.includes(optText)) {
          if (selectEl.selectedIndex !== i) {
            selectEl.selectedIndex = i;
            selectEl.dispatchEvent(new Event('input', { bubbles: true }));
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            selectEl.dispatchEvent(new Event('blur', { bubbles: true }));
            selectEl.classList.add('qa-hunter-filled-field');
          }
          return true;
        }
      }
    }
    return false;
  }

  // Custom Combobox / Workday Dropdown Handler
  async function selectCustomDropdown(container, targetText) {
    if (!container || !targetText) return false;
    const targets = (Array.isArray(targetText) ? targetText : [targetText]).map(t => String(t).toLowerCase());
    try {
      // Find trigger button or input
      const trigger = container.querySelector('[role="combobox"], [role="button"], input, div[class*="control"], div[class*="select"], div[class*="placeholder"], div[class*="indicator"]');
      if (trigger) {
        trigger.focus();
        trigger.click();
        await new Promise(r => setTimeout(r, 150));

        const options = Array.from(document.querySelectorAll('[role="option"], li, div[class*="option"], div[id*="option"], div[class*="menu"] div, [role="listbox"] div'));
        for (const opt of options) {
          const optText = (opt.textContent || '').toLowerCase().trim();
          for (const t of targets) {
            if (optText === t || optText.includes(t) || t.includes(optText)) {
              opt.click();
              opt.dispatchEvent(new Event('click', { bubbles: true }));
              opt.dispatchEvent(new Event('change', { bubbles: true }));
              container.classList.add('qa-hunter-filled-field');
              return true;
            }
          }
        }
      }
    } catch (e) {}
    return false;
  }

  // -------------------------------------------------------------
  // 3. Radio Buttons & Radiogroups Matching
  // -------------------------------------------------------------
  function selectRadioOption(groupEl, targetKeywords) {
    if (!groupEl || !targetKeywords) return false;
    const keywords = (Array.isArray(targetKeywords) ? targetKeywords : [targetKeywords]).map(k => String(k).toLowerCase());
    const radios = groupEl.querySelectorAll ? groupEl.querySelectorAll('input[type="radio"], [role="radio"]') : [groupEl];

    for (const r of radios) {
      // Check label or container text for this radio
      let labelText = '';
      if (r.id) {
        const lbl = document.querySelector(`label[for="${r.id}"]`);
        if (lbl) labelText = lbl.textContent.toLowerCase();
      }
      if (!labelText) {
        const parent = r.closest('label, div, li, tr');
        if (parent) labelText = parent.textContent.toLowerCase();
      }
      const valText = (r.value || r.getAttribute('value') || '').toLowerCase();
      const combined = `${labelText} ${valText}`;

      for (const kw of keywords) {
        // Strict boundary or clean match
        if (combined.includes(kw)) {
          r.click();
          r.checked = true;
          r.dispatchEvent(new Event('change', { bubbles: true }));
          r.dispatchEvent(new Event('click', { bubbles: true }));
          return true;
        }
      }
    }
    return false;
  }

  // -------------------------------------------------------------
  // 4. Semantic Question & Label Extraction
  // -------------------------------------------------------------
  function extractFieldDescriptor(el) {
    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const placeholder = (el.placeholder || '').toLowerCase();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    const autocomplete = (el.autocomplete || '').toLowerCase();
    const dataTest = (el.getAttribute('data-test') || el.getAttribute('data-automation-id') || el.getAttribute('data-qa') || '').toLowerCase();

    let labelText = '';

    // Direct label by for
    if (el.id) {
      const lbl = document.querySelector(`label[for="${el.id}"]`);
      if (lbl) labelText = lbl.textContent;
    }

    // Label by aria-labelledby
    if (!labelText && ariaLabelledBy) {
      const lblElem = document.getElementById(ariaLabelledBy);
      if (lblElem) labelText = lblElem.textContent;
    }

    // Parent label
    if (!labelText) {
      const parentLabel = el.closest('label');
      if (parentLabel) labelText = parentLabel.textContent;
    }

    // Preceding or parent question container
    if (!labelText) {
      const container = el.closest('.field, .form-group, .input-group, [class*="question"], [class*="field"], [class*="form-item"], tr, div');
      if (container) {
        const heading = container.querySelector('label, .label, legend, h3, h4, h5, [class*="label"], [class*="title"], [class*="question"]');
        if (heading) labelText = heading.textContent;
      }
    }

    // If still empty, check immediate previous sibling
    if (!labelText && el.previousElementSibling) {
      const prev = el.previousElementSibling;
      if (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'P') {
        labelText = prev.textContent;
      }
    }

    return {
      rawQuestion: labelText.trim(),
      searchKey: `${id} ${name} ${placeholder} ${ariaLabel} ${autocomplete} ${dataTest} ${labelText}`.toLowerCase().replace(/\s+/g, ' ').trim()
    };
  }

  // -------------------------------------------------------------
  // 5. Groq AI Question Answerer Engine
  // -------------------------------------------------------------
  async function askGroqAI(questionText) {
    const p = currentProfile || window.DEFAULT_USER_PROFILE;
    const apiKey = p.groqApiKey || '';
    const model = p.groqModel || 'qwen/qwen3.8-27b';

    const pageTitle = document.title || '';
    const jobHeading = document.querySelector('h1, h2, [data-automation-id="jobPostingHeader"], .job-title')?.textContent?.trim() || 'SDET / QA Automation Engineer';

    // 1. Try local backend first (if user is running locally)
    try {
      const localRes = await fetch('http://localhost:5000/api/ai/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          jobTitle: jobHeading,
          company: pageTitle
        })
      });
      if (localRes.ok) {
        const data = await localRes.json();
        if (data.answer && data.answer.trim().length > 0) return data.answer.trim();
      }
    } catch (e) {
      // Backend not running, proceed to direct Groq call
    }

    // 2. Direct Groq API Call
    try {
      const systemPrompt = `You are an expert, professional job application assistant for ${p.fullName || 'Prashant Kumar Ary'}, applying for a Senior SDET / QA Automation Engineer position.
Candidate Background:
- Role: SDET-II at Corecard India Pvt. Ltd (4.5 years total experience)
- Skills: Playwright, RestAssured, Python, Selenium WebDriver, Java, Postman, SQL, Docker, GitHub Actions, Jenkins, CI/CD, ISO 8583 payment messaging.
- Accomplishments: Designed scalable automated regression suites (99.4% pass stability), built AI-assisted log reconciliation tool reducing triage by 45%, enforced pull-request CI/CD quality gates.
- Notice Period: 30 days (negotiable to 15 days)
- Work Mode: Open to Remote, Hybrid, or On-site. Willing to relocate.

Instruction: Answer the employer's application screening question directly, concisely, and persuasively in 2 to 4 sentences (or 1 short paragraph).
Do NOT include markdown formatting, bullet asterisks, quotes, greetings, or placeholders. Provide ONLY the final answer text ready to submit.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Application Question: "${questionText}"` }
          ],
          max_tokens: 350,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const json = await response.json();
        const ans = json.choices?.[0]?.message?.content?.trim();
        if (ans) return ans;
      }
    } catch (err) {
      console.warn('[QA Hunter Bot] Direct Groq API failed:', err);
    }

    // 3. Fallback to pre-computed truthful answer
    return `With 4.5 years of experience specializing in test automation, Playwright, RestAssured, and Python across cloud microservices and payment systems, I have consistently improved automated test coverage and accelerated release velocity. I am eager to apply my test architecture and quality engineering skills to this role.`;
  }

  // -------------------------------------------------------------
  // 6. Intelligent Semantic Answer Resolver
  // -------------------------------------------------------------
  async function resolveAnswerForField(descriptor, rawQuestion = '') {
    const p = currentProfile || window.DEFAULT_USER_PROFILE;
    const d = descriptor.toLowerCase();
    const q = (rawQuestion || descriptor).toLowerCase();

    // 1. Identity & Name
    if (d.includes('first_name') || d.includes('firstname') || d.includes('given-name') || (d.includes('first') && d.includes('name'))) {
      return { type: 'value', value: p.firstName };
    }
    if (d.includes('last_name') || d.includes('lastname') || d.includes('family-name') || (d.includes('last') && d.includes('name')) || d.includes('surname')) {
      return { type: 'value', value: p.lastName };
    }
    if (d.includes('middle_name') || d.includes('middlename') || (d.includes('middle') && d.includes('name'))) {
      return { type: 'value', value: p.middleName || '' };
    }
    if (d.includes('full_name') || d.includes('fullname') || (d.includes('name') && !d.includes('company') && !d.includes('user') && !d.includes('file') && !d.includes('school') && !d.includes('college'))) {
      return { type: 'value', value: p.fullName };
    }

    // 2. Email & Phone
    if (d.includes('email') || d.includes('e-mail')) {
      return { type: 'value', value: p.email };
    }
    if (d.includes('phone') || d.includes('mobile') || d.includes('cell') || d.includes('tel') || d.includes('contact number')) {
      if (d.includes('code') || d.includes('country code')) return { type: 'value', value: p.countryCode || '+91' };
      return { type: 'value', value: p.phone };
    }

    // 3. Online URLs
    if (d.includes('linkedin') || d.includes('linked_in')) {
      return { type: 'value', value: p.linkedIn };
    }
    if (d.includes('github') || d.includes('git')) {
      return { type: 'value', value: p.github };
    }
    if (d.includes('portfolio') || d.includes('website') || d.includes('personal site') || d.includes('blog') || d.includes('url')) {
      return { type: 'value', value: p.portfolio || p.linkedIn };
    }

    // 4. Current Employment
    if (d.includes('current company') || d.includes('employer') || d.includes('organization') || (d.includes('company') && !d.includes('why'))) {
      return { type: 'value', value: p.currentCompany };
    }
    if (d.includes('current role') || d.includes('current title') || d.includes('designation') || d.includes('job title') || (d.includes('title') && !d.includes('job title you are applying'))) {
      return { type: 'value', value: p.currentRole };
    }

    // 5. Total Years of Experience
    if (d.includes('years of experience') || d.includes('total experience') || d.includes('total exp') || d.includes('how many years of total')) {
      return { type: 'value', value: p.yearsOfExperience || '4.5' };
    }

    // 6. Specific Skills Experience (e.g. "How many years with Playwright / Python / Selenium")
    if (p.skillExperience) {
      for (const [skill, yrs] of Object.entries(p.skillExperience)) {
        if (q.includes(skill)) {
          return { type: 'value', value: String(yrs) };
        }
      }
    }

    // 7. Notice Period & Availability
    if (d.includes('notice') || d.includes('availability') || d.includes('when can you start') || d.includes('start date')) {
      if (d.includes('day')) return { type: 'value', value: p.noticePeriodDays || '30' };
      return { type: 'value', value: p.noticePeriod || '30 days' };
    }

    // 8. Compensation & Salary (CTC)
    if (d.includes('current ctc') || d.includes('current salary') || d.includes('current compensation') || d.includes('present ctc')) {
      if (d.includes('number') || d.includes('lpa') || d.includes('inr') || d.includes('amount')) {
        return { type: 'value', value: p.currentSalaryNumber || '1200000' };
      }
      return { type: 'value', value: p.currentSalary || '12,00,000 INR' };
    }
    if (d.includes('expected ctc') || d.includes('expected salary') || d.includes('desired salary') || d.includes('salary expectation') || d.includes('compensation requirement') || (d.includes('salary') && !d.includes('current'))) {
      if (d.includes('number') || d.includes('lpa') || d.includes('inr') || d.includes('amount')) {
        return { type: 'value', value: p.expectedSalaryNumber || '1800000' };
      }
      return { type: 'value', value: p.expectedSalary || '18,00,000 INR' };
    }

    // 9. Location & Address
    if (d.includes('street') || d.includes('address')) {
      return { type: 'value', value: p.currentAddress || p.currentCity };
    }
    if (d.includes('city') || (d.includes('location') && !d.includes('pref') && !d.includes('reloc'))) {
      return { type: 'value', value: p.currentCity };
    }
    if (d.includes('state') || d.includes('province')) {
      return { type: 'value', value: p.state };
    }
    if (d.includes('country') && !d.includes('code')) {
      return { type: 'value', value: p.country };
    }
    if (d.includes('zip') || d.includes('postal') || d.includes('pincode') || d.includes('pin code')) {
      return { type: 'value', value: p.postalCode };
    }

    // 10. Education
    if (d.includes('school') || d.includes('university') || d.includes('college') || d.includes('institution')) {
      return { type: 'value', value: p.education?.university || p.education?.school };
    }
    if (d.includes('degree') || d.includes('qualification') || d.includes('education level')) {
      return { type: 'value', value: p.education?.degree || 'Bachelor of Technology' };
    }
    if (d.includes('field of study') || d.includes('major') || d.includes('branch') || d.includes('discipline')) {
      return { type: 'value', value: p.education?.fieldOfStudy || 'Computer Science and Engineering' };
    }
    if (d.includes('graduation year') || d.includes('passing year') || d.includes('grad year') || d.includes('end year')) {
      return { type: 'value', value: p.education?.graduationYear || '2020' };
    }
    if (d.includes('gpa') || d.includes('cgpa') || d.includes('percentage') || d.includes('grade')) {
      return { type: 'value', value: p.education?.gpa || '8.8' };
    }

    // 11. Work Authorization & Legal Questions
    if (q.includes('authorized to work') || q.includes('legally authorized') || q.includes('work authorization') || q.includes('eligible to work')) {
      return { type: 'intent', value: 'Yes' };
    }
    if (q.includes('sponsorship') || q.includes('require visa') || q.includes('visa sponsorship') || q.includes('now or in the future')) {
      return { type: 'intent', value: 'No' };
    }
    if (q.includes('18 years') || q.includes('age of 18') || q.includes('at least 18')) {
      return { type: 'intent', value: 'Yes' };
    }
    if (q.includes('background check') || q.includes('background verification') || q.includes('drug screen')) {
      return { type: 'intent', value: 'Yes' };
    }
    if (q.includes('relocate') || q.includes('willing to relocate') || q.includes('open to relocation')) {
      return { type: 'intent', value: 'Yes' };
    }
    if (q.includes('hybrid') || q.includes('remote') || q.includes('on-site') || q.includes('work in office')) {
      return { type: 'intent', value: 'Yes' };
    }
    if (q.includes('criminal') || q.includes('convicted') || q.includes('felony')) {
      return { type: 'intent', value: 'No' };
    }
    if (q.includes('non-compete') || q.includes('non compete') || q.includes('restrictive covenant')) {
      return { type: 'intent', value: 'No' };
    }
    if (q.includes('previously employed') || q.includes('worked here before') || q.includes('worked for this company')) {
      return { type: 'intent', value: 'No' };
    }
    if (q.includes('relatives') || q.includes('family member currently')) {
      return { type: 'intent', value: 'No' };
    }

    // 12. Standard Cover Letter / Summary
    if (d.includes('cover letter') || d.includes('coverletter') || d.includes('letter')) {
      return { type: 'value', value: p.coverLetter };
    }
    if (d.includes('summary') || d.includes('about yourself') || d.includes('bio') || d.includes('profile summary')) {
      return { type: 'value', value: p.summary };
    }

    // 13. Pre-computed Q&A Match
    if (p.qna) {
      if (q.includes('why') && (q.includes('interested') || q.includes('role') || q.includes('company') || q.includes('apply') || q.includes('join'))) {
        return { type: 'value', value: p.qna.whyInterested };
      }
      if (q.includes('why') && (q.includes('change') || q.includes('leaving') || q.includes('looking'))) {
        return { type: 'value', value: p.qna.whyChange };
      }
      if (q.includes('framework') || (q.includes('automation') && q.includes('experience'))) {
        return { type: 'value', value: p.qna.frameworkExperience };
      }
      if (q.includes('api') && q.includes('experience')) {
        return { type: 'value', value: p.qna.apiExperience };
      }
      if (q.includes('challenge') || q.includes('bug') || q.includes('difficult')) {
        return { type: 'value', value: p.qna.biggestChallenge };
      }
      if (q.includes('ci/cd') || q.includes('jenkins') || q.includes('pipeline') || q.includes('github actions')) {
        return { type: 'value', value: p.qna.ciCdExperience };
      }
      if (q.includes('payment') || q.includes('iso') || q.includes('card') || q.includes('gateway')) {
        return { type: 'value', value: p.qna.paymentExperience };
      }
      if (q.includes('how did you hear') || q.includes('source') || q.includes('referral')) {
        return { type: 'value', value: p.qna.source };
      }
    }

    // 14. Novel / Custom Screening Question -> Consult Groq AI!
    if (rawQuestion && rawQuestion.trim().length > 10) {
      const aiResponse = await askGroqAI(rawQuestion);
      return { type: 'value', value: aiResponse };
    }

    return null;
  }

  // -------------------------------------------------------------
  // 7. Interactive Floating Bot HUD (Widget)
  // -------------------------------------------------------------
  function injectFloatingBotWidget() {
    if (document.getElementById('qa-hunter-floating-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'qa-hunter-floating-widget';
    widget.innerHTML = `
      <div class="qa-widget-header" id="qa-widget-drag-handle">
        <div class="qa-widget-title">
          <span>⚡ QA Hunter Bot</span>
          <span class="qa-widget-badge" id="qa-bot-badge">Ready</span>
        </div>
        <div class="qa-widget-actions">
          <button class="qa-widget-icon-btn" id="qa-widget-minimize" title="Minimize / Expand">_</button>
          <button class="qa-widget-icon-btn" id="qa-widget-close" title="Hide widget">✕</button>
        </div>
      </div>
      <div class="qa-widget-body">
        <div class="qa-widget-status-text" id="qa-widget-status">
          Detected job portal. Click below to autofill all fields and generate AI answers for screening questions.
        </div>
        <button class="qa-widget-btn-fill" id="qa-trigger-autofill">
          <span>⚡ Run AI Bot AutoFill</span>
        </button>
        <button class="qa-widget-btn-sub" id="qa-trigger-sync">
          <span>🔄 Sync Candidate Profile</span>
        </button>
        <div class="qa-telemetry-container" id="qa-telemetry-box" style="display:none; max-height: 140px; overflow-y: auto; font-family: monospace; font-size: 10px; background: rgba(0,0,0,0.5); border-radius: 8px; padding: 6px 8px; border: 1px solid rgba(6, 182, 212, 0.2); color: #94a3b8;">
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Draggable
    makeDraggable(widget, widget.querySelector('#qa-widget-drag-handle'));

    // Events
    widget.querySelector('#qa-trigger-autofill').addEventListener('click', () => {
      runAutofillBot();
    });

    widget.querySelector('#qa-trigger-sync').addEventListener('click', async () => {
      await syncWithLocalApp();
    });

    const minimizeBtn = widget.querySelector('#qa-widget-minimize');
    minimizeBtn.addEventListener('click', () => {
      widget.classList.toggle('minimized');
      minimizeBtn.textContent = widget.classList.contains('minimized') ? '□' : '_';
    });

    widget.querySelector('#qa-widget-close').addEventListener('click', () => {
      widget.style.display = 'none';
    });
  }

  function logTelemetry(msg, isSuccess = true) {
    const box = document.getElementById('qa-telemetry-box');
    if (!box) return;
    box.style.display = 'block';
    const line = document.createElement('div');
    line.style.color = isSuccess ? '#34d399' : '#38bdf8';
    line.style.marginBottom = '2px';
    line.textContent = `[${new Date().toLocaleTimeString().slice(0, 5)}] ${msg}`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.bottom = 'auto';
      element.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // -------------------------------------------------------------
  // 8. Sync with Local QA Hunter Web App (localhost:5000)
  // -------------------------------------------------------------
  async function syncWithLocalApp() {
    showToast('Connecting to QA Hunter local server (http://localhost:5000)...');
    try {
      const res = await fetch('http://localhost:5000/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          currentProfile = { ...currentProfile, ...data.profile };
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ qa_user_profile: currentProfile });
          }
          showToast('✓ Profile successfully synced with QA Hunter app!');
          logTelemetry('Profile synchronized with local server.', true);
          return true;
        }
      }
    } catch (e) {
      console.warn('Local app sync not available:', e.message);
    }
    showToast('Using embedded SDET candidate profile knowledge base.');
    return false;
  }

  // -------------------------------------------------------------
  // 9. Full Autonomous Bot Autofill Engine
  // -------------------------------------------------------------
  async function runAutofillBot() {
    if (isBotRunning) return;
    isBotRunning = true;

    const statusEl = document.getElementById('qa-widget-status');
    const badgeEl = document.getElementById('qa-bot-badge');
    const fillBtn = document.getElementById('qa-trigger-autofill');

    if (badgeEl) {
      badgeEl.textContent = 'RUNNING';
      badgeEl.style.background = 'rgba(6, 182, 212, 0.3)';
      badgeEl.style.color = '#38bdf8';
    }
    if (fillBtn) {
      fillBtn.innerHTML = '<span>⚡ Bot Filling Fields...</span>';
      fillBtn.style.opacity = '0.7';
    }

    let filledCount = 0;
    const telemetryBox = document.getElementById('qa-telemetry-box');
    if (telemetryBox) telemetryBox.innerHTML = '';

    logTelemetry('Starting autonomous form inspection...');

    // Collect all documents (main document + accessible iframes)
    const docs = [document];
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        if (iframe.contentDocument) docs.push(iframe.contentDocument);
      } catch (e) {}
    });

    for (const doc of docs) {
      // 1. Process Text Inputs & Number Inputs
      const textInputs = Array.from(doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]):not([type="radio"]):not([type="checkbox"])'));
      for (const inp of textInputs) {
        if (inp.value && inp.value.trim().length > 0 && !inp.classList.contains('qa-hunter-filled-field')) {
          continue; // Don't overwrite if already filled
        }

        const { searchKey, rawQuestion } = extractFieldDescriptor(inp);
        const resolved = await resolveAnswerForField(searchKey, rawQuestion);

        if (resolved && (resolved.type === 'value' || resolved.type === 'intent') && resolved.value !== undefined && resolved.value !== '') {
          if (setNativeValue(inp, resolved.value)) {
            filledCount++;
            const shortVal = String(resolved.value).length > 25 ? `${String(resolved.value).slice(0, 25)}...` : String(resolved.value);
            logTelemetry(`Filled: ${rawQuestion || inp.name || inp.id} -> "${shortVal}"`);
          }
        }
      }

      // 2. Process Native Select Elements
      const selects = Array.from(doc.querySelectorAll('select'));
      for (const sel of selects) {
        const { searchKey, rawQuestion } = extractFieldDescriptor(sel);
        const resolved = await resolveAnswerForField(searchKey, rawQuestion);

        let targetVal = resolved?.value;
        if (!targetVal) {
          // Heuristic default targets
          if (searchKey.includes('authorized') || searchKey.includes('legally')) targetVal = ['Yes', 'Citizen'];
          else if (searchKey.includes('sponsorship') || searchKey.includes('visa')) targetVal = 'No';
          else if (searchKey.includes('gender')) targetVal = ['Male', 'Decline'];
          else if (searchKey.includes('veteran')) targetVal = ['Not a veteran', 'No', 'Decline'];
          else if (searchKey.includes('disability')) targetVal = ['No', 'Decline'];
          else if (searchKey.includes('relocate')) targetVal = 'Yes';
          else if (searchKey.includes('notice')) targetVal = ['30', '1 month', 'Immediate'];
          else if (searchKey.includes('experience') || searchKey.includes('years')) targetVal = ['4', '4.5', '3-5', '5'];
        }

        if (targetVal && selectOption(sel, targetVal)) {
          filledCount++;
          logTelemetry(`Selected: ${rawQuestion || sel.name} -> "${targetVal}"`);
        }
      }

      // 2.b Process Custom Dropdowns / Comboboxes (Workday, Ashby, React-Select)
      const customDropdowns = Array.from(doc.querySelectorAll('[role="combobox"], div[class*="Select-control"], div[class*="select__control"], div[data-automation-id*="dropdown"], div[data-automation-id*="Select"], button[aria-haspopup="listbox"], div[aria-haspopup="listbox"]'));
      for (const cd of customDropdowns) {
        if (cd.classList.contains('qa-hunter-filled-field')) continue;
        const { searchKey, rawQuestion } = extractFieldDescriptor(cd);
        const resolved = await resolveAnswerForField(searchKey, rawQuestion);

        let targetVal = resolved?.value;
        if (!targetVal) {
          if (searchKey.includes('authorized') || searchKey.includes('legally')) targetVal = ['Yes', 'Citizen'];
          else if (searchKey.includes('sponsorship') || searchKey.includes('visa')) targetVal = 'No';
          else if (searchKey.includes('gender')) targetVal = ['Male', 'Decline'];
          else if (searchKey.includes('veteran')) targetVal = ['Not a veteran', 'No', 'Decline'];
          else if (searchKey.includes('disability')) targetVal = ['No', 'Decline'];
          else if (searchKey.includes('relocate')) targetVal = 'Yes';
          else if (searchKey.includes('notice')) targetVal = ['30', '1 month', 'Immediate'];
          else if (searchKey.includes('experience') || searchKey.includes('years')) targetVal = ['4', '4.5', '3-5', '5'];
        }

        if (targetVal) {
          const ok = await selectCustomDropdown(cd, targetVal);
          if (ok) {
            filledCount++;
            logTelemetry(`Custom Select: ${rawQuestion || searchKey.slice(0, 25)} -> "${Array.isArray(targetVal) ? targetVal[0] : targetVal}"`);
          }
        }
      }

      // 3. Process Radio Button Groups & Radiogroups
      const radioContainers = Array.from(doc.querySelectorAll('fieldset, div[role="radiogroup"], [class*="question"], [class*="radio-group"], tr'));
      for (const rc of radioContainers) {
        const text = rc.textContent.toLowerCase();
        let intent = null;

        if (text.includes('authorized to work') || text.includes('legally authorized') || text.includes('work authorization')) {
          intent = ['yes', 'authorized', 'eligible'];
        } else if (text.includes('sponsorship') || text.includes('require visa') || text.includes('require sponsorship')) {
          intent = ['no', 'do not require'];
        } else if (text.includes('18 years') || text.includes('age of 18')) {
          intent = ['yes'];
        } else if (text.includes('background check') || text.includes('drug screen')) {
          intent = ['yes', 'consent'];
        } else if (text.includes('relocate') || text.includes('relocation')) {
          intent = ['yes'];
        } else if (text.includes('hybrid') || text.includes('remote') || text.includes('in-office')) {
          intent = ['yes', 'hybrid', 'remote'];
        } else if (text.includes('criminal') || text.includes('convicted')) {
          intent = ['no'];
        } else if (text.includes('non-compete')) {
          intent = ['no'];
        } else if (text.includes('gender')) {
          intent = ['male', 'decline'];
        } else if (text.includes('veteran')) {
          intent = ['not a veteran', 'no', 'decline'];
        } else if (text.includes('disability')) {
          intent = ['no', 'decline'];
        }

        if (intent && selectRadioOption(rc, intent)) {
          filledCount++;
          logTelemetry(`Radio Checked: ${text.slice(0, 30)}... -> "${intent[0]}"`);
        }
      }

      // 4. Process Checkboxes (Terms, Consent, Declarations)
      const checkboxes = Array.from(doc.querySelectorAll('input[type="checkbox"]'));
      for (const cb of checkboxes) {
        const { searchKey, rawQuestion } = extractFieldDescriptor(cb);
        const combined = `${searchKey} ${rawQuestion}`.toLowerCase();

        if (combined.includes('agree') || combined.includes('consent') || combined.includes('certif') ||
            combined.includes('acknowledge') || combined.includes('privacy') || combined.includes('terms') ||
            combined.includes('accuracy') || combined.includes('truthful') || combined.includes('authorize')) {
          if (!cb.checked) {
            cb.click();
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
            logTelemetry(`Agreed & Checked: ${rawQuestion.slice(0, 30)}...`);
          }
        }
      }

      // 5. Process Textareas (Cover Letters, Summaries, and Custom Screening Questions)
      const textareas = Array.from(doc.querySelectorAll('textarea'));
      for (const ta of textareas) {
        if (ta.value && ta.value.trim().length > 0 && !ta.classList.contains('qa-hunter-filled-field')) {
          continue;
        }

        const { searchKey, rawQuestion } = extractFieldDescriptor(ta);
        logTelemetry(`AI Reasoning on question: "${(rawQuestion || ta.name).slice(0, 35)}..."`);

        const resolved = await resolveAnswerForField(searchKey, rawQuestion);
        if (resolved && resolved.value) {
          if (setNativeValue(ta, resolved.value)) {
            filledCount++;
            logTelemetry(`✓ Answered textarea: "${(rawQuestion || ta.name).slice(0, 30)}..."`);
          }
        }
      }

      // 6. Highlight Resume Upload Field (Browser security forbids auto-setting file paths)
      const fileInputs = Array.from(doc.querySelectorAll('input[type="file"]'));
      for (const fi of fileInputs) {
        fi.style.outline = '2px dashed #06b6d4';
        fi.style.boxShadow = '0 0 12px rgba(6, 182, 212, 0.4)';
        logTelemetry('📎 Resume Upload found: Please attach your resume PDF here if needed.');
      }
    }

    isBotRunning = false;

    // Final Completion Banner & Notification
    if (badgeEl) {
      badgeEl.textContent = 'DONE';
      badgeEl.style.background = 'rgba(16, 185, 129, 0.25)';
      badgeEl.style.color = '#34d399';
    }
    if (fillBtn) {
      fillBtn.innerHTML = '<span>⚡ Re-Run AI AutoFill</span>';
      fillBtn.style.opacity = '1';
    }

    const finishMsg = `🎉 All questions answered & ${filledCount} field(s) filled! Please review everything and click Submit manually.`;
    if (statusEl) statusEl.textContent = finishMsg;
    logTelemetry(`100% COMPLETE! Total ${filledCount} items filled.`);
    showToast(finishMsg);
  }

  // -------------------------------------------------------------
  // 10. In-Page Floating Toast Notification
  // -------------------------------------------------------------
  function showToast(msg) {
    const existing = document.querySelector('.qa-hunter-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'qa-hunter-toast';
    toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 5500);
  }

  // -------------------------------------------------------------
  // 11. Extension Message Listener & Hotkeys
  // -------------------------------------------------------------
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOFILL_PAGE') {
        loadProfile();
        runAutofillBot().then(() => sendResponse({ success: true }));
        return true;
      }
      if (request.action === 'PING') {
        sendResponse({ status: 'READY', profile: currentProfile });
      }
      if (request.action === 'UPDATE_PROFILE') {
        currentProfile = { ...currentProfile, ...request.profile };
        showToast('Profile updated in active tab.');
        sendResponse({ success: true });
      }
      if (request.action === 'SCRAPE_PAGE_CONTACTS') {
        const text = (document.body ? document.body.innerText + ' ' + document.body.innerHTML : '');
        // 1. Email Regex
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
        const rawEmails = text.match(emailRegex) || [];
        const cleanEmails = Array.from(new Set(rawEmails.map(e => e.toLowerCase().trim()))).filter(e => {
          return !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') && !e.endsWith('.webp') && !e.includes('example.com') && !e.includes('schema.org') && !e.includes('w3.org') && !e.includes('sentry.io');
        });

        // 2. Phone Regex (Indian mobile & standard numbers, ensuring full 10-digits are captured without 9-digit truncation)
        const indianMobileRegex = /(?:(?:\+|0{0,2})91[\s.-]?|0[\s.-]?)?([6789](?:[\s.-]*\d){9})(?!\d)/g;
        const internationalRegex = /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{4,5}(?!\d)/g;

        const extractedPhones = [];
        const indianMatches = [...text.matchAll(indianMobileRegex)];
        indianMatches.forEach(m => {
          const fullMatched = m[0].trim();
          const rawDigits = fullMatched.replace(/\D/g, '');
          const last10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
          if (last10.length === 10 && /^[6789]/.test(last10)) {
            extractedPhones.push(`+91 ${last10.slice(0, 5)} ${last10.slice(5)}`);
          } else if (rawDigits.length >= 8) {
            extractedPhones.push(fullMatched);
          }
        });

        const otherMatches = text.match(internationalRegex) || [];
        otherMatches.forEach(p => {
          const trimmed = p.trim();
          const raw = trimmed.replace(/\D/g, '');
          if (raw.length >= 8 && raw.length <= 14) {
            const exists = extractedPhones.some(ep => ep.replace(/\D/g, '').includes(raw) || raw.includes(ep.replace(/\D/g, '')));
            if (!exists) {
              extractedPhones.push(trimmed);
            }
          }
        });

        const cleanPhones = Array.from(new Set(extractedPhones));

        sendResponse({
          success: true,
          emails: cleanEmails.slice(0, 30),
          phones: cleanPhones.slice(0, 20),
          title: document.title,
          url: window.location.href
        });
        return true;
      }
    });
  }

  // Inject floating Bot HUD on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingBotWidget);
  } else {
    injectFloatingBotWidget();
  }

})();
