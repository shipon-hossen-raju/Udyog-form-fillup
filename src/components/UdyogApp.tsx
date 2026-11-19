'use client';

import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { FormStepId, UdyogFormData, ViewMode } from '../types/form';
import {
  DEFAULT_BUDGET_ROWS,
  EMPTY_FORM_DATA,
  SAMPLE_IT_FORM_DATA,
  toBengaliDigits,
} from '../data/defaults';
import {
  SavedDraft,
  deleteDraftFromList,
  getSavedDrafts,
  loadActiveForm,
  loadLastSavedTime,
  loadSavedStep,
  loadSavedViewMode,
  saveActiveForm,
  saveActiveStep,
  saveActiveViewMode,
  saveDraftToList,
} from '../utils/storage';
import { TopBar } from './TopBar';
import { FormEditor } from './FormEditor';
import { OfficialPdfPreview } from './OfficialPdfPreview';
import { DraftsModal } from './DraftsModal';
import { exportOfficialFormPdf } from '../utils/pdfExport';

export function UdyogApp() {
  const [formData, setFormData] = useState<UdyogFormData>(EMPTY_FORM_DATA);
  const [activeStep, setActiveStep] = useState<FormStepId>('part1');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [previewZoom, setPreviewZoom] = useState<number>(0.72);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // LocalStorage state
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  const isHydratedRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const resetDialogRef = useRef<HTMLDialogElement>(null);

  // 1. Client-side Hydration from LocalStorage
  useEffect(() => {
    try {
      const savedForm = loadActiveForm();
      if (savedForm) {
        setFormData(savedForm);
      }

      const savedStep = loadSavedStep();
      if (savedStep) {
        setActiveStep(savedStep);
      }

      const savedMode = loadSavedViewMode();
      if (savedMode) {
        setViewMode(savedMode);
      }

      const savedTime = loadLastSavedTime();
      if (savedTime) {
        setLastSavedTime(savedTime);
      }

      const allDrafts = getSavedDrafts();
      setDrafts(allDrafts);
    } catch (err) {
      console.error('Error hydrating from localStorage:', err);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // 2. Auto-save formData to LocalStorage with 350ms debounce
  useEffect(() => {
    if (!isHydratedRef.current) return;

    setIsSaving(true);
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      const ok = saveActiveForm(formData);
      if (ok) {
        setLastSavedTime(new Date().toISOString());
      }
      setIsSaving(false);
    }, 350);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData]);

  // 3. Save activeStep & viewMode
  const handleStepChange = (step: FormStepId) => {
    setActiveStep(step);
    saveActiveStep(step);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveActiveViewMode(mode);
    if (mode === 'preview' && previewZoom < 0.85) {
      setPreviewZoom(0.95);
    } else if (mode === 'split' && previewZoom > 0.85) {
      setPreviewZoom(0.72);
    }
  };

  const announce = (msg: string) => {
    setStatusMessage(msg);
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? '' : prev));
    }, 4500);
  };

  const handleManualSave = () => {
    const ok = saveActiveForm(formData);
    if (ok) {
      const nowIso = new Date().toISOString();
      setLastSavedTime(nowIso);
      announce('বর্তমান ফরমের সকল তথ্য লোকালস্টোরেজে সফলভাবে সেভ করা হয়েছে।');
    } else {
      announce('সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে ব্রাউজার স্টোরেজ চেক করুন।');
    }
  };

  const handleFillSample = () => {
    const sampleData: UdyogFormData = {
      ...SAMPLE_IT_FORM_DATA,
      part4: {
        ...SAMPLE_IT_FORM_DATA.part4,
        budgetRows: SAMPLE_IT_FORM_DATA.part4.budgetRows.map((r) => ({ ...r })),
      },
    };
    setFormData(sampleData);
    saveActiveForm(sampleData);
    setLastSavedTime(new Date().toISOString());
    announce('AI ও IT Skill Hub-এর নমুনা তথ্য ফরমে বসানো এবং লোকালস্টোরেজে সংরক্ষিত হয়েছে।');
  };

  const handleConfirmReset = () => {
    const blank: UdyogFormData = {
      ...EMPTY_FORM_DATA,
      part4: {
        ...EMPTY_FORM_DATA.part4,
        budgetRows: DEFAULT_BUDGET_ROWS.map((r) => ({ ...r })),
      },
    };
    setFormData(blank);
    saveActiveForm(blank);
    setLastSavedTime(new Date().toISOString());
    resetDialogRef.current?.close();
    announce('ফরমের সকল তথ্য মুছে নতুন ফাঁকা ফরম শুরু করা হয়েছে।');
  };

  // Drafts management handlers
  const handleSaveCurrentAsNewDraft = (title: string) => {
    const updatedDrafts = saveDraftToList(title, formData);
    setDrafts(updatedDrafts);
    announce(`"${title}" সফলভাবে লোকালস্টোরেজে ড্রাফট হিসেবে সেভ হয়েছে।`);
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    setFormData(draft.formData);
    saveActiveForm(draft.formData);
    setLastSavedTime(new Date().toISOString());
    announce(`"${draft.title}" ড্রাফটটি সফলভাবে এডিটরে লোড করা হয়েছে।`);
  };

  const handleDeleteDraft = (id: string) => {
    const updatedDrafts = deleteDraftFromList(id);
    setDrafts(updatedDrafts);
    announce('ড্রাফটটি লোকালস্টোরেজ থেকে মুছে ফেলা হয়েছে।');
  };

  const handleDuplicateDraft = (draft: SavedDraft) => {
    const newTitle = `${draft.title} (কপি)`;
    const updatedDrafts = saveDraftToList(newTitle, draft.formData);
    setDrafts(updatedDrafts);
    announce(`"${newTitle}" তৈরি করা হয়েছে।`);
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || isExporting) return;
    setIsExporting(true);
    setExportProgress('পৃষ্ঠা প্রস্তুত হচ্ছে...');
    try {
      const safeName = formData.part1.nameEn
        ? `UDYOG-${formData.part1.nameEn.replace(/[^A-Z0-9]+/gi, '-')}.pdf`
        : 'UDYOG-Application-Form.pdf';

      await exportOfficialFormPdf({
        container: previewRef.current,
        fileName: safeName,
        onProgress: (curr, total) => {
          setExportProgress(`পৃষ্ঠা ${toBengaliDigits(curr)}/${toBengaliDigits(total)}...`);
        },
      });
      announce('৭ পৃষ্ঠার PDF সফলভাবে ডাউনলোড হয়েছে।');
    } catch (err) {
      console.error(err);
      announce('PDF ডাউনলোডে সমস্যা হয়েছে। অনুগ্রহ করে "প্রিন্ট / ভেক্টর PDF" ব্যবহার করুন।');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'udyog-form-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    announce('ফরমের JSON ব্যাকআপ ফাইল ডাউনলোড হয়েছে।');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === 'object') {
          setFormData(parsed);
          saveActiveForm(parsed);
          setLastSavedTime(new Date().toISOString());
          announce('ব্যাকআপ ফাইল থেকে সকল তথ্য সফলভাবে লোড ও সেভ হয়েছে।');
        } else {
          announce('সঠিক ব্যাকআপ JSON ফাইল নির্বাচন করুন।');
        }
      } catch {
        announce('JSON ফাইল পড়তে সমস্যা হয়েছে।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link visually-hidden">
        মূল ফর্মে যান
      </a>

      <TopBar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onFillSample={handleFillSample}
        onReset={() => resetDialogRef.current?.showModal()}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        isExporting={isExporting}
        exportProgress={exportProgress}
        lastSavedTime={lastSavedTime}
        isSaving={isSaving}
        draftsCount={drafts.length}
        onOpenDrafts={() => setIsDraftsModalOpen(true)}
        onManualSave={handleManualSave}
      />

      {/* Polite status live region */}
      <div className="status-toast-host no-print" role="status" aria-live="polite" aria-atomic="true">
        {statusMessage && <div className="status-toast">{statusMessage}</div>}
      </div>

      <main id="main-content" className={`workspace-main mode-${viewMode}`}>
        {/* Editor Pane */}
        {viewMode !== 'preview' && (
          <section className="editor-pane no-print" aria-label="ফর্ম সম্পাদনা অংশ">
            <FormEditor
              data={formData}
              activeStep={activeStep}
              onStepChange={handleStepChange}
              onChange={setFormData}
            />
          </section>
        )}

        {/* Preview Pane (always mounted so PDF export & print work in every view mode) */}
        <section
          className={`preview-pane ${viewMode === 'editor' ? 'is-offscreen-for-print' : ''}`}
          aria-label="অফিসিয়াল ৭ পৃষ্ঠার A4 প্রিভিউ"
          aria-hidden={viewMode === 'editor' ? 'true' : undefined}
        >
          {viewMode !== 'editor' && (
            <div className="preview-toolbar no-print">
              <span className="preview-toolbar-label">
                অফিসিয়াল A4 ফরম প্রিভিউ (মোট ৭ পৃষ্ঠা) — লেখা পরিবর্তন করলে সাথে সাথে এখানে বসবে
              </span>
              <div className="zoom-controls">
                <button
                  type="button"
                  className="zoom-btn"
                  aria-label="জুম কমান"
                  onClick={() => setPreviewZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                >
                  <ZoomOut size={16} aria-hidden="true" />
                </button>
                <span className="zoom-pct">{toBengaliDigits(Math.round(previewZoom * 100))}%</span>
                <button
                  type="button"
                  className="zoom-btn"
                  aria-label="জুম বাড়ান"
                  onClick={() => setPreviewZoom((z) => Math.min(1.15, Number((z + 0.1).toFixed(2))))}
                >
                  <ZoomIn size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          <div className="preview-scroll-area">
            <OfficialPdfPreview
              ref={previewRef}
              data={formData}
              zoom={viewMode === 'editor' ? 1 : previewZoom}
            />
          </div>
        </section>
      </main>

      {/* Drafts Manager Modal */}
      <DraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        drafts={drafts}
        currentFormData={formData}
        onLoadDraft={handleLoadDraft}
        onSaveCurrentAsNewDraft={handleSaveCurrentAsNewDraft}
        onDeleteDraft={handleDeleteDraft}
        onDuplicateDraft={handleDuplicateDraft}
      />

      {/* Native accessible confirmation dialog */}
      <dialog ref={resetDialogRef} className="confirm-dialog no-print" aria-labelledby="reset-dialog-title">
        <h2 id="reset-dialog-title">সকল তথ্য মুছে ফেলবেন?</h2>
        <p>
          ফরমে লেখা আপনার বর্তমান সকল তথ্য মুছে নতুন ফাঁকা ফরম শুরু হবে। প্রয়োজনে আগে <strong>ড্রাফট সেভ</strong> করুন অথবা <strong>ব্যাকআপ</strong> বাটনে ক্লিক করে JSON ফাইল সেভ করে নিন।
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => resetDialogRef.current?.close()}
          >
            বাতিল করুন
          </button>
          <button type="button" className="btn-danger" onClick={handleConfirmReset}>
            হ্যাঁ, সব মুছে ফেলুন
          </button>
        </div>
      </dialog>
    </div>
  );
}
