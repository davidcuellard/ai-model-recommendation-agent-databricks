# Landing Page + App Restyle Design

**Date:** 2026-07-10  
**Scope:** Add an interactive stakeholder landing page at `/`, move chat app to `/app`, restyle chat app to match dark theme.

---

## Goals

- Give stakeholders a polished, self-explanatory entry point before they touch the app
- Communicate the problem, solution, and real architecture in a compelling visual format
- Move the chat interface to `/app` without changing any of its logic
- Unify the visual language: dark navy, blue/purple glows, Tailwind throughout

---

## Dependencies to Add

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing (`/` and `/app`) |
| `framer-motion` | Scroll-triggered animations, stagger reveals, SVG path animations |

---

## Routing

`App.tsx` becomes a router shell:

```
/ → LandingPage (new)
/app → ChatPage (existing, restyled)
```

`BrowserRouter` wraps the app in `main.tsx`. Both routes are eagerly loaded (no lazy loading needed at this scale).

---

## Color Palette (Tailwind custom tokens via CSS vars in index.css)

All colors expressed as Tailwind utilities. Core palette:

| Token | Value | Usage |
|---|---|---|
| Background | `#0a0f1e` | Page base (`bg-[#0a0f1e]`) |
| Surface | `#111827` (`gray-900`) | Cards, sidebar |
| Surface raised | `#1f2937` (`gray-800`) | Inputs, hover states |
| Border | `#374151` (`gray-700`) | Card borders |
| Accent blue | `#3b82f6` (`blue-500`) | CTAs, icons, glows |
| Accent purple | `#8b5cf6` (`violet-500`) | Gradient pops |
| Text primary | `#f9fafb` (`gray-50`) | Headlines |
| Text secondary | `#9ca3af` (`gray-400`) | Body, subtitles |
| Danger | `#ef4444` (`red-500`) | Error states |

Glow effect: `shadow-[0_0_20px_rgba(59,130,246,0.4)]` on key elements.

---

## Landing Page — `src/pages/LandingPage.tsx`

### Section 1: Hero (full viewport)

**Layout:** Full-screen (`min-h-screen`), centered content, dark navy base.

**Background:** Animated CSS grid overlay using `bg-[image:linear-gradient(...)]` — a 40×40px grid of `rgba(59,130,246,0.07)` lines, slow infinite pan via a Tailwind `@keyframes` rule in `index.css`.

**Content (Framer Motion stagger, triggered on mount):**
- Badge pill: `School Project · Real World Architecture` — gray-800 bg, blue border, small caps
- H1: `Find the Right AI Model. Instantly.` — each word fades+slides up with 0.1s stagger, `text-5xl font-bold text-white`
- Subline: `Describe what you want to build. The agent decomposes it into subtasks and recommends the best AI model for each — grounded in live OpenRouter data.` — `text-gray-400 text-xl max-w-2xl`
- CTA button: `Launch App →` — blue-to-violet gradient bg, `shadow-[0_0_30px_rgba(59,130,246,0.5)]`, scale-up on hover via Framer `whileHover`
- Scroll indicator: a bouncing chevron-down icon at bottom center (`animate-bounce` Tailwind)

### Section 2: Problem Statement

**Layout:** Two columns, `py-24`.

**Left column — stat block:**
- Large animated number: `300+` — count-up animation (0 → 300) triggered by Intersection Observer on scroll enter, using a `useCountUp` hook
- Label: `AI models on OpenRouter alone`
- Secondary stat: `Hours` spent manually comparing pricing, context length, and capabilities

**Right column — pain points:**
Three items, each with a red-500 warning icon, staggered slide-in on scroll:
1. "Too many models to evaluate manually"
2. "Pricing, context length, and capabilities change constantly"
3. "No single model is best for every subtask"

### Section 3: Why This App

Three cards in a responsive row (`grid grid-cols-1 md:grid-cols-3`), each sliding up with stagger on scroll enter via `whileInView` + `viewport={{ once: true }}`.

| Icon | Title | Body |
|---|---|---|
| Database | Grounded in live data | Pulls the full OpenRouter catalog fresh — no stale hardcoded lists |
| Layers | Subtask decomposition | Breaks your prompt into sub-problems and matches the right model to each |
| Zap | Instant recommendations | Vector Search over model embeddings returns relevant candidates in milliseconds |

Card style: `bg-gray-900 border border-gray-800 rounded-2xl p-6`, icon in a blue-500 glow circle, hover lifts with `whileHover={{ y: -4 }}`.

### Section 4: How It Works

Horizontal 4-step timeline. On scroll enter, a blue line (`w-0` → `w-full`) animates left-to-right via Framer `animate={{ width: "100%" }}`, then each step node fades in sequentially.

