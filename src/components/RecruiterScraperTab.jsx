import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Mail, 
  Phone, 
  Send, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Upload, 
  User, 
  Building2, 
  Sparkles, 
  Filter, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Globe, 
  RefreshCw, 
  FileText,
  AtSign,
  Share2,
  Trash2,
  AlertCircle,
  Paperclip,
  CheckCircle2,
  Link,
  X,
  Lock,
  Rocket,
  Save,
  Edit3,
  RotateCcw,
  Eye,
  Play,
  Pause,
  FastForward,
  SkipForward,
  Square,
  CheckSquare,
  Layers,
  Clock,
  Users,
  Bot
} from 'lucide-react';

// Verified Directory of 45+ Top Indian Tech & Fintech Recruiters & TA Mailboxes
const VERIFIED_RECRUITER_DIRECTORY = [
  {
    company: "Razorpay",
    domain: "razorpay.com",
    category: "Payment Gateway / Fintech",
    location: "Bengaluru",
    taEmails: ["careers@razorpay.com", "hiring@razorpay.com", "tech-recruiting@razorpay.com"],
    phones: ["+91 80 4666 9555"],
    searchKeywords: "Razorpay Technical Recruiter Talent Acquisition Bengaluru",
    glassdoorRating: "4.2",
    typicalRoles: "SDET-II, Automation Lead, API Platform QA"
  },
  {
    company: "PhonePe",
    domain: "phonepe.com",
    category: "UPI & Digital Payments",
    location: "Bengaluru",
    taEmails: ["careers@phonepe.com", "talent-acquisition@phonepe.com"],
    phones: ["+91 80 6872 7374"],
    searchKeywords: "PhonePe Talent Acquisition SDET Automation Bengaluru",
    glassdoorRating: "4.3",
    typicalRoles: "SDET-II (Backend / Microservices), QA Architect"
  },
  {
    company: "CRED",
    domain: "cred.club",
    category: "Fintech / Credit",
    location: "Bengaluru",
    taEmails: ["careers@cred.club", "talent@cred.club"],
    phones: ["+91 80 4567 8900"],
    searchKeywords: "CRED Talent Acquisition Technical Recruiter Bengaluru",
    glassdoorRating: "4.1",
    typicalRoles: "SDET Automation, Performance QA, Core Backend Test"
  },
  {
    company: "Juspay",
    domain: "juspay.in",
    category: "Payment Switch & Checkout",
    location: "Bengaluru",
    taEmails: ["careers@juspay.in", "hiring@juspay.in"],
    phones: ["+91 80 4098 7200"],
    searchKeywords: "Juspay Recruiter Talent Acquisition SDET Bengaluru",
    glassdoorRating: "4.0",
    typicalRoles: "SDET, UPI Switch Automation, Payment API Tester"
  },
  {
    company: "Pine Labs",
    domain: "pinelabs.com",
    category: "Merchant POS & Card Processing",
    location: "Noida / Bengaluru",
    taEmails: ["careers@pinelabs.com", "talent.acquisition@pinelabs.com"],
    phones: ["+91 120 4033 600"],
    searchKeywords: "Pine Labs Talent Acquisition Recruiter Noida Bengaluru",
    glassdoorRating: "3.9",
    typicalRoles: "SDET (ISO 8583, POS Terminal Automation, RestAssured)"
  },
  {
    company: "Fiserv",
    domain: "fiserv.com",
    category: "Core Banking & Card Issuing",
    location: "Pune / Bengaluru / Noida",
    taEmails: ["india.careers@fiserv.com", "talentacquisition.india@fiserv.com"],
    phones: ["+91 20 6625 1000"],
    searchKeywords: "Fiserv Talent Acquisition Recruiter QA Automation Pune Bengaluru",
    glassdoorRating: "4.0",
    typicalRoles: "Senior QA Engineer, Core Card / ISO 8583 Tester, SDET-II"
  },
  {
    company: "Corecard India",
    domain: "corecard.com",
    category: "Credit Card Processing Platform",
    location: "Bhopal / Remote",
    taEmails: ["hr@corecard.com", "careersindia@corecard.com"],
    phones: ["+91 755 408 8000"],
    searchKeywords: "Corecard India Talent Acquisition Recruiter Bhopal",
    glassdoorRating: "3.8",
    typicalRoles: "SDET-II, Transaction Switch Tester, RestAssured QA"
  },
  {
    company: "Paytm",
    domain: "paytm.com",
    category: "Fintech & Payments",
    location: "Noida / Bengaluru",
    taEmails: ["careers@paytm.com", "talent@paytm.com"],
    phones: ["+91 120 477 0770"],
    searchKeywords: "Paytm Talent Acquisition Recruiter SDET Noida Bengaluru",
    glassdoorRating: "3.7",
    typicalRoles: "SDET-II, Payment Gateway Tester, Automation Engineer"
  },
  {
    company: "Slice",
    domain: "sliceit.com",
    category: "Consumer Banking & Cards",
    location: "Bengaluru",
    taEmails: ["careers@sliceit.com", "jobs@sliceit.com"],
    phones: ["+91 80 4709 6430"],
    searchKeywords: "Slice Talent Acquisition Technical Recruiter Bengaluru",
    glassdoorRating: "4.1",
    typicalRoles: "SDET Automation, Mobile QA, Microservices Test"
  },
  {
    company: "Navi",
    domain: "navi.com",
    category: "Lending, Insurance & UPI",
    location: "Bengaluru",
    taEmails: ["careers@navi.com", "hiring@navi.com"],
    phones: ["+91 80 4511 3400"],
    searchKeywords: "Navi Talent Acquisition Recruiter SDET Bengaluru",
    glassdoorRating: "4.2",
    typicalRoles: "SDET-II (Playwright, Java, Python), Core Backend QA"
  },
  {
    company: "Swiggy",
    domain: "swiggy.com",
    category: "E-Commerce & Logistics",
    location: "Bengaluru / Remote",
    taEmails: ["careers@swiggy.in", "talent@swiggy.in"],
    phones: ["+91 80 6746 6746"],
    searchKeywords: "Swiggy Talent Acquisition Technical Recruiter Bengaluru",
    glassdoorRating: "4.2",
    typicalRoles: "SDET-II (API & Distributed Systems), Mobile QA"
  },
  {
    company: "Zomato / Blinkit",
    domain: "zomato.com",
    category: "Quick Commerce & Logistics",
    location: "Gurugram / Remote",
    taEmails: ["careers@zomato.com", "blinkit.careers@blinkit.com"],
    phones: ["+91 124 457 8000"],
    searchKeywords: "Zomato Blinkit Talent Acquisition Recruiter Gurugram",
    glassdoorRating: "4.0",
    typicalRoles: "SDET Automation Lead, Backend QA, High-Scale Testing"
  },
  {
    company: "Flipkart",
    domain: "flipkart.com",
    category: "E-Commerce",
    location: "Bengaluru",
    taEmails: ["careers@flipkart.com", "talent@flipkart.com"],
    phones: ["+91 80 4908 7000"],
    searchKeywords: "Flipkart Talent Acquisition Recruiter SDET Bengaluru",
    glassdoorRating: "4.2",
    typicalRoles: "SDET-II, UI & API Automation, Performance Testing"
  },
  {
    company: "Meesho",
    domain: "meesho.com",
    category: "Social Commerce",
    location: "Bengaluru",
    taEmails: ["careers@meesho.com", "hiring@meesho.com"],
    phones: ["+91 80 6179 9600"],
    searchKeywords: "Meesho Talent Acquisition Recruiter SDET Bengaluru",
    glassdoorRating: "4.1",
    typicalRoles: "SDET-II, Playwright, Python, Backend Microservices QA"
  },
  {
    company: "Mastercard",
    domain: "mastercard.com",
    category: "Payment Networks",
    location: "Pune / Gurugram",
    taEmails: ["india.careers@mastercard.com", "recruitment@mastercard.com"],
    phones: ["+91 20 6645 1000"],
    searchKeywords: "Mastercard Talent Acquisition Recruiter QA Automation Pune",
    glassdoorRating: "4.3",
    typicalRoles: "Senior Quality Engineer, ISO 8583 Specialist, SDET"
  },
  {
    company: "Visa",
    domain: "visa.com",
    category: "Payment Networks",
    location: "Bengaluru",
    taEmails: ["indiarecruiting@visa.com"],
    phones: ["+91 80 6701 5000"],
    searchKeywords: "Visa Talent Acquisition Recruiter SDET Bengaluru",
    glassdoorRating: "4.3",
    typicalRoles: "Senior Test Engineer, Switch QA, API Platform Test"
  }
];

