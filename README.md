# Shiv Saya Properties — Real Estate Platform

## Overview

Shiv Saya Properties is a premium full-featured digital real estate platform engineered for the Delhi NCR market. It provides a sleek, high-end user interface for clients looking to discover verified residential and commercial listings, book consultations, search and filter properties, submit listings, and bookmark favorites. It also features a fully comprehensive Admin Panel to review properties page-by-page, toggle approval states, sync configurations, view enquiries, and manage admin privileges.

### Main Features

- **Property Discovery & Search**: Fully filterable listings workspace (location, types, budget limits, BHK configurations).
- **Property Submissions**: Integrated stepper listing wizard for users to suggest property listings directly.
- **Real-Time Interactions**: Interactive enquiry forms, dynamic favorites bookmarked local/Firestore lists.
- **Administrative Panel**: Multi-tab workspace for validation queues, direct property creation/editing, system controls, and CSV lead exports.
- **Pre-Launch Checklist**: Dynamic developer drawer to track compliance and deployment milestones.

---

## Tech Stack

- **Frontend Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (`motion/react`)
- **Backend & Persistence**: Firebase (Authentication & Cloud Firestore)
- **Bundling**: Vite build tool
- **Deployment Configuration**: Vercel & custom edge routing

---

## Getting Started (Local Development)

### Step 1: Clone the repository

Clone files to your local environment.

### Step 2: Run npm install

Install required dependencies:

```bash
npm install
```

### Step 3: Copy .env.example to .env.local

Create a local variable file for configuration:

```bash
cp .env.example .env.local
```

### Step 4: Fill in Firebase values (see Firebase Setup)

Configure the appropriate environment values for client verification.

### Step 5: Run npm run dev

Launch the development server:

```bash
npm run dev
```

### Step 6: Open http://localhost:5173

View and test your application locally.

---

## Firebase Setup (Required)

