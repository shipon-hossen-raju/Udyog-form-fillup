'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  FolderOpen,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { SavedDraft, formatTimeBn } from '../utils/storage';
import { UdyogFormData } from '../types/form';
import { toBengaliDigits } from '../data/defaults';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedDraft[];
  currentFormData: UdyogFormData;
  onLoadDraft: (formData: UdyogFormData, title: string) => void;
  onSaveCurrentAsNewDraft: (title: string) => void;
  onDeleteDraft: (id: string) => void;
  onDuplicateDraft: (draft: SavedDraft) => void;
  onNotify: (msg: string) => void;
}

export function DraftsModal({
  isOpen,
  onClose,
  drafts,
  currentFormData,
  onLoadDraft,
  onSaveCurrentAsNewDraft,
  onDeleteDraft,
  onDuplicateDraft,
}: DraftsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const defaultProposedTitle =
    currentFormData.part3.businessName ||
    currentFormData.part2.businessTypeDetails ||
    currentFormData.part2.businessType ||
    (currentFormData.part1.nameBn ? `${currentFormData.part1.nameBn}-এর ফর্ম` : 'নতুন উদ্যোগ ড্রাফট');

  const handleCreateLocalDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newDraftTitle.trim() || defaultProposedTitle;
    onSaveCurrentAsNewDraft(title);
    setNewDraftTitle('');
    setIsSavingNew(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className="drafts-dialog no-print"
      aria-labelledby="drafts-dialog-title"
      onClose={onClose}
    >
      <div className="drafts-modal-header">
        <div className="drafts-modal-title-group">
          <FolderOpen size={22} className="text-bb-green" aria-hidden="true" />
          <h2 id="drafts-dialog-title" className="drafts-modal-title">
            সংরক্ষিত ড্রাফটসমূহ (লোকালস্টোরেজ)
          </h2>
        </div>
        <button
          type="button"
          className="btn-close-modal"
          onClick={onClose}
          aria-label="বন্ধ করুন"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <p className="drafts-modal-desc">
        আপনার ব্রাউজারের মেমোরিতে বর্তমানে{' '}
        <strong>{toBengaliDigits(drafts.length)}টি ফর্ম ড্রাফট সংরক্ষিত</strong> রয়েছে। অফলাইনেও এটি সবসময় অক্ষত থাকে এবং কেবলমাত্র আপনার এই ডিভাইসেই দৃশ্যমান থাকে।
      </p>

      {/* Create New Draft Box */}
      <div className="new-draft-box">
        {!isSavingNew ? (
          <button
            type="button"
            className="btn-create-draft"
            onClick={() => {
              setNewDraftTitle(defaultProposedTitle);
              setIsSavingNew(true);
            }}
          >
            <Plus size={18} aria-hidden="true" />
            <span>বর্তমান ফর্মটি নতুন ড্রাফট হিসেবে সেভ করুন</span>
          </button>
        ) : (
          <form onSubmit={handleCreateLocalDraft} className="new-draft-form">
            <div className="field-group">
              <label htmlFor="draft-title-input" className="field-label">
                ড্রাফটের নাম বা শিরোনাম দিন:
              </label>
              <div className="save-input-row">
                <input
                  id="draft-title-input"
                  type="text"
                  required
                  autoFocus
                  value={newDraftTitle}
                  placeholder="যেমন: AI ও IT Academy প্রজেক্ট বা ইলেকট্রিক প্রোডাক্ট উদ্যোগ"
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  <Save size={16} aria-hidden="true" />
                  <span>সেভ করুন</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsSavingNew(false)}
                >
                  বাতিল
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Local Drafts List */}
      <div className="drafts-list-container">
        {drafts.length === 0 ? (
          <div className="drafts-empty-state">
            <p>লোকালস্টোরেজে কোনো ড্রাফট নেই। বর্তমান ফর্মটি সেভ করে রাখুন।</p>
          </div>
        ) : (
          <ul className="drafts-ul">
            {drafts.map((draft, idx) => (
              <li key={draft.id} className="draft-item-card">
                <div className="draft-meta">
                  <div className="draft-title-row">
                    <span className="draft-badge-num">{toBengaliDigits(idx + 1)}</span>
                    <h3 className="draft-title">{draft.title}</h3>
                  </div>
                  <div className="draft-sub-details">
                    <span>
                      আবেদনকারী: <strong>{draft.applicantName || '—'}</strong>
                    </span>
                    <span>•</span>
                    <span>উদ্যোগ: {draft.businessName || '—'}</span>
                    <span>•</span>
                    <span>
                      অর্থায়ন:{' '}
                      <strong>{draft.requestedAmount ? `${draft.requestedAmount} টাকা` : '—'}</strong>
                    </span>
                    <span>•</span>
                    <span className="draft-time">আপডেট: {formatTimeBn(draft.updatedAt)}</span>
                  </div>
                </div>

                <div className="draft-actions">
                  <button
                    type="button"
                    className="btn-load-draft"
                    onClick={() => {
                      onLoadDraft(draft.formData, draft.title);
                      onClose();
                    }}
                    title="এই ফর্মটি এডিটরে লোড করুন"
                  >
                    <Check size={16} aria-hidden="true" />
                    <span>লোড</span>
                  </button>

                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => onDuplicateDraft(draft)}
                    title="কপি/ডুপ্লিকেট করুন"
                    aria-label={`${draft.title} ডুপ্লিকেট করুন`}
                  >
                    <Copy size={16} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => {
                      if (window.confirm(`"${draft.title}" ড্রাফটটি মুছে ফেলতে চান?`)) {
                        onDeleteDraft(draft.id);
                      }
                    }}
                    title="মুছুন"
                    aria-label={`${draft.title} মুছে ফেলুন`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="drafts-modal-footer">
        <button type="button" className="btn-secondary" onClick={onClose}>
          বন্ধ করুন
        </button>
      </div>
    </dialog>
  );
}
