# 🚀 QA Job Hunter & Automation Station (JOB-FINDER)

An automated job search, semantic application engine, and recruiter outreach workstation engineered for QA / SDET and software engineers. Features real-time aggregation across **34+ hiring platforms**, AI-powered resume and cover letter tailoring, ATS keyword scoring, recruiter direct outreach (WhatsApp & Email), and mobile hosting support via Termux.

---

## 📱 Mobile Quickstart (Run on Android via Termux)

You can host and run this entire application directly on your Android phone using **Termux**, allowing you to discover jobs and apply from anywhere on the go.

### 1️⃣ Install Prerequisites in Termux
Open Termux on your phone and run:
```bash
pkg update -y && pkg install -y git nodejs
```

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/prashant231197/JOB-FINDER.git
cd JOB-FINDER
```

### 3️⃣ One-Click Setup & Launch
Make the setup script executable and run it:
```bash
chmod +x setup-termux.sh run-termux.sh
./setup-termux.sh
```
*This installs dependencies, initializes configurations, builds the frontend UI, and starts the server on port 5000.*

### 4️⃣ Open in Your Phone Browser
Open Google Chrome, Brave, or Samsung Internet on your phone and navigate to:
```text
http://localhost:5000
```

### 🔁 Next Time You Run (Quick Start)
Whenever you open Termux later, just run:
```bash
cd JOB-FINDER
npm start
```
and open `http://localhost:5000` in your browser.

---

## 💻 Running on Desktop (Windows / macOS / Linux)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy the example environment file:
```bash
cp .env.example .env
```
Add your free Groq API key from [Groq Console](https://console.groq.com/keys) for instant AI resume tailoring.

### 3. Start Development Server
```bash
npm run dev
```
- **Frontend UI:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

Or for production build:
```bash
npm run build
npm start
```
Accessible at `http://localhost:5000`.

---

## ✨ Features & Architecture

- **🌐 34+ Hiring Platforms Aggregator**: Scrapes and indexes openings across Major Indian Portals (Naukri, Indeed, Foundit, Shine, TimesJobs, Apna), Global & Remote networks (RemoteOK, WeWorkRemotely, Wellfound, Himalayas, Working Nomads), and Tech hubs.
- **🎯 Semantic Form Filling**: Auto-detects application form fields (experience, CTC, notice period, portfolio, skills) and autofills with applicant profile data.
- **📄 AI Resume Tailoring**: Instant contextual customization of resume bullets and cover letters matching job descriptions via Groq LLM.
- **📊 ATS Match Scoring**: Multi-dimensional keyword scoring and gap analysis against job descriptions.
- **📲 Recruiter Direct Outreach**: One-click custom WhatsApp outreach messages and automated email applications.
- **🛡️ CAPTCHA Safety Circuit Breaker**: Safely pauses automation when interactive bot checks or 2FA are encountered.
- **🧩 Chrome Extension**: Included in `chrome-extension/` for one-click in-page auto-filling on live portal tabs.

---

## ⚙️ Configuration

- **`backend/data/profile.json`**: Your contact info, skills, experience, and default settings.
- **`backend/data/platform_credentials.example.json`**: Template for platform logins. Copy to `platform_credentials.json` to configure credentials locally without exposing them to Git.
- **`.env`**: Port configuration, Groq API keys, and optional SMTP email credentials.

---

## 📜 License
MIT License. Built for seamless job hunting.
