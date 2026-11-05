import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RecordItem, RecordInput } from '../types/record';

export interface DbRecord {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  category: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Archived';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  value: number | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export function mapDbToRecord(dbRow: DbRecord): RecordItem {
  return {
    id: dbRow.id,
    userId: dbRow.user_id || 'system',
    name: dbRow.name,
    email: dbRow.email,
    phone: dbRow.phone || '',
    company: dbRow.company || '',
    category: dbRow.category || 'Other',
    status: dbRow.status || 'Active',
    priority: dbRow.priority || 'Medium',
    value: Number(dbRow.value) || 0,
    notes: dbRow.notes || '',
    tags: Array.isArray(dbRow.tags) ? dbRow.tags : [],
    createdAt: dbRow.created_at || new Date().toISOString(),
    updatedAt: dbRow.updated_at || new Date().toISOString(),
  };
}

// In-memory fallback if Supabase is not yet connected
let localRecords: RecordItem[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    userId: 'admin-seed-id',
    name: 'Acme Cloud Infrastructure',
    email: 'contact@acmecloud.com',
    phone: '+1 (555) 234-5678',
    company: 'Acme Corporation',
    category: 'Enterprise Client',
    status: 'Active',
    priority: 'Critical',
    value: 84500,
    notes: 'Multi-region Kubernetes deployment and annual cloud SLA renewal.',
    tags: ['Cloud', 'Enterprise', 'SLA', 'High-Priority'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'c9a646d3-9c61-4cd9-bc19-47027788c831',
    userId: 'admin-seed-id',
    name: 'CyberShield Security Audit',
    email: 'security@shielddefense.io',
    phone: '+1 (555) 987-6543',
    company: 'Shield Defense Systems',
    category: 'Consulting Lead',
    status: 'Pending',
    priority: 'High',
    value: 42000,
    notes: 'SOC2 Type II compliance audit and penetration testing contract review.',
    tags: ['Security', 'Compliance', 'Audit'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '7d354b0c-1123-4d4b-97a3-e29d784a0d9b',
    userId: 'admin-seed-id',
    name: 'Nexus NextGen Mobile App',
    email: 'pm@nexusmobility.tech',
    phone: '+1 (555) 456-7890',
    company: 'Nexus Mobility Corp',
    category: 'Software Project',
    status: 'Completed',
    priority: 'Medium',
    value: 65000,
    notes: 'React Native iOS & Android companion app launched on App Store.',
    tags: ['Mobile', 'React Native', 'Delivered'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const fallbackListeners: Set<(records: RecordItem[]) => void> = new Set();
function notifyFallbackListeners() {
  const copy = [...localRecords];
  fallbackListeners.forEach((l) => l(copy));
}

/**
 * Fetch all records from Supabase
 */
export async function getSupabaseRecords(searchTerm?: string): Promise<RecordItem[]> {
  if (!isSupabaseConfigured()) {
    if (searchTerm?.trim()) {
      const q = searchTerm.toLowerCase().trim();
      return localRecords.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.company || '').toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    return [...localRecords];
  }

  let query = supabase.from('records').select('*').order('created_at', { ascending: false });

  if (searchTerm && searchTerm.trim()) {
    const q = `%${searchTerm.trim()}%`;
    query = query.or(`name.ilike.${q},email.ilike.${q},company.ilike.${q},category.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase fetch error:', error);
    throw new Error(error.message);
  }

  return (data || []).map((row) => mapDbToRecord(row as DbRecord));
}

/**
 * Real-time subscription to Supabase records table changes
 */
export function subscribeToSupabaseRecords(
  onUpdate: (records: RecordItem[]) => void,
  onError: (error: Error) => void
): () => void {
  // If Supabase not configured, use local state
  if (!isSupabaseConfigured()) {
    onUpdate([...localRecords]);
    fallbackListeners.add(onUpdate);
    return () => {
      fallbackListeners.delete(onUpdate);
    };
  }

  // Initial load
  getSupabaseRecords()
    .then((data) => onUpdate(data))
    .catch((err) => onError(err));

  // Set up real-time postgres_changes listener
  const channel = supabase
    .channel('public:records_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'records' },
      () => {
        // Re-fetch on any INSERT, UPDATE, or DELETE
        getSupabaseRecords()
          .then((data) => onUpdate(data))
          .catch((err) => onError(err));
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // connected
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Add a new record in Supabase
 */
export async function addSupabaseRecord(input: RecordInput, userId?: string): Promise<RecordItem> {
  if (!isSupabaseConfigured()) {
    const newRecord: RecordItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'rec_' + Date.now(),
      userId: userId || 'local-user',
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || '',
      company: input.company?.trim() || '',
      category: input.category,
      status: input.status,
      priority: input.priority,
      value: Number(input.value) || 0,
      notes: input.notes?.trim() || '',
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localRecords = [newRecord, ...localRecords];
    notifyFallbackListeners();
    return newRecord;
  }

  const { data, error } = await supabase
    .from('records')
    .insert({
      user_id: userId || null,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      company: input.company?.trim() || null,
      category: input.category,
      status: input.status,
      priority: input.priority,
      value: Number(input.value) || 0,
      notes: input.notes?.trim() || null,
      tags: input.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(error.message);
  }

  return mapDbToRecord(data as DbRecord);
}

/**
 * Edit / Update an existing record in Supabase
 */
export async function updateSupabaseRecord(
  id: string,
  input: Partial<RecordInput>
): Promise<RecordItem> {
  if (!isSupabaseConfigured()) {
    let updatedItem: RecordItem | null = null;
    localRecords = localRecords.map((item) => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...input,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    });
    notifyFallbackListeners();
    if (!updatedItem) throw new Error('Record not found');
    return updatedItem;
  }

  const payload: Record<string, any> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.email !== undefined) payload.email = input.email.trim();
  if (input.phone !== undefined) payload.phone = input.phone.trim() || null;
  if (input.company !== undefined) payload.company = input.company.trim() || null;
  if (input.category !== undefined) payload.category = input.category;
  if (input.status !== undefined) payload.status = input.status;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.value !== undefined) payload.value = Number(input.value) || 0;
  if (input.notes !== undefined) payload.notes = input.notes.trim() || null;
  if (input.tags !== undefined) payload.tags = input.tags;

  const { data, error } = await supabase
    .from('records')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    throw new Error(error.message);
  }

  return mapDbToRecord(data as DbRecord);
}

/**
 * Delete a single record from Supabase
 */
export async function deleteSupabaseRecord(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localRecords = localRecords.filter((item) => item.id !== id);
    notifyFallbackListeners();
    return;
  }

  const { error } = await supabase.from('records').delete().eq('id', id);
  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(error.message);
  }
}

/**
 * Batch delete multiple records from Supabase
 */
export async function batchDeleteSupabaseRecords(ids: string[]): Promise<void> {
  if (!isSupabaseConfigured()) {
    localRecords = localRecords.filter((item) => !ids.includes(item.id));
    notifyFallbackListeners();
    return;
  }

  const { error } = await supabase.from('records').delete().in('id', ids);
  if (error) {
    console.error('Supabase batch delete error:', error);
    throw new Error(error.message);
  }
}
