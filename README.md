# Shiv Saya Properties — Real Estate Platform

## Overview
Shiv Saya Properties is a premium full-featured digital real estate platform engineered for the Delhi NCR market. It provides a sleek, high-end user interface for clients looking to discover verified residential and commercial listings, book consultations, search and filter properties, submit listings, and bookmark favorites. It also features a fully comprehensive Admin Panel to review properties page-by-page, toggle approval states, sync configurations, view enquiries, and manage admin privileges.

### Main Features
*   **Property Discovery & Search**: Fully filterable listings workspace (location, types, budget limits, BHK configurations).
*   **Property Submissions**: Integrated stepper listing wizard for users to suggest property listings directly.
*   **Real-Time Interactions**: Interactive enquiry forms, dynamic favorites bookmarked local/Firestore lists.
*   **Administrative Panel**: Multi-tab workspace for validation queues, direct property creation/editing, system controls, and CSV lead exports.
*   **Pre-Launch Checklist**: Dynamic developer drawer to track compliance and deployment milestones.

---

## Tech Stack
*   **Frontend Library**: React 19 + TypeScript
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion (`motion/react`)
*   **Backend & Persistence**: Firebase (Authentication & Cloud Firestore)
*   **Bundling**: Vite build tool
*   **Deployment Configuration**: Vercel & custom edge routing

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

*   **Code Config**: Add your email directly to the fallback array `ADMIN_EMAILS` inside `src/firebase.ts`.
*   **Administrative Management**: Log in with Google, navigate to **Admin Panel > Settings > Admin Management**, and dynamically add admin privileges to any verified email.

---

## Configuration

All business detail configurations are structured inside `/src/config.ts`.
Update values like `whatsappNumber`, `businessName`, `reraNumber`, and more before launching to production.

---

## Project Structure

*   `src/components/` — Houses modular views, modals, navbar layouts, and the pre-launch checklists.
*   `src/data/` — Holds general baseline properties data and metadata fallbacks.
*   `src/types.ts` — Houses shared typescript types and structures.
*   `src/firebase.ts` — Implements Firebase client SDK integrations, DB queries, and sign-in modules.
*   `src/config.ts` — Exposes administrative configurations and business parameters.
*   `src/index.css` — Global stylesheet applying base Tailwind layers and layout styling rules.
