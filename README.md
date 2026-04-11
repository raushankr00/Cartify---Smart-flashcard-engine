# Cartify — Smart Flashcard Engine

Turn any PDF into a smart, practice-ready flashcard deck with spaced repetition.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **AI**: Anthropic Claude (server-side only — key never exposed)
- **Algorithm**: SM-2 spaced repetition
- **Deploy**: Vercel (frontend) + Render (backend) + MongoDB Atlas

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Anthropic API key

### 1. Install

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/flashcard
JWT_SECRET=any_long_random_32_char_string_here
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-api03-...
FRONTEND_URL=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173

---

## Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. New Web Service on render.com
3. Build: `npm install` | Start: `npm start`
4. Add all env vars from `.env.example`

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. New Project on vercel.com, framework: Vite
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

---

## How the SM-2 Algorithm Works

After each card review the user rates their recall (1–4 buttons):

| Button | Internal Rating | Meaning |
|--------|----------------|---------|
| No idea | 0 | Complete blank |
| Almost  | 2 | Remembered with difficulty |
| Got it  | 3 | Correct with effort |
| Easy    | 5 | Instant recall |

SM-2 then calculates:
- **Interval**: days until next review (1 → 6 → grows exponentially for correct answers)
- **Ease Factor**: per-card difficulty multiplier (starts 2.5, adjusts based on performance)
- **Status**: new → learning → review → mastered

Cards wrong go back to interval=1. Cards answered correctly multiple times grow intervals until they reach "mastered" (21+ day interval, 5+ successful reviews).

---

## Key Decisions

1. **No AI watermark** — The app is named "Cartify", uses warm sand/ink tones, and presents itself as a clean study tool. The card generation pipeline is server-side only.

2. **PDF text extraction on server** — `pdf-parse` extracts text before sending to Claude. Image-based PDFs won't work (expected — we surface a clear error).

3. **SM-2 over Leitner boxes** — SM-2 gives per-card adaptive intervals which is more precise than fixed box buckets.

4. **Card count slider (10–30)** — Lets the user calibrate depth vs. speed. 20 is the default sweet spot.

5. **Session queue = due cards first** — If a user clicks Study All, they see due cards first, then the rest in nextReview order.

---

## What I'd Add With More Time

- **Deck sharing** — share a deck link (read-only) with classmates
- **Streak calendar** — GitHub-style heatmap of study activity
- **Image cards** — support diagrams from PDFs using Claude's vision
- **Bulk import** — paste text directly (not just PDF)
- **Mobile PWA** — offline support with service workers
- **Confidence graph** — per-card accuracy chart over time
