# Landing Page Implementation Plan for No-Auth Quiz App

## Goal
Create an engaging landing page to introduce the quiz, explain its value, and encourage users to start, based on usability best practices.

## Phase 1: Frontend Development (Next.js - `frontend/`)

1.  **Identify/Create the Landing Page Route:**
    *   Locate or create the root page component: `frontend/src/app/page.tsx`.

2.  **Design the Landing Page UI (`page.tsx`):**
    *   **Structure:**
        *   **Hero Section:**
            *   **Headline:** Compelling title (e.g., "Understand Your Past: Take the Childhood Trauma Questionnaire").
            *   **Sub-headline/Description:** Explain the quiz and its benefit (e.g., "This validated screening tool can help identify potential impacts of early experiences. Gain insight in just a few minutes.").
            *   **Call-to-Action (CTA) Button:** Prominent button (e.g., "Start the Quiz Now").
        *   **(Optional) How it Works Section:** Briefly explain the steps (Answer questions -> Get results -> Understand impact).
        *   **(Optional) Visual Element:** Sensitive, theme-appropriate background or illustration.
    *   **Styling (Tailwind CSS):**
        *   Focus on readability, clean layout, and consistent branding (soft blue, light gray, teal).
    *   **Responsiveness:** Ensure usability on desktop and mobile.

3.  **Implement Navigation:**
    *   Link the main CTA button to the primary quiz page.
    *   **Simple Approach:** Hardcode the link to the specific quiz slug (e.g., `/quiz/ctq-sf`).
    *   **(Future Enhancement):** Fetch available quiz slugs dynamically if multiple quizzes are planned.

4.  **Content Implementation:**
    *   Write clear, concise, and sensitive copy. Emphasize user benefits and the tool's nature (screening, not diagnosis).

## Phase 2: Backend Development (Node.js/Express - `backend/`)

*   **No Changes Needed (Simple Approach):** If hardcoding the frontend link, no backend changes are required for the landing page itself.
*   **(Future Enhancement):** Add a new API endpoint (e.g., `GET /api/quizzes/list`) if dynamic quiz fetching is needed later.

## Phase 3: Testing & Refinement

1.  **Test Flow:** Verify navigation from landing page (`/`) to the quiz (`/quiz/[slug]`).
2.  **Review:** Check design, copy, and responsiveness across devices. Ensure clarity and CTA prominence.
3.  **Accessibility:** Perform basic checks (contrast, semantic HTML).
