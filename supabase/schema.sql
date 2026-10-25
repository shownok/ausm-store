-- =====================================================================
-- ausm store — database schema for Supabase (Postgres)
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Then run seed.sql for the placeholder catalog (optional).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Tables ----------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  group_name  text not null default 'Fashion'
              check (group_name in ('Fashion','Accessories','Lifestyle','Phone & Tech')),
  image_url   text,
  sort_order  int  not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text not null default '',
  category_id      uuid not null references public.categories(id) on delete restrict,
  price            int  not null check (price >= 0),            -- BDT (whole taka)
  compare_at_price int  check (compare_at_price is null or compare_at_price >= 0),
  images           text[] not null default '{}',
  tags             text[] not null default '{}',
  featured         boolean not null default false,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

create table if not exists public.variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  name        text not null,                 -- "M", "Black / L", "iPhone 15", "Standard"
  sku         text,
  price       int  check (price is null or price >= 0),   -- overrides product price
  stock       int  not null default 0 check (stock >= 0),
  sort_order  int  not null default 0
);
create index if not exists variants_product_idx on public.variants(product_id);

create table if not exists public.store_settings (
  id                     int primary key default 1 check (id = 1),  -- single row
  store_name             text not null default 'ausm',
  whatsapp               text not null default '',
  email                  text not null default '',
  bkash_number           text not null default '',
  nagad_number           text not null default '',
  delivery_inside_dhaka  int  not null default 70,
  delivery_outside_dhaka int  not null default 130,
  free_delivery_over     int,
  announcement           text not null default ''
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     bigint generated always as identity (start with 1001) unique,
  customer_name    text not null,
  phone            text not null,
  email            text,
  address          text not null,
  city             text not null,
  zone             text not null check (zone in ('inside_dhaka','outside_dhaka')),
  note             text,
  payment_method   text not null check (payment_method in ('cod','bkash','nagad')),
  payment_ref      text,
  subtotal         int  not null,
  delivery_charge  int  not null,
  total            int  not null,
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','shipped','delivered','cancelled','returned')),
  admin_note       text,
  created_at       timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_phone_idx on public.orders(phone);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  variant_id    uuid references public.variants(id) on delete set null,
  product_name  text not null,      -- copied at purchase time
  variant_name  text,
  unit_price    int  not null,      -- price at purchase time
  quantity      int  not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- Who can use the admin panel. Add rows here for each team member.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'staff' check (role in ('owner','staff')),
  created_at timestamptz not null default now()
);

-- ---------- Helper: is the current user an admin? --------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------- Row Level Security ----------------------------------------
-- Customers (anonymous visitors) can only READ active catalog data.
-- Orders are created exclusively through place_order() below.
-- Admins (rows in admin_users) can read and write everything.

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.variants       enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.admin_users    enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (active or public.is_admin());
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (active or public.is_admin());
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read variants" on public.variants;
create policy "public read variants" on public.variants
  for select using (true);
drop policy if exists "admin write variants" on public.variants;
create policy "admin write variants" on public.variants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings
  for select using (true);
drop policy if exists "admin write settings" on public.store_settings;
create policy "admin write settings" on public.store_settings
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin all orders" on public.orders;
create policy "admin all orders" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin all order items" on public.order_items;
create policy "admin all order items" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read admins" on public.admin_users;
create policy "admins read admins" on public.admin_users
  for select using (public.is_admin());

-- ---------- place_order(): the only way customers create orders --------
-- Prices, delivery charge and stock are checked here on the server, so a
-- visitor cannot change prices in their browser. Stock is reduced atomically.

create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  s            public.store_settings;
  v_order_id   uuid;
  v_number     bigint;
  v_subtotal   int := 0;
  v_delivery   int;
  v_item       jsonb;
  v_qty        int;
  v_variant    public.variants;
  v_product    public.products;
  v_price      int;
  v_zone       text := payload->>'zone';
  v_payment    text := payload->>'payment_method';
