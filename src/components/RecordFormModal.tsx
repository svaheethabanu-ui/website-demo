import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Tag,
  Building,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  RecordItem,
  RecordInput,
  RecordStatus,
  RecordPriority,
  CATEGORIES,
} from '../types/record';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordInput) => Promise<void>;
  initialData?: RecordItem | null;
  mode: 'add' | 'edit';
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [status, setStatus] = useState<RecordStatus>('Active');
  const [priority, setPriority] = useState<RecordPriority>('Medium');
  const [value, setValue] = useState<string>('0');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setCompany(initialData.company || '');
      setPhone(initialData.phone || '');
      setCategory(initialData.category || CATEGORIES[0]);
      setStatus(initialData.status || 'Active');
      setPriority(initialData.priority || 'Medium');
      setValue(initialData.value !== undefined ? String(initialData.value) : '0');
      setNotes(initialData.notes || '');
      setTags(initialData.tags || []);
    } else {
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setCategory(CATEGORIES[0]);
      setStatus('Active');
      setPriority('Medium');
      setValue('0');
      setNotes('');
      setTags([]);
    }
    setTagInput('');
    setErrors({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name / Record title is required';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email format';
    } else if (email.trim().length > 150) {
      newErrors.email = 'Email cannot exceed 150 characters';
    }

    if (company.trim().length > 100) {
      newErrors.company = 'Company name cannot exceed 100 characters';
    }

    if (phone.trim().length > 30) {
      newErrors.phone = 'Phone number cannot exceed 30 characters';
    }

    if (!category) {
      newErrors.category = 'Category selection is required';
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      newErrors.value = 'Value must be a valid non-negative number';
    }

    if (notes.length > 2000) {
      newErrors.notes = 'Notes cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      if (tags.length >= 20) {
        setErrors((prev) => ({ ...prev, tags: 'Maximum 20 tags permitted' }));
        return;
      }
      setTags([...tags, trimmed]);
      setTagInput('');
      setErrors((prev) => {
        const next = { ...prev };
        delete next.tags;
        return next;
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: RecordInput = {
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone.trim(),
        category,
        status,
        priority,
        value: Number(value) || 0,
        notes: notes.trim(),
        tags,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Failed to submit record:', err);
      setErrors((prev) => ({
        ...prev,
        form: err instanceof Error ? err.message : 'Failed to save record to Firestore.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl ring-1 ring-white/10 z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'add' ? 'Add New Record' : 'Edit Record Details'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'add'
                  ? 'Persist a new client, contract, or project in Firestore'
                  : `Updating: ${initialData?.name || initialData?.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errors.form && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Record Name / Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="e.g., Acme Cloud Infrastructure"
                className={`w-full rounded-lg border bg-slate-950/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none ${
                  errors.name
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={150}
                  placeholder="contact@company.com"
                  className={`w-full rounded-lg border bg-slate-950/70 pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40'
                  }`}
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Company / Organization
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={100}
                  placeholder="e.g., Acme Corp"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/70 pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
              {errors.company && <p className="mt-1 text-xs text-rose-400">{errors.company}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/70 pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
            </div>
          </div>

          {/* Classification & Numbers */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RecordStatus)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority <span className="text-rose-400">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RecordPriority)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Value / Budget ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/70 pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              </div>
              {errors.value && <p className="mt-1 text-xs text-rose-400">{errors.value}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tags / Keywords
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and press Enter or Add..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/70 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <Tag className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
            {errors.tags && <p className="mb-2 text-xs text-rose-400">{errors.tags}</p>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/20"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Notes & Description
              </label>
              <span className="text-[11px] text-slate-500">{notes.length}/2000 chars</span>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              placeholder="Detailed contract specs, milestones, action items, or deliverables..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            />
            {errors.notes && <p className="mt-1 text-xs text-rose-400">{errors.notes}</p>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : mode === 'add' ? 'Save Record' : 'Update Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
