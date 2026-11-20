import { UdyogFormData } from '../types/form';

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
): Promise<{ success: boolean; message: string; data?: MongoApplicationItem }> {
  try {
    const isUpdate = Boolean(id);
    const url = isUpdate ? `/api/applications/${id}` : '/api/applications';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, formData, status }),
    });

    const result = await res.json();
    return {
      success: res.ok && result.success,
      message: result.message || (res.ok ? 'সফলভাবে সংরক্ষিত হয়েছে' : 'সেভ ব্যর্থ হয়েছে'),
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'নেটওয়ার্ক এরর',
    };
  }
}

export async function recordFormSubmission(
  formData: UdyogFormData,
  actionType: 'pdf_download' | 'print' | 'draft' = 'pdf_download'
): Promise<{ success: boolean; message: string; data?: MongoApplicationItem }> {
  const applicantName = formData.part1.nameBn || formData.part1.nameEn || 'নামহীন আবেদনকারী';
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

  return await saveMongoApplication(title, formData, undefined, status);
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
