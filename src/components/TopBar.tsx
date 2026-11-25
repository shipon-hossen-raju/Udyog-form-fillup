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
      <div className="topbar-header-row">
        <div className="topbar-brand">
          <UdyogLogo size={34} />
          <div className="topbar-brand-text">
            <h1 className="topbar-title">
              <span className="topbar-title-main">উদ্যোগ</span>{' '}
              <span className="topbar-title-en" lang="en">(UDYOG)</span>{' '}
              <span className="topbar-title-sub">আবেদন ফরম</span>
            </h1>
            <p className="topbar-sub">বাংলাদেশ ব্যাংক — ৭ পৃষ্ঠার অফিসিয়াল A4 ফরম ও PDF জেনারেটর</p>
          </div>
        </div>

        {/* LocalStorage Status Indicator & Action Badges */}
        <div className="topbar-storage-status">
          <div
            className={`storage-status-pill ${isSaving ? 'is-saving' : 'is-saved'}`}
            title="আপনার ফরমের প্রতি অক্ষরের পরিবর্তন স্বয়ংক্রিয়ভাবে ব্রাউজারের LocalStorage-এ সংরক্ষিত থাকে"
          >
            {isSaving ? (
              <>
                <Loader2 size={13} className="spin-icon" aria-hidden="true" />
                <span className="label-full">লোকালস্টোরেজে সেভ হচ্ছে...</span>
                <span className="label-compact">সেভ হচ্ছে...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="status-dot-green" aria-hidden="true" />
                <span className="label-full">
                  অটো-সেভ: {formattedSavedTime ? formattedSavedTime : 'সংরক্ষিত'}
                </span>
                <span className="label-compact">
                  {formattedSavedTime ? formattedSavedTime : 'সংরক্ষিত'}
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
            <FolderOpen size={14} aria-hidden="true" />
            <span className="label-full">সংরক্ষিত ফর্ম ({toBengaliDigits(draftsCount)})</span>
            <span className="label-compact">ড্রাফট ({toBengaliDigits(draftsCount)})</span>
            <span className="label-icon-only">({toBengaliDigits(draftsCount)})</span>
          </button>

          <button
            type="button"
            className="btn-manual-save"
            onClick={onManualSave}
            title="এখনই লোকালস্টোরেজে সেভ করুন"
          >
            <Save size={14} aria-hidden="true" />
            <span className="btn-label-text">সেভ</span>
          </button>

          <button
            type="button"
            className="btn-developer-badge"
            onClick={onOpenDeveloper}
            title="ডেভেলপার পরিচিতি ও পোর্টফোলিও — Shipon Hossain Raju (Software Engineer)"
          >
            <Code2 size={14} aria-hidden="true" />
            <span className="btn-label-text">ডেভেলপার</span>
          </button>
        </div>
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
            <PenSquare size={15} aria-hidden="true" />
            <span>ফর্ম পূরণ</span>
          </button>
          <button
            type="button"
            className={`seg-btn seg-btn-split ${viewMode === 'split' ? 'is-active' : ''}`}
            aria-pressed={viewMode === 'split'}
            onClick={() => onViewModeChange('split')}
          >
            <Columns2 size={15} aria-hidden="true" />
            <span>পাশাপাশি</span>
          </button>
          <button
            type="button"
            className={`seg-btn ${viewMode === 'preview' ? 'is-active' : ''}`}
            aria-pressed={viewMode === 'preview'}
            onClick={() => onViewModeChange('preview')}
          >
            <Eye size={15} aria-hidden="true" />
            <span>A4 প্রিভিউ</span>
          </button>
        </div>

        {/* PDF & Print Actions */}
        <div className="pdf-group">
          <button
            type="button"
            className="btn-print"
            onClick={onPrint}
            title="সরাসরি প্রিন্ট বা ব্রাউজারের প্রিন্ট ডায়লগ থেকে ভেক্টর PDF সেভ করুন"
          >
            <Printer size={15} aria-hidden="true" />
            <span className="label-full">প্রিন্ট / ভেক্টর PDF</span>
            <span className="label-compact">প্রিন্ট</span>
          </button>

          <button
            type="button"
            className="btn-download"
            disabled={isExporting}
            onClick={onDownloadPdf}
            title="ডাউনলোডযোগ্য ভেক্টর PDF ফাইল তৈরি করুন"
          >
            {isExporting ? (
              <>
                <Loader2 size={15} className="spin-icon" aria-hidden="true" />
                <span className="label-full">{exportProgress || 'PDF তৈরি হচ্ছে...'}</span>
                <span className="label-compact">{exportProgress || 'তৈরি হচ্ছে...'}</span>
              </>
            ) : (
              <>
                <Download size={15} aria-hidden="true" />
                <span className="label-full">PDF ডাউনলোড</span>
                <span className="label-compact">PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Utility Actions */}
        <div className="action-group">
          <button
            type="button"
            className="btn-sample"
            onClick={onFillSample}
            title="আইটি ও সফটওয়্যার ভিত্তিক নমুনা ডাটা দিয়ে ফরম পূরণ করুন"
          >
            <Sparkles size={15} aria-hidden="true" />
            <span className="label-full">AI ও IT নমুনা বসান</span>
            <span className="label-compact">AI নমুনা</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={onExportJson}
            title="তথ্য ব্যাকআপ (JSON সেভ)"
            aria-label="তথ্য ব্যাকআপ (JSON সেভ)"
          >
            <FileDown size={15} aria-hidden="true" />
            <span className="hide-md">ব্যাকআপ</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => jsonInputRef.current?.click()}
            title="সংরক্ষিত JSON ফাইল আপলোড করুন"
            aria-label="সংরক্ষিত JSON লোড করুন"
          >
            <FileUp size={15} aria-hidden="true" />
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
            title="সব তথ্য মুছে নতুন শুরু করুন"
            aria-label="সব তথ্য মুছে নতুন শুরু করুন"
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span className="hide-md">মুছুন</span>
          </button>
        </div>
      </div>
    </header>
  );
}
