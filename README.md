# Childhood Trauma Questionnaire (CTQ) Web Application

This project implements a web-based version of the Childhood Trauma Questionnaire - Short Form (CTQ-SF), allowing users to take the quiz anonymously, receive their scores broken down by trauma type, and optionally subscribe to an email list.

The application consists of two main parts:

1.  **Frontend:** A Next.js application (using the App Router) responsible for displaying the quiz interface, collecting answers, calculating detailed CTQ-SF scores client-side, displaying results, handling sharing, and managing email subscriptions via direct Supabase interaction.
2.  **Backend:** A simple Node.js/Express API responsible for receiving raw answers, calculating a *basic* overall score (currently not the detailed CTQ-SF scales), and returning it. *(Note: The primary CTQ-SF calculation logic resides in the frontend)*.

## Features

*   Take the CTQ-SF quiz anonymously.
*   View results broken down by trauma type (Emotional Abuse, Physical Abuse, Sexual Abuse, Emotional Neglect, Physical Neglect) and severity level (None, Low, Moderate, Severe).
*   View Minimization/Denial score.
*   Share quiz results via platform share or copying the link.
*   Optional email subscription form.
*   Responsive design.
*   Exit-intent modal on the results page.
*   Conditional therapy ad banners based on results severity (Moderate/Severe).

## Tech Stack

*   **Frontend:**
    *   Next.js (App Router)
    *   React
    *   TypeScript
    *   Tailwind CSS
    *   Supabase (Client Library for data fetching & email subscription)
*   **Backend:**
    *   Node.js
    *   Express
    *   Supabase (Admin Client for score calculation - *currently basic*)
*   **Database:** Supabase (PostgreSQL)
*   **Deployment:**
    *   Frontend: Vercel
    *   Backend: Railway (or similar Node.js hosting)

## Project Structure

```
/
├── frontend/         # Next.js frontend application
│   ├── public/
│   ├── src/
│   ├── .env.local    # Frontend environment variables (DO NOT COMMIT)
│   ├── next.config.js
│   ├── package.json
│   └── ...
├── backend/          # Node.js/Express backend API
│   ├── .env          # Backend environment variables (DO NOT COMMIT)
│   ├── server.js
│   ├── package.json
│   └── ...
├── .gitignore        # Root gitignore
└── README.md         # This file
```

## Setup and Running Locally

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   Git
*   A Supabase project set up with the required tables (see MVP plan) and RLS policies.

### 1. Clone the Repository

```bash
git clone https://github.com/NaviAndrei/childhood-trauma-quiz.git
cd childhood-trauma-quiz
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create a .env file and add your Supabase credentials:
# SUPABASE_URL=YOUR_SUPABASE_URL
# SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
# PORT=3001 # Or any port you prefer

# Start the backend server (defaults to port 3001 if not set in .env)
npm start
# Or for development with automatic restarts (if nodemon is installed):
# npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend # Navigate back to root, then into frontend

# Install dependencies
npm install

# Create a .env.local file and add your Supabase public credentials:
# NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Start the frontend development server (usually on port 3000)
npm run dev
```

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000` (or the port specified by Next.js).

## Environment Variables

Ensure you have the necessary environment variables configured in both the `backend/.env` and `frontend/.env.local` files. **These files should NOT be committed to Git.**

*   **Frontend (`frontend/.env.local`):**
    *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project's anonymous public key.
*   **Backend (`backend/.env`):**
    *   `SUPABASE_URL`: Your Supabase project URL.
    *   `SUPABASE_SERVICE_KEY`: Your Supabase project's service role key (keep this secret!).
    *   `PORT` (Optional): The port the backend server should run on (defaults to 3001 in `server.js`).

## Deployment

*   **Frontend:** Deploy the `frontend` directory to Vercel. Configure the necessary environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's settings.
*   **Backend:** Deploy the `backend` directory to Railway or another Node.js hosting provider. Configure the necessary environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PORT`) in the hosting provider's settings. Ensure CORS is configured correctly in `backend/server.js` if the frontend and backend domains differ.
