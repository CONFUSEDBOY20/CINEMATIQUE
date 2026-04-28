<div align="center">
  <h1>🍿 Cinematique</h1>
  <p><strong>A Cinematic Web Application for Movie Discovery & Recommendations</strong></p>
</div>

## 📖 Overview

**Cinematique** is a modern, visually stunning web application built to provide a premium movie browsing experience. It offers real-time movie data, trending lists, personalized AI-powered recommendations, detailed cast metadata, and integrated movie trailers. The project is engineered for high performance with a sleek, cinematic dark-themed UI that utilizes micro-animations and glassmorphism.

## ✨ Key Features

- **Real-Time Data Integration:** Powered by the TMDB API to fetch the latest trending, popular, and upcoming movies.
- **Cinematic UI/UX:** A state-of-the-art interface using React Motion for smooth page transitions and interactive micro-animations.
- **Advanced Search & Filtering:** Quickly find your favorite movies or explore by genres.
- **Detailed Movie Pages:** View deep metadata, cast information, user ratings, and watch embedded YouTube trailers directly in the app.
- **Authentication System:** Secure JWT-based authentication with bcrypt password hashing and user/admin roles.
- **Admin Dashboard:** Specific views and tools exclusively available for administrative users.
- **AI Integration (Gemini):** AI-powered capabilities implemented using the `@google/genai` SDK.
- **Serverless Architecture:** Configured for Vercel deployment with serverless functions.

## 🛠 Tech Stack

**Frontend:**
- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Motion (Framer Motion)](https://motion.dev/)
- [Lucide React](https://lucide.dev/) (Icons)

**Backend & Database:**
- Node.js & Express
- [Supabase](https://supabase.com/) (Database & Auth)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

**APIs:**
- [TMDB API](https://developer.themoviedb.org/docs)
- [Google Gemini API](https://ai.google.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [Supabase](https://supabase.com/) account and project
- API Keys for TMDB and Google Gemini (if using AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd zip # or your project directory name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example `.env` file and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   *Required Variables in `.env`:*
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (Frontend)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key (Frontend)
   - `JWT_SECRET`: A secure random string for JWT signing
   - `GEMINI_API_KEY`: Your Google Gemini API Key

4. **Start the Development Server:**
   The `dev` script concurrently runs both the Vite frontend and the Express backend.
   ```bash
   npm run dev
   ```
   - Frontend will be available at `http://localhost:3000`
   - Backend will run on `http://localhost:5000`

## 📜 Available Scripts

- `npm run dev`: Starts the development servers (frontend + backend) using `concurrently`.
- `npm run server`: Starts just the Node/Express backend via nodemon.
- `npm run build`: Compiles the React application for production.
- `npm run preview`: Locally previews the production build.
- `npm run deploy`: Deploys the `dist` directory to GitHub Pages.

## ☁️ Deployment

This application is configured for seamless deployment on **Vercel**.
The included `vercel.json` ensures that API requests are routed to the serverless functions (`/api/*`), and frontend routes fallback to `index.html`.

To deploy on Vercel:
1. Push your code to a GitHub repository.
2. Import the project in your Vercel dashboard.
3. Add your Environment Variables in the Vercel project settings.
4. Deploy!
