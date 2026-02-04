# TasaTrust - Virtual Office Platform

A comprehensive virtual office platform with membership portal, subscription management, and admin dashboard.

## 🎯 Overview

**TasaTrust** is a virtual office platform offering:
- Virtual office subscriptions (Basic, Essential, Professional tiers)
- Add-on services (branding, website building, marketing)
- Member portal with booking and service management
- Admin dashboard for platform management
- Stripe integration for payments

## 🤝 Partnership

| Partner | Role | Contribution |
|---------|------|-------------|
| Marcus Boo | Client / Owner | Virtual office services, domain |
| Herry Ho | Branding & Marketing | Services listed on website |
| Samuel Chan | Developer | Platform development |

## 💰 Pricing

| Tier | Annual | Monthly | Key Benefit |
|------|--------|---------|--------------|
| Basic | $15.99/mo | $17.99/mo | Just an address |
| Essential | $16.99/mo | $18.99/mo | Meeting rooms included |
| Professional | $24.90/mo | $26.90/mo | FREE Website Build |

## 🏗️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Icons | Lucide React |
| Routing | React Router DOM |

## 📁 Project Structure

```
tasatrust/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/
│   │   ├── admin/     # Admin dashboard pages
│   │   └── member/    # Member portal pages
│   ├── lib/           # Utilities (Supabase, Stripe)
│   ├── context/       # React context (Auth)
│   └── App.tsx        # Main app with routes
├── supabase/
│   └── schema.sql     # Database schema
├── public/            # Static assets
└── .env.example      # Environment template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd tasatrust
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema: `supabase/schema.sql`
   - Copy project URL and anon key to `.env`

4. **Set up Stripe:**
   - Create a Stripe account
   - Get publishable and secret keys
   - Create products for each pricing tier
   - Add keys to `.env`

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 📦 Key Features

### Public Website
- Homepage with services overview
- Pricing page with tier comparison
- Services page with add-ons
- About page (team & partnership)
- Contact form

### Member Portal
- Dashboard with subscription overview
- Browse and purchase add-on services
- Meeting room booking system
- Subscription management
- Account settings

### Admin Dashboard
- Overview with revenue analytics
- Service management (CRUD)
- Pricing management per tier
- Order management
- Member management
- Website build tracking
- Analytics

## 🗃️ Database Schema

Key tables:
- `services` - Available services (branding, website, etc.)
- `service_pricing` - Pricing per tier
- `members` - User accounts
- `subscriptions` - Active subscriptions
- `member_services` - Services purchased by members
- `orders` - All orders (one-time + recurring)
- `website_builds` - Website build projects
- `bookings` - Meeting room bookings
- `audit_logs` - Activity tracking

See `supabase/schema.sql` for complete schema.

## 💳 Stripe Integration

### Required Stripe Setup

1. **Products:**
   - Basic Monthly
   - Basic Annual
   - Essential Monthly
   - Essential Annual
   - Professional Monthly
   - Professional Annual

2. **Webhooks:**
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Environment Variables

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🎨 Branding

Colors:
- Primary: `#2D5B5F` (Deep Teal)
- Accent: `#BCA868` (Gold)

Fonts:
- Headings: Montserrat
- Body: Open Sans

## 📱 Routes

| Path | Description |
|------|-------------|
| `/` | Homepage |
| `/pricing` | Pricing page |
| `/services` | Services page |
| `/about` | About page |
| `/contact` | Contact page |
| `/login` | Login |
| `/register` | Register |
| `/member` | Member dashboard |
| `/member/services` | Add-on services |
| `/member/booking` | Meeting bookings |
| `/member/subscription` | Subscription management |
| `/admin` | Admin dashboard |
| `/admin/services` | Manage services |
| `/admin/pricing` | Update pricing |
| `/admin/orders` | View orders |
| `/admin/members` | Member management |

## 🔐 Security

- Row Level Security (RLS) on all tables
- Auth required for member/admin routes
- Service role key for server-side operations
- Webhook signature verification

## 📈 Revenue Model

### Streams
- **Subscriptions:** Monthly recurring revenue
- **One-time add-ons:** Service purchases
- **Recurring add-ons:** Ongoing services

### Projections (Year 1)
- Month 1-3: 10 members, $180 MRR
- Month 4-6: 25 members, $450 MRR
- Month 7-12: 50 members, $900 MRR

## 🚀 Deployment

### Vercel (Frontend)
```bash
vercel deploy
```

### Supabase (Backend)
- Managed via Supabase Cloud
- Auto-deploy from schema changes

### Stripe
- Managed via Stripe Dashboard

## 📄 License

Proprietary - TasaTrust Partnership

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Create PR for review
4. Merge to main after approval

---

Built with ❤️ by Samuel Chan for TasaTrust Partnership
