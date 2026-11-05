-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) FOR APEXCRUD
-- Run this complete script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create User Profiles table with Role-Based Access Control (Admin vs Student)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 3. Create Records table
create table if not exists public.records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) <= 100 and char_length(name) > 0),
  email text not null check (char_length(email) <= 150),
  phone text check (phone is null or char_length(phone) <= 30),
  company text check (company is null or char_length(company) <= 100),
  category text not null check (char_length(category) <= 50),
  status text not null default 'Active' check (status in ('Active', 'Pending', 'Completed', 'Archived')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  value numeric(14, 2) default 0 check (value >= 0),
  notes text check (notes is null or char_length(notes) <= 2000),
  tags text[] default '{}'::text[],
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Create Performance Indexes for Search & Filter queries
create index if not exists idx_records_name on public.records using gin (to_tsvector('english', name));
create index if not exists idx_records_email on public.records(email);
create index if not exists idx_records_category on public.records(category);
create index if not exists idx_records_status on public.records(status);
create index if not exists idx_records_priority on public.records(priority);
create index if not exists idx_records_created_at on public.records(created_at desc);

-- 5. Auto-update updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists set_records_updated_at on public.records;
create trigger set_records_updated_at
  before update on public.records
  for each row execute procedure public.handle_updated_at();

-- 6. Trigger to automatically create a profile row when a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR STUDENT & ADMIN ACCESS
-- ==============================================================================
alter table public.records enable row level security;

-- Helper function to check if current user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- SELECT: Both Students and Admins can view and search records
create policy "Authenticated users (Admins and Students) can view records"
  on public.records for select
  to authenticated
  using (true);

-- INSERT: Only Admins can add records
create policy "Only Admins can insert records"
  on public.records for insert
  to authenticated
  with check (public.is_admin());

-- UPDATE: Only Admins can edit records
create policy "Only Admins can update records"
  on public.records for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE: Only Admins can delete records
create policy "Only Admins can delete records"
  on public.records for delete
  to authenticated
  using (public.is_admin());

-- ==============================================================================
-- 8. INITIAL SEED DATA (Optional)
-- Run this if you want starter records in your database
-- ==============================================================================
insert into public.records (name, email, phone, company, category, status, priority, value, notes, tags)
values
  ('Acme Cloud Infrastructure', 'contact@acmecloud.com', '+1 (555) 234-5678', 'Acme Corporation', 'Enterprise Client', 'Active', 'Critical', 84500.00, 'Multi-region Kubernetes deployment and annual cloud SLA renewal.', array['Cloud', 'Enterprise', 'SLA', 'High-Priority']),
  ('CyberShield Security Audit', 'security@shielddefense.io', '+1 (555) 987-6543', 'Shield Defense Systems', 'Consulting Lead', 'Pending', 'High', 42000.00, 'SOC2 Type II compliance audit and penetration testing contract review.', array['Security', 'Compliance', 'Audit']),
  ('Nexus NextGen Mobile App', 'pm@nexusmobility.tech', '+1 (555) 456-7890', 'Nexus Mobility Corp', 'Software Project', 'Completed', 'Medium', 65000.00, 'React Native iOS and Android companion app launched on App Store.', array['Mobile', 'React Native', 'Delivered']),
  ('Global Supply Chain CRM', 'ops@logisticsworld.net', '+1 (555) 345-6789', 'Vanguard Logistics', 'Operations', 'Active', 'High', 98000.00, 'Warehouse automation API integration and order tracking webhook ingestion.', array['Logistics', 'APIs', 'Integration']),
  ('Q3 Brand Growth Initiative', 'marketing@stellarbrands.co', '+1 (555) 678-1234', 'Stellar Brands Studio', 'Marketing Campaign', 'Archived', 'Low', 18500.00, 'Completed social reach campaigns and influencer sponsorships.', array['Marketing', 'Branding'])
on conflict do nothing;