1.  **Create Project**: Create a new cloud project at [console.firebase.google.com](https://console.firebase.google.com).
2.  **Add Web App**: Provision a Web App to retrieve config client keys.
3.  **Enable Authentication**: Turn on both **Email/Password** and **Google Sign-in** methods in the Authentication console.
4.  **Create Firestore Database**: Initialize Cloud Firestore and select your regional resource node. Start in test mode.
5.  **Enable Storage**: Configure and turn on Firebase Cloud Storage buckets.
6.  **Deploy Firestore rules**:
    ```bash
    firebase deploy --only firestore:rules
    ```
7.  **Deploy Storage rules**:
    ```bash
    firebase deploy --only storage
    ```

---

## Deployment to Vercel

1.  **Push to GitHub**: Send code to your connected GitHub repository.
2.  **Import to Vercel**: Connect your repository on [vercel.com](https://vercel.com).
3.  **Add Environment Variables**: Supply all 7 required `VITE_FIREBASE_` environment variable keys inside Vercel setup.
4.  **Deploy**: Run build and wait for deployment success.
5.  **Connect Custom Domain**: Bind your purchased domain in Vercel settings.
6.  **Configure Nameservers**: Update GoDaddy (or other registrar) nameservers to Vercel values.

---

## Admin Access

- **Code Config**: Add your email directly to the fallback array `ADMIN_EMAILS` inside `src/firebase.ts`.
- **Administrative Management**: Log in with Google, navigate to **Admin Panel > Settings > Admin Management**, and dynamically add admin privileges to any verified email.

---

## Configuration

All business detail configurations are structured inside `/src/config.ts`.
Update values like `whatsappNumber`, `businessName`, `reraNumber`, and more before launching to production.

---

## Project Structure

- `src/components/` — Houses modular views, modals, navbar layouts, and the pre-launch checklists.
- `src/data/` — Holds general baseline properties data and metadata fallbacks.
- `src/types.ts` — Houses shared typescript types and structures.
- `src/firebase.ts` — Implements Firebase client SDK integrations, DB queries, and sign-in modules.
- `src/config.ts` — Exposes administrative configurations and business parameters.
- `src/index.css` — Global stylesheet applying base Tailwind layers and layout styling rules.

---

## Performance Budget

This project follows strict performance standards to ensure a highly responsive user experience:
- **Initial JS Bundle Limit**: `< 200 KB` (enforced via size-limit)
- **Main Chunk Limit**: `< 500 KB` (enforced via vite warning limits and rollup-plugin-visualizer)
- **Lighthouse Scores**: Performance `>= 80`, Accessibility `>= 90` (enforced via Lighthouse CI)
- **Tracing**: Critical user journeys like Property Search and Image Uploads are tracked via Firebase Performance Monitoring.
- **Core Web Vitals**: onCLS, onINP, onFCP, onLCP, and onTTFB are actively collected and reported to Sentry.

Appendix A: Daily/Weekly Checklist for Developers
Every Day
[ ] Run npm run lint before committing
[ ] Run npm run test before pushing
[ ] Run npm run test:e2e before merging PR
[ ] Check bundle size with npm run build -- --analyze
[ ] Review Lighthouse score on staging

Every Week
[ ] Review Dependabot alerts
[ ] Check Sentry for new errors
[ ] Review Firebase Security Rules console for failed requests
[ ] Check analytics dashboard for anomalies
[ ] Review user feedback
[ ] Run full E2E suite on staging

Every Sprint (2 weeks)
[ ] Update sitemap.xml if new routes added
[ ] Review and rotate secrets if needed
[ ] Update Firestore indexes if new queries added
[ ] Review Cloud Functions logs for errors
[ ] Performance audit with Lighthouse
[ ] Accessibility audit with axe-core
[ ] Security audit with Snyk
[ ] Deploy to production

## Appendix B: Technology Stack Recommendations

| Category | Current | Recommended | Reason |
| :--- | :--- | :--- | :--- |
| Framework | React 19 | React 19 + Next.js 14 | SSR for SEO, API routes, image optimization |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 + Tailwind UI | Consistent component library |
| State (Client) | Zustand | Zustand + React Query | Keep Zustand for UI state, React Query for server state |
| State (Server) | Manual Firebase | React Query + Firebase | Caching, pagination, retries |
| Forms | None (native) | React Hook Form + Zod | Validation, performance, DX |
| Images | Raw URLs | Cloudinary/Imgix | CDN, optimization, transforms |
| Search | Client-side | Algolia | Full-text, faceted, typo tolerance |
| Email | None | Resend or SendGrid | Transactional emails |
| Analytics | Firebase Analytics | Firebase + Mixpanel | Product analytics + event tracking |
| Error Tracking | Sentry (placeholder) | Sentry (real) | Error monitoring |
| Performance | None | Web Vitals + Firebase Performance | Core Web Vitals tracking |
| A/B Testing | None | LaunchDarkly or Firebase Remote Config | Feature experimentation |
| Testing | Vitest + Playwright | Same (keep) | Good choices |
| CI/CD | GitHub Actions | Same + Vercel | Good choices |
| PWA | Vite PWA plugin | Custom Workbox SW | Better control over caching |
| Hosting | Vercel | Same | Good choice |
| Backend | Firebase (client only) | Firebase + Cloud Functions | Server-side logic, emails, validation |
| Mobile | PWA | PWA or React Native (Expo) | App store presence if needed |
| i18n | None | react-i18next | Multi-language support |
| Maps | None | Google Maps or Mapbox | Property location visualization |
| Chat | None | Firebase Realtime DB + FCM | Real-time chat widget |
| Recommendations | None | Firebase ML or custom CF | |

## Appendix C: Migration Script for Admin Data

When moving from localStorage to Firestore in Phase 1, run this once:

```typescript
// scripts/migrate-admin-data.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const app = initializeApp({ /* your config */ });
const db = getFirestore(app);

async function migrate() {
  const enquiries = JSON.parse(localStorage.getItem("ssp_simulated_enquiries") || "[]");
  const users = JSON.parse(localStorage.getItem("ssp_simulated_users") || "[]");
  
  for (const enquiry of enquiries) {
    await setDoc(doc(collection(db, "enquiries"), enquiry.id), enquiry);
  }
  
  for (const user of users) {
    await setDoc(doc(collection(db, "users"), user.id), user);
  }
  
  console.log(`Migrated ${enquiries.length} enquiries and ${users.length} users.`);
}

migrate();
```

Run this ONCE in the Firebase Console or via node with service account credentials.