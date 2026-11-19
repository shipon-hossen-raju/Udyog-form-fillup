import { FormStepId, UdyogFormData, ViewMode } from '../types/form';
import {
  DEFAULT_BUDGET_ROWS,
  EMPTY_FORM_DATA,
  SAMPLE_IT_FORM_DATA,
  toBengaliDigits,
} from '../data/defaults';

export const STORAGE_KEYS = {
  ACTIVE_FORM: 'udyog_application_form_v1',
  ACTIVE_STEP: 'udyog_form_active_step_v1',
  VIEW_MODE: 'udyog_form_view_mode_v1',
  LAST_SAVED: 'udyog_form_last_saved_v1',
  SAVED_DRAFTS: 'udyog_saved_drafts_v1',
} as const;

export interface SavedDraft {
  id: string;
  title: string;
  applicantName: string;
  businessName: string;
  requestedAmount: string;
  updatedAt: string; // ISO date string
  formData: UdyogFormData;
}

export function sanitizeFormData(parsed: Partial<UdyogFormData> | null): UdyogFormData {
  if (!parsed) return EMPTY_FORM_DATA;
  return {
    ...EMPTY_FORM_DATA,
    ...parsed,
    office: { ...EMPTY_FORM_DATA.office, ...(parsed.office ?? {}) },
    part1: {
      ...EMPTY_FORM_DATA.part1,
      ...(parsed.part1 ?? {}),
      presentAddress: {
        ...EMPTY_FORM_DATA.part1.presentAddress,
        ...(parsed.part1?.presentAddress ?? {}),
      },
      permanentAddress: {
        ...EMPTY_FORM_DATA.part1.permanentAddress,
        ...(parsed.part1?.permanentAddress ?? {}),
      },
    },
    part2: {
      ...EMPTY_FORM_DATA.part2,
      ...(parsed.part2 ?? {}),
      projectedSales: {
        ...EMPTY_FORM_DATA.part2.projectedSales,
        ...(parsed.part2?.projectedSales ?? {}),
      },
      projectedProfit: {
        ...EMPTY_FORM_DATA.part2.projectedProfit,
        ...(parsed.part2?.projectedProfit ?? {}),
      },
    },
    part3: {
      ...EMPTY_FORM_DATA.part3,
      ...(parsed.part3 ?? {}),
      sales: { ...EMPTY_FORM_DATA.part3.sales, ...(parsed.part3?.sales ?? {}) },
      profit: { ...EMPTY_FORM_DATA.part3.profit, ...(parsed.part3?.profit ?? {}) },
    },
    part4: {
      ...EMPTY_FORM_DATA.part4,
      ...(parsed.part4 ?? {}),
      budgetRows:
        Array.isArray(parsed.part4?.budgetRows) && parsed.part4.budgetRows.length === 12
          ? parsed.part4.budgetRows
          : DEFAULT_BUDGET_ROWS.map((r) => ({ ...r })),
    },
    part5: { ...EMPTY_FORM_DATA.part5, ...(parsed.part5 ?? {}) },
  };
}

/**
 * Loads the active form from LocalStorage
 */
export function loadActiveForm(): UdyogFormData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ACTIVE_FORM);
    if (!raw) return null;
    return sanitizeFormData(JSON.parse(raw));
  } catch (err) {
    console.error('LocalStorage load failed:', err);
    return null;
  }
}

/**
 * Saves active form to LocalStorage
 */
export function saveActiveForm(data: UdyogFormData): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACTIVE_FORM, JSON.stringify(data));
    window.localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    return true;
  } catch (err) {
    console.warn('LocalStorage save failed, trying fallback without large photos:', err);
    try {
      // Fallback: If quota exceeded due to any uncompressed photo, preserve all form text!
      const fallbackData: UdyogFormData = {
        ...data,
        office: { ...data.office, photoDataUrl: '' },
        part5: { ...data.part5, signatureDataUrl: '' },
      };
      window.localStorage.setItem(STORAGE_KEYS.ACTIVE_FORM, JSON.stringify(fallbackData));
      window.localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      return true;
    } catch {
      return false;
    }
  }
}

