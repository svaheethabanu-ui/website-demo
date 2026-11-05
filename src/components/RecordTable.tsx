import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  FolderOpen,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import {
  RecordItem,
  RecordStatus,
  RecordPriority,
  FilterState,
  CATEGORIES,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from '../types/record';

interface RecordTableProps {
  records: RecordItem[];
  isLoading: boolean;
  onView: (record: RecordItem) => void;
  onEdit: (record: RecordItem) => void;
  onDelete: (record: RecordItem) => void;
  onBatchDelete: (records: RecordItem[]) => void;
  onOpenAddModal: () => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onBatchDelete,
  onOpenAddModal,
}) => {
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Search term
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase().trim();
        const matchesName = rec.name.toLowerCase().includes(query);
        const matchesEmail = rec.email.toLowerCase().includes(query);
        const matchesCompany = (rec.company || '').toLowerCase().includes(query);
        const matchesTags = (rec.tags || []).some((t) => t.toLowerCase().includes(query));
        const matchesCategory = rec.category.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      // Status filter
      if (filter.status !== 'all' && rec.status !== filter.status) {
        return false;
      }

      // Priority filter
      if (filter.priority !== 'all' && rec.priority !== filter.priority) {
        return false;
      }

      // Category filter
      if (filter.category !== 'all' && rec.category !== filter.category) {
        return false;
      }

      return true;
    });
  }, [records, filter]);

  // Sorting
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    const { sortBy, sortOrder } = filter;

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'value') {
        comparison = (a.value || 0) - (b.value || 0);
      } else if (sortBy === 'priority') {
        const priorityRank = { Low: 1, Medium: 2, High: 3, Critical: 4 };
        comparison = priorityRank[a.priority] - priorityRank[b.priority];
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        // createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredRecords, filter.sortBy, filter.sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTriggerBatchDelete = () => {
    const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
    if (selectedRecords.length > 0) {
      onBatchDelete(selectedRecords);
      setSelectedIds([]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (sortedRecords.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Company', 'Phone', 'Category', 'Status', 'Priority', 'Value', 'Tags', 'Created At'];
    const rows = sortedRecords.map((r) => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${(r.company || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.status}"`,
      `"${r.priority}"`,
      r.value || 0,
      `"${(r.tags || []).join(';')}"`,
      `"${r.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_records_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (sortedRecords.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sortedRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apex_records_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const handleSortChange = (col: FilterState['sortBy']) => {
    if (filter.sortBy === col) {
      setFilter((prev) => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        sortBy: col,
        sortOrder: 'desc',
      }));
    }
  };

  const isAllCurrentSelected =
    paginatedRecords.length > 0 &&
    paginatedRecords.every((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-4">
      {/* Controls Container: Search, Filters, Bulk Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={filter.search}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search records instantly by name, email, company, tags..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            {filter.search && (
              <button
                onClick={() => setFilter((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={filter.status}
                onChange={(e) => {
                  setFilter((prev) => ({ ...prev, status: e.target.value }));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All</option>
                <option value="Active" className="bg-slate-900">Active</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
                <option value="Completed" className="bg-slate-900">Completed</option>
                <option value="Archived" className="bg-slate-900">Archived</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Priority:</span>
              <select
                value={filter.priority}
                onChange={(e) => {
                  setFilter((prev) => ({ ...prev, priority: e.target.value }));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All</option>
                <option value="Critical" className="bg-slate-900">Critical</option>
                <option value="High" className="bg-slate-900">High</option>
                <option value="Medium" className="bg-slate-900">Medium</option>
                <option value="Low" className="bg-slate-900">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Category:</span>
              <select
                value={filter.category}
                onChange={(e) => {
                  setFilter((prev) => ({ ...prev, category: e.target.value }));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="all" className="bg-slate-900">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters button if active */}
            {(filter.search || filter.status !== 'all' || filter.priority !== 'all' || filter.category !== 'all') && (
              <button
                onClick={() => {
                  setFilter({
                    search: '',
                    status: 'all',
                    priority: 'all',
                    category: 'all',
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                  });
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Reset
              </button>
            )}

            {/* Export Menu */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={handleExportCSV}
                disabled={sortedRecords.length === 0}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-40"
                title="Export filtered records to CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={sortedRecords.length === 0}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-40"
                title="Export filtered records to JSON"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Batch Action Banner */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-950/20 px-3.5 py-2 text-xs">
            <span className="font-medium text-rose-300">
              {selectedIds.length} record{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white"
              >
                Deselect
              </button>
              <button
                onClick={handleTriggerBatchDelete}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-500 transition-colors shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] font-semibold select-none">
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-white flex items-center"
                    title="Select all on current page"
                  >
                    {isAllCurrentSelected ? (
                      <CheckSquare className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>

                <th className="py-3.5 px-3">
                  <button
                    onClick={() => handleSortChange('name')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Record / Client</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </button>
                </th>

                <th className="py-3.5 px-3">
                  <span>Category</span>
                </th>

                <th className="py-3.5 px-3">
                  <button
                    onClick={() => handleSortChange('status')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </button>
                </th>

                <th className="py-3.5 px-3">
                  <button
                    onClick={() => handleSortChange('priority')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Priority</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </button>
                </th>

                <th className="py-3.5 px-3">
                  <button
                    onClick={() => handleSortChange('value')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Budget / Value</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </button>
                </th>

                <th className="py-3.5 px-3">
                  <button
                    onClick={() => handleSortChange('createdAt')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Created</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </button>
                </th>

                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                      <span className="text-sm">Fetching records from Firestore...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-500">
                        <FolderOpen className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {records.length === 0 ? 'No records in database yet' : 'No matching records found'}
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        {records.length === 0
                          ? 'Get started by creating your first record using the form or seeding sample data.'
                          : 'Try modifying your search query or filter tags to see more results.'}
                      </p>
                      {records.length === 0 && (
                        <button
                          onClick={onOpenAddModal}
                          className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add First Record</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  const statusStyle = STATUS_COLORS[record.status] || STATUS_COLORS.Active;
                  const priorityStyle = PRIORITY_COLORS[record.priority] || PRIORITY_COLORS.Medium;

                  return (
                    <tr
                      key={record.id}
                      className={`group transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/30'
                          : 'hover:bg-slate-850 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-4 pr-2">
                        <button
                          onClick={() => handleToggleSelectRow(record.id)}
                          className="text-slate-500 hover:text-white flex items-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Name, Company, Email */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onView(record)}
                            className="text-left font-semibold text-white hover:text-indigo-400 transition-colors truncate max-w-[220px]"
                          >
                            {record.name}
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-[220px]">
                            {record.company && <span>{record.company} •</span>}
                            <span>{record.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="rounded-md bg-slate-800/90 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                          {record.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                          {record.status}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold border ${priorityStyle.badge}`}
                        >
                          {record.priority}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-3 font-semibold text-slate-200">
                        {record.value && record.value > 0 ? (
                          <span className="text-cyan-400">{formatCurrency(record.value)}</span>
                        ) : (
                          <span className="text-slate-500 font-normal">—</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {formatDate(record.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Button */}
                          <button
                            onClick={() => onView(record)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors"
                            title="View Record Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onEdit(record)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300 transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDelete(record)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing {sortedRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedRecords.length)} of {sortedRecords.length} records
            </span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-white focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <span className="px-2 font-medium text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
