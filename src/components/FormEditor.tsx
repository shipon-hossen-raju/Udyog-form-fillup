'use client';

import { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImagePlus,
  Lightbulb,
  Store,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import { AddressFields, FormStepId, UdyogFormData } from '../types/form';
import { compressImageToDataUrl } from '../utils/imageCompress';
import {
  calculateAgeAsOfDeadline,
  countWords,
  formatTakaBn,
  parseNumericAmount,
  toBengaliDigits,
} from '../data/defaults';

interface FormEditorProps {
  data: UdyogFormData;
  activeStep: FormStepId;
  onStepChange: (step: FormStepId) => void;
  onChange: (updater: (prev: UdyogFormData) => UdyogFormData) => void;
}

export const FORM_STEPS: { id: FormStepId; shortLabel: string; title: string; subtitle: string }[] = [
  {
    id: 'office',
    shortLabel: 'ব্যাংক ও ছবি',
    title: 'ব্যাংক শাখা ও পাসপোর্ট ছবি',
    subtitle: 'পৃষ্ঠা ১-এর উপরের অংশ (ছবি, জেলা, উপজেলা ও ব্যাংক তথ্য)',
  },
  {
    id: 'part1',
    shortLabel: 'পার্ট-১: ব্যক্তিগত',
    title: 'পার্ট-১: ব্যক্তিগত তথ্যাবলি',
    subtitle: 'নাম, পিতা-মাতা, এনআইডি, জন্ম তারিখ, শিক্ষা ও ঠিকানা (পৃষ্ঠা ১–২)',
  },
  {
    id: 'part2',
    shortLabel: 'পার্ট-২: নতুন ব্যবসা',
    title: 'পার্ট-২: ব্যবসায়িক পরিকল্পনা (নতুন উদ্যোগ)',
    subtitle: 'ইতোপূর্বে ব্যবসা না থেকে থাকলে এটি পূরণ করুন (পৃষ্ঠা ৩–৪)',
  },
  {
    id: 'part3',
    shortLabel: 'পার্ট-৩: চলমান ব্যবসা',
    title: 'পার্ট-৩: ব্যবসা সম্পর্কিত তথ্যাবলি (চলমান ব্যবসা)',
    subtitle: 'বর্তমানে কোনো ব্যবসা পরিচালনা করে থাকলে এটি পূরণ করুন (পৃষ্ঠা ৪–৫)',
  },
  {
    id: 'part4',
    shortLabel: 'পার্ট-৪: অর্থায়ন ও ব্যয়',
    title: 'পার্ট-৪: অর্থায়ন পরিকল্পনা ও ব্যয় বিভাজন',
    subtitle: 'মূলধন, নিজস্ব বিনিয়োগ ও ১২টি খাতের বাজেট (পৃষ্ঠা ৬)',
  },
  {
    id: 'part5',
    shortLabel: 'পার্ট-৫: অন্যান্য ও স্বাক্ষর',
    title: 'পার্ট-৫: অন্যান্য তথ্য, ঘোষণা ও স্বাক্ষর',
    subtitle: 'বিশেষ তথ্য, ডিজিটাল স্বাক্ষর ও সংযুক্তি চেকলিস্ট (পৃষ্ঠা ৭)',
  },
];

function StepIcon({ id }: { id: FormStepId }) {
  switch (id) {
    case 'office':
      return <Building2 size={16} aria-hidden="true" />;
    case 'part1':
      return <User size={16} aria-hidden="true" />;
    case 'part2':
      return <Lightbulb size={16} aria-hidden="true" />;
    case 'part3':
      return <Store size={16} aria-hidden="true" />;
    case 'part4':
      return <Wallet size={16} aria-hidden="true" />;
    case 'part5':
      return <FileText size={16} aria-hidden="true" />;
  }
}

export function FormEditor({ data, activeStep, onStepChange, onChange }: FormEditorProps) {
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [activeStep]);

  const currentIdx = FORM_STEPS.findIndex((s) => s.id === activeStep);
  const currentMeta = FORM_STEPS[currentIdx];

  const handleImageUpload = async (
    file: File | undefined,
    onLoaded: (dataUrl: string) => void
  ) => {
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file);
      onLoaded(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onLoaded(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAddress = (
    target: 'presentAddress' | 'permanentAddress',
    field: keyof AddressFields,
    value: string
  ) => {
    onChange((prev) => {
      const updated = { ...prev.part1[target], [field]: value };
      return {
        ...prev,
        part1: {
          ...prev.part1,
          [target]: updated,
          ...(target === 'presentAddress' && prev.part1.sameAsPresentAddress
            ? { permanentAddress: updated }
            : {}),
        },
      };
    });
  };

  const ageInfo = calculateAgeAsOfDeadline(data.part1.dob);
  const ideaWordCount = countWords(data.part2.ideaSummary);

  const requestedAmountNum = parseNumericAmount(data.part4.requestedFinancing);
  const totalCapitalNum = parseNumericAmount(data.part4.totalCapitalNeeded);
  const ownInvestmentNum = parseNumericAmount(data.part4.ownInvestment);
  const budgetTotalNum = data.part4.budgetRows.reduce(
    (sum, r) => sum + parseNumericAmount(r.amount),
    0
  );
  const loanHalf = Math.round(requestedAmountNum / 2);
  const grantHalf = requestedAmountNum - loanHalf;

  return (
    <div className="editor-shell">
      {/* Multi-step Progress Navigation */}
      <nav className="step-nav" aria-label="আবেদন ফরমের ধাপসমূহ">
        <ol className="step-list">
          {FORM_STEPS.map((step, idx) => {
            const isActive = step.id === activeStep;
            return (
              <li key={step.id} className="step-list-item">
                <button
                  type="button"
                  className={`step-pill ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                  onClick={() => onStepChange(step.id)}
                >
                  <span className="step-num">{toBengaliDigits(idx + 1)}</span>
                  <StepIcon id={step.id} />
                  <span className="step-label">{step.shortLabel}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Active Step Form */}
      <form
        className="editor-form"
        aria-labelledby="active-step-heading"
        onSubmit={(e) => {
          e.preventDefault();
          if (currentIdx < FORM_STEPS.length - 1) {
            onStepChange(FORM_STEPS[currentIdx + 1].id);
          }
        }}
      >
        <div className="step-header">
          <h2 id="active-step-heading" ref={stepHeadingRef} tabIndex={-1} className="step-title">
            {currentMeta.title}
          </h2>
          <p className="step-subtitle">{currentMeta.subtitle}</p>
        </div>

        {/* ==================== STEP: OFFICE & PHOTO ==================== */}
        {activeStep === 'office' && (
          <div className="form-section-stack">
            <div className="info-banner">
              <strong>টিপস:</strong> ট্র্যাকিং নম্বর, গ্রহণের তারিখ এবং শাখা ব্যবস্থাপকের অংশ সাধারণত ব্যাংক শাখা পূরণ করে। আপনি চাইলে শুধু জেলা, উপজেলা, ব্যাংকের নাম ও আপনার পাসপোর্ট ছবি দিয়ে বাকিগুলো ফাঁকা রাখতে পারেন।
            </div>

            <div className="photo-upload-card">
              <div className="photo-upload-preview">
                {data.office.photoDataUrl ? (
                  <img
                    src={data.office.photoDataUrl}
                    alt="আপলোডকৃত পাসপোর্ট সাইজ ছবি"
                    className="uploaded-thumb"
                  />
                ) : (
                  <div className="upload-empty">
                    <ImagePlus size={28} aria-hidden="true" />
                    <span>পাসপোর্ট ছবি</span>
                  </div>
                )}
              </div>
              <div className="photo-upload-controls">
                <label htmlFor="office-photo" className="field-label">
                  পাসপোর্ট সাইজ ছবি আপলোড করুন (ঐচ্ছিক)
                </label>
                <p id="office-photo-hint" className="field-hint">
                  আপলোড করলে PDF ফরমের প্রথম পাতার ছবির ঘরে স্বয়ংক্রিয়ভাবে বসে যাবে।
                </p>
                <div className="inline-actions">
                  <input
                    id="office-photo"
                    name="office_photo"
                    type="file"
                    accept="image/*"
                    aria-describedby="office-photo-hint"
                    className="file-input"
                    onChange={(e) =>
                      handleImageUpload(e.target.files?.[0], (url) =>
                        onChange((prev) => ({
                          ...prev,
                          office: { ...prev.office, photoDataUrl: url },
                        }))
                      )
                    }
                  />
                  {data.office.photoDataUrl && (
                    <button
                      type="button"
                      className="btn-danger-ghost"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          office: { ...prev.office, photoDataUrl: '' },
                        }))
                      }
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      ছবি মুছুন
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="office-bank" className="field-label">
                আবেদন গ্রহণকারী ব্যাংক ও শাখা
              </label>
              <input
                id="office-bank"
                name="office_bank"
                type="text"
                enterKeyHint="next"
                value={data.office.bankAndBranch}
                placeholder="যেমন: সোনালী ব্যাংক পিএলসি, সদর উপজেলা শাখা"
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    office: { ...prev.office, bankAndBranch: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="office-district" className="field-label">
                  জেলা
                </label>
                <input
                  id="office-district"
                  name="office_district"
                  type="text"
                  enterKeyHint="next"
                  value={data.office.district}
                  placeholder="যেমন: ঢাকা"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      office: { ...prev.office, district: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="office-upazila" className="field-label">
                  উপজেলা
                </label>
                <input
                  id="office-upazila"
                  name="office_upazila"
                  type="text"
                  enterKeyHint="next"
                  value={data.office.upazila}
                  placeholder="যেমন: সাভার"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      office: { ...prev.office, upazila: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="office-tracking" className="field-label">
                  ট্র্যাকিং নম্বর (সর্বোচ্চ ৮ অঙ্ক — ব্যাংক পূরণ করবে)
                </label>
                <p id="office-tracking-hint" className="field-hint">
                  লিখলে ফরমের ৮টি বক্সে আলাদাভাবে বসবে।
                </p>
                <input
                  id="office-tracking"
                  name="office_tracking"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  autoCorrect="off"
                  spellCheck={false}
                  aria-describedby="office-tracking-hint"
                  value={data.office.trackingNumber}
                  placeholder="ফাঁকা রাখতে পারেন"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      office: { ...prev.office, trackingNumber: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="office-manager" className="field-label">
                  শাখা ব্যবস্থাপকের নাম (ঐচ্ছিক)
                </label>
                <input
                  id="office-manager"
                  name="office_manager"
                  type="text"
                  value={data.office.branchManagerName}
                  placeholder="ফাঁকা রাখতে পারেন"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      office: { ...prev.office, branchManagerName: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <fieldset className="form-fieldset">
              <legend>গ্রহণের তারিখ (ব্যাংক শাখার জন্য — ঐচ্ছিক)</legend>
              <div className="field-grid-3">
                <div className="field-group">
                  <label htmlFor="office-day" className="field-label">দিন (২ অঙ্ক)</label>
                  <input
                    id="office-day"
                    name="office_day"
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={data.office.receiveDay}
                    placeholder="যেমন: ১০"
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        office: { ...prev.office, receiveDay: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="office-month" className="field-label">মাস (২ অঙ্ক)</label>
                  <input
                    id="office-month"
                    name="office_month"
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={data.office.receiveMonth}
                    placeholder="যেমন: ১০"
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        office: { ...prev.office, receiveMonth: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="office-year" className="field-label">সাল (৪ অঙ্ক)</label>
                  <input
                    id="office-year"
                    name="office_year"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={data.office.receiveYear}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        office: { ...prev.office, receiveYear: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </fieldset>
          </div>
        )}

        {/* ==================== STEP: PART 1 ==================== */}
        {activeStep === 'part1' && (
          <div className="form-section-stack">
            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="p1-name-bn" className="field-label">
                  ০১. আবেদনকারীর নাম (বাংলায়) <span aria-hidden="true" className="req-star">*</span>
                </label>
                <input
                  id="p1-name-bn"
                  name="name_bn"
                  type="text"
                  autoComplete="name"
                  required
                  value={data.part1.nameBn}
                  placeholder="জাতীয় পরিচয়পত্র অনুযায়ী বাংলায়"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, nameBn: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p1-name-en" className="field-label">
                  ০১. আবেদনকারীর নাম (<span lang="en">In English Block Letters</span>) <span aria-hidden="true" className="req-star">*</span>
                </label>
                <input
                  id="p1-name-en"
                  name="name_en"
                  type="text"
                  lang="en"
                  autoComplete="name"
                  autoCapitalize="characters"
                  spellCheck={false}
                  required
                  value={data.part1.nameEn}
                  placeholder="E.G. MD. TANVIR AHMED"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, nameEn: e.target.value.toUpperCase() },
                    }))
                  }
                />
              </div>
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="p1-father" className="field-label">০২. পিতার নাম</label>
                <input
                  id="p1-father"
                  name="father_name"
                  type="text"
                  value={data.part1.fatherName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, fatherName: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p1-mother" className="field-label">০৩. মাতার নাম</label>
                <input
                  id="p1-mother"
                  name="mother_name"
                  type="text"
                  value={data.part1.motherName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, motherName: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="p1-nid" className="field-label">০৪. জাতীয় পরিচয়পত্র নম্বর (NID)</label>
                <input
                  id="p1-nid"
                  name="nid"
                  type="text"
                  inputMode="numeric"
                  autoCorrect="off"
                  spellCheck={false}
                  value={data.part1.nid}
                  placeholder="১০ বা ১৭ অঙ্কের এনআইডি নম্বর"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, nid: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p1-dob" className="field-label">০৫. জন্ম তারিখ</label>
                <p id="p1-dob-hint" className="field-hint">
                  ১৫ অক্টোবর ২০২৬ তারিখে বয়স সর্বোচ্চ ২৮ বছর হতে হবে।
                </p>
                <input
                  id="p1-dob"
                  name="dob"
                  type="date"
                  autoComplete="bday"
                  aria-describedby="p1-dob-hint"
                  value={data.part1.dob}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, dob: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            {ageInfo && (
              <div className={`status-callout ${ageInfo.isEligible ? 'is-ok' : 'is-warn'}`}>
                {ageInfo.isEligible ? (
                  <CheckCircle2 size={18} aria-hidden="true" />
                ) : (
                  <AlertTriangle size={18} aria-hidden="true" />
                )}
                <span>
                  ১৫ অক্টোবর ২০২৬ তারিখে আপনার হিসাবকৃত বয়স: <strong>{ageInfo.formattedBn}</strong>
                  {ageInfo.isEligible
                    ? ' — যোগ্যতার সীমার (১৮ থেকে সর্বোচ্চ ২৮ বছর) মধ্যে আছে।'
                    : ' — সতর্কতা: নীতিমালা অনুযায়ী বয়স ১৮ থেকে সর্বোচ্চ ২৮ বছরের মধ্যে হতে হবে।'}
                </span>
              </div>
            )}

            <fieldset className="form-fieldset">
              <legend>০৬. বৈবাহিক অবস্থা</legend>
              <div className="radio-row">
                {(['অবিবাহিত', 'বিবাহিত', 'অন্যান্য'] as const).map((status) => (
                  <div key={status} className="radio-option">
                    <input
                      type="radio"
                      id={`marital-${status}`}
                      name="marital_status"
                      value={status}
                      checked={data.part1.maritalStatus === status}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part1: { ...prev.part1, maritalStatus: status },
                        }))
                      }
                    />
                    <label htmlFor={`marital-${status}`}>{status}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            {data.part1.maritalStatus === 'বিবাহিত' && (
              <div className="field-grid-2">
                <div className="field-group">
                  <label htmlFor="p1-spouse-name" className="field-label">
                    ০৭. স্বামী/স্ত্রীর নাম
                  </label>
                  <input
                    id="p1-spouse-name"
                    name="spouse_name"
                    type="text"
                    value={data.part1.spouseName}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part1: { ...prev.part1, spouseName: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p1-spouse-nid" className="field-label">
                    ০৭. স্বামী/স্ত্রীর জাতীয় পরিচয়পত্র নম্বর
                  </label>
                  <input
                    id="p1-spouse-nid"
                    name="spouse_nid"
                    type="text"
                    inputMode="numeric"
                    value={data.part1.spouseNid}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part1: { ...prev.part1, spouseNid: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="p1-education" className="field-label">
                ০৮. শিক্ষাগত যোগ্যতা (সর্বশেষ পাসকৃত পরীক্ষা, বোর্ড/বিশ্ববিদ্যালয় ও সাল)
              </label>
              <input
                id="p1-education"
                name="education"
                type="text"
                value={data.part1.education}
                placeholder="যেমন: বিএসসি (অনার্স), জাতীয় বিশ্ববিদ্যালয়, ২০২৩"
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part1: { ...prev.part1, education: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-grid-3">
              <div className="field-group">
                <label htmlFor="p1-phone" className="field-label">০৯. ফোন নম্বর</label>
                <input
                  id="p1-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={data.part1.phone}
                  placeholder="০১৭XX-XXXXXX"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, phone: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p1-alt-phone" className="field-label">০৯. বিকল্প ফোন নম্বর</label>
                <input
                  id="p1-alt-phone"
                  name="alt_phone"
                  type="tel"
                  inputMode="tel"
                  value={data.part1.altPhone}
                  placeholder="০১৮XX-XXXXXX"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, altPhone: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p1-email" className="field-label">১০. ই-মেইল আইডি</label>
                <input
                  id="p1-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={data.part1.email}
                  placeholder="name@example.com"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part1: { ...prev.part1, email: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="p1-training" className="field-label">
                ১১. দক্ষতা উন্নয়নমূলক প্রশিক্ষণের বিবরণ (প্রতিষ্ঠান, কোর্সের নাম, মেয়াদ ও সাল)
              </label>
              <textarea
                id="p1-training"
                name="training"
                rows={3}
                value={data.part1.training}
                placeholder="প্রশিক্ষণ থাকলে বিস্তারিত লিখুন (সনদের কপি সংযুক্ত করতে হবে)"
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part1: { ...prev.part1, training: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p1-experience" className="field-label">
                ১২. ব্যবসা/চাকরির অভিজ্ঞতা থাকলে তার বিবরণ
              </label>
              <textarea
                id="p1-experience"
                name="experience"
                rows={3}
                value={data.part1.experience}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part1: { ...prev.part1, experience: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p1-bank" className="field-label">
                ১৩. ব্যাংক হিসাব থাকলে ব্যাংক হিসাবের তথ্য (ব্যাংকের নাম ও শাখা, হিসাবের ধরন, হিসাব নম্বর)
              </label>
              <textarea
                id="p1-bank"
                name="bank_account_info"
                rows={2}
                value={data.part1.bankAccountInfo}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part1: { ...prev.part1, bankAccountInfo: e.target.value },
                  }))
                }
              />
            </div>

            <fieldset className="form-fieldset">
              <legend>১৪. কোনো ব্যাংক/আর্থিক প্রতিষ্ঠানে বিদ্যমান ঋণ আছে কিনা?</legend>
              <p className="field-hint">
                নীতিমালা ৫.৫ অনুযায়ী, পূর্বে ব্যবসায়িক ঋণ নিয়ে থাকলে এ কর্মসূচিতে বিবেচিত হবেন না।
              </p>
              <div className="radio-row">
                {(['না', 'হ্যাঁ'] as const).map((opt) => (
                  <div key={opt} className="radio-option">
                    <input
                      type="radio"
                      id={`loan-${opt}`}
                      name="existing_loan"
                      value={opt}
                      checked={data.part1.hasExistingLoan === opt}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part1: { ...prev.part1, hasExistingLoan: opt },
                        }))
                      }
                    />
                    <label htmlFor={`loan-${opt}`}>{opt}</label>
                  </div>
                ))}
              </div>
              {data.part1.hasExistingLoan === 'হ্যাঁ' && (
                <div className="field-group sub-field">
                  <label htmlFor="p1-loan-details" className="field-label">
                    বিদ্যমান ঋণের বিবরণ
                  </label>
                  <input
                    id="p1-loan-details"
                    name="existing_loan_details"
                    type="text"
                    value={data.part1.existingLoanDetails}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part1: { ...prev.part1, existingLoanDetails: e.target.value },
                      }))
                    }
                  />
                </div>
              )}
            </fieldset>

            {/* Address 15 */}
            <fieldset className="form-fieldset">
              <legend>১৫. বর্তমান ঠিকানা (জাতীয় পরিচয়পত্র মোতাবেক)</legend>
              <div className="field-grid-3">
                <div className="field-group">
                  <label htmlFor="addr-p-house" className="field-label">বাড়ি/মহল্লার নং ও নাম</label>
                  <input
                    id="addr-p-house"
                    type="text"
                    autoComplete="address-line1"
                    value={data.part1.presentAddress.house}
                    onChange={(e) => updateAddress('presentAddress', 'house', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="addr-p-road" className="field-label">রোড নং/ এলাকা/ গ্রামের নাম</label>
                  <input
                    id="addr-p-road"
                    type="text"
                    autoComplete="address-line2"
                    value={data.part1.presentAddress.roadVillage}
                    onChange={(e) => updateAddress('presentAddress', 'roadVillage', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="addr-p-post" className="field-label">ডাকঘর ও পোস্ট কোড</label>
                  <input
                    id="addr-p-post"
                    type="text"
                    autoComplete="postal-code"
                    value={data.part1.presentAddress.postOfficeCode}
                    onChange={(e) => updateAddress('presentAddress', 'postOfficeCode', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="addr-p-upazila" className="field-label">থানা/উপজেলা</label>
                  <input
                    id="addr-p-upazila"
                    type="text"
                    value={data.part1.presentAddress.upazila}
                    onChange={(e) => updateAddress('presentAddress', 'upazila', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="addr-p-dist" className="field-label">জেলা</label>
                  <input
                    id="addr-p-dist"
                    type="text"
                    value={data.part1.presentAddress.district}
                    onChange={(e) => updateAddress('presentAddress', 'district', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="addr-p-div" className="field-label">বিভাগ</label>
                  <input
                    id="addr-p-div"
                    type="text"
                    value={data.part1.presentAddress.division}
                    onChange={(e) => updateAddress('presentAddress', 'division', e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            {/* Address 16 */}
            <fieldset className="form-fieldset">
              <legend>১৬. স্থায়ী ঠিকানা</legend>
              <div className="checkbox-inline">
                <input
                  id="same-as-present"
                  type="checkbox"
                  checked={data.part1.sameAsPresentAddress}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange((prev) => ({
                      ...prev,
                      part1: {
                        ...prev.part1,
                        sameAsPresentAddress: checked,
                        permanentAddress: checked
                          ? { ...prev.part1.presentAddress }
                          : prev.part1.permanentAddress,
                      },
                    }));
                  }}
                />
                <label htmlFor="same-as-present">বর্তমান ঠিকানার অনুরূপ</label>
              </div>

              {!data.part1.sameAsPresentAddress && (
                <div className="field-grid-3 sub-field">
                  <div className="field-group">
                    <label htmlFor="addr-perm-house" className="field-label">বাড়ি/মহল্লার নং ও নাম</label>
                    <input
                      id="addr-perm-house"
                      type="text"
                      value={data.part1.permanentAddress.house}
                      onChange={(e) => updateAddress('permanentAddress', 'house', e.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="addr-perm-road" className="field-label">রোড নং/ এলাকা/ গ্রামের নাম</label>
                    <input
                      id="addr-perm-road"
                      type="text"
                      value={data.part1.permanentAddress.roadVillage}
                      onChange={(e) => updateAddress('permanentAddress', 'roadVillage', e.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="addr-perm-post" className="field-label">ডাকঘর ও পোস্ট কোড</label>
                    <input
                      id="addr-perm-post"
                      type="text"
                      value={data.part1.permanentAddress.postOfficeCode}
                      onChange={(e) => updateAddress('permanentAddress', 'postOfficeCode', e.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="addr-perm-upazila" className="field-label">থানা/উপজেলা</label>
                    <input
                      id="addr-perm-upazila"
                      type="text"
                      value={data.part1.permanentAddress.upazila}
                      onChange={(e) => updateAddress('permanentAddress', 'upazila', e.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="addr-perm-dist" className="field-label">জেলা</label>
                    <input
                      id="addr-perm-dist"
                      type="text"
                      value={data.part1.permanentAddress.district}
                      onChange={(e) => updateAddress('permanentAddress', 'district', e.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="addr-perm-div" className="field-label">বিভাগ</label>
                    <input
                      id="addr-perm-div"
                      type="text"
                      value={data.part1.permanentAddress.division}
                      onChange={(e) => updateAddress('permanentAddress', 'division', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </fieldset>
          </div>
        )}

        {/* ==================== STEP: PART 2 (NEW BUSINESS) ==================== */}
        {activeStep === 'part2' && (
          <div className="form-section-stack">
            <div className="info-banner">
              <strong>নতুন উদ্যোক্তাদের জন্য:</strong> আপনি যদি নতুন ব্যবসা শুরু করতে চান, তাহলে পার্ট-২ পূরণ করুন (এবং পার্ট-৩ ফাঁকা রাখুন)।
            </div>

            <div className="field-group">
              <label htmlFor="p2-idea" className="field-label">
                ০১. ব্যবসায়িক ধারণা/উদ্যোগের সংক্ষিপ্ত বিবরণ (২০০ শব্দের মধ্যে)
              </label>
              <p id="p2-idea-hint" className={`field-hint ${ideaWordCount > 200 ? 'text-danger' : ''}`}>
                বর্তমান শব্দ সংখ্যা: {toBengaliDigits(ideaWordCount)} / ২০০ শব্দ
              </p>
              <textarea
                id="p2-idea"
                name="p2_idea"
                rows={6}
                aria-describedby="p2-idea-hint"
                value={data.part2.ideaSummary}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, ideaSummary: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p2-customers" className="field-label">০২. সম্ভাব্য ক্রেতা</label>
              <textarea
                id="p2-customers"
                rows={2}
                value={data.part2.targetCustomers}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, targetCustomers: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p2-timeline" className="field-label">
                ০৩. কত সময়ের মধ্যে ব্যবসায় শুরু করার পরিকল্পনা রয়েছে
              </label>
              <input
                id="p2-timeline"
                type="text"
                value={data.part2.startTimeline}
                placeholder="যেমন: অর্থায়ন প্রাপ্তির ৪৫ দিনের মধ্যে"
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, startTimeline: e.target.value },
                  }))
                }
              />
            </div>

            <fieldset className="form-fieldset">
              <legend>০৪. ব্যবসার ধরন ও বিবরণ</legend>
              <div className="radio-row">
                {(['উৎপাদন', 'সেবা', 'ব্যবসা'] as const).map((t) => (
                  <div key={t} className="radio-option">
                    <input
                      type="radio"
                      id={`p2-type-${t}`}
                      name="p2_business_type"
                      value={t}
                      checked={data.part2.businessType === t}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part2: { ...prev.part2, businessType: t },
                        }))
                      }
                    />
                    <label htmlFor={`p2-type-${t}`}>{t}</label>
                  </div>
                ))}
              </div>
              <div className="field-group sub-field">
                <label htmlFor="p2-type-desc" className="field-label">ব্যবসার সংক্ষিপ্ত বিবরণ</label>
                <input
                  id="p2-type-desc"
                  type="text"
                  value={data.part2.businessTypeDetails}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part2: { ...prev.part2, businessTypeDetails: e.target.value },
                    }))
                  }
                />
              </div>
            </fieldset>

            <div className="field-group">
              <label htmlFor="p2-location" className="field-label">
                ০৫. ব্যবসার সম্ভাব্য অবস্থান (গ্রাম/মহল্লা, ইউনিয়ন, উপজেলা)
              </label>
              <input
                id="p2-location"
                type="text"
                value={data.part2.probableLocation}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, probableLocation: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p2-product-nature" className="field-label">
                ০৬. পণ্যের ধরন (আমদানির বিকল্প বা রপ্তানিযোগ্য পণ্য কিনা)
              </label>
              <input
                id="p2-product-nature"
                type="text"
                value={data.part2.productNature}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, productNature: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p2-raw" className="field-label">
                ০৭. কাঁচামালের উৎস (প্রযোজ্য ক্ষেত্রে)
              </label>
              <input
                id="p2-raw"
                type="text"
                value={data.part2.rawMaterialSource}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, rawMaterialSource: e.target.value },
                  }))
                }
              />
            </div>

            <fieldset className="form-fieldset">
              <legend>০৮. পণ্যের বাজার</legend>
              <div className="radio-row">
                {(['স্থানীয়', 'আন্তর্জাতিক', 'স্থানীয় ও আন্তর্জাতিক'] as const).map((m) => (
                  <div key={m} className="radio-option">
                    <input
                      type="radio"
                      id={`p2-mkt-${m}`}
                      name="p2_market_scope"
                      value={m}
                      checked={data.part2.marketScope === m}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part2: { ...prev.part2, marketScope: m },
                        }))
                      }
                    />
                    <label htmlFor={`p2-mkt-${m}`}>{m}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Sales & Profit Projection */}
            <fieldset className="form-fieldset">
              <legend>০৯. সম্ভাব্য বিক্রয়ের পরিমাণ (টাকায়)</legend>
              <div className="field-grid-3">
                <div className="field-group">
                  <label htmlFor="p2-sales-m" className="field-label">মাসিক</label>
                  <input
                    id="p2-sales-m"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.projectedSales.monthly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: {
                          ...prev.part2,
                          projectedSales: { ...prev.part2.projectedSales, monthly: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p2-sales-q" className="field-label">ত্রৈমাসিক</label>
                  <input
                    id="p2-sales-q"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.projectedSales.quarterly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: {
                          ...prev.part2,
                          projectedSales: { ...prev.part2.projectedSales, quarterly: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p2-sales-y" className="field-label">বার্ষিক</label>
                  <input
                    id="p2-sales-y"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.projectedSales.yearly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: {
                          ...prev.part2,
                          projectedSales: { ...prev.part2.projectedSales, yearly: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-subtle-sm"
                onClick={() => {
                  const m = parseNumericAmount(data.part2.projectedSales.monthly);
                  if (m > 0) {
                    onChange((prev) => ({
                      ...prev,
                      part2: {
                        ...prev.part2,
                        projectedSales: {
                          monthly: formatTakaBn(m),
                          quarterly: formatTakaBn(m * 3),
                          yearly: formatTakaBn(m * 12),
                        },
                      },
                    }));
                  }
                }}
              >
                <Calculator size={14} aria-hidden="true" />
                মাসিক থেকে ত্রৈমাসিক (×৩) ও বার্ষিক (×১২) হিসাব করুন
              </button>
            </fieldset>

            <fieldset className="form-fieldset">
              <legend>১০. সম্ভাব্য লাভ/মুনাফা (টাকায়)</legend>
              <div className="field-grid-3">
                <div className="field-group">
                  <label htmlFor="p2-profit-m" className="field-label">মাসিক</label>
                  <input
                    id="p2-profit-m"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.projectedProfit.monthly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: {
                          ...prev.part2,
                          projectedProfit: { ...prev.part2.projectedProfit, monthly: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p2-profit-q" className="field-label">ত্রৈমাসিক</label>
                  <input
                    id="p2-profit-q"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.projectedProfit.quarterly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: {
                          ...prev.part2,
                          projectedProfit: { ...prev.part2.projectedProfit, quarterly: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p2-profit-y" className="field-label">বার্ষিক</label>
                  <input
                    id="p2-profit-y"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.projectedProfit.yearly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: {
                          ...prev.part2,
                          projectedProfit: { ...prev.part2.projectedProfit, yearly: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-subtle-sm"
                onClick={() => {
                  const m = parseNumericAmount(data.part2.projectedProfit.monthly);
                  if (m > 0) {
                    onChange((prev) => ({
                      ...prev,
                      part2: {
                        ...prev.part2,
                        projectedProfit: {
                          monthly: formatTakaBn(m),
                          quarterly: formatTakaBn(m * 3),
                          yearly: formatTakaBn(m * 12),
                        },
                      },
                    }));
                  }
                }}
              >
                <Calculator size={14} aria-hidden="true" />
                মাসিক থেকে ত্রৈমাসিক (×৩) ও বার্ষিক (×১২) হিসাব করুন
              </button>
            </fieldset>

            <div className="field-group">
              <label htmlFor="p2-risks" className="field-label">
                ১১. ব্যবসা পরিচালনার ক্ষেত্রে সম্ভাব্য সমস্যাসমূহ, ঝুঁকিসমূহ এবং মোকাবেলার পরিকল্পনা
              </label>
              <textarea
                id="p2-risks"
                rows={4}
                value={data.part2.risksAndMitigation}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, risksAndMitigation: e.target.value },
                  }))
                }
              />
            </div>

            <fieldset className="form-fieldset">
              <legend>১২. প্রথম বছরে সম্ভাব্য কর্মসংস্থান</legend>
              <div className="field-grid-2">
                <div className="field-group">
                  <label htmlFor="p2-emp-total" className="field-label">মোট কর্মসংস্থান (জন)</label>
                  <input
                    id="p2-emp-total"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.firstYearEmploymentTotal}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: { ...prev.part2, firstYearEmploymentTotal: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p2-emp-female" className="field-label">তন্মধ্যে নারী (জন)</label>
                  <input
                    id="p2-emp-female"
                    type="text"
                    inputMode="numeric"
                    value={data.part2.firstYearEmploymentFemale}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part2: { ...prev.part2, firstYearEmploymentFemale: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </fieldset>

            <div className="field-group">
              <label htmlFor="p2-comp" className="field-label">
                ১৩. বাজারে পণ্য/সেবার অবস্থান (কমপক্ষে ৩টি সম্ভাব্য প্রতিযোগী প্রতিষ্ঠানের তথ্যসহ)
              </label>
              <textarea
                id="p2-comp"
                rows={4}
                value={data.part2.marketPositionAndCompetitors}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part2: { ...prev.part2, marketPositionAndCompetitors: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* ==================== STEP: PART 3 (EXISTING BUSINESS) ==================== */}
        {activeStep === 'part3' && (
          <div className="form-section-stack">
            <div className="info-banner">
              <strong>চলমান ব্যবসার জন্য:</strong> আপনার বর্তমানে চালু কোনো ব্যবসা না থাকলে এই ধাপটি ফাঁকা রেখে সরাসরি <strong>পার্ট-৪</strong>-এ চলে যান।
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="p3-name" className="field-label">০১. ব্যবসা প্রতিষ্ঠানের নাম</label>
                <input
                  id="p3-name"
                  type="text"
                  value={data.part3.businessName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part3: { ...prev.part3, businessName: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p3-start" className="field-label">০৩. ব্যবসা শুরুর তারিখ</label>
                <input
                  id="p3-start"
                  type="date"
                  value={data.part3.startDate}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part3: { ...prev.part3, startDate: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <fieldset className="form-fieldset">
              <legend>০২. ব্যবসার ধরন ও বিবরণ</legend>
              <div className="radio-row">
                {(['উৎপাদন', 'সেবা', 'ব্যবসা'] as const).map((t) => (
                  <div key={t} className="radio-option">
                    <input
                      type="radio"
                      id={`p3-type-${t}`}
                      name="p3_business_type"
                      value={t}
                      checked={data.part3.businessType === t}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part3: { ...prev.part3, businessType: t },
                        }))
                      }
                    />
                    <label htmlFor={`p3-type-${t}`}>{t}</label>
                  </div>
                ))}
              </div>
              <div className="field-group sub-field">
                <label htmlFor="p3-type-desc" className="field-label">ব্যবসার বিবরণ</label>
                <input
                  id="p3-type-desc"
                  type="text"
                  value={data.part3.businessTypeDetails}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part3: { ...prev.part3, businessTypeDetails: e.target.value },
                    }))
                  }
                />
              </div>
            </fieldset>

            <fieldset className="form-fieldset">
              <legend>০৪. ট্রেড লাইসেন্স আছে কিনা?</legend>
              <div className="radio-row">
                {(['হ্যাঁ', 'না'] as const).map((opt) => (
                  <div key={opt} className="radio-option">
                    <input
                      type="radio"
                      id={`p3-tl-${opt}`}
                      name="p3_trade_license"
                      value={opt}
                      checked={data.part3.hasTradeLicense === opt}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part3: { ...prev.part3, hasTradeLicense: opt },
                        }))
                      }
                    />
                    <label htmlFor={`p3-tl-${opt}`}>{opt}</label>
                  </div>
                ))}
              </div>
              {data.part3.hasTradeLicense === 'হ্যাঁ' && (
                <div className="field-group sub-field">
                  <label htmlFor="p3-tl-details" className="field-label">
                    ট্রেড লাইসেন্স ইস্যুর তারিখ ও নম্বর
                  </label>
                  <input
                    id="p3-tl-details"
                    type="text"
                    value={data.part3.tradeLicenseDetails}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, tradeLicenseDetails: e.target.value },
                      }))
                    }
                  />
                </div>
              )}
            </fieldset>

            <div className="field-group">
              <label htmlFor="p3-avg-price" className="field-label">
                ০৫. পণ্য/সেবার গড় বিক্রয়মূল্য (একক প্রতি)
              </label>
              <input
                id="p3-avg-price"
                type="text"
                value={data.part3.avgSellingPrice}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part3: { ...prev.part3, avgSellingPrice: e.target.value },
                  }))
                }
              />
            </div>

            <fieldset className="form-fieldset">
              <legend>০৬. বিক্রয়ের পরিমাণ (টাকায়)</legend>
              <div className="field-grid-3">
                <div className="field-group">
                  <label htmlFor="p3-sales-m" className="field-label">মাসিক</label>
                  <input
                    id="p3-sales-m"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.sales.monthly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, sales: { ...prev.part3.sales, monthly: e.target.value } },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p3-sales-q" className="field-label">ত্রৈমাসিক</label>
                  <input
                    id="p3-sales-q"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.sales.quarterly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, sales: { ...prev.part3.sales, quarterly: e.target.value } },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p3-sales-y" className="field-label">বার্ষিক</label>
                  <input
                    id="p3-sales-y"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.sales.yearly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, sales: { ...prev.part3.sales, yearly: e.target.value } },
                      }))
                    }
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="form-fieldset">
              <legend>০৭. লাভ/মুনাফার পরিমাণ (টাকায়)</legend>
              <div className="field-grid-3">
                <div className="field-group">
                  <label htmlFor="p3-prof-m" className="field-label">মাসিক</label>
                  <input
                    id="p3-prof-m"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.profit.monthly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, profit: { ...prev.part3.profit, monthly: e.target.value } },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p3-prof-q" className="field-label">ত্রৈমাসিক</label>
                  <input
                    id="p3-prof-q"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.profit.quarterly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, profit: { ...prev.part3.profit, quarterly: e.target.value } },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p3-prof-y" className="field-label">বার্ষিক</label>
                  <input
                    id="p3-prof-y"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.profit.yearly}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, profit: { ...prev.part3.profit, yearly: e.target.value } },
                      }))
                    }
                  />
                </div>
              </div>
            </fieldset>

            <div className="field-group">
              <label htmlFor="p3-expenses" className="field-label">
                ০৮. কাঁচামাল ও ব্যবসা পরিচালনা বাবদ বিভিন্ন খাতে মাসিক সম্ভাব্য খরচ (টাকা)
              </label>
              <textarea
                id="p3-expenses"
                rows={2}
                value={data.part3.monthlyExpenses}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part3: { ...prev.part3, monthlyExpenses: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p3-involved" className="field-label">
                ০৯. উদ্যোক্তা কীভাবে আলোচ্য ব্যবসায়ের সঙ্গে জড়িত হয়েছেন
              </label>
              <textarea
                id="p3-involved"
                rows={2}
                value={data.part3.howInvolved}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part3: { ...prev.part3, howInvolved: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="p3-inv" className="field-label">
                  ১০. ব্যবসার সঙ্গে সম্পর্কিত মোট বিনিয়োগের পরিমাণ (টাকা)
                </label>
                <input
                  id="p3-inv"
                  type="text"
                  inputMode="numeric"
                  value={data.part3.totalInvestment}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part3: { ...prev.part3, totalInvestment: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p3-area" className="field-label">১২. পণ্য/সেবা বিপণন এলাকা</label>
                <input
                  id="p3-area"
                  type="text"
                  value={data.part3.marketingArea}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part3: { ...prev.part3, marketingArea: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="p3-raw" className="field-label">১১. কাঁচামালের উৎস (প্রযোজ্য ক্ষেত্রে)</label>
              <input
                id="p3-raw"
                type="text"
                value={data.part3.rawMaterialSource}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part3: { ...prev.part3, rawMaterialSource: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p3-comp" className="field-label">
                ১৩. বাজারে অবস্থান (কমপক্ষে ৩টি সম্ভাব্য প্রতিযোগী প্রতিষ্ঠানের তথ্যসহ)
              </label>
              <textarea
                id="p3-comp"
                rows={3}
                value={data.part3.marketPositionAndCompetitors}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part3: { ...prev.part3, marketPositionAndCompetitors: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="p3-risks" className="field-label">
                ১৪. বিদ্যমান ব্যবসায় পরিচালনায় সমস্যাসমূহ, ঝুঁকিসমূহ এবং মোকাবেলার পরিকল্পনা
              </label>
              <textarea
                id="p3-risks"
                rows={3}
                value={data.part3.risksAndMitigation}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part3: { ...prev.part3, risksAndMitigation: e.target.value },
                  }))
                }
              />
            </div>

            <fieldset className="form-fieldset">
              <legend>১৫. কর্মীর সংখ্যা</legend>
              <div className="field-grid-2">
                <div className="field-group">
                  <label htmlFor="p3-emp-total" className="field-label">মোট কর্মী (জন)</label>
                  <input
                    id="p3-emp-total"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.employeeTotal}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, employeeTotal: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="p3-emp-female" className="field-label">তন্মধ্যে নারী (জন)</label>
                  <input
                    id="p3-emp-female"
                    type="text"
                    inputMode="numeric"
                    value={data.part3.employeeFemale}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part3: { ...prev.part3, employeeFemale: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </fieldset>

            <div className="field-group">
              <label htmlFor="p3-expand" className="field-label">
                ১৬. চলমান ব্যবসায় সম্প্রসারণসহ কর্মী বাড়ানোর কোনো পরিকল্পনা রয়েছে কিনা; থাকলে বিবরণ
              </label>
              <textarea
                id="p3-expand"
                rows={3}
                value={data.part3.expansionPlan}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part3: { ...prev.part3, expansionPlan: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* ==================== STEP: PART 4 (FINANCING & BUDGET) ==================== */}
        {activeStep === 'part4' && (
          <div className="form-section-stack">
            <fieldset className="form-fieldset">
              <legend>ক. অর্থায়ন প্যাকেজ (টাকায়)</legend>
              <div className="field-grid-3">
                <div className="field-group">
                  <label htmlFor="p4-total" className="field-label">
                    ০১. প্রয়োজনীয় মোট মূলধনের পরিমাণ
                  </label>
                  <input
                    id="p4-total"
                    type="text"
                    inputMode="numeric"
                    value={data.part4.totalCapitalNeeded}
                    placeholder="যেমন: ১৮,০০,০০০"
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part4: { ...prev.part4, totalCapitalNeeded: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="p4-own" className="field-label">
                    ০২. নিজস্ব বিনিয়োগ (যদি থাকে)
                  </label>
                  <input
                    id="p4-own"
                    type="text"
                    inputMode="numeric"
                    value={data.part4.ownInvestment}
                    placeholder="যেমন: ২,০০,০০০"
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part4: { ...prev.part4, ownInvestment: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="p4-req" className="field-label">
                    ০৩. আবেদনকৃত অর্থায়নের পরিমাণ
                  </label>
                  <input
                    id="p4-req"
                    type="text"
                    inputMode="numeric"
                    value={data.part4.requestedFinancing}
                    placeholder="সর্বোচ্চ ২০,০০,০০০"
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part4: { ...prev.part4, requestedFinancing: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {totalCapitalNum > 0 && ownInvestmentNum >= 0 && (
                <button
                  type="button"
                  className="btn-subtle-sm"
                  onClick={() => {
                    const diff = Math.max(0, totalCapitalNum - ownInvestmentNum);
                    onChange((prev) => ({
                      ...prev,
                      part4: { ...prev.part4, requestedFinancing: formatTakaBn(diff) },
                    }));
                  }}
                >
                  <Calculator size={14} aria-hidden="true" />
                  মোট মূলধন − নিজস্ব বিনিয়োগ = আবেদনকৃত অর্থায়ন বসান
                </button>
              )}

              {requestedAmountNum > 0 && (
                <div
                  className={`status-callout ${
                    requestedAmountNum <= 2000000 ? 'is-ok' : 'is-warn'
                  }`}
                >
                  {requestedAmountNum <= 2000000 ? (
                    <CheckCircle2 size={18} aria-hidden="true" />
                  ) : (
                    <AlertTriangle size={18} aria-hidden="true" />
                  )}
                  <span>
                    ৫০:৫০ সমন্বিত অর্থায়ন বিভাজন: <strong>ব্যাংক ঋণ {formatTakaBn(loanHalf)} টাকা</strong> +{' '}
                    <strong>অনুদান {formatTakaBn(grantHalf)} টাকা</strong>।
                    {requestedAmountNum > 2000000 &&
                      ' সতর্কতা: নীতিমালা অনুযায়ী সর্বোচ্চ আবেদনযোগ্য সীমা ২০,০০,০০০ টাকা।'}
                  </span>
                </div>
              )}
            </fieldset>

            <div className="budget-editor-block">
              <div className="budget-header-row">
                <h3 className="sub-heading">খ. খাতভিত্তিক ব্যয় বিভাজন (১২টি খাত)</h3>
                <div className="budget-total-badge">
                  সর্বমোট: <strong>{budgetTotalNum > 0 ? `${formatTakaBn(budgetTotalNum)} টাকা` : '০ টাকা'}</strong>
                </div>
              </div>

              {totalCapitalNum > 0 && budgetTotalNum > 0 && totalCapitalNum !== budgetTotalNum && (
                <div className="status-callout is-warn">
                  <AlertTriangle size={18} aria-hidden="true" />
                  <span>
                    খাতভিত্তিক সর্বমোট ব্যয় ({formatTakaBn(budgetTotalNum)} টাকা) এবং প্রয়োজনীয় মোট মূলধন ({formatTakaBn(totalCapitalNum)} টাকা) সমান নয়।
                  </span>
                </div>
              )}

              <div className="budget-rows-list">
                {data.part4.budgetRows.map((row, idx) => (
                  <div key={row.id} className="budget-row-card">
                    <div className="budget-row-title">
                      <span className="budget-sl-badge">{row.serial}</span>
                      <span>{row.sector}</span>
                    </div>
                    <div className="budget-row-inputs">
                      <div className="field-group">
                        <label htmlFor={`b-det-${row.id}`} className="field-label-xs">বিবরণ</label>
                        <input
                          id={`b-det-${row.id}`}
                          type="text"
                          value={row.details}
                          placeholder="খাতের বিস্তারিত বিবরণ"
                          onChange={(e) => {
                            const val = e.target.value;
                            onChange((prev) => ({
                              ...prev,
                              part4: {
                                ...prev.part4,
                                budgetRows: prev.part4.budgetRows.map((r, i) =>
                                  i === idx ? { ...r, details: val } : r
                                ),
                              },
                            }));
                          }}
                        />
                      </div>
                      <div className="field-group">
                        <label htmlFor={`b-amt-${row.id}`} className="field-label-xs">মোট (টাকা)</label>
                        <input
                          id={`b-amt-${row.id}`}
                          type="text"
                          inputMode="numeric"
                          value={row.amount}
                          placeholder="০"
                          onChange={(e) => {
                            const val = e.target.value;
                            onChange((prev) => ({
                              ...prev,
                              part4: {
                                ...prev.part4,
                                budgetRows: prev.part4.budgetRows.map((r, i) =>
                                  i === idx ? { ...r, amount: val } : r
                                ),
                              },
                            }));
                          }}
                        />
                      </div>
                      <div className="field-group">
                        <label htmlFor={`b-src-${row.id}`} className="field-label-xs">অর্থের উৎস</label>
                        <input
                          id={`b-src-${row.id}`}
                          type="text"
                          value={row.source}
                          placeholder="ঋণ ও অনুদান / নিজস্ব"
                          onChange={(e) => {
                            const val = e.target.value;
                            onChange((prev) => ({
                              ...prev,
                              part4: {
                                ...prev.part4,
                                budgetRows: prev.part4.budgetRows.map((r, i) =>
                                  i === idx ? { ...r, source: val } : r
                                ),
                              },
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP: PART 5 (OTHER & SIGNATURE) ==================== */}
        {activeStep === 'part5' && (
          <div className="form-section-stack">
            <fieldset className="form-fieldset">
              <legend>০১. শারীরিক প্রতিবন্ধকতা আছে কিনা?</legend>
              <div className="radio-row">
                {(['না', 'হ্যাঁ'] as const).map((opt) => (
                  <div key={opt} className="radio-option">
                    <input
                      type="radio"
                      id={`dis-${opt}`}
                      name="has_disability"
                      value={opt}
                      checked={data.part5.hasDisability === opt}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part5: { ...prev.part5, hasDisability: opt },
                        }))
                      }
                    />
                    <label htmlFor={`dis-${opt}`}>{opt}</label>
                  </div>
                ))}
              </div>
              {data.part5.hasDisability === 'হ্যাঁ' && (
                <div className="field-group sub-field">
                  <label htmlFor="p5-dis-type" className="field-label">প্রতিবন্ধকতার ধরন</label>
                  <input
                    id="p5-dis-type"
                    type="text"
                    value={data.part5.disabilityType}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        part5: { ...prev.part5, disabilityType: e.target.value },
                      }))
                    }
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="form-fieldset">
              <legend>০২. ক্ষুদ্র নৃগোষ্ঠীভুক্ত কিনা?</legend>
              <div className="radio-row">
                {(['না', 'হ্যাঁ'] as const).map((opt) => (
                  <div key={opt} className="radio-option">
                    <input
                      type="radio"
                      id={`eth-${opt}`}
                      name="is_ethnic"
                      value={opt}
                      checked={data.part5.isEthnicMinority === opt}
                      onChange={() =>
                        onChange((prev) => ({
                          ...prev,
                          part5: { ...prev.part5, isEthnicMinority: opt },
                        }))
                      }
                    />
                    <label htmlFor={`eth-${opt}`}>{opt}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="field-group">
              <label htmlFor="p5-other" className="field-label">০৩. অন্যান্য তথ্য (ঐচ্ছিক)</label>
              <textarea
                id="p5-other"
                rows={3}
                value={data.part5.otherInfo}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    part5: { ...prev.part5, otherInfo: e.target.value },
                  }))
                }
              />
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label htmlFor="p5-sig-date" className="field-label">আবেদনের তারিখ</label>
                <input
                  id="p5-sig-date"
                  type="date"
                  value={data.part5.signatureDate}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      part5: { ...prev.part5, signatureDate: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="field-group">
                <label htmlFor="p5-sig-upload" className="field-label">
                  আবেদনকারীর স্বাক্ষর আপলোড (ঐচ্ছিক)
                </label>
                <p id="p5-sig-hint" className="field-hint">
                  ফাঁকা রাখলে প্রিন্ট করার পর কলম দিয়ে স্বাক্ষর করতে পারবেন।
                </p>
                <div className="inline-actions">
                  <input
                    id="p5-sig-upload"
                    type="file"
                    accept="image/*"
                    aria-describedby="p5-sig-hint"
                    className="file-input"
                    onChange={(e) =>
                      handleImageUpload(e.target.files?.[0], (url) =>
                        onChange((prev) => ({
                          ...prev,
                          part5: { ...prev.part5, signatureDataUrl: url },
                        }))
                      )
                    }
                  />
                  {data.part5.signatureDataUrl && (
                    <button
                      type="button"
                      className="btn-danger-ghost"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          part5: { ...prev.part5, signatureDataUrl: '' },
                        }))
                      }
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      মুছুন
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="info-banner">
              <strong>দাখিলযোগ্য সংযুক্তি চেকলিস্ট (প্রিন্ট কপির সাথে জমা দিন):</strong>
              <ul className="checklist-ul">
                <li>জাতীয় পরিচয়পত্র/জন্মনিবন্ধন সনদের ফটোকপি</li>
                <li>২ কপি পাসপোর্ট সাইজ রঙিন ছবি</li>
                <li>সর্বশেষ শিক্ষাগত যোগ্যতার সনদের কপি (যদি থাকে)</li>
                <li>দক্ষতা উন্নয়ন/উদ্যোক্তা উন্নয়ন প্রশিক্ষণ সনদ (যদি থাকে)</li>
                <li>ওয়ার্ড কমিশনার/কাউন্সিলর/ইউপি চেয়ারম্যান কর্তৃক প্রদত্ত নাগরিক সনদ</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step Footer Navigation */}
        <div className="step-footer-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={currentIdx === 0}
            onClick={() => currentIdx > 0 && onStepChange(FORM_STEPS[currentIdx - 1].id)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
            পূর্ববর্তী ধাপ
          </button>

          <span className="step-counter">
            ধাপ {toBengaliDigits(currentIdx + 1)} / {toBengaliDigits(FORM_STEPS.length)}
          </span>

          {currentIdx < FORM_STEPS.length - 1 ? (
            <button type="submit" className="btn-primary">
              পরবর্তী ধাপ
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.print()}
            >
              প্রিন্ট / PDF সেভ করুন
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
