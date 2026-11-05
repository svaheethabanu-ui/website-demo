import React from 'react';
import {
  Database,
  Cloud,
  LogOut,
  Sparkles,
  Server,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNetlifyGuide: () => void;
  onSeedDemoData: () => void;
  isSeeding: boolean;
  recordCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNetlifyGuide,
  onSeedDemoData,
  isSeeding,
  recordCount,
}) => {
  const { user, logout, firestoreConnected } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Database className="h-5 w-5 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Apex<span className="text-indigo-400">CRUD</span></span>
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 ring-1 ring-indigo-500/30">
                Cloud SQL / Firebase
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Real-time Database & Record Management
            </p>
          </div>
        </div>

        {/* Status badges & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firestore status */}
          <div
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium md:flex ${
              firestoreConnected
                ? 'bg-emerald-950/50 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-amber-950/50 text-amber-400 ring-1 ring-amber-500/30'
            }`}
            title="Real-time Firestore sync active"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Firestore Live</span>
          </div>

          {/* Netlify Ready Button */}
          <button
            onClick={onOpenNetlifyGuide}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-900/40 hover:text-cyan-200"
            title="View Netlify deployment instructions"
          >
            <Cloud className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Netlify Ready</span>
            <HelpCircle className="h-3 w-3 opacity-70" />
          </button>

          {/* Seed demo records if empty */}
          {recordCount === 0 && (
            <button
              onClick={onSeedDemoData}
              disabled={isSeeding}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 text-xs font-medium text-purple-200 transition-colors hover:bg-purple-900/50"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span>{isSeeding ? 'Seeding...' : 'Add Demo Records'}</span>
            </button>
          )}

          {/* User Profile & Sign Out */}
          {user && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-2 sm:pl-3">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full ring-2 ring-indigo-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/50">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                  </div>
                )}
                <div className="hidden text-left text-xs lg:block">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <span>{user.displayName}</span>
                    {user.isDemo && (
                      <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[10px] font-semibold text-amber-300">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="max-w-[140px] truncate text-slate-400">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-900/80 p-1.5 text-slate-300 transition-colors hover:border-rose-500/40 hover:bg-rose-950/30 hover:text-rose-300"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-medium pr-1">Exit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
