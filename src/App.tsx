import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { RecordTable } from './components/RecordTable';
import { RecordFormModal } from './components/RecordFormModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { NetlifyDeployGuideModal } from './components/NetlifyDeployGuideModal';
import { LoginPage } from './components/LoginPage';
import {
  subscribeToRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  batchDeleteRecords,
  seedSampleRecords,
} from './services/recordService';
import { RecordItem, RecordInput } from './types/record';
import { RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function MainDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null);
  const [viewingRecord, setViewingRecord] = useState<RecordItem | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<RecordItem | null>(null);
  const [recordsToBatchDelete, setRecordsToBatchDelete] = useState<RecordItem[]>([]);
  const [isNetlifyGuideOpen, setIsNetlifyGuideOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Real-time Firestore subscription
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = subscribeToRecords(
      user.uid,
      user.isDemo,
      (updatedRecords) => {
        setRecords(updatedRecords);
        setIsLoading(false);
      },
      (error) => {
        console.error('Real-time subscription error:', error);
        setIsLoading(false);
        addToast('error', 'Failed to synchronize records with Firestore.');
      }
    );

    return () => unsubscribe();
  }, [user, addToast]);

  // Handle Add / Edit submit
  const handleSaveRecord = async (input: RecordInput) => {
    if (!user) return;

    if (editingRecord) {
      // Update existing record
      await updateRecord(editingRecord.id, user.uid, input, editingRecord, user.isDemo);
      addToast('success', `Record "${input.name}" updated successfully.`);
      setEditingRecord(null);
    } else {
      // Create new record
      await createRecord(user.uid, input, user.isDemo);
      addToast('success', `New record "${input.name}" saved to database.`);
      setIsAddModalOpen(false);
    }
  };

  // Handle Single Delete
  const handleConfirmDelete = async () => {
    if (!user || !recordToDelete) return;
    try {
      await deleteRecord(recordToDelete.id, user.uid, user.isDemo);
      addToast('info', `Record "${recordToDelete.name}" was removed.`);
      setRecordToDelete(null);
      if (viewingRecord?.id === recordToDelete.id) {
        setViewingRecord(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      addToast('error', 'Failed to delete record.');
    }
  };

  // Handle Batch Delete
  const handleConfirmBatchDelete = async () => {
    if (!user || recordsToBatchDelete.length === 0) return;
    try {
      const ids = recordsToBatchDelete.map((r) => r.id);
      await batchDeleteRecords(ids, user.uid, user.isDemo);
      addToast('info', `Successfully removed ${ids.length} records.`);
      setRecordsToBatchDelete([]);
    } catch (err) {
      console.error('Batch delete error:', err);
      addToast('error', 'Failed to complete batch delete.');
    }
  };

  // Handle Seed Demo Data
  const handleSeedData = async () => {
    if (!user || isSeeding) return;
    setIsSeeding(true);
    try {
      await seedSampleRecords(user.uid, user.isDemo);
      addToast('success', 'Sample records added to database!');
    } catch (err) {
      console.error('Seed error:', err);
      addToast('error', 'Failed to seed sample records.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenNetlifyGuide={() => setIsNetlifyGuideOpen(true)}
        onSeedDemoData={handleSeedData}
        isSeeding={isSeeding}
        recordCount={records.length}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Interactive Stats & Metrics */}
        <DashboardStats
          records={records}
          onOpenAddModal={() => {
            setEditingRecord(null);
            setIsAddModalOpen(true);
          }}
          onSeedDemoData={handleSeedData}
          isSeeding={isSeeding}
        />

        {/* Records Data Table with Search, Filter, Sort, View, Edit, Delete */}
        <RecordTable
          records={records}
          isLoading={isLoading}
          onView={(rec) => setViewingRecord(rec)}
          onEdit={(rec) => {
            setEditingRecord(rec);
            setIsAddModalOpen(true);
          }}
          onDelete={(rec) => setRecordToDelete(rec)}
          onBatchDelete={(selected) => setRecordsToBatchDelete(selected)}
          onOpenAddModal={() => {
            setEditingRecord(null);
            setIsAddModalOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ApexCRUD Studio • Powered by Google AI Studio, Firebase Firestore & Netlify
          </p>
          <button
            onClick={() => setIsNetlifyGuideOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
          >
            Deploy to Netlify Guide →
          </button>
        </div>
      </footer>

      {/* Add / Edit Record Modal */}
      <RecordFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveRecord}
        initialData={editingRecord}
        mode={editingRecord ? 'edit' : 'add'}
      />

      {/* View Detail Modal */}
      <RecordDetailModal
        record={viewingRecord}
        isOpen={Boolean(viewingRecord)}
        onClose={() => setViewingRecord(null)}
        onEdit={(rec) => {
          setViewingRecord(null);
          setEditingRecord(rec);
          setIsAddModalOpen(true);
        }}
        onDelete={(rec) => {
          setViewingRecord(null);
          setRecordToDelete(rec);
        }}
      />

      {/* Single Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        targetRecord={recordToDelete}
      />

      {/* Batch Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={recordsToBatchDelete.length > 0}
        onClose={() => setRecordsToBatchDelete([])}
        onConfirm={handleConfirmBatchDelete}
        batchCount={recordsToBatchDelete.length}
      />

      {/* Netlify Deployment Guide Modal */}
      <NetlifyDeployGuideModal
        isOpen={isNetlifyGuideOpen}
        onClose={() => setIsNetlifyGuideOpen(false)}
      />

      {/* Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
                : toast.type === 'error'
                ? 'border-rose-500/30 bg-rose-950/90 text-rose-200'
                : 'border-indigo-500/30 bg-slate-900/90 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-xs font-medium text-slate-300">
          Initializing Cloud Authentication & Database...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainDashboard />;
}
