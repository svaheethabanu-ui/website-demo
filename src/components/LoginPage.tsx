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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInDemoMode, authError, clearAuthError } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDemoMode = () => {
    clearAuthError();
    signInDemoMode();
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
            <span>Firebase Firestore Backend Active</span>
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
              <span>Full-Stack Cloud Database Application</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Modern CRUD Management with <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Firebase & Netlify</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Seamlessly create, read, update, search, filter, and delete records with real-time cloud synchronization, zero-trust security rules, and production-ready architecture.
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
                  <h4 className="text-xs font-bold text-white">Zero-Trust ABAC</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hardened Firestore security rules with user-scoped data isolation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Cloud className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Netlify Ready</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Includes netlify.toml and SPA redirects for zero-config deployment.</p>
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
              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/40">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Sign In to Continue</h3>
                <p className="text-xs text-slate-400">
                  Authenticate securely to access your private records workspace
                </p>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-rose-200">Authentication Note</p>
                    <p className="text-[11px] leading-relaxed">{authError}</p>
                    <p className="text-[11px] text-rose-400">
                      Tip: If popups are blocked by your browser or sandbox iframe, you can click <strong>"Explore in Instant Demo Mode"</strong> below.
                    </p>
                  </div>
                </div>
              )}

              {/* Sign In Options */}
              <div className="space-y-3">
                {/* Primary Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white py-3 px-4 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isAuthenticating ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                {/* Divider */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                    Or Test Drive
                  </span>
                </div>

                {/* Instant Demo Mode Button */}
                <button
                  onClick={handleDemoMode}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 py-3 px-4 text-xs font-semibold text-indigo-200 hover:from-indigo-900/70 hover:to-purple-900/70 hover:border-indigo-400 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Explore in Instant Demo Mode</span>
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                </button>
              </div>

              <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Secured by Firebase Authentication & Firestore. Your records are isolated to your authenticated account ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <p>ApexCRUD Cloud Manager • Google AI Studio & Firebase Firestore • Ready for Netlify deployment</p>
      </footer>
    </div>
  );
};
