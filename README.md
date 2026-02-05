# MuscleMeter — Luxury Fitness Marketplace

<div align="center">
  
  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
  ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
  ![Supabase](https://img.shields.io/badge/Supabase-2.39-3ECF8E?style=for-the-badge&logo=supabase)
  ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer)

  **The hyper-luxury, two-sided marketplace for elite gyms and athletes.**

  *Awwwards-level design • Zero-fee payments • Real-time crowd tracking*

</div>

---

## ✨ Features

### For Athletes 🏋️
- **Discover Premium Gyms** — Browse curated, luxury fitness spaces
- **Live Crowd Meter** — Real-time occupancy data before you go
- **Zero-Fee Payments** — Pay gyms directly via UPI, no platform fees
- **Instant Access** — Get approved and start training immediately

### For Gym Owners 🏢
- **Stunning Dashboard** — Manage bookings, revenue, and crowd flow
- **Real-time Crowd Control** — Update live occupancy with +/- buttons
- **Direct Payments** — Receive payments straight to your UPI
- **Booking Management** — Approve/reject with one click

### Design & Tech 🎨
- **Equinox meets Cyberpunk** aesthetic
- Deep matte blacks (#050505) with luxury gold accents
- Lenis smooth scrolling
- Framer Motion animations
- Split-screen landing with 50/50 → 75/25 hover expansion
- Glassmorphism UI components
- Fully responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/himanshumudigonda/musclemeter.git
   cd musclemeter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase project
   - Open SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Run the SQL

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
musclemeter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page (split screen)
│   │   ├── explore/           # Athlete gym discovery
│   │   ├── dashboard/         # Owner dashboard
│   │   │   └── setup/         # New gym wizard
│   │   └── auth/              # Sign in/up pages
│   ├── components/
│   │   ├── ui/                # UI components
│   │   └── providers/         # Context providers
│   ├── lib/                   # Utilities & Supabase client
│   └── types/                 # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
└── public/                    # Static assets
```

---

## 💰 Payment System

MuscleMeter uses a **zero-fee manual UPI payment system**:

1. **Athlete selects a plan** → QR code generated with gym's UPI ID
2. **Athlete pays via any UPI app** → Gets UTR (transaction ID)
3. **Athlete submits UTR** → Booking created with "pending" status
4. **Gym owner verifies & approves** → Athlete gets access

**UPI Deep Link Format:**
```
upi://pay?pa={gym_upi_id}&pn={gym_name}&am={amount}&tn={plan_name}
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `void` | #050505 | Primary background |
| `gold` | #C9A962 | Accent, CTAs |
| `pearl` | #FAFAFA | Primary text |
| `pearl-muted` | #A0A0A0 | Secondary text |

**Typography:**
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Scrolling | Lenis |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Icons | Lucide React |
| QR Codes | qrcode |

---

## 📜 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🌐 Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables in Netlify dashboard

---

## 📄 License

MIT © 2026 MuscleMeter

---

<div align="center">
  
  **Built with 💪 for the fitness community**

  [Report Bug](https://github.com/himanshumudigonda/musclemeter/issues) • [Request Feature](https://github.com/himanshumudigonda/musclemeter/issues)

</div>
