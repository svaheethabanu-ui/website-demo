import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { RecordItem, RecordInput } from '../types/record';

const COLLECTION_NAME = 'records';

// Helper to generate a compliant document ID: <= 128 characters, matching '^[a-zA-Z0-9_-]+$'
function generateCompliantId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'rec_';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Local in-memory store for demo user when not authenticated via Google
let demoStore: RecordItem[] = [
  {
    id: 'rec_demo_1001',
    userId: 'demo-user-apex-2026',
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
    id: 'rec_demo_1002',
    userId: 'demo-user-apex-2026',
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
    id: 'rec_demo_1003',
    userId: 'demo-user-apex-2026',
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
  {
    id: 'rec_demo_1004',
    userId: 'demo-user-apex-2026',
    name: 'Global Supply Chain CRM',
    email: 'ops@logisticsworld.net',
    phone: '+1 (555) 345-6789',
    company: 'Vanguard Logistics',
    category: 'Operations',
    status: 'Active',
    priority: 'High',
    value: 98000,
    notes: 'Warehouse automation API integration and order tracking webhook ingestion.',
    tags: ['Logistics', 'APIs', 'Integration'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'rec_demo_1005',
    userId: 'demo-user-apex-2026',
    name: 'Q3 Brand Growth Initiative',
    email: 'marketing@stellarbrands.co',
    phone: '+1 (555) 678-1234',
    company: 'Stellar Brands Studio',
    category: 'Marketing Campaign',
    status: 'Archived',
    priority: 'Low',
    value: 18500,
    notes: 'Completed social reach campaigns and influencer sponsorships.',
    tags: ['Marketing', 'Branding'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

const demoListeners: Set<(records: RecordItem[]) => void> = new Set();
function notifyDemoListeners() {
  const copy = [...demoStore];
  demoListeners.forEach((listener) => listener(copy));
}

export function subscribeToRecords(
  userId: string,
  isDemo: boolean | undefined,
  onUpdate: (records: RecordItem[]) => void,
  onError: (err: unknown) => void
): () => void {
  if (isDemo || userId.startsWith('demo-user-')) {
    onUpdate([...demoStore]);
    demoListeners.add(onUpdate);
    return () => {
      demoListeners.delete(onUpdate);
    };
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const records: RecordItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          userId: data.userId,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          company: data.company || '',
          category: data.category || 'Other',
          status: data.status || 'Active',
          priority: data.priority || 'Medium',
          value: Number(data.value || 0),
          notes: data.notes || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      // Sort newest first
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (e) {
        onError(e);
      }
    }
  );
}

export async function createRecord(
  userId: string,
  input: RecordInput,
  isDemo?: boolean
): Promise<string> {
  const newId = generateCompliantId();
  const now = new Date().toISOString();

  const record: RecordItem = {
    id: newId,
    userId,
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
    createdAt: now,
    updatedAt: now,
  };

  if (isDemo || userId.startsWith('demo-user-')) {
    demoStore = [record, ...demoStore];
    notifyDemoListeners();
    return newId;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, newId);
    await setDoc(docRef, record);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
  }
}

export async function updateRecord(
  recordId: string,
  userId: string,
  input: Partial<RecordInput>,
  existingRecord: RecordItem,
  isDemo?: boolean
): Promise<void> {
  const now = new Date().toISOString();

  if (isDemo || userId.startsWith('demo-user-')) {
    demoStore = demoStore.map((item) =>
      item.id === recordId
        ? {
            ...item,
            ...input,
            updatedAt: now,
          }
        : item
    );
    notifyDemoListeners();
    return;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, recordId);
    const updatePayload: Record<string, any> = {
      updatedAt: now,
    };
    if (input.name !== undefined) updatePayload.name = input.name.trim();
    if (input.email !== undefined) updatePayload.email = input.email.trim();
    if (input.phone !== undefined) updatePayload.phone = input.phone.trim();
    if (input.company !== undefined) updatePayload.company = input.company.trim();
    if (input.category !== undefined) updatePayload.category = input.category;
    if (input.status !== undefined) updatePayload.status = input.status;
    if (input.priority !== undefined) updatePayload.priority = input.priority;
    if (input.value !== undefined) updatePayload.value = Number(input.value) || 0;
    if (input.notes !== undefined) updatePayload.notes = input.notes.trim();
    if (input.tags !== undefined) updatePayload.tags = input.tags;

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${recordId}`);
  }
}

export async function deleteRecord(
  recordId: string,
  userId: string,
  isDemo?: boolean
): Promise<void> {
  if (isDemo || userId.startsWith('demo-user-')) {
    demoStore = demoStore.filter((item) => item.id !== recordId);
    notifyDemoListeners();
    return;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${recordId}`);
  }
}

export async function batchDeleteRecords(
  recordIds: string[],
  userId: string,
  isDemo?: boolean
): Promise<void> {
  if (isDemo || userId.startsWith('demo-user-')) {
    demoStore = demoStore.filter((item) => !recordIds.includes(item.id));
    notifyDemoListeners();
    return;
  }

  try {
    const batch = writeBatch(db);
    recordIds.forEach((id) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
  }
}

export async function seedSampleRecords(userId: string, isDemo?: boolean): Promise<void> {
  const samples: RecordInput[] = [
    {
      name: 'Tesla Energy Storage Fleet',
      email: 'partnerships@teslaenergy.com',
      phone: '+1 (800) 613-8840',
      company: 'Tesla Energy Global',
      category: 'Enterprise Client',
      status: 'Active',
      priority: 'Critical',
      value: 125000,
      notes: 'Industrial Megapack telemetry and remote grid monitoring platform.',
      tags: ['CleanTech', 'Energy', 'Enterprise', 'Grid'],
    },
    {
      name: 'Horizon Health Telemed App',
      email: 'clinical@horizonhealth.org',
      phone: '+1 (555) 777-8899',
      company: 'Horizon Health Network',
      category: 'Software Project',
      status: 'Active',
      priority: 'High',
      value: 78000,
      notes: 'HIPAA-compliant video consults and electronic health record syncing.',
      tags: ['Healthcare', 'HIPAA', 'WebRTC'],
    },
    {
      name: 'Aether Robotics AI Vision',
      email: 'devs@aetherbotics.ai',
      phone: '+1 (555) 321-4567',
      company: 'Aether Robotics Labs',
      category: 'Software Project',
      status: 'Pending',
      priority: 'High',
      value: 54000,
      notes: 'Real-time computer vision inference on edge robotic arms.',
      tags: ['AI/ML', 'Robotics', 'Edge'],
    },
    {
      name: 'Nordic FinTech Compliance',
      email: 'legal@nordicpay.se',
      phone: '+46 8 123 4567',
      company: 'NordicPay AB',
      category: 'Vendor Contract',
      status: 'Active',
      priority: 'Medium',
      value: 36000,
      notes: 'Cross-border payment regulations and automated KYC pipeline integration.',
      tags: ['Fintech', 'KYC', 'Payments'],
    },
    {
      name: 'Metro Transit Smart Fare',
      email: 'transit@citygov.gov',
      phone: '+1 (555) 888-0011',
      company: 'Department of Transportation',
      category: 'Operations',
      status: 'Completed',
      priority: 'Medium',
      value: 92000,
      notes: 'Contactless NFC card validation and public commuter portal.',
      tags: ['Public Sector', 'IoT', 'NFC'],
    },
  ];

  for (const sample of samples) {
    await createRecord(userId, sample, isDemo);
  }
}
