import React, { useState } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
  Tag,
  Calendar,
  Clock,
  DollarSign,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { RecordItem, STATUS_COLORS, PRIORITY_COLORS } from '../types/record';

interface RecordDetailModalProps {
  record: RecordItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: RecordItem) => void;
  onDelete: (record: RecordItem) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const statusStyle = STATUS_COLORS[record.status] || STATUS_COLORS.Active;
  const priorityStyle = PRIORITY_COLORS[record.priority] || PRIORITY_COLORS.Medium;

  const handleCopyId = () => {
    navigator.clipboard.writeText(record.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl ring-1 ring-white/10 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {record.status}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${priorityStyle.badge}`}
              >
                {record.priority} Priority
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                {record.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{record.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Contact & Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {record.email && (
              <a
                href={`mailto:${record.email}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                <span>Send Email</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
            {record.phone && (
              <a
                href={`tel:${record.phone}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>Call Phone</span>
              </a>
            )}
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors ml-auto"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'ID Copied' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <Mail className="h-3.5 w-3.5 text-slate-500" /> Email
              </span>
              <p className="text-sm font-medium text-white break-all">{record.email}</p>
            </div>

            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <Building className="h-3.5 w-3.5 text-slate-500" /> Company
              </span>
              <p className="text-sm font-medium text-white">
                {record.company || <span className="text-slate-500 italic">Not specified</span>}
              </p>
            </div>

            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <Phone className="h-3.5 w-3.5 text-slate-500" /> Phone
              </span>
              <p className="text-sm font-medium text-white">
                {record.phone || <span className="text-slate-500 italic">Not provided</span>}
              </p>
            </div>

            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-500" /> Value / Budget
              </span>
              <p className="text-sm font-bold text-cyan-400">
                {formatCurrency(record.value)}
              </p>
            </div>
          </div>

          {/* Tags */}
          {record.tags && record.tags.length > 0 && (
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <Tag className="h-3.5 w-3.5 text-slate-500" /> Associated Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {record.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Notes & Description
            </span>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
              {record.notes || <span className="text-slate-500 italic">No notes provided for this record.</span>}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4 text-xs text-slate-500 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Created: {formatDate(record.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Updated: {formatDate(record.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/30">
          <button
            onClick={() => {
              onClose();
              onDelete(record);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