export function loadSavedStep(): FormStepId | null {
  if (typeof window === 'undefined') return null;
  try {
    const step = window.localStorage.getItem(STORAGE_KEYS.ACTIVE_STEP);
    if (step && ['office', 'part1', 'part2', 'part3', 'part4', 'part5'].includes(step)) {
      return step as FormStepId;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveActiveStep(step: FormStepId): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACTIVE_STEP, step);
  } catch {
    // Ignore
  }
}

export function loadSavedViewMode(): ViewMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const mode = window.localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (mode && ['split', 'editor', 'preview'].includes(mode)) {
      return mode as ViewMode;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveActiveViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch {
    // Ignore
  }
}

export function loadLastSavedTime(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
  } catch {
    return null;
  }
}

/**
 * Multiple Drafts Management in LocalStorage
 */
export function getSavedDrafts(): SavedDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SAVED_DRAFTS);
    if (!raw) {
      // Seed default sample draft if none exist yet
      const initial: SavedDraft[] = [
        {
          id: 'draft-sample-it-hub',
          title: 'AI ও IT Skill Development Hub (নমুনা প্রজেক্ট)',
          applicantName: SAMPLE_IT_FORM_DATA.part1.nameBn,
          businessName: 'AI & IT Skill Hub',
          requestedAmount: SAMPLE_IT_FORM_DATA.part4.requestedFinancing,
          updatedAt: new Date().toISOString(),
          formData: SAMPLE_IT_FORM_DATA,
        },
      ];
      window.localStorage.setItem(STORAGE_KEYS.SAVED_DRAFTS, JSON.stringify(initial));
      return initial;
    }
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      return list.map((item) => ({
        ...item,
        formData: sanitizeFormData(item.formData),
      }));
    }
    return [];
  } catch (err) {
    console.error('Failed to get drafts from localStorage:', err);
    return [];
  }
}

export function saveDraftToList(title: string, formData: UdyogFormData, existingId?: string): SavedDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const currentList = getSavedDrafts();
    const id = existingId || `draft-${Date.now()}`;
    const applicantName = formData.part1.nameBn || formData.part1.nameEn || 'নামহীন আবেদনকারী';
    const businessName =
      formData.part3.businessName ||
      formData.part2.businessTypeDetails ||
      formData.part2.businessType ||
      'উদ্যোগ প্রস্তাবনা';
    const requestedAmount = formData.part4.requestedFinancing || '০';

    const draftItem: SavedDraft = {
      id,
      title: title.trim() || businessName || `ড্রাফট #${toBengaliDigits(currentList.length + 1)}`,
      applicantName,
      businessName,
      requestedAmount,
      updatedAt: new Date().toISOString(),
      formData,
    };

    const existingIdx = currentList.findIndex((d) => d.id === id);
    let updatedList: SavedDraft[];
    if (existingIdx >= 0) {
      updatedList = [...currentList];
      updatedList[existingIdx] = draftItem;
    } else {
      updatedList = [draftItem, ...currentList];
    }

    window.localStorage.setItem(STORAGE_KEYS.SAVED_DRAFTS, JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error('Failed to save draft to localStorage:', err);
    return getSavedDrafts();
  }
}

export function deleteDraftFromList(id: string): SavedDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const currentList = getSavedDrafts();
    const filtered = currentList.filter((d) => d.id !== id);
    window.localStorage.setItem(STORAGE_KEYS.SAVED_DRAFTS, JSON.stringify(filtered));
    return filtered;
  } catch {
    return getSavedDrafts();
  }
}

export function formatTimeBn(isoString: string | null): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'দুপুর/রাত' : 'সকাল';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    return `${ampm} ${toBengaliDigits(hours)}:${toBengaliDigits(minutes)}:${toBengaliDigits(seconds)}`;
  } catch {
    return '';
  }
}
