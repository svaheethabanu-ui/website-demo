import React, { useState } from 'react';
import {
  Database,
  Shield,
  Zap,
  Cloud,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Mail,
  User as UserIcon,
  KeyRound,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/record';

type AuthViewMode = 'login' | 'register' | 'forgot';

export const LoginPage: React.FC = () => {
  const {
    signInWithEmailPassword,
    signUpWithEmail,
    resetPassword,
    signInAsAdminDemo,
    signInAsStudentDemo,
    authError,
    authSuccess,
    clearAuthMessages,
    isSupabaseLive,
  } = useAuth();

  const [mode, setMode] = useState<AuthViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidation, setFormValidation] = useState('');

  const validate = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormValidation('Please provide a valid email address');
      return false;
    }
    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setFormValidation('Password must be at least 6 characters long');
      return false;
    }
    if (mode === 'register' && !fullName.trim()) {
      setFormValidation('Please enter your full name');
      return false;
    }
    setFormValidation('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    clearAuthMessages();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmailPassword(email, password);
      } else if (mode === 'register') {
        await signUpWithEmail(email, password, fullName, selectedRole);
      } else if (mode === 'forgot') {
        await resetPassword(email);
      }
    } catch {
      // Auth errors are captured and set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-between text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Database className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Apex<span className="text-indigo-400">CRUD</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isSupabaseLive ? 'Supabase PostgreSQL Connected' : 'Supabase Ready • PostgreSQL / Auth'}</span>
          </div>
        </div>
      </header>

      {/* Main Login Hero & Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Product Value & Highlights */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Supabase PostgreSQL & Row Level Security (RLS)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Modern CRUD Management with <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Supabase Database</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Seamlessly create, read, update, search, filter, and delete records with PostgreSQL database storage, role-based student access, and instant search queries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Search & Filter</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Filter by status, category, priority, or multi-field text search.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Admin vs Student Roles</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Students can search & view records; Admins maintain full CRUD control.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Cloud className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Supabase PostgreSQL</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">PostgreSQL database tables with RLS policies and SQL triggers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">CSV & JSON Export</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Batch operations, confirmation modals, and export utilities.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
              {/* Card Header & Tabs */}
              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/40">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {mode === 'login' ? 'Supabase Authentication' : mode === 'register' ? 'Create New Account' : 'Reset Password'}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === 'login'
                    ? 'Sign in with your email and password'
                    : mode === 'register'
                    ? 'Register as an Admin or Student user'
                    : 'Enter your email to receive a password reset link'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-xl bg-slate-950/80 p-1 mb-5 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    clearAuthMessages();
                    setFormValidation('');
                  }}
                  className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    clearAuthMessages();
                    setFormValidation('');
                  }}
                  className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
                    mode === 'register'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    clearAuthMessages();
                    setFormValidation('');
                  }}
                  className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
                    mode === 'forgot'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Forgot?
                </button>
              </div>

              {/* Error & Success Banners */}
              {authError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {formValidation && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-950/40 p-2.5 text-xs text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>{formValidation}</span>
                </div>
              )}

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivers"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                      <UserIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@university.edu"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                      <KeyRound className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Select Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                          selectedRole === 'student'
                            ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('admin')}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                          selectedRole === 'admin'
                            ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Admin</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedRole === 'student'
                        ? 'Students have read-only search & view access.'
                        : 'Admins have full CRUD privileges to add, edit, and delete records.'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2"
                >
                  <span>
                    {isSubmitting
                      ? 'Authenticating...'
                      : mode === 'login'
                      ? 'Sign In with Supabase'
                      : mode === 'register'
                      ? 'Create Supabase Account'
                      : 'Send Password Reset'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Quick Role Test Drive Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  Instant Role Evaluation
                </span>
              </div>

              {/* 1-Click Role Logins */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={signInAsAdminDemo}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 py-2 px-3 text-[11px] font-semibold text-indigo-200 hover:bg-indigo-900/50 hover:border-indigo-400 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Log In as Admin</span>
                </button>

                <button
                  type="button"
                  onClick={signInAsStudentDemo}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-2 px-3 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-900/50 hover:border-emerald-400 transition-colors"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Log In as Student</span>
                </button>
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-3 text-center">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  PostgreSQL database powered by Supabase with Row Level Security (RLS) enforcement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <p>ApexCRUD Cloud Manager • Supabase PostgreSQL & Auth • Netlify Ready</p>
      </footer>
    </div>
  );
};