begin
  if coalesce(trim(payload->>'customer_name'), '') = ''
     or coalesce(trim(payload->>'phone'), '') !~ '^01[3-9][0-9]{8}$'
     or coalesce(trim(payload->>'address'), '') = ''
     or coalesce(trim(payload->>'city'), '') = '' then
    raise exception 'INVALID_CUSTOMER';
  end if;
  if v_zone not in ('inside_dhaka','outside_dhaka') then raise exception 'INVALID_ZONE'; end if;
  if v_payment not in ('cod','bkash','nagad') then raise exception 'INVALID_PAYMENT'; end if;
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0
     or jsonb_array_length(payload->'items') > 50 then
    raise exception 'EMPTY_CART';
  end if;

  select * into s from public.store_settings where id = 1;

  insert into public.orders (customer_name, phone, email, address, city, zone, note,
                             payment_method, payment_ref, subtotal, delivery_charge, total)
  values (left(trim(payload->>'customer_name'), 120), trim(payload->>'phone'),
          nullif(left(trim(coalesce(payload->>'email','')), 200), ''),
          left(trim(payload->>'address'), 500), left(trim(payload->>'city'), 80), v_zone,
          nullif(left(trim(coalesce(payload->>'note','')), 500), ''),
          v_payment, nullif(left(trim(coalesce(payload->>'payment_ref','')), 60), ''),
          0, 0, 0)
  returning id, order_number into v_order_id, v_number;

  for v_item in select * from jsonb_array_elements(payload->'items') loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 20 then raise exception 'INVALID_QUANTITY'; end if;

    select * into v_variant from public.variants
      where id = (v_item->>'variant_id')::uuid for update;
    if not found then raise exception 'ITEM_NOT_FOUND'; end if;

    select * into v_product from public.products where id = v_variant.product_id;
    if not found or not v_product.active then raise exception 'ITEM_NOT_FOUND'; end if;

    if v_variant.stock < v_qty then
      raise exception 'OUT_OF_STOCK:%', v_product.name || ' (' || v_variant.name || ')';
    end if;

    v_price := coalesce(v_variant.price, v_product.price);
    v_subtotal := v_subtotal + v_price * v_qty;

    update public.variants set stock = stock - v_qty where id = v_variant.id;

    insert into public.order_items (order_id, product_id, variant_id, product_name,
                                    variant_name, unit_price, quantity)
    values (v_order_id, v_product.id, v_variant.id, v_product.name, v_variant.name, v_price, v_qty);
  end loop;

  if s.free_delivery_over is not null and v_subtotal >= s.free_delivery_over then
    v_delivery := 0;
  elsif v_zone = 'inside_dhaka' then
    v_delivery := s.delivery_inside_dhaka;
  else
    v_delivery := s.delivery_outside_dhaka;
  end if;

  update public.orders
     set subtotal = v_subtotal, delivery_charge = v_delivery, total = v_subtotal + v_delivery
   where id = v_order_id;

  return jsonb_build_object('id', v_order_id, 'order_number', v_number,
                            'total', v_subtotal + v_delivery);
end;
$$;

-- Limited, read-only view of one order for the confirmation page.
-- The order id is a random UUID, so it can't be guessed.
create or replace function public.get_order_summary(p_order_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id, 'order_number', o.order_number, 'customer_name', o.customer_name,
    'total', o.total, 'subtotal', o.subtotal, 'delivery_charge', o.delivery_charge,
    'payment_method', o.payment_method, 'status', o.status,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
                'product_name', i.product_name, 'variant_name', i.variant_name,
                'quantity', i.quantity, 'unit_price', i.unit_price))
              from public.order_items i where i.order_id = o.id), '[]'::jsonb))
  from public.orders o where o.id = p_order_id;
$$;

-- Admin helper: put stock back when an order is cancelled or returned.
create or replace function public.restock_order(p_order_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  update public.variants v
     set stock = v.stock + i.quantity
    from public.order_items i
   where i.order_id = p_order_id and i.variant_id = v.id;
end;
$$;

revoke all on function public.place_order(jsonb) from public;
revoke all on function public.get_order_summary(uuid) from public;
revoke all on function public.restock_order(uuid) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.get_order_summary(uuid) to anon, authenticated;
grant execute on function public.restock_order(uuid) to authenticated;

-- ---------- Storage bucket for product photos --------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- ---------- Make yourself an admin ------------------------------------
-- 1. Supabase → Authentication → Users → Add user (email + password).
-- 2. Run (replace the email):
--
-- insert into public.admin_users (user_id, email, role)
-- select id, email, 'owner' from auth.users where email = 'you@ausm.com.bd';
