-- Day 3 — Bible: tools, credentials, access matrix.
-- Depends on Day 1 helpers: public.get_my_role(), public.is_admin(),
-- public.touch_updated_at().

-- 1. Categories ---------------------------------------------------------

create table if not exists public.bible_categories (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

-- 2. Entries (tools) ----------------------------------------------------

create table if not exists public.bible_entries (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.bible_categories(id) on delete restrict,
  name text not null,
  icon text,
  url text,
  login text,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bible_entries_category_idx
  on public.bible_entries(category_id, sort_order);

drop trigger if exists touch_bible_entries on public.bible_entries;
create trigger touch_bible_entries
  before update on public.bible_entries
  for each row execute function public.touch_updated_at();

-- 3. Credentials (admin-only) ------------------------------------------

create table if not exists public.bible_credentials (
  entry_id uuid primary key references public.bible_entries(id) on delete cascade,
  password text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_bible_credentials on public.bible_credentials;
create trigger touch_bible_credentials
  before update on public.bible_credentials
  for each row execute function public.touch_updated_at();

-- 4. Access matrix (free-string person labels for v1) ------------------

create table if not exists public.bible_access (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.bible_entries(id) on delete cascade,
  person_label text not null,
  level text not null check (level in ('admin', 'yes', 'no')),
  unique (entry_id, person_label)
);

create index if not exists bible_access_entry_idx
  on public.bible_access(entry_id);

-- 5. RLS ----------------------------------------------------------------

alter table public.bible_categories  enable row level security;
alter table public.bible_entries     enable row level security;
alter table public.bible_credentials enable row level security;
alter table public.bible_access      enable row level security;

-- Categories: cgm+admin read, admin write
drop policy if exists "bible_categories_read" on public.bible_categories;
create policy "bible_categories_read" on public.bible_categories
  for select using (public.get_my_role() in ('cgm', 'admin'));

drop policy if exists "bible_categories_admin_write" on public.bible_categories;
create policy "bible_categories_admin_write" on public.bible_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Entries: cgm+admin read, admin write
drop policy if exists "bible_entries_read" on public.bible_entries;
create policy "bible_entries_read" on public.bible_entries
  for select using (public.get_my_role() in ('cgm', 'admin'));

drop policy if exists "bible_entries_admin_write" on public.bible_entries;
create policy "bible_entries_admin_write" on public.bible_entries
  for all using (public.is_admin()) with check (public.is_admin());

-- Access matrix: cgm+admin read, admin write
drop policy if exists "bible_access_read" on public.bible_access;
create policy "bible_access_read" on public.bible_access
  for select using (public.get_my_role() in ('cgm', 'admin'));

drop policy if exists "bible_access_admin_write" on public.bible_access;
create policy "bible_access_admin_write" on public.bible_access
  for all using (public.is_admin()) with check (public.is_admin());

-- Credentials: admin only (read AND write)
drop policy if exists "bible_credentials_admin_only" on public.bible_credentials;
create policy "bible_credentials_admin_only" on public.bible_credentials
  for all using (public.is_admin()) with check (public.is_admin());