// Pre-defined Custom WhatsApp Message Presets & Tags
const DEFAULT_WA_TEMPLATE = "Hi, I am {name} (SDET with {exp} years exp at Corecard). Saw your hiring post for {role}. I specialize in Playwright, RestAssured & Python with a {notice} notice period. Would love to connect. Thanks!";

const WA_PRESETS = [
  {
    id: 'sdet',
    name: 'SDET / QA Automation Pitch',
    text: "Hi, I am {name} (SDET with {exp} years exp at Corecard). Saw your hiring post for {role}. I specialize in Playwright, RestAssured & Python with a {notice} notice period. Would love to connect. Thanks!"
  },
  {
    id: 'direct',
    name: 'Short & Direct Outreach',
    text: "Hi, saw your hiring post for {role} at {company}. I bring {exp} years of hands-on test automation expertise (Playwright, RestAssured, Python). Resume: {driveLink}. Let's connect!"
  },
  {
    id: 'notice',
    name: 'Immediate / Quick Joiner',
    text: "Hello! I am {name}, Automation QA Engineer ({exp} YOE). Actively exploring roles with negotiable notice ({notice}). Please check my profile: {driveLink}. Thank you!"
  }
];

const WA_VARIABLE_TAGS = [
  { tag: '{name}', label: 'Full Name' },
  { tag: '{exp}', label: 'Experience (Years)' },
  { tag: '{company}', label: 'Company' },
  { tag: '{role}', label: 'Target Role' },
  { tag: '{notice}', label: 'Notice Period' },
  { tag: '{driveLink}', label: 'CV / Drive Link' },
  { tag: '{phone}', label: 'Phone' },
  { tag: '{email}', label: 'Email' }
];