| Step | Label | Detail |
|---|---|---|
| 1 | Describe your task | Type what you want to build in plain language |
| 2 | Agent decomposes | Claude breaks it into subtasks |
| 3 | Vector Search retrieves | Top-5 model chunks from the live catalog |
| 4 | Recommendation delivered | Structured plan with model + rationale per subtask |

On mobile, collapses to a vertical stepper.

### Section 5: System Design Flow

**Label:** `Architecture` — section headline with a `bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent` treatment.

**Diagram:** SVG rendered in React, 100% width, responsive viewBox. Two rows of labeled nodes connected by animated arrows.

**Top row (data pipeline):**
```
[OpenRouter API] ──► [Ingestion Job] ──► [Delta Table] ──► [Vector Search Index]
```

**Bottom row (request flow):**
```
[User] ──► [FastAPI Backend] ──► [Claude via OpenRouter] ──► [Recommendation Card]
              │                           ▲
              └──── Vector Search ────────┘
```

**Node style:** Rounded rect, `fill: #1f2937`, `stroke: #3b82f6`, white label text, small tech badge below (e.g. "Databricks", "OpenRouter", "Claude").

**Arrow animation:** SVG `<path>` with `stroke-dasharray` + `stroke-dashoffset` animated via Framer Motion on a loop — gives a "data flowing" pulse effect. Each arrow animates with a 0.3s offset from the previous, creating a cascade.

**Node pulse:** Each node has a subtle `boxShadow` glow that pulses (opacity 0.3 → 0.8 → 0.3) in sequence, synchronized with the arrow flow.

### Section 6: Footer CTA

Full-width, `bg-gradient-to-b from-[#0a0f1e] to-gray-900`, centered:
- Headline: `Ready to find your model?`
- Subline: `Try the live agent — describe any project and get instant recommendations.`
- Button: same glowing blue-violet gradient as hero CTA → routes to `/app`
- Small footnote: `Built on Databricks · Powered by OpenRouter · Grounded in live data`

---

## Chat App Restyle — `src/pages/ChatPage.tsx` + components

All layout/logic stays the same. Only Tailwind class changes.

### Color mapping (old → new)

| Element | Before | After |
|---|---|---|
| Page bg | `bg-gray-100` / `bg-white` | `bg-[#0a0f1e]` |
| Sidebar bg | `bg-gray-900` | `bg-gray-900` (keep) |
| Chat area bg | `bg-gray-50` / `bg-white` | `bg-[#0f172a]` |
| Input bg | `bg-white border-gray-300` | `bg-gray-800 border-gray-700 text-white` |
| User message bubble | `bg-blue-600 text-white` | `bg-blue-600 text-white` (keep) |
| Assistant message | `bg-white border` | `bg-gray-800 border-gray-700 text-gray-100` |
| Header | `bg-white border-b` | `bg-gray-900 border-gray-800` |
| Text primary | `text-gray-900` | `text-gray-50` |
| Text secondary | `text-gray-500` | `text-gray-400` |
| Buttons | `bg-blue-600` | `bg-blue-600` (keep, add glow on hover) |
| RecommendationCard | white card | `bg-gray-800 border-gray-700` dark card |
| ErrorBanner | red-50 bg | `bg-red-900/30 border-red-700 text-red-300` |

### Sidebar additions
- Add "← Back to Home" link at top linking to `/`
- Keep session management logic unchanged

---

## File Plan

```
src/
├── App.tsx                    ← add BrowserRouter + Routes
├── main.tsx                   ← unchanged
├── index.css                  ← add grid pan keyframes
├── pages/
│   ├── ChatPage.tsx           ← restyle only, no logic changes
│   └── LandingPage.tsx        ← new
└── components/
    └── (all existing)         ← restyle as needed
```

No new hooks, services, or types required.

---

## Animations Summary

| Element | Trigger | Library | Type |
|---|---|---|---|
| Hero text | mount | Framer | stagger fade-up |
| CTA button | hover | Framer | scale + glow |
| Stat count-up | scroll enter | custom hook + Framer | number tween |
| Pain points | scroll enter | Framer `whileInView` | stagger slide-right |
| Why cards | scroll enter | Framer `whileInView` | stagger slide-up |
| Card hover | hover | Framer `whileHover` | lift (y: -4) |
| Timeline line | scroll enter | Framer `animate` | width 0→100% |
| Timeline steps | scroll enter | Framer stagger | fade-in |
| SVG arrows | loop | Framer | dashoffset loop |
| SVG node glow | loop | Framer | opacity pulse |
| Scroll indicator | always | Tailwind | `animate-bounce` |
| Grid bg | always | CSS `@keyframes` | slow translate |

---

## Testing

- Existing backend + frontend tests are unaffected (no logic changes)
- Visually verify: hero loads without flash, scroll animations trigger once, SVG diagram renders on mobile, `/app` route loads ChatPage correctly, "Back to Home" link works
