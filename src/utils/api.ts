import { UdyogFormData } from '../types/form';
import { detectTrafficSource } from './traffic';

export interface MongoApplicationItem {
  id: string;
  title: string;
  applicantName: string;
  businessName: string;
  requestedAmount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  formData: UdyogFormData;
}

const SUBMISSION_ID_KEY = 'udyog_last_mongo_submission_id';

export function getStoredSubmissionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(SUBMISSION_ID_KEY);
  } catch {
    return null;
  }
}

export function setStoredSubmissionId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBMISSION_ID_KEY, id);
  } catch {
    // Ignore storage quota
  }
}

export function clearStoredSubmissionId(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SUBMISSION_ID_KEY);
  } catch {
    // Ignore
  }
}

export async function checkDbHealth(): Promise<{
  connected: boolean;
  status: string;
  message: string;
}> {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    if (!res.ok) {
      return { connected: false, status: 'error', message: 'সার্ভার রেসপন্স করেনি' };
    }
    return await res.json();
  } catch {
    return { connected: false, status: 'offline', message: 'সার্ভারে কানেক্ট করা যায়নি' };
  }
}

export async function fetchMongoApplications(): Promise<{
  success: boolean;
  connected: boolean;
  data: MongoApplicationItem[];
  message?: string;
}> {
  try {
    const res = await fetch('/api/applications', { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      connected: false,
      data: [],
      message: error instanceof Error ? error.message : 'কানেকশন এরর',
    };
  }
}

export async function fetchSingleMongoApplication(id: string): Promise<{
  success: boolean;
  data?: MongoApplicationItem;
  message?: string;
}> {
  try {
    const res = await fetch(`/api/applications/${id}`, { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'ডাটা লোড করা যায়নি',
    };
  }
}

export async function saveMongoApplication(
  title: string,
  formData: UdyogFormData,
  id?: string,
  status: string = 'draft'
): Promise<{
  success: boolean;
  message: string;
  isUpdated?: boolean;
  data?: MongoApplicationItem;
}> {
  try {
    const submissionId = id || getStoredSubmissionId() || undefined;
    const isExplicitPut = Boolean(id);
    const url = isExplicitPut ? `/api/applications/${id}` : '/api/applications';
    const method = isExplicitPut ? 'PUT' : 'POST';

    const traffic = detectTrafficSource();

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: submissionId, title, formData, status, traffic }),
    });

    const result = await res.json();
    if (result.success && result.data?.id) {
      setStoredSubmissionId(result.data.id);
    }
    return {
      success: res.ok && result.success,
      message: result.message || (res.ok ? 'সফলভাবে সংরক্ষিত হয়েছে' : 'সেভ ব্যর্থ হয়েছে'),
      isUpdated: result.isUpdated,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'নেটওয়ার্ক এরর',
    };
  }
}

let isSubmittingLock = false;

export async function recordFormSubmission(
  formData: UdyogFormData,
  actionType: 'pdf_download' | 'print' | 'draft' = 'pdf_download'
): Promise<{ success: boolean; message: string; data?: MongoApplicationItem }> {
  if (isSubmittingLock) {
    return { success: true, message: 'আবেদনটি ইতোমধ্যে প্রসেস হচ্ছে...' };
  }
  isSubmittingLock = true;

  try {
    const applicantName =
      formData.part1.nameBn || formData.part1.nameEn || 'নামহীন আবেদনকারী';
    const businessName =
      formData.part3.businessName ||
      formData.part2.businessTypeDetails ||
      formData.part2.businessType ||
      'উদ্যোগ প্রস্তাবনা';
    const title = `${applicantName} — ${businessName}`;
    const status =
      actionType === 'pdf_download'
        ? 'pdf_generated'
        : actionType === 'print'
        ? 'printed'
        : 'draft';

    const existingId = getStoredSubmissionId() || undefined;
    const res = await saveMongoApplication(title, formData, existingId, status);
    return res;
  } finally {
    isSubmittingLock = false;
  }
}

export async function deduplicateMongoApplications(): Promise<{
  success: boolean;
  message: string;
  removedCount?: number;
  remainingCount?: number;
}> {
  try {
    const res = await fetch('/api/applications/deduplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'নেটওয়ার্ক এরর',
    };
  }
}

export async function deleteMongoApplication(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    return {
      success: res.ok && result.success,
      message: result.message || 'মুছে ফেলা হয়েছে',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'নেটওয়ার্ক এরর',
    };
  }
}
