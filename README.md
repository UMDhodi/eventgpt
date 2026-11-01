# EventGpt — Cinematic AI Event Planning Assistant

> Event-management agency site · cinematic scroll-zoom transitions · AI planner · v1.0  
> Prepared for **Mayank / Niora Star**

EventGpt is a producer-grade event planning intelligence designed like an interactive high-production theatre. It unites stadium acoustics, botanical floral architecture, and unbundled budgets across 38 cities in India.

---

## ✦ Core Features

- **"Curtain Up" Per-Page Color System**:
  - `Home`: Gold & Violet (`#E8B84A` & `#7B4DFF`)
  - `Music Concert`: Violet & Electric Blue (`#7B4DFF` & `#2FA8FF`)
  - `Wedding`: Light Ivory & Sage (`#8FA98A` & `#E9D8C4`, light background `#F6F0E6`)
  - `Birthday`: Confetti Gold & Coral (`#FFC83D` & `#FF6B6B`)
  - `AI Chat / Plan`: Mint & Violet (`#6EE7C8` & `#7B4DFF`)
  - `Checkout`: Pure Gold (`#E8B84A`)
  - `Loom Footer`: Terracotta (`#C4623A`), Cream (`#F5EBDD`), and Indian Monuments Skyline (`#9E4A2A`).
- **Signature Feature 1: Letter-Portal Zoom**:
  - Pinned hero sections where the camera dives into a target letter, scaling up to become the portal into the next venue.
  - Optical counter-hole reveals for letters with counters (`o`, `d`, `B`, `A`, `P`).
- **Signature Feature 2: 3D Ring Gallery in Projected Space**:
  - Mathematically calculated angles ensuring equal projected screen gaps within 0.5px.
  - Interactive with pointer drag, mouse wheel, keyboard arrows, and click-to-center.
- **Signature Feature 3: Fanned Quote Deck**:
  - Testimonials fanned across the width with dynamic rotation and scaling based on distance from focus.
- **Signature Feature 4: Loom Footer & Monuments Skyline**:
  - Illustrated skyline featuring Taj Mahal, India Gate, Hawa Mahal, Gateway of India, Qutub Minar, Charminar, and Lotus Temple.
- **AI Planning Suite**:
  - `/chat`: Interactive chat with fold-out parameter toolbar (M8) and live "Plan so far" summary card.
  - `/plan`: 6-step wizard, 3D Orbit Sphere loader (M5), Pack-opening card reveal (M9), timeline, and budget breakdown.
  - `/checkout`: Unfolding crumpled receipt (M7), 30% advance deposit option, GST line items, and confetti booking confirmation.

---

## ✦ Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
npm install --legacy-peer-deps
```

### Running Locally
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Running Test Suite
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## ✦ Environment Variables (Optional)
If you wish to use live Google Gemini 1.5 Flash in place of the built-in producer mock engine:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```
