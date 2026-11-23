'use client';

import { useRef } from 'react';
import {
  CheckCircle2,
  Code2,
  Columns2,
  Download,
  Eye,
  FileDown,
  FileUp,
  FolderOpen,
  Loader2,
  PenSquare,
  Printer,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react';
import { ViewMode } from '../types/form';
import { UdyogLogo } from './UdyogLogo';
import { formatTimeBn } from '../utils/storage';
import { toBengaliDigits } from '../data/defaults';

interface TopBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFillSample: () => void;
  onReset: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  isExporting: boolean;
  exportProgress: string;
  // LocalStorage props
  lastSavedTime: string | null;
  isSaving: boolean;
  draftsCount: number;
  onOpenDrafts: () => void;
  onManualSave: () => void;
  onOpenDeveloper: () => void;
}

export function TopBar({
  viewMode,
  onViewModeChange,
  onFillSample,
  onReset,
  onDownloadPdf,
  onPrint,
  onExportJson,
  onImportJson,
  isExporting,
  exportProgress,
  lastSavedTime,
  isSaving,
  draftsCount,
  onOpenDrafts,
  onManualSave,
  onOpenDeveloper,
}: TopBarProps) {
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const formattedSavedTime = formatTimeBn(lastSavedTime);

  return (
    <header className="app-topbar no-print">
      <div className="topbar-brand">
        <UdyogLogo size={36} />
        <div>
          <h1 className="topbar-title">উদ্যোগ (<span lang="en">UDYOG</span>) আবেদন ফরম</h1>
          <p className="topbar-sub">বাংলাদেশ ব্যাংক — ৭ পৃষ্ঠার অফিসিয়াল A4 ফরম ও PDF জেনারেটর</p>
        </div>
      </div>

      {/* LocalStorage Status Indicator */}
      <div className="topbar-storage-status">
        <div
          className={`storage-status-pill ${isSaving ? 'is-saving' : 'is-saved'}`}
          title="আপনার ফরমের প্রতি অক্ষরের পরিবর্তন স্বয়ংক্রিয়ভাবে ব্রাউজারের LocalStorage-এ সংরক্ষিত থাকে"
        >
          {isSaving ? (
            <>
              <Loader2 size={13} className="spin-icon" aria-hidden="true" />
              <span>লোকালস্টোরেজে সেভ হচ্ছে...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={13} className="status-dot-green" aria-hidden="true" />
              <span>
                অটো-সেভ: {formattedSavedTime ? formattedSavedTime : 'সংরক্ষিত'}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-drafts-badge"
          onClick={onOpenDrafts}
          title="সংরক্ষিত সকল ড্রাফট দেখুন বা নতুন নামে সেভ করুন"
        >
          <FolderOpen size={15} aria-hidden="true" />
          <span>সংরক্ষিত ফর্ম ({toBengaliDigits(draftsCount)})</span>
        </button>

        <button
          type="button"
          className="btn-manual-save"
          onClick={onManualSave}
          title="এখনই লোকালস্টোরেজে সেভ করুন"
        >
          <Save size={14} aria-hidden="true" />
          <span className="hide-sm">সেভ</span>
        </button>

        <button
          type="button"
          className="btn-developer-badge"
          onClick={onOpenDeveloper}
          title="ডেভেলপার পরিচিতি ও পোর্টফোলিও — Shipon Hossain Raju (Software Engineer)"
        >
          <Code2 size={14} aria-hidden="true" />
          <span>ডেভেলপার</span>
        </button>
      </div>

      <div className="topbar-controls">
        {/* View Mode Switcher */}
        <div className="segmented-group" role="group" aria-label="ভিউ মোড পরিবর্তন">
          <button
            type="button"
            className={`seg-btn ${viewMode === 'editor' ? 'is-active' : ''}`}
            aria-pressed={viewMode === 'editor'}
            onClick={() => onViewModeChange('editor')}
          >
            <PenSquare size={16} aria-hidden="true" />
            <span>ফর্ম পূরণ</span>
          </button>
          <button
            type="button"
            className={`seg-btn ${viewMode === 'split' ? 'is-active' : ''}`}
            aria-pressed={viewMode === 'split'}
            onClick={() => onViewModeChange('split')}
          >
            <Columns2 size={16} aria-hidden="true" />
            <span>পাশাপাশি</span>
          </button>
          <button
            type="button"
            className={`seg-btn ${viewMode === 'preview' ? 'is-active' : ''}`}
            aria-pressed={viewMode === 'preview'}
            onClick={() => onViewModeChange('preview')}
          >
            <Eye size={16} aria-hidden="true" />
            <span>A4 প্রিভিউ</span>
          </button>
        </div>

        {/* Utility Actions */}
        <div className="action-group">
          <button
            type="button"
            className="btn-sample"
            onClick={onFillSample}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>AI ও IT নমুনা বসান</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={onExportJson}
            aria-label="তথ্য ব্যাকআপ (JSON সেভ)"
          >
            <FileDown size={16} aria-hidden="true" />
            <span className="hide-md">ব্যাকআপ</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => jsonInputRef.current?.click()}
            aria-label="সংরক্ষিত JSON লোড করুন"
          >
            <FileUp size={16} aria-hidden="true" />
            <span className="hide-md">লোড</span>
          </button>
          <input
            ref={jsonInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportJson(file);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            className="btn-ghost btn-reset"
            onClick={onReset}
            aria-label="সব তথ্য মুছে নতুন শুরু করুন"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span className="hide-md">মুছুন</span>
          </button>
        </div>

        {/* PDF & Print Actions */}
        <div className="pdf-group">
          <button
            type="button"
            className="btn-print"
            onClick={onPrint}
          >
            <Printer size={16} aria-hidden="true" />
            <span>প্রিন্ট / ভেক্টর PDF</span>
          </button>

          <button
            type="button"
            className="btn-download"
            disabled={isExporting}
            onClick={onDownloadPdf}
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="spin-icon" aria-hidden="true" />
                <span>{exportProgress || 'PDF তৈরি হচ্ছে...'}</span>
              </>
            ) : (
              <>
                <Download size={16} aria-hidden="true" />
                <span>PDF ডাউনলোড</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
