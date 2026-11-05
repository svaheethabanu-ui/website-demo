export type RecordStatus = 'Active' | 'Pending' | 'Completed' | 'Archived';
export type RecordPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type UserRole = 'admin' | 'student';

export interface RecordItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  category: string;
  status: RecordStatus;
  priority: RecordPriority;
  value?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type RecordInput = Omit<RecordItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export interface FilterState {
  search: string;
  status: string; // 'all' or RecordStatus
  priority: string; // 'all' or RecordPriority
  category: string; // 'all' or specific category
  sortBy: 'name' | 'value' | 'createdAt' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
}

export const CATEGORIES = [
  'Enterprise Client',
  'Software Project',
  'Consulting Lead',
  'Vendor Contract',
  'Marketing Campaign',
  'Operations',
  'Other',
] as const;

export const STATUS_COLORS: Record<RecordStatus, { bg: string; text: string; border: string; dot: string }> = {
  Active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  Pending: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  Completed: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
  },
  Archived: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  },
};

export const PRIORITY_COLORS: Record<RecordPriority, { bg: string; text: string; badge: string }> = {
  Low: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    badge: 'border-slate-700 text-slate-300',
  },
  Medium: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    badge: 'border-sky-500/30 text-sky-400',
  },
  High: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    badge: 'border-orange-500/30 text-orange-400',
  },
  Critical: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    badge: 'border-rose-500/30 text-rose-400 animate-pulse',
  },
};
