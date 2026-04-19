# 🍃 One Leaf

> *A calming daily ritual for curious minds.*

A gentle, atmospheric web app that invites you to gather one thing each day — a fact, a thought, a wonder. When you have nothing to gather, it finds something worth knowing just for you.

---

## Features

- **Hero Circle** — Click to write what you learned. A poetic AI reflection responds.
- **Mood Color Picker** — Pick the color of your day; the AI curates a gift card of wonder matched to your mood and interests.
- **Polaroid Cards** — Beautiful flipable fact/puzzle/exercise/observation cards, AI-generated via ChatAnywhere.
- **Glass Jar Archive** — All your gatherings stored in an animated jar. Synced to Supabase if signed in, localStorage otherwise.
- **Ephemeral Mode** (🌙) — Toggle to make thoughts vanish after 24 hours. No pressure.
- **Ink Rain Silence Mode** — Sit still for 45 seconds. Watch ink fall. A single word appears.
- **Wunderkammer** — A secret cabinet at the bottom of the screen. Barely visible. Worth finding.
- **Onboarding Card Sort** — Choose 3 interest cards (Gear, Telescope, Book…) to shape your daily wonders.
- **Time-of-Day Gradients** — The background shifts: peach at dawn, lavender at dusk, midnight blue at night.
- **Supabase Auth** — Sign in to sync your jar across devices.

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd one-leaf
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase-setup.sql`
3. Copy your **Project URL** and **anon public key** from Settings → API

### 3. ChatAnywhere

- You already have your API key. It's compatible with OpenAI's API format.
- Default model: `gpt-3.5-turbo`

### 4. Environment Variables

Create `.env.local` for local development:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CHATANYWHERE_API_KEY=sk-...
VITE_CHATANYWHERE_API_URL=https://api.chatanywhere.tech/v1/chat/completions
```

### 5. Local Development

```bash
npm run dev
```

---

## Deploy to Netlify

### Option A: Netlify UI (Recommended)

1. Push to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → Import from Git
3. Build settings are auto-detected via `netlify.toml`
4. Go to **Site Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `VITE_CHATANYWHERE_API_KEY` | your ChatAnywhere key |
| `VITE_CHATANYWHERE_API_URL` | `https://api.chatanywhere.tech/v1/chat/completions` |

5. Trigger a redeploy. Done. ✓

### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJ..."
netlify env:set VITE_CHATANYWHERE_API_KEY "sk-..."
netlify env:set VITE_CHATANYWHERE_API_URL "https://api.chatanywhere.tech/v1/chat/completions"
netlify deploy --prod
```

---

## Architecture

```
src/
├── components/
│   ├── HeroCircle.jsx      ← Main interaction + AI reflection
│   ├── MoodPicker.jsx      ← Color swatches for mood
│   ├── PolaroidCard.jsx    ← AI content gift card
│   ├── GlassJar.jsx        ← Archive modal
│   ├── InkRain.jsx         ← Silence mode animation
│   ├── AuthModal.jsx       ← Supabase sign in/up
│   └── Onboarding.jsx      ← Category card sort
├── hooks/
│   ├── useAuth.jsx         ← Supabase auth context
│   └── useJar.js           ← Seeds state + persistence
├── lib/
│   ├── supabase.js         ← Supabase client
│   ├── chatanywhere.js     ← AI content generation
│   └── theme.js            ← Time-of-day gradient logic
├── pages/
│   └── Home.jsx            ← Main page + orchestration
└── index.css               ← Global styles, animations
```

---

## Supabase Auth Setup (Important)

In your Supabase dashboard:
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your Netlify URL (e.g. `https://your-site.netlify.app`)
3. Add `https://your-site.netlify.app/**` to **Redirect URLs**

---

*"Not all those who wander are lost — some are just gathering."*
