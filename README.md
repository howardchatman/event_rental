# EventRental – Event Rental Relationship Platform

An MVP event rental platform built with Next.js 14+ App Router, Supabase, Stripe, and Tailwind CSS.

Customers can browse products, select date ranges, add to cart, pay via Stripe Checkout, and receive confirmed orders. Admins can manage products, view orders, and see a calendar view.

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **Supabase** (Postgres, Auth, Storage, Row Level Security)
- **Stripe** (Checkout Sessions + Webhooks)
- **Tailwind CSS**
- **Zustand** (client-side cart state)
- **date-fns** (date utilities)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `supabase/migrations/00001_schema.sql` via the Supabase SQL Editor
3. Copy your project URL and keys into `.env.local` (see `.env.local.example`)

### 3. Stripe

1. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
3. For webhooks, see the section below

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
APP_URL=http://localhost:3000
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing Stripe Checkout Locally

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Log in: `stripe login`
3. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret (`whsec_...`) printed by the CLI into your `.env.local` as `STRIPE_WEBHOOK_SECRET`
5. Use Stripe test card `4242 4242 4242 4242` with any future expiry and any CVC

## Creating an Admin User

1. Sign up through the app UI
2. In the Supabase SQL Editor, run:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
```

3. Admin pages are at `/admin`

## Key Architecture

### Availability System
- Quantity-based inventory (not serialized items)
- Reservations are created as `held` with a 15-minute expiry when checkout begins
- After Stripe payment succeeds (webhook), reservations become `confirmed`
- Expired holds are released by a cron job (`/api/cron/release-holds`) every 5 minutes
- Availability = `total_qty - SUM(active reservations overlapping date range)`

### Pricing Models
- `per_day`: base_price * qty * days
- `flat`: base_price * qty (regardless of days)
- `weekend`: flat rate if entire range is Fri-Sun, otherwise falls back to per_day

### Checkout Flow
1. Client POSTs cart items + dates to `/api/stripe/checkout`
2. Server validates availability, creates order + held reservations
3. Server creates Stripe Checkout Session and returns the URL
4. After payment, Stripe webhook confirms the order and reservations
5. On session expiry, webhook releases holds and cancels the order

## Deploy to Vercel

1. Push to GitHub
2. Import into Vercel
3. Set all environment variables in Vercel project settings
4. Set `APP_URL` to your production domain
5. Set up Stripe webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
6. The cron job for releasing holds is configured in `vercel.json`

## Folder Structure

```
app/
  (storefront)/        # Customer-facing pages
    page.tsx           # Home
    products/          # Product listing + detail
    cart/              # Cart + checkout trigger
    success/           # Post-payment success
    login/             # Auth
  (admin)/             # Admin panel
    admin/
      page.tsx         # Dashboard
      products/        # CRUD products
      orders/          # Order management
      calendar/        # Calendar view
  api/
    stripe/checkout/   # Create Stripe session
    stripe/webhook/    # Handle Stripe events
    cron/release-holds/ # Cleanup expired holds
lib/
  supabase/            # Client, server, admin helpers
  stripe/              # Stripe client
  pricing/             # Pricing calculator
  availability/        # RPC wrappers
  store/               # Zustand cart store
components/            # Shared UI components
supabase/migrations/   # SQL schema
```
