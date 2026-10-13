import React from 'react';

/**
 * World-Class Modern Executive ATS Tech Resume Template
 * Recruiter-approved layout with verified SVG tech icons,
 * Google X-Y-Z quantifiable metrics, 100% ATS parse rate,
 * and compact single-page A4 layout eliminating page break gaps.
 */

export function formatPhoneNumber(phone, location = '') {
  if (!phone) return '+91 6204507166';
  let cleaned = phone.trim();
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('+')) return cleaned;
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2)}`;
  return `+91 ${cleaned}`;
}

export function formatVisibleUrl(url) {
  if (!url) return '';
  return url.trim().replace(/^https?:\/\/(www\.)?/, '');
}

export function cleanJobTitle(title) {
  if (!title) return 'SDET-I (Software Development Engineer in Test)';
  let t = title.trim();
  // If multiple titles joined by "/", keep the official primary title
  if (t.includes('/')) {
    t = t.split('/')[0].trim();
  }
  // Expand acronym for SDET / SDET-I / SDET-II on first mention
  if (/^sdet-?i$/i.test(t)) {
    return 'SDET-I (Software Development Engineer in Test)';
  }
  if (/^sdet-?ii$/i.test(t)) {
    return 'SDET-II (Software Development Engineer in Test)';
  }
  if (/^sdet$/i.test(t)) {
    return 'SDET (Software Development Engineer in Test)';
  }
  return t;
}

export function cleanBulletRoboticText(text) {
  if (!text) return '';
  // Strip any raw markdown asterisks
  const raw = text.replace(/\*\*/g, '').trim();
  const match = raw.match(/^Accomplished\s+([\s\S]+?)\s+as measured by\s+([\s\S]+?),\s+by\s+([\s\S]+)$/i);
  if (match) {
    const impact = match[1].trim();
    const metric = match[2].trim();
    let action = match[3].trim();
    const words = action.split(' ');
    const first = words[0].toLowerCase();
    const map = {
      designing: 'Designed and executed',
      performing: 'Performed',
      leveraging: 'Leveraged',
      executing: 'Executed',
      utilizing: 'Utilized',
      developing: 'Developed',
      preparing: 'Prepared',
      tracking: 'Tracked and resolved',
      implementing: 'Implemented',
      optimizing: 'Optimized',
      aligning: 'Aligned',
      enhancing: 'Enhanced',
      building: 'Built',
      architecting: 'Architected',
      integrating: 'Integrated',
      conducting: 'Conducted',
      managing: 'Managed',
      coordinating: 'Coordinated'
    };
    words[0] = map[first] || (words[0].charAt(0).toUpperCase() + words[0].slice(1));
    action = words.join(' ').replace(/\.$/, '');
    return `${action}, achieving ${impact} (${metric}).`;
  }
  return raw;
}

export function cleanSummaryAcronyms(summary) {
  if (!summary) return '';
  // Strip any raw markdown asterisks from summary
  let res = summary.replace(/\*\*/g, '').trim();
  // Expand 4+ years experience if still showing 3+
  res = res.replace(/3\+\s*years/gi, '4+ years');
  
  // Expand acronyms on first mention in summary
  if (!res.includes('IT (Information Technology)') && !res.includes('Information Technology (IT)')) {
    res = res.replace(/\bIT\b/, 'IT (Information Technology)');
  }
  if (!res.includes('SDET (Software Development Engineer in Test)') && !res.includes('Software Development Engineer in Test')) {
    res = res.replace(/\bSDET\b/, 'SDET (Software Development Engineer in Test)');
  }
  if (!res.includes('AI (Artificial Intelligence)') && !res.includes('Artificial Intelligence (AI)')) {
    res = res.replace(/\bAI\b/, 'AI (Artificial Intelligence)');
  }
  if (!res.includes('API (Application Programming Interface)') && !res.includes('Application Programming Interface (API)')) {
    res = res.replace(/\bAPI\b/, 'API (Application Programming Interface)');
  }
  return res;
}

export function renderBulletContent(text) {
  if (!text) return null;
  const processed = cleanBulletRoboticText(text);
  const clean = processed.replace(/\*\*/g, '').trim();
  return <span>{clean}</span>;
}

export default function ModernExecutiveResume({ resumeData, isInlineEditing = false }) {
  const header = resumeData?.header || {};
  const fullName = header.fullName || 'Prashant Kumar Ary';
  // Title dynamically reflects the target JD role (QA, Automation, SDET, Performance, etc.)
  const rawTitle = header.title || 'SDET-I (Software Development Engineer in Test)';
  const title = cleanJobTitle(rawTitle);
  const location = header.location || 'Bhopal, Madhya Pradesh, India';
  const email = header.email || 'prashantkumar231197@gmail.com';
  // Always include +91 country code
  const phone = formatPhoneNumber(header.phone || '6204507166', location);
  const linkedinUrl = header.linkedinUrl || 'https://linkedin.com/in/prashant-kumar-ary-336463205';
  const githubUrl = header.githubUrl || 'https://github.com/prashant231197';

  return (
    <div
      id="modern-resume-paper"
      contentEditable={isInlineEditing}
      suppressContentEditableWarning={true}
      className="bg-white text-slate-900 mx-auto shadow-2xl border border-slate-300 transition-all text-left"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        width: '100%',
        maxWidth: '780px',
        padding: '16px 26px 16px 24px',
        fontSize: '11.5px',
        lineHeight: '1.34',
        boxSizing: 'border-box',
        overflow: 'visible'
      }}
    >
      {/* ========================================================= */}
      {/* 1. EXECUTIVE HEADER (No badge, full URLs, +91 phone)      */}
      {/* ========================================================= */}
      <header style={{ borderBottom: '2px solid #0284c7', paddingBottom: '6px', marginBottom: '6px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
          <div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: '900',
                color: '#0f172a',
                letterSpacing: '-0.03em',
                margin: '0 0 2px 0',
                lineHeight: '1.15'
              }}
            >
              {fullName}
            </h1>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: '700',
                color: '#0284c7',
                letterSpacing: '-0.01em',
                margin: '0 0 4px 0',
                textTransform: 'uppercase'
              }}
            >
              {title}
            </div>
          </div>
        </div>

        {/* Contact Bar with Verified SVG Icons & Full Visible URLs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: '#334155',
            marginTop: '3px'
          }}
        >
          {/* Location */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg style={{ width: '12px', height: '12px', color: '#0284c7', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{location}</span>
          </span>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0f172a', textDecoration: 'none' }}
          >
            <svg style={{ width: '12px', height: '12px', color: '#0284c7', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span style={{ fontWeight: '500' }}>{email}</span>
          </a>

          {/* Phone (+91 Country Code) */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg style={{ width: '12px', height: '12px', color: '#0284c7', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span style={{ fontWeight: '600' }}>{phone}</span>
          </span>

          {/* LinkedIn with Full Visible URL */}
          <a
            href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0077b5', fontWeight: '500', textDecoration: 'none' }}
          >
            <svg style={{ width: '12px', height: '12px', fill: '#0077b5', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9m1.37 9.74v-8.37H5.09v8.37h2.74Z" />
            </svg>
            <span>{formatVisibleUrl(linkedinUrl)}</span>
          </a>

          {/* GitHub with Full Visible URL */}
          <a
            href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1e293b', fontWeight: '500', textDecoration: 'none' }}
          >
            <svg style={{ width: '12px', height: '12px', fill: '#1e293b', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
            </svg>
            <span>{formatVisibleUrl(githubUrl)}</span>
          </a>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. EXECUTIVE SUMMARY (4+ Years Experience)                */}
      {/* ========================================================= */}
      <section style={{ marginBottom: '7px' }}>
        <h2
          className="avoid-break"
          style={{
            fontSize: '12px',
            fontWeight: '800',
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #cbd5e1',
            paddingBottom: '2px',
            marginBottom: '4px',
            width: '100%',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            pageBreakAfter: 'avoid',
            breakAfter: 'avoid'
          }}
        >
          Professional Summary
        </h2>
        <p
          className="avoid-break"
          style={{
            fontSize: '11.5px',
            color: '#334155',
            lineHeight: '1.34',
            textAlign: 'justify',
            textJustify: 'inter-word',
            margin: 0,
            wordBreak: 'normal',
            overflowWrap: 'break-word',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          {cleanSummaryAcronyms(resumeData?.summary)}
        </p>
      </section>

      {/* ========================================================= */}
      {/* 3. TECHNICAL SKILLS & COMPETENCIES (Compact 2-col format) */}
      {/* ========================================================= */}
      <section style={{ marginBottom: '7px' }}>
        <h2
          className="avoid-break"
          style={{
            fontSize: '12px',
            fontWeight: '800',
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #cbd5e1',
            paddingBottom: '2px',
            marginBottom: '4px',
            width: '100%',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            pageBreakAfter: 'avoid',
            breakAfter: 'avoid'
          }}
        >
          Technical Competencies & Frameworks
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {(resumeData?.skills || []).map((skillGroup, idx) => {
            const rawItems = typeof skillGroup.items === 'string'
              ? skillGroup.items
              : (Array.isArray(skillGroup.items) ? skillGroup.items.join(', ') : '');
            const cleanItems = rawItems.replace(/\.$/, '').trim();

            return (
              <div
                key={idx}
                className="skill-row avoid-break"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '195px 1fr',
                  gap: '6px',
                  fontSize: '11px',
                  lineHeight: '1.35',
                  alignItems: 'baseline',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  marginBottom: '1px',
                  paddingRight: '4px'
                }}
              >
                <strong style={{ color: '#0f172a', fontWeight: '700' }}>
                  {skillGroup.category}:
                </strong>
                <span style={{ color: '#334155' }}>
                  {cleanItems}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PROFESSIONAL WORK EXPERIENCE (Fintech & Payments)      */}
      {/* ========================================================= */}
      <section style={{ marginBottom: '7px' }}>
        {(resumeData?.experience || []).map((exp, idx) => {
          const expRole = cleanJobTitle(exp.role);

          return (
            <div key={idx} className="exp-block" style={{ marginBottom: '7px' }}>
              {/* If first experience item, bind the section header together with the role to prevent orphan headers */}
              {idx === 0 ? (
                <div
                  className="avoid-break"
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    marginBottom: '4px'
                  }}
                >
                  <h2
                    style={{
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#0f172a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #cbd5e1',
                      paddingBottom: '2px',
                      marginBottom: '4px',
                      width: '100%'
                    }}
                  >
                    Professional Experience
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                      {expRole}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', whiteSpace: 'nowrap' }}>
                      {exp.companyAndDuration?.includes('–') ? exp.companyAndDuration.split('–')[1]?.replace(')', '').trim() : 'Aug 2022 – Present'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: '#475569', fontSize: '11px', fontWeight: '600' }}>
                    <span>{exp.companyAndDuration}</span>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>Full-time • On-site/Hybrid</span>
                  </div>
                </div>
              ) : (
                <div
                  className="avoid-break"
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                      {expRole}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', whiteSpace: 'nowrap' }}>
                      {exp.companyAndDuration?.includes('–') ? exp.companyAndDuration.split('–')[1]?.replace(')', '').trim() : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: '#475569', fontSize: '11px', fontWeight: '600' }}>
                    <span>{exp.companyAndDuration}</span>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>Full-time • On-site/Hybrid</span>
                  </div>
                </div>
              )}

              {/* Plain "-" bullets with complete phrases only & strict pagebreak avoidance */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {(exp.bullets || []).map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    className="avoid-break"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '5px',
                      fontSize: '11.5px',
                      color: '#334155',
                      lineHeight: '1.34',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid'
                    }}
                  >
                    <span style={{ color: '#475569', fontWeight: 'bold', fontSize: '11.5px', lineHeight: '1.34', userSelect: 'none', flexShrink: 0 }}>-</span>
                    <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', textAlign: 'justify', textJustify: 'inter-word', flex: 1 }}>{renderBulletContent(bullet)}</div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* ========================================================= */}
      {/* 5. FEATURED AUTOMATION SYSTEMS & PROJECTS (Corecredit V2) */}
      {/* ========================================================= */}
      <section style={{ marginBottom: '7px' }}>
        {(resumeData?.projects || []).map((proj, idx) => (
          <div key={idx} className="proj-block" style={{ marginBottom: '6px' }}>
            {/* If first project, bind section header together with project title */}
            {idx === 0 ? (
              <div
                className="avoid-break"
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  marginBottom: '2px'
                }}
              >
                <h2
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #cbd5e1',
                    paddingBottom: '2px',
                    marginBottom: '4px',
                    width: '100%'
                  }}
                >
                  Key Projects & Automation Architectures
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                    {proj.title}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                    Enterprise Production
                  </span>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>
                  Roles & Deliverables:
                </div>
              </div>
            ) : (
              <div
                className="avoid-break"
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  marginBottom: '2px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                    {proj.title}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                    Enterprise Production
                  </span>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>
                  Roles & Deliverables:
                </div>
              </div>
            )}

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {(proj.rolesAndResponsibilities || []).map((resp, rIdx) => (
                <li
                  key={rIdx}
                  className="avoid-break"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '5px',
                    fontSize: '11px',
                    color: '#334155',
                    lineHeight: '1.33',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <span style={{ color: '#475569', fontWeight: 'bold', fontSize: '11px', lineHeight: '1.33', userSelect: 'none', flexShrink: 0 }}>-</span>
                  <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', textAlign: 'justify', textJustify: 'inter-word', flex: 1 }}>{renderBulletContent(resp)}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ========================================================= */}
      {/* 6. EDUCATION & CREDENTIALS                                */}
      {/* ========================================================= */}
      <section className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h2
          className="avoid-break"
          style={{
            fontSize: '12px',
            fontWeight: '800',
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #cbd5e1',
            paddingBottom: '2px',
            marginBottom: '4px',
            width: '100%',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            pageBreakAfter: 'avoid',
            breakAfter: 'avoid'
          }}
        >
          Education & Academic Foundation
        </h2>

        {(resumeData?.education || []).map((edu, idx) => (
          <div key={idx} className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                {edu.institution}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>
                {edu.duration}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: '500' }}>
              {edu.degree}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
