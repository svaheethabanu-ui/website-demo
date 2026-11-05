import React, { useState } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Key,
  Layers,
} from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, updateSupabaseConfig, clearSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseAnonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- Run this in your Supabase Project -> SQL Editor
create extension if not exists "uuid-ossp";

-- 1. Profiles Table with Roles (Admin & Student)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;
create policy "Profiles are viewable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- 2. Records Table
create table if not exists public.records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) <= 100),
  email text not null check (char_length(email) <= 150),
  phone text check (phone is null or char_length(phone) <= 30),
  company text check (company is null or char_length(company) <= 100),
  category text not null check (char_length(category) <= 50),
  status text not null default 'Active' check (status in ('Active', 'Pending', 'Completed', 'Archived')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  value numeric(14, 2) default 0,
  notes text check (notes is null or char_length(notes) <= 2000),
  tags text[] default '{}'::text[],
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_records_name on public.records(name);
create index if not exists idx_records_category on public.records(category);
create index if not exists idx_records_status on public.records(status);

-- 3. Row Level Security Policies (Admins: Full CRUD, Students: View/Search Only)
alter table public.records enable row level security;

create or replace function public.is_admin() returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer;

-- SELECT: Students and Admins can view
create policy "Allow Select for Authenticated" on public.records for select to authenticated using (true);

-- MUTATIONS: Only Admins can add, edit, or delete
create policy "Allow Insert for Admins" on public.records for insert to authenticated with check (public.is_admin());
create policy "Allow Update for Admins" on public.records for update to authenticated using (public.is_admin());
create policy "Allow Delete for Admins" on public.records for delete to authenticated using (public.is_admin());`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) return;
    updateSupabaseConfig(inputUrl.trim(), inputKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-indigo-500/30 bg-slate-900 shadow-2xl ring-1 ring-white/10 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Supabase PostgreSQL Setup
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  isConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isConfigured ? 'Connected' : 'Credentials Needed'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                SQL schema, table creation script, RLS policies, and project configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300">
          {/* Quick Connect Credentials Form */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="h-4 w-4 text-indigo-400" />
                <span>Supabase API Credentials</span>
              </span>
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Project URL (<code className="text-indigo-300">VITE_SUPABASE_URL</code>)
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Public Anon Key (<code className="text-indigo-300">VITE_SUPABASE_ANON_KEY</code>)
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {isConfigured && (
                  <button
                    type="button"
                    onClick={clearSupabaseConfig}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Reset to Default Demo
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {saveSuccess && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Saved!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    Save & Connect Supabase
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* SQL Editor Instructions */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span>Execute in Supabase SQL Editor (`supabase_schema.sql`)</span>
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied SQL' : 'Copy Script'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Open your Supabase project, navigate to <strong>SQL Editor</strong> &gt; <strong>New query</strong>, paste the script below, and click <strong>Run</strong>.
            </p>
            <pre className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800 max-h-56">
              {sqlCode}
            </pre>
          </div>

          {/* RLS Security highlights */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Row Level Security (RLS) Permissions Enforced</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                <span className="font-semibold text-indigo-300 block mb-0.5">ADMIN Role</span>
                <span className="text-slate-400">Full CRUD: Can add, edit, delete, search, and view all records.</span>
              </div>
              <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                <span className="font-semibold text-emerald-300 block mb-0.5">STUDENT Role</span>
                <span className="text-slate-400">Read & Search Only: Can search and view records; cannot insert or modify.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/40">
          <span className="text-[11px] text-slate-500">
            Also saved at <code className="text-indigo-400">/supabase_schema.sql</code> in root
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
