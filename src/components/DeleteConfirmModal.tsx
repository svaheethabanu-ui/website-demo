import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { RecordItem } from '../types/record';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  targetRecord?: RecordItem | null;
  batchCount?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetRecord,
  batchCount = 0,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const isBatch = batchCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl ring-1 ring-white/10 z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isBatch ? `Delete ${batchCount} Selected Records?` : 'Delete Record Confirmation'}
            </h3>
            <p className="text-xs text-rose-400/90 font-medium">This action cannot be undone.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
          {isBatch ? (
            <p>
              Are you sure you want to permanently delete{' '}
              <strong className="text-white font-semibold">{batchCount}</strong> selected records
              from your Firebase Firestore database?
            </p>
          ) : (
            <div>
              <p className="mb-2">
                Are you sure you want to permanently delete this record from Firestore?
              </p>
              <div className="rounded-lg border border-slate-800/80 bg-slate-900/80 p-2.5">
                <div className="font-semibold text-white">{targetRecord?.name}</div>
                <div className="text-slate-400 truncate mt-0.5">{targetRecord?.email}</div>
                <div className="text-slate-500 text-[11px] mt-1">ID: {targetRecord?.id}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? 'Deleting...' : isBatch ? 'Delete All' : 'Delete Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
