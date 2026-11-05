import React from 'react';
import {
  FileText,
  Activity,
  DollarSign,
  AlertTriangle,
  FolderKanban,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { RecordItem } from '../types/record';

interface DashboardStatsProps {
  records: RecordItem[];
  onOpenAddModal: () => void;
  onSeedDemoData: () => void;
  isSeeding: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  records,
  onOpenAddModal,
  onSeedDemoData,
  isSeeding,
}) => {
  const totalCount = records.length;
  const activeCount = records.filter((r) => r.status === 'Active').length;
  const pendingCount = records.filter((r) => r.status === 'Pending').length;
  const completedCount = records.filter((r) => r.status === 'Completed').length;
  const archivedCount = records.filter((r) => r.status === 'Archived').length;

  const criticalAndHighCount = records.filter(
    (r) => r.priority === 'Critical' || r.priority === 'High'
  ).length;

  const totalValue = records.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Group by category
  const categoryCounts: Record<string, number> = {};
  records.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Records Operations Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time CRUD management, cloud database indexing, and query analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {records.length > 0 && (
            <button
              onClick={onSeedDemoData}
              disabled={isSeeding}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>{isSeeding ? 'Seeding...' : 'Add Sample Data'}</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:shadow-indigo-500/35 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Record</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Records */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700/80 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Records
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 group-hover:scale-105 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalCount}</span>
            <span className="text-xs text-slate-400">managed items</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center text-emerald-400 font-medium">
              Synchronized
            </span>
            <span>• in Firebase Firestore</span>
          </div>
        </div>

        {/* Active Status */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700/80 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Active Engagements
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 group-hover:scale-105 transition-transform">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{activeCount}</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              {activePercent}% of total
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>{pendingCount} pending</span>
            <span>•</span>
            <span>{completedCount} completed</span>
          </div>
        </div>

        {/* Total Value */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700/80 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Portfolio Value
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20 group-hover:scale-105 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalValue)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Aggregated budget / contracts</span>
          </div>
        </div>

        {/* Priority items */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700/80 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Critical & High
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {criticalAndHighCount}
            </span>
            <span className="text-xs text-rose-400/90 font-medium">high priority</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Requires urgent review</span>
          </div>
        </div>
      </div>

      {/* Category distribution pills if records exist */}
      {totalCount > 0 && Object.keys(categoryCounts).length > 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <FolderKanban className="h-3.5 w-3.5 text-indigo-400" />
              Category Breakdown
            </span>
            <span>{Object.keys(categoryCounts).length} Categories</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalCount) * 100);
              return (
                <div
                  key={cat}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300"
                >
                  <span className="font-medium text-white">{cat}</span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
