# TasaTrust Virtual Office Platform

A comprehensive virtual office platform for small businesses in Singapore.

## 🎯 Overview

**TasaTrust** offers three tiers of virtual office services:
- **Basic** ($17.99/mo) — Business address
- **Essential** ($18.99/mo) — Address + meeting rooms
- **Professional** ($26.90/mo) — Everything + FREE website build ($1,499 value)

## 👥 Partnership

| Partner | Role | Contribution |
|---------|------|-------------|
| Marcus Boo | Owner | Virtual office services, physical space |
| Herry Ho | Marketing Partner | Branding, website builds, marketing |
| Samuel Chan | Developer | Platform development, maintenance |

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Icons**: Lucide React

## 📁 Project Structure

```
tasatrust-virtualoffice/
├── src/
│   ├── pages/           # Page components
│   │   ├── Pricing.tsx  # Pricing page
│   │   ├── Services.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   ├── components/      # Reusable components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── pricing/    # Pricing-related
│   │   ├── services/   # Service-related
│   │   └── ...
│   ├── integrations/   # External services
│   │   └── supabase/   # Supabase client
│   └── lib/            # Utilities
├── supabase/
│   └── schema.sql      # Database schema
└── ...
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Deploy

**Vercel** (recommended):
```bash
vercel --prod
```

## 📝 Pricing Strategy

| Tier | Monthly | Annual | Meeting Hours |
|------|---------|--------|---------------|
| Basic | $17.99 | $15.99/mo | 0 |
| Essential | $18.99 | $16.99/mo | 4 hrs/mo |
| Professional | $26.90 | $24.90/mo | 8 hrs/mo + FREE website |

## 📄 License

Proprietary — TasaTrust Partnership

---

Built with ❤️ for small businesses in Singapore
