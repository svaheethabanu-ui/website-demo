import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface NetlifyDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetlifyDeployGuideModal: React.FC<NetlifyDeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const netlifyTomlSnippet = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"`;

  const cliSnippet = `# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build and Deploy
npm run build
netlify deploy --prod --dir=dist`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl ring-1 ring-white/10 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Netlify Deployment Ready
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Pre-Configured
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Single-Page App routing, static asset optimization, and Firebase backend connectivity
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
          {/* Key Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Zero Server Ops</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Connects directly to Firebase Firestore with zero server maintenance on Netlify.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ABAC Security</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Hardened Firestore rules enforce user-scoped CRUD access directly on Google's cloud.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>SPA Redirects</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                <code className="text-indigo-300">public/_redirects</code> and <code className="text-indigo-300">netlify.toml</code> already included.
              </p>
            </div>
          </div>

          {/* Method 1: Git Connection */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Method 1: Connect GitHub / GitLab to Netlify (Recommended)</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
              <li>Push your application code to your Git repository.</li>
              <li>Log in to <span className="text-cyan-300 font-medium">app.netlify.com</span> and click <strong>"Add new site" → "Import an existing project"</strong>.</li>
              <li>Select your repository. Netlify will auto-detect the configuration:</li>
            </ol>
            <div className="grid grid-cols-2 gap-2 mt-2 rounded-lg bg-slate-900 p-2.5 border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[11px]">Build command:</span>
                <code className="text-indigo-400 font-mono font-semibold">npm run build</code>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Publish directory:</span>
                <code className="text-indigo-400 font-mono font-semibold">dist</code>
              </div>
            </div>
          </div>

          {/* Method 2: Netlify CLI */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Method 2: Deploy via Netlify CLI</span>
              </h3>
              <button
                onClick={() => copyToClipboard(cliSnippet, 'cli')}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
              >
                {copiedSection === 'cli' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === 'cli' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
              {cliSnippet}
            </pre>
          </div>

          {/* Included netlify.toml */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Included <code className="text-cyan-400">netlify.toml</code> Configuration
              </span>
              <button
                onClick={() => copyToClipboard(netlifyTomlSnippet, 'toml')}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
              >
                {copiedSection === 'toml' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === 'toml' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
              {netlifyTomlSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/40">
          <a
            href="https://docs.netlify.com/get-started/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
          >
            <span>Read Netlify Documentation</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
