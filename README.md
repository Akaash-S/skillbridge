# SkillBridge Suite - Frontend

A modern React application for career intelligence and skill development, built with TypeScript, Tailwind CSS, and Firebase authentication.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project (for authentication)
- SkillBridge backend running (see backend README)

### Installation

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# 4. Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🔧 Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Application Settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click "Add app" and select Web (</>) 
6. Copy the configuration values to your `.env` file

### Environment Validation

The application automatically validates required environment variables on startup. If any required variables are missing, you'll see a helpful error message.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (routes)
├── services/           # API and external service integrations
├── context/            # React context providers
├── config/             # Configuration and environment setup
├── data/               # Mock data and type definitions
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── styles/             # Global styles and Tailwind config
```

## 🔑 Key Features

- **Firebase Authentication** - Google OAuth integration
- **Real-time API Integration** - Connects to SkillBridge backend
- **Skill Management** - Add, update, and track your skills
- **AI-Powered Roadmaps** - Personalized learning paths
- **Job Role Analysis** - Skill gap analysis for target roles
- **Responsive Design** - Works on desktop and mobile
- **TypeScript** - Full type safety throughout the application

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check

# Testing
npm run test             # Run tests (if configured)
```

## 🔗 API Integration

The frontend connects to the SkillBridge backend API:

- **Base URL**: Configured via `VITE_API_BASE_URL`
- **Authentication**: Firebase ID tokens
- **Endpoints**: Skills, roles, roadmaps, jobs, user profile
- **Error Handling**: Automatic retry and user-friendly messages

### API Service Usage

```typescript
import { apiService } from '@/services/api';

// Get master skills (public)
const skills = await apiService.getMasterSkills();

// Get user skills (authenticated)
const userSkills = await apiService.getUserSkills();

// Add a skill
await apiService.addSkill('react', 'intermediate');
```

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) components:

- Consistent design system
- Accessible components
- Dark/light mode support
- Customizable with Tailwind CSS

## 🔒 Authentication Flow

1. User clicks "Sign in with Google"
2. Firebase handles OAuth flow
3. Frontend receives Firebase user + ID token
4. Token sent to backend for verification
5. Backend creates/updates user profile
6. Frontend stores user data and token

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Components**: Automatically adapt to screen size
- **Navigation**: Collapsible sidebar on mobile

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production build.

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables in deployment settings
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- All `VITE_FIREBASE_*` variables
- `VITE_API_BASE_URL` (your production backend URL)
- `VITE_APP_ENV=production`

## 🐛 Troubleshooting

### Common Issues

**Firebase Authentication Errors**
- Check Firebase configuration in `.env`
- Ensure Firebase project has Google OAuth enabled
- Verify authorized domains in Firebase console

**API Connection Issues**
- Ensure backend is running on correct port
- Check `VITE_API_BASE_URL` in `.env`
- Verify CORS settings in backend

**Build Errors**
- Run `npm run type-check` to find TypeScript errors
- Check for missing environment variables
- Clear `node_modules` and reinstall if needed

### Debug Mode

Set `VITE_DEBUG_MODE=true` to enable:
- Console logging of API requests
- Environment configuration display
- Additional error details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the SkillBridge Suite application.

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Firebase** - Authentication
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Recharts** - Data visualization
