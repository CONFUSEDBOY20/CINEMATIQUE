<div align="center">
  <h1>🍿 Cinematique</h1>
  <p><strong>A Cinematic Web Application for Movie Discovery & Recommendations</strong></p>
</div>

---

## 📖 Overview

**Cinematique** is a modern, visually stunning web application engineered to provide a premium movie browsing experience. It offers real-time movie data, trending lists, personalized AI-powered recommendations, detailed cast metadata, and integrated movie trailers. The project is designed for high performance with a sleek, cinematic dark-themed UI that utilizes micro-animations, lazy loading, and glassmorphism.

The application uses a robust architecture that features a React 19 frontend seamlessly integrated with a hybrid backend. It supports both local development via a Node/Express server and production deployment utilizing Vercel's Serverless Functions. Data storage and authentication are securely managed via Supabase.

---

## ✨ Key Features

- **Real-Time TMDB Integration:** Fetches the latest trending, popular, and upcoming movies directly from the TMDB API.
- **Cinematic UI/UX:** A state-of-the-art interface using Framer Motion (`motion/react`) for smooth page transitions, interactive micro-animations, and a highly polished dark-mode aesthetic.
- **Advanced Search & Filtering:** Quickly find your favorite movies with live search capabilities and genre filtering.
- **Detailed Movie Profiles:** View deep metadata, synopsis, cast information, user ratings, and watch embedded YouTube trailers directly within the application.
- **Personalized Watchlists & Profiles:** Users can create an account, build custom watchlists, and manage their personal movie library.
- **Secure Authentication System:** Full JWT-based authentication flow with bcrypt password hashing.
- **Role-Based Access Control (RBAC):** Built-in administrative roles with an exclusive Admin Dashboard for platform management.
- **AI Integration:** Uses the Google Gemini API (`@google/genai`) to power intelligent, personalized movie recommendations and dynamic content.
- **Performance Optimized:** Implements lazy loading (`LazyImage.tsx`), code splitting (React `lazy` and `Suspense`), and optimized image fetching strategies.

---

## 🏗 Tech Stack & Architecture

### **Frontend**
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with custom utility classes for glassmorphism.
- **Animations:** [Motion](https://motion.dev/) (Framer Motion) for sophisticated entry/exit and hover animations.
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Visualization:** [Recharts](https://recharts.org/) (for Admin Dashboard analytics)

### **Backend & APIs**
- **Serverless API:** Vercel Serverless Functions (`/api/*` directory) for production endpoints (login, registration, user management, movies).
- **Local Dev Server:** Node.js & Express (`/server/index.js`) using `nodemon` for rapid local testing.
- **External Data:** [TMDB API](https://developer.themoviedb.org/docs) for rich movie datasets.
- **AI Engine:** [Google Gemini API](https://ai.google.dev/) for NLP and intelligent recommendations.

### **Database & Auth**
- **Database Service:** [Supabase](https://supabase.com/) (PostgreSQL under the hood).
- **Authentication:** Custom JWT-based stateless auth, securely verifying users against the Supabase DB.

---

## 📂 Project Structure

```text
cinematique/
├── api/                  # Vercel Serverless Functions (Auth, Users, Movies)
├── server/               # Express.js local development server & seed scripts
├── src/
│   ├── components/       # Reusable UI components (MovieCard, LazyImage, SplashScreen)
│   ├── context/          # React Context providers (AppContext for global state)
│   ├── lib/              # Utility functions and API wrappers (tmdb.ts)
│   ├── pages/            # Application routes (Home, Profile, Watchlist, Admin Dashboard)
│   ├── App.tsx           # Main application entry and router
│   └── main.tsx          # React DOM mounting point
├── supabase/             # Database schema, migrations, or local configs
├── vercel.json           # Vercel deployment and routing configuration
├── vite.config.ts        # Vite bundler configuration
└── package.json          # Project dependencies and NPM scripts
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 1. Prerequisites
- **Node.js**: v18 or higher is recommended.
- **Supabase**: A free [Supabase](https://supabase.com/) account and a newly created project.
- **API Keys**: You will need keys for [TMDB](https://developer.themoviedb.org/reference/intro/getting-started) and [Google Gemini](https://aistudio.google.com/app/apikey).

### 2. Installation

Clone the repository and install the NPM dependencies:

```bash
git clone <your-repo-url>
cd cinematique
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory by copying the provided example:

```bash
cp .env.example .env
```

Populate the `.env` file with your specific credentials:

```env
# Supabase — find these in your project: Settings > API
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Frontend Supabase Keys
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Security
JWT_SECRET=your_super_secret_jwt_string

# APIs (If required by specific features)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Seeding (Optional)
If you need to populate your Supabase database with initial mock data or admin users, you can run the seed script:
```bash
npm run seed
```

### 5. Running the Application Locally

The project utilizes `concurrently` to run both the Vite frontend and the Express backend simultaneously.

```bash
npm run dev
```

- **Frontend:** Available at `http://localhost:3000`
- **Backend:** Available at `http://localhost:5000`

---

## 📜 NPM Scripts Overview

- `npm run dev`: Starts both the Vite frontend server and the Express backend server concurrently.
- `npm run server`: Starts the backend Express server independently via `nodemon`.
- `npm run build`: Compiles and bundles the React application for production into the `dist` directory.
- `npm run preview`: Locally serves the production `dist` build for testing.
- `npm run seed`: Executes the `server/seed.js` script to populate the database.
- `npm run lint`: Runs TypeScript type-checking (`tsc --noEmit`).
- `npm run deploy`: Automatically builds and deploys the `dist` folder to GitHub Pages.

---

## ☁️ Deployment

Cinematique is heavily optimized for deployment on **Vercel**. 

The included `vercel.json` ensures that any request to `/api/*` is routed to the serverless Node.js functions within the `api/` directory, while all other requests fall back to `index.html` to be handled by React Router.

**Steps to Deploy via Vercel:**
1. Push your local repository to GitHub, GitLab, or Bitbucket.
2. Log into [Vercel](https://vercel.com/) and create a "New Project".
3. Import your Cinematique repository.
4. **Crucial:** In the deployment settings, add all the environment variables from your `.env` file to the Vercel Environment Variables section.
5. Click **Deploy**. Vercel will automatically run `npm run build` and provision your serverless functions.
