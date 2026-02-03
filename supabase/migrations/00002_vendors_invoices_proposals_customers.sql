-- ============================================================
-- Vendors, Invoices, Proposals, Customers
-- ============================================================

-- A) vendors
create table if not exists public.vendors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null default 'other'
                check (category in ('florist','caterer','photographer','dj','planner','rental_partner','transport','staffing','other')),
  contact_name text,
  email       text,
  phone       text,
  website     text,
  notes       text,
  active      bool not null default true,
  created_at  timestamptz not null default now()
);

-- B) customers
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  first_name  text not null,
  last_name   text not null,
  email       text,
  phone       text,
  company     text,
  notes       text,
  total_spent_cents int not null default 0,
  created_at  timestamptz not null default now()
);

-- C) proposals
create table if not exists public.proposals (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references public.customers(id) on delete set null,
  title           text not null,
  status          text not null default 'draft'
                    check (status in ('draft','sent','viewed','accepted','declined','expired')),
  event_date      date,
  event_type      text,
  venue           text,
  guest_count     int,
  subtotal_cents  int not null default 0,
  discount_cents  int not null default 0,
  total_cents     int not null default 0,
  notes           text,
  valid_until     date,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- D) proposal_items
create table if not exists public.proposal_items (
  id              uuid primary key default gen_random_uuid(),
  proposal_id     uuid not null references public.proposals(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  description     text not null,
  qty             int not null default 1,
  unit_price_cents int not null,
  line_total_cents int not null,
  sort            int not null default 0,
  created_at      timestamptz not null default now()
);

-- E) invoices
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  invoice_number  text unique not null,
  customer_id     uuid references public.customers(id) on delete set null,
  order_id        uuid references public.orders(id) on delete set null,
  proposal_id     uuid references public.proposals(id) on delete set null,
  status          text not null default 'draft'
                    check (status in ('draft','sent','viewed','paid','overdue','cancelled','refunded')),
  issue_date      date not null default current_date,
  due_date        date not null,
  subtotal_cents  int not null default 0,
  tax_cents       int not null default 0,
  discount_cents  int not null default 0,
  total_cents     int not null default 0,
  amount_paid_cents int not null default 0,
  notes           text,
  sent_at         timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- F) invoice_items
create table if not exists public.invoice_items (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid not null references public.invoices(id) on delete cascade,
  description     text not null,
  qty             int not null default 1,
  unit_price_cents int not null,
  line_total_cents int not null,
  sort            int not null default 0,
  created_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_vendors_category on public.vendors(category);
create index if not exists idx_customers_email on public.customers(email);
create index if not exists idx_proposals_customer on public.proposals(customer_id);
create index if not exists idx_proposals_status on public.proposals(status);
create index if not exists idx_invoices_customer on public.invoices(customer_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_due_date on public.invoices(due_date);

-- RLS
alter table public.vendors enable row level security;
create policy "Admin manage vendors" on public.vendors for all using (public.is_admin());
create policy "Public read vendors" on public.vendors for select using (true);

alter table public.customers enable row level security;
create policy "Admin manage customers" on public.customers for all using (public.is_admin());

alter table public.proposals enable row level security;
create policy "Admin manage proposals" on public.proposals for all using (public.is_admin());

alter table public.proposal_items enable row level security;
create policy "Admin manage proposal items" on public.proposal_items for all using (public.is_admin());

alter table public.invoices enable row level security;
create policy "Admin manage invoices" on public.invoices for all using (public.is_admin());

alter table public.invoice_items enable row level security;
create policy "Admin manage invoice items" on public.invoice_items for all using (public.is_admin());
