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

Generated from repository files (`git ls-files`):

```
frontend/
├── .github/workflows/
│   └── frontend-ci.yml          # CI workflow (npm ci, lint, vitest, vite build)
├── docs/                        # Architecture & documentation records
│   ├── ACCESSIBILITY_FIX.md
│   ├── COOKIE_AUTH_FRONTEND_CHANGES.md
│   ├── SECURITY_FIXES_SUMMARY.md
│   ├── test-api.html            # Standalone API test page
│   └── test-fixes.md            # React context & Radix UI fix notes
├── public/                      # Static web assets
│   ├── favicon.ico
│   ├── og-image.png             # Custom OpenGraph preview banner (1200x630)
│   ├── robots.txt
│   └── skillbridge-logo-dark.png
├── scripts/
│   └── generate_og_image.py     # Python script to render branded social card
├── src/
│   ├── assets/guide/            # Onboarding & walkthrough visual assets
│   ├── components/              # React UI & domain components
│   │   ├── AIAssistant/         # Real-time Groq/Llama interactive chat panel
│   │   ├── auth/                # AuthRedirect, MFA verification, ProtectedRoute
│   │   ├── gamification/        # Achievements, streaks, timeline, and XP cards
│   │   ├── ui/                  # 37 Radix UI + Tailwind styled primitives
│   │   ├── AdvancedAnalytics.tsx
│   │   ├── AuthErrorHandler.tsx # COOP/popup blocker error handler
│   │   ├── Certificate.tsx
│   │   ├── CompletionMessage.tsx
│   │   ├── CompletionMessage.test.tsx # Unit tests for completion modal (7 tests)
│   │   ├── Layout.tsx
│   │   ├── MFAHandler.tsx
│   │   ├── RoleCard.tsx
│   │   └── SkillChip.tsx
│   ├── config/
│   │   └── env.ts               # Runtime environment configuration & validation
│   ├── context/
│   │   ├── AppDataContext.tsx   # Global application state (skills, roles, roadmaps)
│   │   └── AuthContext.tsx      # Firebase auth & session cookie synchronization
│   ├── data/
│   │   ├── fixedRoadmaps.ts     # Offline algorithmic template roadmaps
│   │   └── mockData.ts          # TypeScript domain models & offline catalog fallback
│   ├── hooks/
│   │   ├── use-mobile.tsx       # Viewport breakpoint detection hook
│   │   └── use-toast.ts         # Toast notifications hook
│   ├── lib/
│   │   ├── utils.ts             # Tailwind class merging & formatting utilities
│   │   └── utils.test.ts        # Utilities unit test suite (8 tests)
│   ├── pages/                   # Application view routes
│   │   ├── auth/Login.tsx       # Authentication view
│   │   ├── guide/               # Interactive guide pages (AddSkills, Roadmap, etc.)
│   │   ├── Dashboard.tsx        # Career cockpit & skill progress overview
│   │   ├── Roadmap.tsx          # Dynamic personalized learning path view
│   │   ├── Roadmap.test.tsx     # Roadmap component integration test (2 tests)
│   │   ├── Skills.tsx           # Skill inventory & proficiency selector
│   │   └── Roles.tsx            # Target role search & gap analysis
│   ├── services/                # Backend API clients
│   │   ├── analyticsService.ts  # Learning analytics & progress tracking
│   │   ├── apiClient.ts         # Centralized Axios client with withCredentials: true
│   │   ├── assistantService.ts  # AI assistant endpoint client
│   │   ├── auth.ts              # Firebase auth token & cookie sync client
│   │   ├── auth.types.ts        # Auth data types & interfaces
│   │   ├── certificateService.ts# Certificate generation & verification client
│   │   └── gamificationService.ts# XP, streak, and achievement client
│   ├── utils/
│   │   ├── browserDiagnostics.ts# Diagnostic helper for auth popup/COOP blockers
│   │   └── securityCleanup.ts   # Client sanitization helper
│   ├── App.tsx                  # Main router & theme provider setup
│   ├── index.css                # Global Tailwind CSS and design tokens
│   └── main.tsx                 # React DOM root entry point
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML entry point with custom meta tags
├── package.json                 # Project dependencies & scripts
├── tailwind.config.ts           # Tailwind CSS configuration & theme tokens
├── vite.config.ts               # Vite build configuration
└── vitest.config.ts             # Vitest test runner configuration
```

---

## 🧪 Automated Testing

The frontend includes **17 automated tests** across 3 test files running on Vitest:

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

**Verified Test Results (`npx vitest run`):**
- `src/components/CompletionMessage.test.tsx` (7 passed): Validates completion celebration dialogs, badge rendering, event callbacks, and dismiss actions.
- `src/lib/utils.test.ts` (8 passed): Validates Tailwind class mergers (`cn`), time estimations, skill level normalization, and string formatting.
- `src/pages/Roadmap.test.tsx` (2 passed): Validates roadmap path rendering, active milestone card state, and route navigation.

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
