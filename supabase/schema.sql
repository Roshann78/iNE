create extension if not exists pgcrypto;

create table tracked_products (
  id uuid primary key default gen_random_uuid(),
  store_product_id text not null,
  name text not null,
  url text not null,
  created_at timestamptz default now()
);

create table price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references tracked_products(id) on delete cascade,
  price numeric,
  in_stock boolean,
  scraped_at timestamptz default now()
);

create table scrape_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references tracked_products(id) on delete cascade,
  status text check (status in ('success','retried','failed')),
  attempt_number int default 1,
  error_message text,
  duration_ms int,
  created_at timestamptz default now()
);
