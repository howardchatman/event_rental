-- ============================================================
-- Event Rental Platform – Full Schema Migration
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- A) profiles
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'customer' check (role in ('customer','admin')),
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

-- B) categories
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_at  timestamptz not null default now()
);

-- C) products
create table public.products (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  slug                  text unique not null,
  description           text,
  category_id           uuid references public.categories(id) on delete set null,
  pricing_model         text not null default 'per_day' check (pricing_model in ('per_day','flat','weekend')),
  base_price_cents      int not null,
  security_deposit_cents int not null default 0,
  total_qty             int not null default 0,
  active                bool not null default true,
  created_at            timestamptz not null default now()
);

-- D) product_images
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

-- E) orders
create table public.orders (
  id                          uuid primary key default gen_random_uuid(),
  customer_id                 uuid not null references auth.users(id),
  status                      text not null default 'pending_payment'
                                check (status in ('pending_payment','paid','scheduled','out_for_delivery','completed','cancelled')),
  event_date_start            date not null,
  event_date_end              date not null,
  delivery_required           bool not null default false,
  delivery_address            jsonb,
  subtotal_cents              int not null default 0,
  tax_cents                   int not null default 0,
  delivery_fee_cents          int not null default 0,
  deposit_cents               int not null default 0,
  total_cents                 int not null default 0,
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  created_at                  timestamptz not null default now()
);

-- F) order_items
create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid not null references public.products(id),
  qty             int not null,
  unit_price_cents int not null,
  line_total_cents int not null,
  created_at      timestamptz not null default now()
);

-- G) reservations
create table public.reservations (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  qty         int not null,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'held' check (status in ('held','confirmed','released')),
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
create index idx_reservations_product_dates on public.reservations(product_id, start_date, end_date);
create index idx_orders_customer            on public.orders(customer_id, created_at desc);
create index idx_products_slug              on public.products(slug);
create index idx_products_category          on public.products(category_id);
create index idx_reservations_status        on public.reservations(status, expires_at);

-- ============================================================
-- 3. HELPER FUNCTION: is_admin()
-- ============================================================
create or replace function public.is_admin()
returns bool
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

-- profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- categories: public read
alter table public.categories enable row level security;

create policy "Public read categories"
  on public.categories for select
  using (true);

create policy "Admin manage categories"
  on public.categories for all
  using (public.is_admin());

-- products: public read
alter table public.products enable row level security;

create policy "Public read active products"
  on public.products for select
  using (true);

create policy "Admin manage products"
  on public.products for all
  using (public.is_admin());

-- product_images: public read
alter table public.product_images enable row level security;

create policy "Public read product images"
  on public.product_images for select
  using (true);

create policy "Admin manage product images"
  on public.product_images for all
  using (public.is_admin());

-- orders
alter table public.orders enable row level security;

create policy "Customers view own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

create policy "Customers create own orders"
  on public.orders for insert
  with check (auth.uid() = customer_id);

create policy "Admin manage orders"
  on public.orders for all
  using (public.is_admin());

-- order_items
alter table public.order_items enable row level security;

create policy "Customers view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "Customers insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "Admin manage order items"
  on public.order_items for all
  using (public.is_admin());

-- reservations
alter table public.reservations enable row level security;

create policy "Customers view own reservations"
  on public.reservations for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = reservations.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "Customers insert own reservations"
  on public.reservations for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = reservations.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "Admin manage reservations"
  on public.reservations for all
  using (public.is_admin());

-- ============================================================
-- 6. AVAILABILITY RPC – single product
-- ============================================================
create or replace function public.check_availability(
  p_product_id uuid,
  p_start      date,
  p_end        date
)
returns int
language sql
stable
security definer
as $$
  select greatest(0, p.total_qty - coalesce(r.reserved, 0))
  from public.products p
  left join lateral (
    select sum(res.qty)::int as reserved
    from public.reservations res
    where res.product_id = p_product_id
      and res.status in ('held', 'confirmed')
      and not (res.end_date < p_start or res.start_date > p_end)
      and (res.status != 'held' or res.expires_at > now())
  ) r on true
  where p.id = p_product_id;
$$;

-- ============================================================
-- 7. AVAILABILITY RPC – check entire cart
-- ============================================================
-- Accepts a json array: [{"product_id":"...","qty":2}, ...]
-- Returns rows for items that have shortages
create or replace function public.check_cart_availability(
  p_cart  jsonb,
  p_start date,
  p_end   date
)
returns table(product_id uuid, requested int, available int)
language sql
stable
security definer
as $$
  with cart_items as (
    select
      (item ->> 'product_id')::uuid as pid,
      (item ->> 'qty')::int         as requested_qty
    from jsonb_array_elements(p_cart) as item
  ),
  availability as (
    select
      ci.pid,
      ci.requested_qty,
      greatest(0, p.total_qty - coalesce((
        select sum(res.qty)::int
        from public.reservations res
        where res.product_id = ci.pid
          and res.status in ('held', 'confirmed')
          and not (res.end_date < p_start or res.start_date > p_end)
          and (res.status != 'held' or res.expires_at > now())
      ), 0)) as avail_qty
    from cart_items ci
    join public.products p on p.id = ci.pid
  )
  select
    a.pid         as product_id,
    a.requested_qty as requested,
    a.avail_qty   as available
  from availability a
  where a.avail_qty < a.requested_qty;
$$;

-- ============================================================
-- 8. RELEASE EXPIRED HOLDS
-- ============================================================
create or replace function public.release_expired_holds()
returns int
language plpgsql
security definer
as $$
declare
  released_count int;
begin
  update public.reservations
  set status = 'released'
  where status = 'held'
    and expires_at < now();

  get diagnostics released_count = row_count;

  -- also cancel the related orders if all reservations released
  update public.orders
  set status = 'cancelled'
  where status = 'pending_payment'
    and id in (
      select distinct order_id from public.reservations
      where status = 'released'
    )
    and not exists (
      select 1 from public.reservations
      where order_id = orders.id
        and status in ('held', 'confirmed')
    );

  return released_count;
end;
$$;

-- ============================================================
-- 9. STORAGE BUCKET for product images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product image files"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================
-- 10. SEED DATA (optional categories)
-- ============================================================
insert into public.categories (name, slug) values
  ('Tents & Canopies',  'tents-canopies'),
  ('Tables & Chairs',   'tables-chairs'),
  ('Lighting',          'lighting'),
  ('Audio & Visual',    'audio-visual'),
  ('Décor',             'decor'),
  ('Catering Equipment','catering-equipment')
on conflict (slug) do nothing;
