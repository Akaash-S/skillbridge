# SkillBridge Suite - Frontend Client 🚀

A modern, responsive, accessible Single Page Application (SPA) for the SkillBridge AI career development platform. Built with React 18, TypeScript, Vite, Tailwind CSS, Radix UI primitives, and TanStack Query.

---

## ⚡ Deployment & Hosting Status

> [!NOTE]
> **Deployment Status: Static Production Ready (Companion Backend VM Archived)**
> The frontend client is configured for deployment to static hosting platforms (Vercel, Netlify, Cloudflare Pages, or Nginx). The companion cloud backend VM (`skillbridge-server.asolvitra.tech`) is currently powered down to eliminate ongoing hosting costs. For local development or live demonstrations, run the local backend server via `cd ../backend && python run.py`.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19 with SWC
- **Styling**: Tailwind CSS 3.4.17, Tailwind Animate, PostCSS
- **Component Primitives**: Radix UI (Dialog, Dropdown, Tabs, Tooltip, Progress, Avatar, Accordion)
- **Icons & Animation**: Lucide React 0.462, Framer Motion 12.23, GSAP 3.14
- **Data Fetching**: TanStack React Query 5.83
- **Forms & Validation**: React Hook Form 7.61 with Zod 3.25 schema validation
- **Routing**: React Router DOM 6.30
- **Testing**: Vitest 4.0.16, fast-check (property testing)

---

## 📁 Project Structure

```
frontend/
├── public/                      # Static assets (logos, favicon, og-image.png)
├── src/
│   ├── components/              # Reusable UI & business components
│   │   ├── auth/                # Login, registration, and onboarding dialogs
│   │   ├── dashboard/           # Readiness scorecards, progress bars & metrics
│   │   ├── learning/            # Course cards, video player & resource lists
│   │   ├── roadmap/             # Interactive milestone cards & skill nodes
│   │   ├── skills/              # Skill catalog, proficiency sliders & filters
│   │   └── ui/                  # Radix UI primitives with Tailwind styling
│   ├── contexts/                # AuthContext & ThemeContext
│   ├── hooks/                   # Custom React hooks (useAuth, useSkills, useRoadmap)
│   ├── pages/                   # Application view routes (Dashboard, Roadmap, etc.)
│   ├── services/                # TypeScript backend API clients
│   │   ├── api.ts               # Axios / Fetch client with auth headers & cookies
│   │   ├── auth.ts              # Firebase auth token & cookie sync
│   │   ├── careerCompass.ts     # Career path recommendations
│   │   ├── courseService.ts     # Curated courses and learning progress
│   │   ├── learningAssistantService.ts # AI assistant interactions
│   │   └── resumeService.ts     # Resume parsing and review
│   └── test/                    # Automated Vitest test suites
│       ├── auth.test.ts         # Token handling & session logic
│       ├── security.test.ts     # Input sanitization & XSS protection
│       └── skills.test.ts       # Client-side skill calculation & filtering
├── docs/                        # Architectural records & fix summaries
├── scripts/                     # Helper & diagnostic scripts
├── index.html                   # HTML entry point with custom OpenGraph metadata
├── tailwind.config.ts           # Design tokens, color palette & animations
├── vite.config.ts               # Vite build & chunk configuration
└── vitest.config.ts             # Vitest test runner configuration
```

---

## 🧪 Automated Testing

The frontend includes 17 automated unit and property-based tests running on Vitest:

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

**Test Suite Coverage:**
- `src/test/skills.test.ts` (6 passed): Validates skill filtering, search normalization, proficiency mapping, and gap analysis algorithms.
- `src/test/auth.test.ts` (6 passed): Validates Firebase ID token extraction, cookie credentials forwarding (`withCredentials: true`), and unauthenticated redirection.
- `src/test/security.test.ts` (5 passed): Validates URL sanitization, XSS payload escaping, and secure external link attributes (`rel="noopener noreferrer"`).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment settings:
```ini
# Backend API URL (default to local backend)
VITE_API_URL=http://localhost:8000

# Firebase Web App Credentials
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Running the Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173`.

### 5. Production Build
```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📊 Performance & Lighthouse Audit

Audited via Google Lighthouse 13.5.0 on local production build preview:
- **Accessibility**: **99 / 100** (Full ARIA labels, semantic markup, high-contrast ratios)
- **Best Practices**: **100 / 100** (HTTPS ready, clean console, secure cookies)
- **SEO**: **100 / 100** (Structured meta tags, valid OpenGraph preview, crawlable robots.txt)
- **Performance**: **57 / 100** (Mobile 4x CPU throttle baseline; single vendor bundle)