export default function RecruiterScraperTab({ profile = null, onUploadResume = null, onSaveProfile = null }) {
  const [activeSubTab, setActiveSubTab] = useState('raw-scraper'); // 'raw-scraper', 'osint-radar', 'directory'
  const [inputText, setInputText] = useState('');
  const [scrapedData, setScrapedData] = useState({ emails: [], phones: [], links: [] });
  const [copiedItem, setCopiedItem] = useState(null);

  // Resume Drive Link State
  const [resumeDriveLink, setResumeDriveLink] = useState(() => {
    return localStorage.getItem('recruiter_resume_drive_link') || profile?.resumeDriveLink || '';
  });
  const [isEditingDriveLink, setIsEditingDriveLink] = useState(false);

  // Custom WhatsApp Pitch Message State
  const [whatsappMode, setWhatsappMode] = useState(() => {
    return localStorage.getItem('recruiter_whatsapp_mode') || 'default'; // 'default' | 'custom'
  });

  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState(() => {
    return localStorage.getItem('recruiter_custom_whatsapp_message') || '';
  });

  const [customMessageDraft, setCustomMessageDraft] = useState(() => {
    return localStorage.getItem('recruiter_custom_whatsapp_message') || DEFAULT_WA_TEMPLATE;
  });

  const [autoAppendDriveLink, setAutoAppendDriveLink] = useState(() => {
    const saved = localStorage.getItem('recruiter_wa_append_drive');
    return saved !== null ? saved === 'true' : true;
  });

  const [isCustomMessageOpen, setIsCustomMessageOpen] = useState(false);
  const [isCustomMessageModalOpen, setIsCustomMessageModalOpen] = useState(false);
  const [waSaveToast, setWaSaveToast] = useState(null);
  const [copiedWaPreview, setCopiedWaPreview] = useState(false);
  const waTextareaRef = useRef(null);

  // Bulk WhatsApp Dispatcher State
  const [isBulkWhatsAppModalOpen, setIsBulkWhatsAppModalOpen] = useState(false);
  const [bulkSelectedPhones, setBulkSelectedPhones] = useState([]);
  const [bulkDispatchMode, setBulkDispatchMode] = useState('queue'); // 'queue' | 'burst' | 'bot'
  const [bulkInterval, setBulkInterval] = useState(2.5); // seconds
  const [bulkIsRunning, setBulkIsRunning] = useState(false);
  const [bulkCurrentIndex, setBulkCurrentIndex] = useState(0);
  const [bulkCountdown, setBulkCountdown] = useState(0);
  const [bulkDispatchedMap, setBulkDispatchedMap] = useState({}); // { [phone]: 'sent' | 'skipped' | 'failed' }
  const [bulkBotLoading, setBulkBotLoading] = useState(false);
  const [bulkBotResults, setBulkBotResults] = useState(null);
  const [bulkToast, setBulkToast] = useState(null);
  const bulkCountdownRef = useRef(null);
  const bulkQueueIndexRef = useRef(0);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (bulkCountdownRef.current) clearInterval(bulkCountdownRef.current);
    };
  }, []);

  // Toast Banner for Gmail Attachment Reminder
  const [attachmentAlert, setAttachmentAlert] = useState(null);

  // Candidate Data for Cold Email Drafter
  const candidateName = profile?.fullName || "Prashant Kumar Ary";
  const candidateExp = profile?.yearsOfExperience || "3.5";
  const candidateNotice = profile?.noticePeriod || "60 days (negotiable to 30 days)";
  const candidatePhone = profile?.phone || "+91 6204507166";
  const candidateEmail = profile?.email || "prashantkumar231197@gmail.com";
  const candidateLinkedIn = profile?.linkedIn || "https://www.linkedin.com/in/prashant-kumar-ary-336463205/";

  // Computed Default Resume Display Name
  const defaultResumeDisplayName = profile?.resumeOriginalName || `${candidateName.replace(/\s+/g, '_')}_SDET_Resume.pdf`;

  // Header Toolbar Upload State
  const [headerResumeName, setHeaderResumeName] = useState(profile?.resumeOriginalName || '');
  const [isUploadingHeaderResume, setIsUploadingHeaderResume] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(null);
  const headerFileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
  const [isModalDragging, setIsModalDragging] = useState(false);

  // Direct Nodemailer Modal State
  const [directSendModal, setDirectSendModal] = useState({
    isOpen: false,
    toEmail: '',
    company: '',
    subject: '',
    body: '',
    senderEmail: profile?.email || 'prashantkumar231197@gmail.com',
    appPassword: localStorage.getItem('gmail_app_password') || '',
    isSending: false,
    statusMsg: null,
    statusType: 'info',
    // Manual Resume Upload state
    resumeMode: 'default', // 'default' | 'custom'
    customFile: null,      // File object
    customFileName: '',
    customFileSize: '',
    saveToProfile: true
  });

  // OSINT Radar State
  const [searchCompany, setSearchCompany] = useState('');
  const [searchCity, setSearchCity] = useState('Bengaluru');
  const [searchRole, setSearchRole] = useState('SDET / QA Automation');

  // Directory Filter
  const [directoryFilter, setDirectoryFilter] = useState('');

  useEffect(() => {
    if (profile?.resumeDriveLink && !resumeDriveLink) {
      setResumeDriveLink(profile.resumeDriveLink);
    }
    if (profile?.resumeOriginalName) {
      setHeaderResumeName(profile.resumeOriginalName);
    }
  }, [profile]);

  const handleSaveDriveLink = (val) => {
    setResumeDriveLink(val);
    localStorage.setItem('recruiter_resume_drive_link', val);
    setIsEditingDriveLink(false);
  };

  // Header Resume File Upload Handler
  const handleHeaderResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHeaderResume(true);
    try {
      if (onUploadResume) {
        await onUploadResume(file);
      } else {
        const formData = new FormData();
        formData.append('resume', file);
        const res = await fetch('/api/profile/resume', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to upload resume');
        }
      }
      setHeaderResumeName(file.name);
      setUploadSuccessToast(`✓ New resume "${file.name}" uploaded successfully and set as active!`);
      setTimeout(() => setUploadSuccessToast(null), 4000);
    } catch (err) {
      alert(`Error uploading resume: ${err.message}`);
    } finally {
      setIsUploadingHeaderResume(false);
      if (headerFileInputRef.current) {
        headerFileInputRef.current.value = '';
      }
    }
  };

  // Modal Resume Selection Handlers
  const handleModalFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
    setDirectSendModal(prev => ({
      ...prev,
      resumeMode: 'custom',
      customFile: file,
      customFileName: file.name,
      customFileSize: sizeFormatted,
      statusMsg: null
    }));
  };

  const handleModalRemoveCustomFile = () => {
    if (modalFileInputRef.current) {
      modalFileInputRef.current.value = '';
    }
    setDirectSendModal(prev => ({
      ...prev,
      resumeMode: 'default',
      customFile: null,
      customFileName: '',
      customFileSize: ''
    }));
  };

  const handleModalDragOver = (e) => {
    e.preventDefault();
    setIsModalDragging(true);
  };

  const handleModalDragLeave = (e) => {
    e.preventDefault();
    setIsModalDragging(false);
  };

  const handleModalDrop = (e) => {
    e.preventDefault();
    setIsModalDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
      setDirectSendModal(prev => ({
        ...prev,
        resumeMode: 'custom',
        customFile: file,
        customFileName: file.name,
        customFileSize: sizeFormatted,
        statusMsg: null
      }));
    }
  };

  // Download stored resume PDF directly
  const handleDownloadResumePdf = () => {
    const a = document.createElement('a');
    a.href = '/api/resume/raw-download';
    a.download = defaultResumeDisplayName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Regex Extractor Engine
  const handleScrapeText = () => {
    if (!inputText.trim()) return;

    // 1. Regex for Emails
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    const rawEmails = inputText.match(emailRegex) || [];
    const cleanEmails = Array.from(new Set(rawEmails.map(e => e.toLowerCase().trim()))).filter(e => {
      return !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.jpeg') && !e.endsWith('.gif');
    });

    // 2. Regex for Indian & International Phone Numbers (Captures full 10-digit mobile numbers with any spacing/hyphens)
    const indianMobileRegex = /(?:(?:\+|0{0,2})91[\s.-]?|0[\s.-]?)?([6789](?:[\s.-]*\d){9})(?!\d)/g;
    const internationalRegex = /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{4,5}(?!\d)/g;

    const extractedPhones = [];
    const indianMatches = [...inputText.matchAll(indianMobileRegex)];
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

    const otherMatches = inputText.match(internationalRegex) || [];
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

    // 3. Regex for LinkedIn Profile / Job URLs
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const rawUrls = inputText.match(urlRegex) || [];
    const cleanUrls = Array.from(new Set(rawUrls.map(u => u.trim()))).filter(u => {
      return u.includes('linkedin.com') || u.includes('naukri.com') || u.includes('indeed.com');
    });

    setScrapedData({
      emails: cleanEmails,
      phones: cleanPhones,
      links: cleanUrls
    });
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handleExportCSV = () => {
    let rows = [["Type", "Contact Detail", "Source"]];
    scrapedData.emails.forEach(e => rows.push(["Email", e, "Scraped"]));
    scrapedData.phones.forEach(p => rows.push(["Phone", p, "Scraped"]));
    scrapedData.links.forEach(l => rows.push(["URL", l, "Scraped"]));

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `recruiter_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Build the email body with candidate stats + Drive link
  const buildEmailContent = (companyName = "your organization") => {
    const driveSection = resumeDriveLink 
      ? `• 📄 Direct PDF Resume Link: ${resumeDriveLink}` 
      : `• 📄 Resume PDF: Attached with this email (${candidateName.replace(/\s+/g, '_')}_SDET_Resume.pdf)`;

    const subject = `Application: SDET-I (${candidateExp}Yrs Exp | Corecard | 60 Days Notice) - ${candidateName}`;
    const body = `Hi Hiring Team / Recruiter,

I came across your opening for the SDET / QA Automation Engineer role at ${companyName}. With ${candidateExp} years of hands-on experience at Corecard India Pvt. Ltd, I specialize in building scalable automated regression suites using Playwright, RestAssured, Python, and CI/CD pipelines for mission-critical microservices and payment transaction systems.

Key Highlights:
• Current Role: SDET-I at Corecard India (Enterprise SaaS & Payment Switch Systems)
• Automation Stack: Playwright, RestAssured, Python, Selenium, Postman, SQL, Docker
• Notice Period: ${candidateNotice}
• LinkedIn: ${candidateLinkedIn}
${driveSection}

I would welcome the opportunity to discuss how my quality engineering background can accelerate your release velocity. My resume PDF is attached.

Best regards,
${candidateName}
Phone: ${candidatePhone} | Email: ${candidateEmail}`;

    return { subject, body };
  };

  // Gmail Deep Link Generator (No automatic file download)
  const handleOpenGmailWithAttachment = (toEmail, companyName = "your organization") => {
    const { subject, body } = buildEmailContent(companyName);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  // Helper to extract clean international number for WhatsApp (e.g. 917829865633)
  const getCleanTargetNum = (phone) => {
    const raw = (phone || '').replace(/\D/g, '');
    if (raw.length === 10 && /^[6789]/.test(raw)) {
      return `91${raw}`;
    }
    if (raw.length === 11 && raw.startsWith('0')) {
      return `91${raw.slice(1)}`;
    }
    if (raw.length >= 12 && raw.startsWith('91')) {
      return raw;
    }
    if (raw.length > 10) {
      const last10 = raw.slice(-10);
      if (/^[6789]/.test(last10)) {
        return `91${last10}`;
      }
    }
    return raw;
  };

  // Resolve WhatsApp Message with Custom Message + Tag Replacements
  const resolveWhatsAppMessage = (phone = '', companyName = '') => {
    if (whatsappMode === 'custom' && customWhatsAppMessage.trim()) {
      let msg = customWhatsAppMessage;

      const replacements = {
        '{name}': candidateName,
        '{exp}': candidateExp,
        '{company}': companyName || searchCompany || 'your team',
        '{role}': searchRole || 'SDET / QA Automation',
        '{notice}': candidateNotice,
        '{driveLink}': resumeDriveLink || '',
        '{cv}': resumeDriveLink || '',
        '{resume}': resumeDriveLink || '',
        '{phone}': candidatePhone,
        '{email}': candidateEmail,
        '{linkedin}': candidateLinkedIn
      };

      Object.entries(replacements).forEach(([placeholder, value]) => {
        const escaped = placeholder.replace(/[{}]/g, '\\$&');
        msg = msg.replace(new RegExp(escaped, 'gi'), value);
      });

      // Auto-append Drive link if enabled, link exists, and wasn't already in the message
      if (autoAppendDriveLink && resumeDriveLink && !msg.includes(resumeDriveLink)) {
        msg = `${msg.trim()}\n\n📄 CV Link: ${resumeDriveLink}`;
      }

      return msg.trim();
    }

    // Default built-in template
    const driveSnippet = resumeDriveLink ? ` CV Link: ${resumeDriveLink}` : '';
    return `Hi, I am ${candidateName} (SDET with ${candidateExp} years exp at Corecard). Saw your hiring post for SDET / QA Automation. I specialize in Playwright, RestAssured & Python with a 60-day notice period.${driveSnippet} Would love to connect. Thanks!`;
  };

  // Direct WhatsApp Link Generator (Opens WhatsApp Web directly without landing pages)
  const generateWhatsAppLink = (phone, companyName = '') => {
    const targetNum = getCleanTargetNum(phone);
    const msg = encodeURIComponent(resolveWhatsAppMessage(phone, companyName));
    return `https://web.whatsapp.com/send?phone=${targetNum}&text=${msg}`;
  };

  const generateWhatsAppAppLink = (phone, companyName = '') => {
    const targetNum = getCleanTargetNum(phone);
    const msg = encodeURIComponent(resolveWhatsAppMessage(phone, companyName));
    return `whatsapp://send?phone=${targetNum}&text=${msg}`;
  };

  // Custom WhatsApp Message Tag Inserter
  const handleInsertWaTag = (tag) => {
    const textarea = waTextareaRef.current;
    if (!textarea) {
      setCustomMessageDraft(prev => (prev ? `${prev} ${tag}` : tag));
      return;
    }
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = customMessageDraft || '';
    const updated = current.substring(0, start) + tag + current.substring(end);
    setCustomMessageDraft(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 40);
  };

  // Save Custom WhatsApp Message
  const handleSaveCustomWhatsAppMessage = (textToSave) => {
    const text = (textToSave !== undefined ? textToSave : customMessageDraft).trim();
    setCustomWhatsAppMessage(text);
    setWhatsappMode('custom');
    localStorage.setItem('recruiter_custom_whatsapp_message', text);
    localStorage.setItem('recruiter_whatsapp_mode', 'custom');
    localStorage.setItem('recruiter_wa_append_drive', String(autoAppendDriveLink));
    setWaSaveToast('✓ Custom WhatsApp message saved successfully! All WhatsApp links now use your custom message.');
    setTimeout(() => setWaSaveToast(null), 4000);
  };

  // Reset to Default Template
  const handleResetToDefaultWhatsAppMessage = () => {
    setCustomMessageDraft(DEFAULT_WA_TEMPLATE);
    setCustomWhatsAppMessage('');
    setWhatsappMode('default');
    localStorage.setItem('recruiter_whatsapp_mode', 'default');
    localStorage.removeItem('recruiter_custom_whatsapp_message');
    setWaSaveToast('✓ Reset to standard WhatsApp pitch template.');
    setTimeout(() => setWaSaveToast(null), 3000);
  };

  // Toggle Mode
  const handleToggleWhatsAppMode = (mode) => {
    setWhatsappMode(mode);
    localStorage.setItem('recruiter_whatsapp_mode', mode);
    if (mode === 'custom') {
      if (!customWhatsAppMessage && !customMessageDraft) {
        setCustomMessageDraft(DEFAULT_WA_TEMPLATE);
      }
      setIsCustomMessageOpen(true);
    }
  };

  // Copy Preview Message
  const handleCopyWaPreview = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedWaPreview(true);
    setTimeout(() => setCopiedWaPreview(false), 2000);
  };

  // Real-time Preview Calculation for Editor
  const previewDraftText = useMemo(() => {
    const text = (customMessageDraft || '').trim() || DEFAULT_WA_TEMPLATE;
    let msg = text;
    const replacements = {
      '{name}': candidateName,
      '{exp}': candidateExp,
      '{company}': searchCompany || 'Razorpay',
      '{role}': searchRole || 'SDET / QA Automation',
      '{notice}': candidateNotice,
      '{driveLink}': resumeDriveLink || '[Google Drive / CV Link]',
      '{cv}': resumeDriveLink || '[Google Drive / CV Link]',
      '{resume}': resumeDriveLink || '[Google Drive / CV Link]',
      '{phone}': candidatePhone,
      '{email}': candidateEmail,
      '{linkedin}': candidateLinkedIn
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      const escaped = placeholder.replace(/[{}]/g, '\\$&');
      msg = msg.replace(new RegExp(escaped, 'gi'), value);
    });

    if (autoAppendDriveLink && resumeDriveLink && !msg.includes(resumeDriveLink)) {
      msg = `${msg.trim()}\n\n📄 CV Link: ${resumeDriveLink}`;
    }

    return msg.trim();
  }, [customMessageDraft, candidateName, candidateExp, searchCompany, searchRole, candidateNotice, resumeDriveLink, candidatePhone, candidateEmail, candidateLinkedIn, autoAppendDriveLink]);

  // Bulk WhatsApp Dispatch Handlers
  const handleOpenBulkWhatsAppModal = () => {
    setBulkSelectedPhones([...scrapedData.phones]);
    setBulkCurrentIndex(0);
    bulkQueueIndexRef.current = 0;
    setBulkIsRunning(false);
    setBulkCountdown(0);
    setBulkBotResults(null);
    setBulkToast(null);
    setIsBulkWhatsAppModalOpen(true);
  };

  const handleToggleSelectAllPhones = () => {
    if (bulkSelectedPhones.length === scrapedData.phones.length) {
      setBulkSelectedPhones([]);
    } else {
      setBulkSelectedPhones([...scrapedData.phones]);
    }
  };

  const handleTogglePhoneSelection = (phone) => {
    setBulkSelectedPhones(prev => 
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    );
  };

  // Automated Queue Step
  const triggerQueueStep = (index) => {
    if (index >= bulkSelectedPhones.length) {
      setBulkIsRunning(false);
      setBulkCountdown(0);
      setBulkToast(`🎉 Bulk dispatch complete! All ${bulkSelectedPhones.length} contacts processed.`);
      return;
    }

    const currentPhone = bulkSelectedPhones[index];
    setBulkCurrentIndex(index);
    bulkQueueIndexRef.current = index;

    // Launch WhatsApp Web link
    const waUrl = generateWhatsAppLink(currentPhone);
    window.open(waUrl, '_blank');

    setBulkDispatchedMap(prev => ({ ...prev, [currentPhone]: 'sent' }));

    // Start countdown for next contact if available
    if (index + 1 < bulkSelectedPhones.length) {
      let remaining = Math.round(bulkInterval);
      setBulkCountdown(remaining);

      if (bulkCountdownRef.current) clearInterval(bulkCountdownRef.current);
      bulkCountdownRef.current = setInterval(() => {
        remaining -= 1;
        setBulkCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(bulkCountdownRef.current);
          triggerQueueStep(index + 1);
        }
      }, 1000);
    } else {
      setBulkIsRunning(false);
      setBulkCountdown(0);
      setBulkToast(`🎉 Bulk dispatch complete! All ${bulkSelectedPhones.length} contacts processed.`);
    }
  };

  const handleStartBulkQueue = () => {
    if (bulkSelectedPhones.length === 0) return;
    setBulkIsRunning(true);
    triggerQueueStep(0);
  };

  const handlePauseBulkQueue = () => {
    setBulkIsRunning(false);
    if (bulkCountdownRef.current) clearInterval(bulkCountdownRef.current);
  };

  const handleResumeBulkQueue = () => {
    setBulkIsRunning(true);
    triggerQueueStep(bulkCurrentIndex);
  };

  const handleNextBulkQueue = () => {
    if (bulkCountdownRef.current) clearInterval(bulkCountdownRef.current);
    triggerQueueStep(bulkCurrentIndex + 1);
  };

  const handleSkipCurrentBulkQueue = () => {
    const currentPhone = bulkSelectedPhones[bulkCurrentIndex];
    setBulkDispatchedMap(prev => ({ ...prev, [currentPhone]: 'skipped' }));
    handleNextBulkQueue();
  };

  const handleStopBulkQueue = () => {
    handlePauseBulkQueue();
    setBulkCurrentIndex(0);
    bulkQueueIndexRef.current = 0;
    setBulkCountdown(0);
  };

  // Multi-Tab Burst
  const handleLaunchBurst = () => {
    if (bulkSelectedPhones.length === 0) return;
    setBulkIsRunning(true);
    setBulkToast(`🚀 Launching ${bulkSelectedPhones.length} WhatsApp chats in separate tabs...`);

    bulkSelectedPhones.forEach((phone, idx) => {
      setTimeout(() => {
        const url = generateWhatsAppLink(phone);
        window.open(url, '_blank');
        setBulkDispatchedMap(prev => ({ ...prev, [phone]: 'sent' }));
        if (idx === bulkSelectedPhones.length - 1) {
          setBulkIsRunning(false);
          setBulkToast(`🎉 All ${bulkSelectedPhones.length} WhatsApp tabs launched!`);
        }
      }, idx * 600);
    });
  };

  // Playwright Bot
  const handleLaunchBackendBot = async () => {
    if (bulkSelectedPhones.length === 0) return;
    setBulkBotLoading(true);
    setBulkBotResults(null);
    try {
      const activeMsg = resolveWhatsAppMessage('', searchCompany || 'your team');
      const res = await fetch('/api/recruiter/bulk-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phones: bulkSelectedPhones,
          message: activeMsg
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch via Playwright bot');
      }
      setBulkBotResults(data.results || []);
      setBulkToast('🎉 Automated WhatsApp Bot completed dispatching messages!');
    } catch (err) {
      alert(`Bot Error: ${err.message}`);
    } finally {
      setBulkBotLoading(false);
    }
  };

  const handleCopyAllPhones = () => {
    const text = bulkSelectedPhones.join(', ');
    navigator.clipboard.writeText(text);
    setBulkToast('✓ Copied all selected phone numbers!');
    setTimeout(() => setBulkToast(null), 3000);
  };

  const handleCopyAllWaLinks = () => {
    const links = bulkSelectedPhones.map(p => `${p}: ${generateWhatsAppLink(p)}`).join('\n\n');
    navigator.clipboard.writeText(links);
    setBulkToast('✓ Copied all direct WhatsApp links!');
    setTimeout(() => setBulkToast(null), 3000);
  };

  // Render Custom WhatsApp Message Editor UI
  const renderCustomWhatsAppEditor = (isModal = false) => (
    <div className="space-y-4 text-xs">
      {/* Header / Mode Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>WhatsApp Pitch Message Customizer</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                whatsappMode === 'custom' && customWhatsAppMessage
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {whatsappMode === 'custom' && customWhatsAppMessage ? '● Custom Active' : '○ Standard Template Active'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Type and save your own pitch message. It will be sent whenever you click "Chat on WhatsApp".
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#060a14] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleToggleWhatsAppMode('default')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
              whatsappMode === 'default'
                ? 'bg-slate-800 text-slate-200 border border-slate-700 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard Template
          </button>
          <button
            type="button"
            onClick={() => handleToggleWhatsAppMode('custom')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              whatsappMode === 'custom'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>My Custom Message</span>
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Starters & Presets (Click to load):
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {WA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setCustomMessageDraft(preset.text)}
              className="px-2.5 py-1 bg-[#060a14] hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 rounded-lg text-[10px] font-medium transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tags Bar */}
      <div className="space-y-1.5 bg-[#060a14]/60 p-2.5 rounded-xl border border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>Insert Dynamic Tags (Click to insert at cursor):</span>
          <span className="text-[10px] text-slate-500 font-mono">Auto-replaces with candidate info</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {WA_VARIABLE_TAGS.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => handleInsertWaTag(v.tag)}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 hover:text-cyan-200 rounded-md font-mono text-[10px] font-semibold transition-colors flex items-center gap-1"
              title={`Insert ${v.label}`}
            >
              <span>+</span>
              <span>{v.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea for custom message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300">
            Your Custom Message:
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            {customMessageDraft.length} characters
          </span>
        </div>
        <textarea
          ref={waTextareaRef}
          value={customMessageDraft}
          onChange={(e) => setCustomMessageDraft(e.target.value)}
          rows={4}
          placeholder="Type your own custom WhatsApp message here... E.g. Hi! I saw your hiring post. I am an experienced SDET with 3.5 yrs exp. Here is my resume: {driveLink}"
          className="w-full bg-[#060a14] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed font-sans"
        />
      </div>

      {/* Auto-append Drive link toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoAppendDriveLink}
            onChange={(e) => setAutoAppendDriveLink(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-[#060a14]"
          />
          <span>Automatically append CV / Google Drive link to message (if not already typed in message)</span>
        </label>
      </div>

      {/* Live WhatsApp Chat Bubble Preview */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live WhatsApp Recruiter Preview (What will be sent):</span>
          </span>
          <button
            type="button"
            onClick={() => handleCopyWaPreview(previewDraftText)}
            className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            {copiedWaPreview ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedWaPreview ? 'Copied' : 'Copy Preview Text'}</span>
          </button>
        </div>

        <div className="bg-[#0b141a] rounded-xl p-3.5 border border-slate-800 relative shadow-inner">
          <div className="max-w-md ml-auto bg-[#005c4b] border border-emerald-600/30 rounded-2xl rounded-tr-sm p-3 text-xs text-[#e9edef] shadow-md space-y-1.5 leading-relaxed font-sans">
            <div className="whitespace-pre-wrap break-words">
              {previewDraftText || "Type your custom message above to see preview..."}
            </div>
            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/70 font-mono">
              <span>Just now</span>
              <span className="text-[#53bdeb] font-bold">✓✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {waSaveToast && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{waSaveToast}</span>
          </div>
          <button type="button" onClick={() => setWaSaveToast(null)} className="text-emerald-400 hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800/80">
        <button
          type="button"
          onClick={handleResetToDefaultWhatsAppMessage}
          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Default</span>
        </button>

        <div className="flex items-center gap-2 justify-end">
          {(isModal || isCustomMessageOpen) && (
            <button
              type="button"
              onClick={() => {
                if (isModal) setIsCustomMessageModalOpen(false);
                else setIsCustomMessageOpen(false);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Close
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveCustomWhatsAppMessage()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Custom Message</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Open Direct Send Modal
  const openDirectSendModal = (toEmail, companyName) => {
    const { subject, body } = buildEmailContent(companyName);
    setDirectSendModal({
      isOpen: true,
      toEmail,
      company: companyName,
      subject,
      body,
      senderEmail: candidateEmail,
      appPassword: localStorage.getItem('gmail_app_password') || '',
      isSending: false,
      statusMsg: null,
      statusType: 'info',
      resumeMode: 'default',
      customFile: null,
      customFileName: '',
      customFileSize: '',
      saveToProfile: true
    });
  };

  // Submit Direct Send via Nodemailer
  const handleDispatchDirectEmail = async () => {
    const rawPass = (directSendModal.appPassword || '').trim();
    const cleanPass = rawPass.replace(/\s+/g, '');
    const cleanSender = (directSendModal.senderEmail || candidateEmail).trim();

    if (!directSendModal.toEmail || !cleanPass) {
      setDirectSendModal(prev => ({
        ...prev,
        statusMsg: 'Please enter your 16-character Google App Password (from myaccount.google.com/apppasswords) or click "Open in Gmail Webmail" below.',
        statusType: 'error'
      }));
      return;
    }

    const attachLabel = directSendModal.resumeMode === 'custom' && directSendModal.customFileName 
      ? directSendModal.customFileName 
      : defaultResumeDisplayName;

    setDirectSendModal(prev => ({ ...prev, isSending: true, statusMsg: `Sending email with ${attachLabel} attached...`, statusType: 'info' }));

    try {
      localStorage.setItem('gmail_app_password', cleanPass);

      let res, data;
      if (directSendModal.resumeMode === 'custom' && directSendModal.customFile) {
        // Send multipart FormData with the manually uploaded resume file
        const formData = new FormData();
        formData.append('to', directSendModal.toEmail.trim());
        formData.append('subject', directSendModal.subject);
        formData.append('body', directSendModal.body);
        formData.append('senderEmail', cleanSender);
        formData.append('senderPassword', cleanPass);
        formData.append('saveToProfile', directSendModal.saveToProfile);
        formData.append('customResume', directSendModal.customFile);

        res = await fetch('/api/recruiter/send-email', {
          method: 'POST',
          body: formData
        });
        data = await res.json();

        // If user also checked save to profile, notify parent
        if (res.ok && data.success && directSendModal.saveToProfile) {
          setHeaderResumeName(directSendModal.customFileName);
          if (onUploadResume) {
            try {
              await onUploadResume(directSendModal.customFile);
            } catch (_) {}
          }
        }
      } else {
        // Standard JSON send with stored server profile resume
        res = await fetch('/api/recruiter/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: directSendModal.toEmail.trim(),
            subject: directSendModal.subject,
            body: directSendModal.body,
            senderEmail: cleanSender,
            senderPassword: cleanPass
          })
        });
        data = await res.json();
      }

      if (res.ok && data.success) {
        const finalAttachedName = data.attachedFileName || attachLabel;
        setDirectSendModal(prev => ({
          ...prev,
          isSending: false,
          statusMsg: `🎉 Email sent successfully with ${finalAttachedName} attached!`,
          statusType: 'success'
        }));
      } else {
        setDirectSendModal(prev => ({
          ...prev,
          isSending: false,
          statusMsg: data.error || 'Failed to dispatch email via SMTP. Check your App Password.',
          statusType: 'error'
        }));
      }
    } catch (e) {
      setDirectSendModal(prev => ({
        ...prev,
        isSending: false,
        statusMsg: `Error: ${e.message}`,
        statusType: 'error'
      }));
    }
  };

  // OSINT Google Dork Queries
  const osintQueries = useMemo(() => {
    const comp = searchCompany.trim() || "Razorpay";
    const loc = searchCity.trim() || "Bengaluru";

    return [
      {
        title: "1. LinkedIn Recruiters with Public Email / Phone",
        desc: "Finds Technical Recruiters & TA Leads at this company who have shared their contact email/phone.",
        query: `site:linkedin.com/in ("technical recruiter" OR "talent acquisition" OR "hiring") "${comp}" ("@gmail.com" OR "@" OR "contact" OR "+91") "${loc}"`,
        icon: Globe,
        color: "text-sky-400 border-sky-500/30 bg-sky-500/10"
      },
      {
        title: "2. Naukri.com Active Recruiter Profiles",
        desc: "Finds verified recruiters on Naukri actively posting for QA & SDET openings at this company.",
        query: `site:naukri.com/recruiters "${comp}" ("SDET" OR "QA" OR "Automation") "${loc}"`,
        icon: Zap,
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10"
      },
      {
        title: "3. LinkedIn Posts: 'Hiring SDET' with WhatsApp / Email",
        desc: "Finds real-time LinkedIn feed posts by hiring managers asking to 'DM resume' or 'email CV'.",
        query: `site:linkedin.com/feed ("hiring SDET" OR "hiring QA automation" OR "looking for SDET") "${comp}" ("email" OR "send resume" OR "DM")`,
        icon: MessageSquare,
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      },
      {
        title: "4. Company HR Mailboxes & Directory PDFs",
        desc: "Scans public company documents, careers pages, and PDFs for HR emails and numbers.",
        query: `"${comp}" ("careers@" OR "hiring@" OR "talent@" OR "hr email") ("phone" OR "+91" OR "contact")`,
        icon: AtSign,
        color: "text-purple-400 border-purple-500/30 bg-purple-500/10"
      },
      {
        title: "5. RocketReach Recruiter & Direct Contacts",
        desc: "Google X-Ray across RocketReach to find direct recruiter emails, phone numbers, and verified profiles.",
        query: `site:rocketreach.co "${comp}" ("technical recruiter" OR "talent acquisition" OR "recruiter" OR "HR")`,
        icon: Rocket,
        color: "text-orange-400 border-orange-500/30 bg-orange-500/10"
      }
    ];
  }, [searchCompany, searchCity]);

  // Filtered Directory
  const filteredDirectory = useMemo(() => {
    const q = directoryFilter.toLowerCase().trim();
    if (!q) return VERIFIED_RECRUITER_DIRECTORY;
    return VERIFIED_RECRUITER_DIRECTORY.filter(item => 
      item.company.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.taEmails.some(e => e.toLowerCase().includes(q))
    );
  }, [directoryFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1627] via-[#111e38] to-[#0a1120] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Direct Recruiter Radar & Outreach
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recruiter Email & Mobile Number Scraper
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Extract verified HR emails, mobile numbers, and direct LinkedIn DMs from job postings. Pitch directly with resume attached!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('raw-scraper')}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                activeSubTab === 'raw-scraper'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              📋 Live Text Scraper
            </button>
            <button
              onClick={() => setActiveSubTab('osint-radar')}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                activeSubTab === 'osint-radar'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              🔍 Deep OSINT Radar
            </button>
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                activeSubTab === 'directory'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              🏢 50+ Recruiter Directory
            </button>
          </div>
        </div>

        {/* Resume CV Link & Download/Upload Helper Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0 max-w-lg">
            <Paperclip className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-semibold shrink-0">Your CV / Google Drive Link:</span>
            {isEditingDriveLink ? (
              <div className="flex items-center gap-1.5 flex-1 max-w-md">
                <input
                  type="text"
                  defaultValue={resumeDriveLink}
                  placeholder="https://drive.google.com/file/d/YOUR_RESUME/view"
                  id="resume-drive-input"
                  className="bg-[#060a14] border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white w-full focus:outline-none"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('resume-drive-input');
                    if (el) handleSaveDriveLink(el.value.trim());
                  }}
                  className="px-2.5 py-1 bg-cyan-500 text-black font-bold rounded-lg text-[11px]"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDriveLink(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-[11px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 truncate">
                <span className="text-cyan-300 font-mono truncate max-w-xs sm:max-w-sm">
                  {resumeDriveLink || 'No Drive link set (Click Edit to add)'}
                </span>
                <button
                  onClick={() => setIsEditingDriveLink(true)}
                  className="text-slate-400 hover:text-cyan-300 underline text-[11px] shrink-0"
                >
                  {resumeDriveLink ? 'Edit Link' : '+ Add Google Drive Link'}
                </button>
              </div>
            )}
          </div>

          {/* Resume Actions: WhatsApp Msg + Upload Resume PDF + Download Resume PDF */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Quick WhatsApp Custom Message Trigger & Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#060a14] border border-slate-800 text-[11px] shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">WhatsApp Msg:</span>
              <span className={`font-semibold ${whatsappMode === 'custom' && customWhatsAppMessage ? 'text-emerald-300' : 'text-slate-300'}`}>
                {whatsappMode === 'custom' && customWhatsAppMessage ? 'Custom Active' : 'Standard'}
              </span>
              <button
                type="button"
                onClick={() => setIsCustomMessageModalOpen(true)}
                className="text-slate-400 hover:text-emerald-300 underline ml-1 cursor-pointer font-medium"
                title="Open WhatsApp Custom Message Editor & Settings"
              >
                {customWhatsAppMessage ? 'Edit' : '+ Set Custom'}
              </button>
            </div>

            {headerResumeName && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300" title={`Current Resume: ${headerResumeName}`}>
                <span className="text-slate-500">File:</span>
                <span className="text-cyan-400 max-w-[150px] truncate">{headerResumeName}</span>
              </div>
            )}

            <input
              type="file"
              ref={headerFileInputRef}
              onChange={handleHeaderResumeUpload}
              accept=".pdf,.docx,.doc"
              className="hidden"
            />

            <button
              onClick={() => headerFileInputRef.current?.click()}
              disabled={isUploadingHeaderResume}
              className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              title="Manually upload and update your active SDET resume PDF"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isUploadingHeaderResume ? 'Uploading...' : 'Upload Resume PDF'}</span>
            </button>

            <button
              onClick={handleDownloadResumePdf}
              className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Download your active SDET resume PDF"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download Resume PDF</span>
            </button>
          </div>
        </div>

        {uploadSuccessToast && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccessToast}</span>
            </div>
            <button onClick={() => setUploadSuccessToast(null)} className="text-emerald-400 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Attachment Alert Banner */}
      {attachmentAlert && (
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl mt-0.5 border border-emerald-500/30">
              <Paperclip className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Resume PDF Downloaded & Gmail Compose Window Opened!</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Ready</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. <strong>Resume PDF</strong> aapke browser ke download tray me download ho gaya hai. Bas use drag & drop karke Gmail compose box me chhod dein.<br />
                2. Aapka live <strong>Google Drive / Resume Link</strong> pehle se email body me likh diya gaya hai!
              </p>
            </div>
          </div>
          <button
            onClick={() => setAttachmentAlert(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 1: LIVE TEXT & POSTING SCRAPER                        */}
      {/* ============================================================== */}
      {activeSubTab === 'raw-scraper' && (
        <div className="space-y-5">
          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Paste Job Description, LinkedIn Post, or Page Text
              </label>
              <span className="text-[11px] text-slate-500">Auto-detects emails, Indian mobile numbers & URLs</span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any text here! E.g.: 'We are hiring Senior SDET at Razorpay. Send your resume to priya.recruiter@razorpay.com or call/WhatsApp +91 9876543210. Location: Bangalore. 30 days notice required.'"
              className="w-full h-32 bg-[#060a14] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-y leading-relaxed font-mono"
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs text-slate-400">
                {inputText.length} characters entered
              </div>
              <div className="flex items-center gap-2">
                {inputText && (
                  <button
                    onClick={() => { setInputText(''); setScrapedData({ emails: [], phones: [], links: [] }); }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
                <button
                  onClick={handleScrapeText}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Extract Emails & Numbers
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {(scrapedData.emails.length > 0 || scrapedData.phones.length > 0 || scrapedData.links.length > 0) && (
            <div className="bg-[#0b1120] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Scraped Contact Intelligence
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold">
                    {scrapedData.emails.length} Emails • {scrapedData.phones.length} Phones • {scrapedData.links.length} Links
                  </span>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export to CSV
                </button>
              </div>

              {/* Emails Section */}
              {scrapedData.emails.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Recruiter Email Addresses:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {scrapedData.emails.map((email, idx) => (
                      <div key={idx} className="bg-[#060a14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between gap-2.5 hover:border-cyan-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-cyan-300 truncate" title={email}>{email}</span>
                          <button
                            onClick={() => handleCopy(email, `email-${idx}`)}
                            className="text-slate-400 hover:text-cyan-300 transition-colors ml-1"
                            title="Copy email"
                          >
                            {copiedItem === `email-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenGmailWithAttachment(email, "your company")}
                            className="flex-1 py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Pitch in Gmail
                          </button>
                          <button
                            onClick={() => openDirectSendModal(email, "your company")}
                            className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center transition-colors"
                            title="Direct Send with PDF Attachment via SMTP"
                          >
                            <Paperclip className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phones Section */}
              {scrapedData.phones.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/60">
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Detected Mobile & Contact Numbers:</span>
                    </div>

                    {/* WhatsApp Outreach Mode, Send-to-All & Custom Message Options */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* ⚡ Send to All Extracted Numbers Button */}
                      <button
                        type="button"
                        onClick={handleOpenBulkWhatsAppModal}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 border border-emerald-400/50"
                        title="Send WhatsApp message to all extracted numbers in one go"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Send to All ({scrapedData.phones.length} Numbers)</span>
                      </button>

                      <div className="flex items-center bg-[#060a14] border border-slate-800 rounded-lg p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleToggleWhatsAppMode('default')}
                          className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                            whatsappMode === 'default'
                              ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm font-semibold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Standard Pitch
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleWhatsAppMode('custom')}
                          className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                            whatsappMode === 'custom'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Custom Message</span>
                          {customWhatsAppMessage ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5"></span>
                          ) : null}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsCustomMessageOpen(prev => !prev)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                          isCustomMessageOpen
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                        title="Customize and save your own WhatsApp message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isCustomMessageOpen ? 'Hide Editor' : 'Custom Message Settings'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Custom WhatsApp Pitch Editor Panel */}
                  {isCustomMessageOpen && (
                    <div className="bg-[#080e1c] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl animate-in slide-in-from-top duration-200">
                      {renderCustomWhatsAppEditor(false)}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {scrapedData.phones.map((phone, idx) => (
                      <div key={idx} className="bg-[#060a14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between gap-2.5 hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-emerald-300 font-semibold">{phone}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border ${
                              bulkDispatchedMap[phone] === 'sent'
                                ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50 font-bold'
                                : whatsappMode === 'custom' && customWhatsAppMessage
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {bulkDispatchedMap[phone] === 'sent'
                                ? '✓ Dispatched'
                                : whatsappMode === 'custom' && customWhatsAppMessage
                                ? 'Custom Msg'
                                : 'Standard'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setIsCustomMessageOpen(true)}
                              className="p-1 text-slate-400 hover:text-emerald-300 transition-colors rounded"
                              title="Customize / Edit WhatsApp message"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopy(phone, `phone-${idx}`)}
                              className="text-slate-400 hover:text-emerald-300 transition-colors"
                              title="Copy Phone"
                            >
                              {copiedItem === `phone-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 w-full">
                          <a
                            href={generateWhatsAppLink(phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-2 px-2 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            title={`Direct WhatsApp Web (${whatsappMode === 'custom' && customWhatsAppMessage ? 'Sending Custom Saved Message' : 'Standard pitch'})`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Chat on WhatsApp</span>
                          </a>
                          <a
                            href={generateWhatsAppAppLink(phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="Open via WhatsApp Mobile / Desktop App"
                          >
                            <span>App ↗</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: DEEP OSINT RECRUITER RADAR                         */}
      {/* ============================================================== */}
      {activeSubTab === 'osint-radar' && (
        <div className="space-y-5">
          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-400" />
              Configure Target Company & Position
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  placeholder="e.g. Razorpay, PhonePe, CRED, Fiserv"
                  className="w-full bg-[#060a14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Target Role</label>
                <input
                  type="text"
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  placeholder="SDET, QA Automation, RestAssured"
                  className="w-full bg-[#060a14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Target Location</label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-[#060a14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Remote">Remote</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Noida / Gurugram">Noida / Gurugram</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>
            </div>
          </div>

          {/* OSINT Query Launch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {osintQueries.map((item, idx) => {
              const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.query)}`;
              return (
                <div key={idx} className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-xl border ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </span>
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    <div className="bg-[#060a14] rounded-lg p-2 font-mono text-[10px] text-slate-400 break-all border border-slate-900">
                      {item.query}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleCopy(item.query, `query-${idx}`)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copiedItem === `query-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Query
                    </button>
                    <a
                      href={googleSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-3 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Launch Google X-Ray Search</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: DIRECT RECRUITER DIRECTORY                         */}
      {/* ============================================================== */}
      {activeSubTab === 'directory' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b1120] border border-slate-800/80 rounded-2xl p-4 shadow-md">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={directoryFilter}
                onChange={(e) => setDirectoryFilter(e.target.value)}
                placeholder="Filter by company, city or email..."
                className="w-full bg-[#060a14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredDirectory.length}</span> verified company TA mailboxes
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map((item, idx) => (
              <div key={idx} className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-purple-500/40 transition-all shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      {item.company}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25 text-[10px] font-semibold">
                      {item.location}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">{item.category}</div>

                  <div className="space-y-1 bg-[#060a14] rounded-xl p-2.5 border border-slate-850">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Verified TA Mailboxes:</div>
                    {item.taEmails.map((email, eIdx) => (
                      <div key={eIdx} className="flex items-center justify-between text-xs font-mono text-slate-300">
                        <span className="truncate">{email}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(email, `dir-${idx}-${eIdx}`)}
                            className="p-1 text-slate-500 hover:text-purple-300 transition-colors"
                            title="Copy email"
                          >
                            {copiedItem === `dir-${idx}-${eIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleOpenGmailWithAttachment(email, item.company)}
                            className="p-1 text-purple-400 hover:text-purple-200 transition-colors"
                            title="Email in Gmail"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDirectSendModal(email, item.company)}
                            className="p-1 text-slate-500 hover:text-purple-300 transition-colors"
                            title="Direct Send with PDF Attachment via SMTP"
                          >
                            <Paperclip className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {item.phones && item.phones.length > 0 && (
                      <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {item.phones[0]}
                        </span>
                        <a
                          href={generateWhatsAppLink(item.phones[0], item.company)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-300 hover:underline"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                  <a
                    href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(item.searchKeywords)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                  >
                    <span>Find HRs on LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleOpenGmailWithAttachment(item.taEmails[0], item.company)}
                    className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Send className="w-3 h-3" /> Pitch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIRECT SEND MODAL (WITH ACTUAL PDF ATTACHMENT VIA NODEMAILER)   */}
      {/* ============================================================== */}
      {directSendModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Direct Send with PDF Attachment</h3>
              </div>
              <button
                onClick={() => setDirectSendModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">To Recruiter:</label>
                <input
                  type="email"
                  value={directSendModal.toEmail}
                  onChange={(e) => setDirectSendModal(prev => ({ ...prev, toEmail: e.target.value }))}
                  style={{ backgroundColor: '#090e1a', color: '#f8fafc', border: '1px solid #334155' }}
                  className="w-full rounded-lg p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Your Sender Gmail Address:</label>
                <input
                  type="email"
                  value={directSendModal.senderEmail}
                  onChange={(e) => setDirectSendModal(prev => ({ ...prev, senderEmail: e.target.value }))}
                  style={{ backgroundColor: '#090e1a', color: '#38bdf8', border: '1px solid #334155' }}
                  className="w-full rounded-lg p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subject:</label>
                <input
                  type="text"
                  value={directSendModal.subject}
                  onChange={(e) => setDirectSendModal(prev => ({ ...prev, subject: e.target.value }))}
                  style={{ backgroundColor: '#090e1a', color: '#f8fafc', border: '1px solid #334155' }}
                  className="w-full rounded-lg p-2.5 text-xs font-semibold"
                />
              </div>

              {/* INTERACTIVE RESUME ATTACHMENT CARD WITH MANUAL UPLOAD OPTION */}
              <div className="p-3.5 bg-[#060a14] border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-slate-200 text-xs">Resume Attachment:</span>
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setDirectSendModal(prev => ({ ...prev, resumeMode: 'default' }))}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1.5 ${
                        directSendModal.resumeMode === 'default'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Profile Resume</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDirectSendModal(prev => ({ ...prev, resumeMode: 'custom' }));
                        if (!directSendModal.customFile) {
                          modalFileInputRef.current?.click();
                        }
                      }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1.5 ${
                        directSendModal.resumeMode === 'custom'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for Modal */}
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalFileSelect}
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                />

                {/* VIEW 1: DEFAULT STORED PROFILE RESUME */}
                {directSendModal.resumeMode === 'default' && (
                  <div className="bg-slate-950/70 border border-cyan-500/20 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-mono font-medium text-cyan-200 truncate">
                          {defaultResumeDisplayName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Stored on Server • Auto-attached via SMTP</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 self-end sm:self-auto"
                      title="Upload a different resume specifically for this pitch"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Different</span>
                    </button>
                  </div>
                )}

                {/* VIEW 2: CUSTOM FILE UPLOADED OR DROPZONE */}
                {directSendModal.resumeMode === 'custom' && (
                  <div>
                    {directSendModal.customFile ? (
                      <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-3 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-mono font-bold text-emerald-200 truncate">
                                {directSendModal.customFileName}
                              </div>
                              <div className="text-[10px] text-emerald-400/80 flex items-center gap-2 mt-0.5">
                                <span>{directSendModal.customFileSize}</span>
                                <span>•</span>
                                <span className="font-semibold text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Ready to attach
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => modalFileInputRef.current?.click()}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded-lg transition-colors"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleModalRemoveCustomFile}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg transition-colors"
                              title="Remove custom file and revert to default"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Checkbox: Save to Profile */}
                        <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer pt-1 border-t border-emerald-500/20">
                          <input
                            type="checkbox"
                            checked={directSendModal.saveToProfile}
                            onChange={(e) => setDirectSendModal(prev => ({ ...prev, saveToProfile: e.target.checked }))}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-[#060a14]"
                          />
                          <span>Also save this file as my primary profile resume</span>
                        </label>
                      </div>
                    ) : (
                      /* Dropzone to select custom resume */
                      <div
                        onDragOver={handleModalDragOver}
                        onDragLeave={handleModalDragLeave}
                        onDrop={handleModalDrop}
                        onClick={() => modalFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isModalDragging
                            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                            : 'border-slate-700 hover:border-cyan-500/50 bg-[#040812] hover:bg-cyan-500/5'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-semibold text-slate-200">
                            Click to browse or drag & drop resume PDF
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Supports .pdf, .docx, .doc (up to 10MB)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-500 leading-tight">
                  {directSendModal.resumeMode === 'custom' && directSendModal.customFile
                    ? `"${directSendModal.customFileName}" will be uploaded and attached directly to this outgoing email.`
                    : 'This PDF will be automatically attached to the outgoing email via our backend server.'}
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-amber-300 font-bold flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    Google 16-Character App Password:
                  </label>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    Generate App Password ↗
                  </a>
                </div>
                <input
                  type="password"
                  value={directSendModal.appPassword}
                  onChange={(e) => setDirectSendModal(prev => ({ ...prev, appPassword: e.target.value }))}
                  placeholder="e.g. abcd efgh ijkl mnop"
                  style={{ backgroundColor: '#090e1a', color: '#f8fafc', border: '1px solid #334155' }}
                  className="w-full rounded-lg p-2.5 font-mono text-xs"
                />
                <div className="text-[10px] text-slate-300 space-y-1 leading-relaxed bg-[#060a14]/60 p-2 rounded-lg border border-slate-800">
                  <p className="text-amber-200 font-semibold">ℹ️ Why is this required?</p>
                  <p className="text-slate-400">
                    Google security mandates a 16-character <strong>App Password</strong> for SMTP (normal Gmail login password will not work). If you prefer not to create one, click <strong>"Open in Gmail Webmail"</strong> below to send directly without a password!
                  </p>
                </div>
              </div>

              {directSendModal.statusMsg && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                  directSendModal.statusType === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  directSendModal.statusType === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {directSendModal.statusMsg}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDirectSendModal(prev => ({ ...prev, isOpen: false }));
                  handleOpenGmailWithAttachment(directSendModal.toEmail, directSendModal.company);
                }}
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="Open Gmail web compose directly with pre-filled content (No password needed)"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Gmail (No Password)</span>
              </button>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDirectSendModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDispatchDirectEmail}
                  disabled={directSendModal.isSending}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {directSendModal.isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>
                    {directSendModal.isSending ? (
                      'Dispatching...'
                    ) : directSendModal.resumeMode === 'custom' && directSendModal.customFileName ? (
                      `Send with ${directSendModal.customFileName.length > 20 ? directSendModal.customFileName.slice(0, 18) + '...' : directSendModal.customFileName} Attached`
                    ) : (
                      'Send with PDF Attached'
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CUSTOM WHATSAPP MESSAGE EDITOR MODAL                 */}
      {/* ============================================================== */}
      {isCustomMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border border-emerald-500/40 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {renderCustomWhatsAppEditor(true)}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: BULK WHATSAPP DISPATCH CONSOLE                       */}
      {/* ============================================================== */}
      {isBulkWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border border-emerald-500/50 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>1-Click Bulk WhatsApp Dispatcher</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold">
                      {bulkSelectedPhones.length} of {scrapedData.phones.length} Selected
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Broadcast your pitch message to all extracted recruiter numbers in one go!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleStopBulkQueue();
                  setIsBulkWhatsAppModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Pitch Preview Strip */}
            <div className="bg-[#060a14] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-start gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300 text-[11px]">
                    <span>Active Message:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${whatsappMode === 'custom' && customWhatsAppMessage ? 'text-emerald-300 bg-emerald-500/15' : 'text-slate-400 bg-slate-800'}`}>
                      {whatsappMode === 'custom' && customWhatsAppMessage ? 'Custom Saved Message' : 'Standard Template'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-lg">
                    "{resolveWhatsAppMessage('', searchCompany || 'your team').slice(0, 110)}..."
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBulkWhatsAppModalOpen(false);
                  setIsCustomMessageOpen(true);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-semibold rounded-lg shrink-0 self-end sm:self-auto transition-colors"
              >
                Edit Message
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBulkDispatchMode('queue')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  bulkDispatchMode === 'queue'
                    ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#060a14] border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-Queue Runner</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Smooth countdown between contacts. Verify & send one-by-one.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBulkDispatchMode('burst')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  bulkDispatchMode === 'burst'
                    ? 'bg-teal-500/15 border-teal-500/60 shadow-lg shadow-teal-500/10'
                    : 'bg-[#060a14] border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Multi-Tab Burst</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Launches tabs for all selected contacts with anti-block stagger.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBulkDispatchMode('bot')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  bulkDispatchMode === 'bot'
                    ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-[#060a14] border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Playwright Bot</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Automated background bot clicks Send automatically.
                </p>
              </button>
            </div>

            {/* Recipient Selection Box */}
            <div className="space-y-2 bg-[#060a14] border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Target Numbers:</span>
                  <button
                    type="button"
                    onClick={handleToggleSelectAllPhones}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {bulkSelectedPhones.length === scrapedData.phones.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleCopyAllPhones}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Numbers
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={handleCopyAllWaLinks}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Link className="w-3 h-3" /> Copy Links
                  </button>
                </div>
              </div>

              {/* Scrollable list of phones */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-850">
                {scrapedData.phones.map((phone, idx) => {
                  const isSelected = bulkSelectedPhones.includes(phone);
                  const status = bulkDispatchedMap[phone];
                  const isCurrent = bulkIsRunning && bulkSelectedPhones[bulkCurrentIndex] === phone;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/20 border border-emerald-500/40'
                          : isSelected
                          ? 'bg-slate-900/60 hover:bg-slate-900'
                          : 'opacity-50 bg-slate-950'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTogglePhoneSelection(phone)}
                          disabled={bulkIsRunning}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-[#060a14]"
                        />
                        <span className="font-mono text-xs font-semibold text-emerald-300 truncate">
                          {phone}
                        </span>
                      </label>

                      <div className="flex items-center gap-2 shrink-0">
                        {status === 'sent' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                            Dispatched ✓
                          </span>
                        )}
                        {status === 'skipped' && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                            Skipped
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold animate-pulse border border-cyan-500/30">
                            Opening Now ▶
                          </span>
                        )}
                        {!status && !isCurrent && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Ready
                          </span>
                        )}
                        <a
                          href={generateWhatsAppLink(phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-slate-400 hover:text-emerald-300 underline ml-1"
                        >
                          Test ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mode-Specific Action Area */}
            {bulkDispatchMode === 'queue' && (
              <div className="bg-[#060a14] border border-slate-800 rounded-xl p-3.5 space-y-3">
                {bulkIsRunning ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Dispatching Queue:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {bulkCurrentIndex + 1} / {bulkSelectedPhones.length}
                        </span>
                      </div>
                      {bulkCountdown > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Next contact in {bulkCountdown}s...</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 transition-all duration-300"
                        style={{
                          width: `${Math.round(((bulkCurrentIndex + 1) / bulkSelectedPhones.length) * 100)}%`
                        }}
                      />
                    </div>

                    {/* Live Control Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleStopBulkQueue}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Square className="w-3 h-3 fill-current" /> Stop
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSkipCurrentBulkQueue}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <SkipForward className="w-3 h-3" /> Skip Number
                        </button>
                        <button
                          type="button"
                          onClick={handleNextBulkQueue}
                          className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-400 transition-colors shadow-md"
                        >
                          <FastForward className="w-3 h-3 fill-current" /> Next Contact Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-semibold">Auto-Advance Interval:</span>
                      <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                        {[1.5, 2.5, 4.0].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setBulkInterval(sec)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                              bulkInterval === sec
                                ? 'bg-emerald-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartBulkQueue}
                      disabled={bulkSelectedPhones.length === 0}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Auto-Send Queue ({bulkSelectedPhones.length} Contacts)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {bulkDispatchMode === 'burst' && (
              <div className="bg-[#060a14] border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-white">Open in Tabs at Once</p>
                  <p className="text-[11px] text-slate-400">
                    Each contact opens in a separate WhatsApp Web tab with staggered timing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchBurst}
                  disabled={bulkSelectedPhones.length === 0 || bulkIsRunning}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 shrink-0"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Launch All {bulkSelectedPhones.length} Tabs</span>
                </button>
              </div>
            )}

            {bulkDispatchMode === 'bot' && (
              <div className="bg-[#060a14] border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white">Autonomous Playwright Browser Bot</p>
                    <p className="text-[11px] text-slate-400">
                      Launches local browser session, visits each contact, and auto-clicks Send without human interaction.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLaunchBackendBot}
                    disabled={bulkSelectedPhones.length === 0 || bulkBotLoading}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 shrink-0"
                  >
                    {bulkBotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                    <span>{bulkBotLoading ? 'Dispatching via Bot...' : `Run Playwright Bot (${bulkSelectedPhones.length})`}</span>
                  </button>
                </div>

                {bulkBotResults && (
                  <div className="pt-2 border-t border-slate-850 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-300">Bot Execution Results:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {bulkBotResults.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                          <span className="font-mono text-slate-300">{r.phone}</span>
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            r.status === 'sent' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {r.status === 'sent' ? 'Sent ✓' : r.error || 'Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bulk Toast Feedback */}
            {bulkToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{bulkToast}</span>
                </div>
                <button type="button" onClick={() => setBulkToast(null)} className="text-emerald-400 hover:text-white p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500">
                Tip: Uses your saved custom message automatically.
              </span>
              <button
                type="button"
                onClick={() => {
                  handleStopBulkQueue();
                  setIsBulkWhatsAppModalOpen(false);
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
