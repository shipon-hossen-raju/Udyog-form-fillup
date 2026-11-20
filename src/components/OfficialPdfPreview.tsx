'use client';

import { forwardRef } from 'react';
import { UdyogFormData } from '../types/form';
import {
  DEFAULT_BUDGET_ROWS,
  EMPTY_FORM_DATA,
  calculateAgeAsOfDeadline,
  formatIsoDateBn,
  formatTakaBn,
  parseNumericAmount,
  toBengaliDigits,
} from '../data/defaults';
import { UdyogLogo } from './UdyogLogo';

interface OfficialPdfPreviewProps {
  data: UdyogFormData;
  zoom?: number;
}

function splitChars(value: unknown, count: number): string[] {
  const safeStr = typeof value === 'string' ? value : value != null ? String(value) : '';
  const bn = toBengaliDigits(safeStr.replace(/\s+/g, ''));
  const chars = Array.from(bn);
  return Array.from({ length: count }, (_, idx) => chars[idx] ?? '');
}

function PageFooter({ pageNumber }: { pageNumber: number }) {
  return (
    <div className="sheet-footer">
      <UdyogLogo size={16} decorative />
      <span>
        উদ্যোগ (<span lang="en">UDYOG</span>): উপজেলাভিত্তিক তরুণ উদ্যোক্তা অনুসন্ধান, চিহ্নিতকরণ ও অর্থায়ন কর্মসূচি | পৃষ্ঠা {pageNumber}
      </span>
    </div>
  );
}

export const OfficialPdfPreview = forwardRef<HTMLDivElement, OfficialPdfPreviewProps>(
  function OfficialPdfPreview({ data: rawData, zoom = 1 }, ref) {
    const data: UdyogFormData = {
      ...EMPTY_FORM_DATA,
      ...rawData,
      office: { ...EMPTY_FORM_DATA.office, ...rawData?.office },
      part1: {
        ...EMPTY_FORM_DATA.part1,
        ...rawData?.part1,
        presentAddress: { ...EMPTY_FORM_DATA.part1.presentAddress, ...rawData?.part1?.presentAddress },
        permanentAddress: { ...EMPTY_FORM_DATA.part1.permanentAddress, ...rawData?.part1?.permanentAddress },
      },
      part2: {
        ...EMPTY_FORM_DATA.part2,
        ...rawData?.part2,
        projectedSales: { ...EMPTY_FORM_DATA.part2.projectedSales, ...rawData?.part2?.projectedSales },
        projectedProfit: { ...EMPTY_FORM_DATA.part2.projectedProfit, ...rawData?.part2?.projectedProfit },
      },
      part3: {
        ...EMPTY_FORM_DATA.part3,
        ...rawData?.part3,
        sales: { ...EMPTY_FORM_DATA.part3.sales, ...rawData?.part3?.sales },
        profit: { ...EMPTY_FORM_DATA.part3.profit, ...rawData?.part3?.profit },
      },
      part4: {
        ...EMPTY_FORM_DATA.part4,
        ...rawData?.part4,
        budgetRows:
          Array.isArray(rawData?.part4?.budgetRows) && rawData.part4.budgetRows.length > 0
            ? rawData.part4.budgetRows
            : DEFAULT_BUDGET_ROWS,
      },
      part5: { ...EMPTY_FORM_DATA.part5, ...rawData?.part5 },
    };

    const trackingChars = splitChars(data.office.trackingNumber, 8);
    const dayChars = splitChars(data.office.receiveDay, 2);
    const monthChars = splitChars(data.office.receiveMonth, 2);
    const yearChars = splitChars(data.office.receiveYear || '২০২৬', 4);

    const ageCalc = calculateAgeAsOfDeadline(data.part1.dob);
    const dobAndAgeText = (() => {
      const dobBn = formatIsoDateBn(data.part1.dob);
      const ageText = (data.part1.ageOverride || '').trim() || (ageCalc ? ageCalc.formattedBn : '');
      if (dobBn && ageText) return `জন্ম তারিখ: ${dobBn} | বয়স: ${ageText}`;
      if (dobBn) return `জন্ম তারিখ: ${dobBn}`;
      return ageText;
    })();

    const existingLoanText = (() => {
      if (!data.part1.hasExistingLoan) return '';
      if (data.part1.hasExistingLoan === 'না') return 'না';
      return data.part1.existingLoanDetails
        ? `হ্যাঁ — ${data.part1.existingLoanDetails}`
        : 'হ্যাঁ';
    })();

    const permAddr = data.part1.sameAsPresentAddress
      ? data.part1.presentAddress
      : data.part1.permanentAddress;

    const part2TypeText = [data.part2.businessType, data.part2.businessTypeDetails]
      .filter(Boolean)
      .join(' — ');

    const part3TypeText = [data.part3.businessType, data.part3.businessTypeDetails]
      .filter(Boolean)
      .join(' — ');

    const tradeLicenseText = (() => {
      if (!data.part3.hasTradeLicense) return '';
      if (data.part3.hasTradeLicense === 'না') return 'না';
      return data.part3.tradeLicenseDetails
        ? `হ্যাঁ — ${data.part3.tradeLicenseDetails}`
        : 'হ্যাঁ';
    })();

    const disabilityText = (() => {
      if (!data.part5.hasDisability) return '';
      if (data.part5.hasDisability === 'না') return 'না';
      return data.part5.disabilityType
        ? `হ্যাঁ (${data.part5.disabilityType})`
        : 'হ্যাঁ';
    })();

    const totalBudgetSum = data.part4.budgetRows.reduce(
      (sum, row) => sum + parseNumericAmount(row.amount),
      0
    );

    const formattedSignatureDate = data.part5.signatureDate
      ? formatIsoDateBn(data.part5.signatureDate)
      : '';

    return (
      <div
        ref={ref}
        className="pdf-preview-stack"
        style={{ '--preview-zoom': zoom } as React.CSSProperties}
      >
        {/* ==================== PAGE 1 ==================== */}
        <article className="a4-sheet" aria-label="আবেদন ফরম পৃষ্ঠা ১">
          <div className="sheet-body">
            {/* Official Header */}
            <div className="official-header">
              <div className="official-logo-wrap">
                <UdyogLogo size={54} />
              </div>
              <div className="official-title-block">
                <div className="official-main-title">
                  উদ্যোগ (<span lang="en">UDYOG</span>)
                </div>
                <div className="official-subtitle">
                  উপজেলাভিত্তিক তরুণ উদ্যোক্তা অনুসন্ধান, চিহ্নিতকরণ ও অর্থায়ন কর্মসূচি
                </div>
                <div className="official-dept">
                  এসএমই এন্ড স্পেশাল প্রোগ্রামস্ ডিপার্টমেন্ট, বাংলাদেশ ব্যাংক।
                </div>
              </div>
            </div>
            <div className="official-divider" />

            <div className="form-center-heading">
              <div className="form-title-lg">আবেদন ফরম</div>
              <div className="form-deadline">(আবেদন জমাদানের সর্বশেষ তারিখ ১৫ অক্টোবর ২০২৬)</div>
            </div>

            {/* Office Use Table */}
            <table className="bb-table office-table">
              <caption className="visually-hidden">ব্যাংক শাখায় ব্যবহারের জন্য তথ্য ও ছবি</caption>
              <colgroup>
                <col style={{ width: '32%' }} />
                <col style={{ width: '44%' }} />
                <col style={{ width: '24%' }} />
              </colgroup>
              <thead>
                <tr className="bb-green-row">
                  <th scope="col" colSpan={2} className="center-cell">
                    ব্যাংক শাখায় ব্যবহারের জন্য
                  </th>
                  <th scope="col" className="center-cell">
                    পাসপোর্ট সাইজ ছবি (২ কপি)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-h-28">
                  <th scope="row">ট্র্যাকিং নম্বর:</th>
                  <td className="box-strip-cell">
                    <div className="char-boxes-8">
                      {trackingChars.map((ch, idx) => (
                        <span key={idx} className="char-box">{ch}</span>
                      ))}
                    </div>
                  </td>
                  <td rowSpan={5} className="photo-cell">
                    {data.office.photoDataUrl ? (
                      <img
                        src={data.office.photoDataUrl}
                        alt="আবেদনকারীর পাসপোর্ট সাইজ ছবি"
                        className="passport-photo-img"
                      />
                    ) : (
                      <div className="photo-placeholder-text">
                        পাসপোর্ট সাইজ ছবি<br />(২ কপি সংযুক্ত করুন)
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="row-h-34">
                  <th scope="row">আবেদন গ্রহণকারী ব্যাংক ও শাখা:</th>
                  <td className="val-cell">{data.office.bankAndBranch}</td>
                </tr>
                <tr className="row-h-28">
                  <th scope="row">গ্রহণের তারিখ:</th>
                  <td className="box-strip-cell">
                    <div className="char-boxes-date">
                      <span className="char-box">{dayChars[0]}</span>
                      <span className="char-box">{dayChars[1]}</span>
                      <span className="char-box">{monthChars[0]}</span>
                      <span className="char-box">{monthChars[1]}</span>
                      <span className="char-box">{yearChars[0]}</span>
                      <span className="char-box">{yearChars[1]}</span>
                      <span className="char-box">{yearChars[2]}</span>
                      <span className="char-box">{yearChars[3]}</span>
                    </div>
                  </td>
                </tr>
                <tr className="row-h-28">
                  <th scope="row">জেলা:</th>
                  <td className="val-cell">{data.office.district}</td>
                </tr>
                <tr className="row-h-28">
                  <th scope="row">উপজেলা:</th>
                  <td className="val-cell">{data.office.upazila}</td>
                </tr>
                <tr className="row-h-32">
                  <th scope="row">শাখা ব্যবস্থাপকের নাম:</th>
                  <td colSpan={2} className="val-cell">{data.office.branchManagerName}</td>
                </tr>
                <tr className="row-h-56">
                  <th scope="row">স্বাক্ষর ও সীল:</th>
                  <td colSpan={2} className="val-cell" />
                </tr>
              </tbody>
            </table>

            {/* Part 1 Header */}
            <div className="section-bar">পার্ট-১: ব্যক্তিগত তথ্যাবলি</div>

            <table className="bb-table part1-table">
              <caption className="visually-hidden">পার্ট-১ ব্যক্তিগত তথ্যাবলি (ক্রম ০১ থেকে ১০)</caption>
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '27%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '52%' }} />
              </colgroup>
              <tbody>
                <tr className="row-h-34">
                  <td rowSpan={2} className="sl-col">০১</td>
                  <th scope="row" rowSpan={2}>আবেদনকারীর নাম</th>
                  <th scope="row">বাংলায়</th>
                  <td className="val-cell">{data.part1.nameBn}</td>
                </tr>
                <tr className="row-h-40">
                  <th scope="row" lang="en">
                    In English<br />(Block Letters)
                  </th>
                  <td className="val-cell uppercase-en" lang="en">{data.part1.nameEn}</td>
                </tr>
                <tr className="zebra-row row-h-32">
                  <td className="sl-col">০২</td>
                  <th scope="row">পিতার নাম</th>
                  <td colSpan={2} className="val-cell">{data.part1.fatherName}</td>
                </tr>
                <tr className="row-h-32">
                  <td className="sl-col">০৩</td>
                  <th scope="row">মাতার নাম</th>
                  <td colSpan={2} className="val-cell">{data.part1.motherName}</td>
                </tr>
                <tr className="zebra-row row-h-32">
                  <td className="sl-col">০৪</td>
                  <th scope="row">জাতীয় পরিচয়পত্র নম্বর</th>
                  <td colSpan={2} className="val-cell">{data.part1.nid}</td>
                </tr>
                <tr className="row-h-42">
                  <td className="sl-col">০৫</td>
                  <th scope="row">জন্ম তারিখ ও আবেদনের শেষ তারিখে বয়স</th>
                  <td colSpan={2} className="val-cell">{dobAndAgeText}</td>
                </tr>
                <tr className="zebra-row row-h-32">
                  <td className="sl-col">০৬</td>
                  <th scope="row">বৈবাহিক অবস্থা</th>
                  <td colSpan={2} className="val-cell">{data.part1.maritalStatus}</td>
                </tr>
                <tr className="row-h-38">
                  <td rowSpan={2} className="sl-col">০৭</td>
                  <th scope="row">
                    (বিবাহিত হলে)<br />স্বামী/স্ত্রীর নাম:
                  </th>
                  <td colSpan={2} className="val-cell">
                    {data.part1.maritalStatus === 'বিবাহিত' ? data.part1.spouseName : ''}
                  </td>
                </tr>
                <tr className="row-h-32">
                  <th scope="row">জাতীয় পরিচয়পত্র নম্বর</th>
                  <td colSpan={2} className="val-cell">
                    {data.part1.maritalStatus === 'বিবাহিত' ? data.part1.spouseNid : ''}
                  </td>
                </tr>
                <tr className="zebra-row row-h-46">
                  <td className="sl-col">০৮</td>
                  <th scope="row">
                    শিক্ষাগত যোগ্যতা (সর্বশেষ পাসকৃত পরীক্ষা, বোর্ড/বিশ্ববিদ্যালয় ও সাল)
                  </th>
                  <td colSpan={2} className="val-cell">{data.part1.education}</td>
                </tr>
                <tr className="row-h-32">
                  <td className="sl-col">০৯</td>
                  <th scope="row">ফোন নম্বর / বিকল্প ফোন নম্বর</th>
                  <td colSpan={2} className="val-cell">
                    {[data.part1.phone, data.part1.altPhone].filter(Boolean).join(' / ')}
                  </td>
                </tr>
                <tr className="zebra-row row-h-32">
                  <td className="sl-col">১০</td>
                  <th scope="row">ই-মেইল আইডি</th>
                  <td colSpan={2} className="val-cell" lang="en">{data.part1.email}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <PageFooter pageNumber={1} />
        </article>

        {/* ==================== PAGE 2 ==================== */}
        <article className="a4-sheet" aria-label="আবেদন ফরম পৃষ্ঠা ২">
          <div className="sheet-body">
            <table className="bb-table">
              <caption className="visually-hidden">পার্ট-১ ব্যক্তিগত তথ্যাবলি (ক্রম ১১ থেকে ১৪)</caption>
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '66%' }} />
              </colgroup>
              <tbody>
                <tr className="p2-row-11">
                  <td className="sl-col">১১</td>
                  <th scope="row">
                    দক্ষতা উন্নয়নমূলক কোনরূপ প্রশিক্ষণ থাকলে তার বিবরণ (প্রতিষ্ঠান, কোর্সের নাম, মেয়াদ ও সাল; সনদের কপি সংযুক্ত করুন)
                  </th>
                  <td className="val-cell multiline-val">{data.part1.training}</td>
                </tr>
                <tr className="zebra-row p2-row-12">
                  <td className="sl-col">১২</td>
                  <th scope="row">
                    ব্যবসা/চাকরির অভিজ্ঞতা থাকলে তার বিবরণ
                  </th>
                  <td className="val-cell multiline-val">{data.part1.experience}</td>
                </tr>
                <tr className="row-h-28">
                  <td rowSpan={2} className="sl-col">১৩</td>
                  <th scope="row" rowSpan={2}>
                    ব্যাংক হিসাব থাকলে ব্যাংক হিসাবের তথ্য
                  </th>
                  <td className="bank-subhead">(ব্যাংকের নাম ও শাখা, হিসাবের ধরন, হিসাব নম্বর)</td>
                </tr>
                <tr className="p2-row-13-body">
                  <td className="val-cell multiline-val">{data.part1.bankAccountInfo}</td>
                </tr>
                <tr className="zebra-row p2-row-14">
                  <td className="sl-col">১৪</td>
                  <th scope="row">
                    কোনো ব্যাংক/আর্থিক প্রতিষ্ঠানে বিদ্যমান ঋণ আছে কিনা (হ্যাঁ/না); থাকলে বিবরণ
                  </th>
                  <td className="val-cell multiline-val">{existingLoanText}</td>
                </tr>
              </tbody>
            </table>

            <div className="address-block-title">১৫. বর্তমান ঠিকানা (জাতীয় পরিচয়পত্র মোতাবেক)</div>
            <table className="bb-table address-table">
              <caption className="visually-hidden">বর্তমান ঠিকানা</caption>
              <colgroup>
                <col style={{ width: '17%' }} />
                <col style={{ width: '19%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">বাড়ি/মহল্লার নং<br />ও নাম</th>
                  <th scope="col">রোড নং/ এলাকা/<br />গ্রামের নাম</th>
                  <th scope="col">ডাকঘর ও<br />পোস্ট কোড</th>
                  <th scope="col">থানা/উপজেলা</th>
                  <th scope="col">জেলা</th>
                  <th scope="col">বিভাগ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="addr-val-cell">{data.part1.presentAddress.house}</td>
                  <td className="addr-val-cell">{data.part1.presentAddress.roadVillage}</td>
                  <td className="addr-val-cell">{data.part1.presentAddress.postOfficeCode}</td>
                  <td className="addr-val-cell">{data.part1.presentAddress.upazila}</td>
                  <td className="addr-val-cell">{data.part1.presentAddress.district}</td>
                  <td className="addr-val-cell">{data.part1.presentAddress.division}</td>
                </tr>
              </tbody>
            </table>

            <div className="address-block-title">১৬. স্থায়ী ঠিকানা</div>
            <table className="bb-table address-table">
              <caption className="visually-hidden">স্থায়ী ঠিকানা</caption>
              <colgroup>
                <col style={{ width: '17%' }} />
                <col style={{ width: '19%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">বাড়ি/মহল্লার নং<br />ও নাম</th>
                  <th scope="col">রোড নং/ এলাকা/<br />গ্রামের নাম</th>
                  <th scope="col">ডাকঘর ও<br />পোস্ট কোড</th>
                  <th scope="col">থানা/উপজেলা</th>
                  <th scope="col">জেলা</th>
                  <th scope="col">বিভাগ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="addr-val-cell">{permAddr.house}</td>
                  <td className="addr-val-cell">{permAddr.roadVillage}</td>
                  <td className="addr-val-cell">{permAddr.postOfficeCode}</td>
                  <td className="addr-val-cell">{permAddr.upazila}</td>
                  <td className="addr-val-cell">{permAddr.district}</td>
                  <td className="addr-val-cell">{permAddr.division}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <PageFooter pageNumber={2} />
        </article>

        {/* ==================== PAGE 3 ==================== */}
        <article className="a4-sheet" aria-label="আবেদন ফরম পৃষ্ঠা ৩">
          <div className="sheet-body">
            <div className="section-bar section-bar-top">
              পার্ট-২: ব্যবসায়িক পরিকল্পনা সংক্রান্ত তথ্যাদি (ইতোপূর্বে ব্যবসা না থেকে থাকলে)
            </div>

            <table className="bb-table page3-table">
              <caption className="visually-hidden">পার্ট-২ নতুন ব্যবসায়িক পরিকল্পনা (ক্রম ০১ থেকে ১০)</caption>
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <tbody>
                <tr className="p3-row-01">
                  <td className="sl-col">০১</td>
                  <th scope="row">
                    ব্যবসায়িক ধারণা/উদ্যোগের সংক্ষিপ্ত বিবরণ<br />(২০০ শব্দের মধ্যে)
                  </th>
                  <td colSpan={3} className="val-cell multiline-val">
                    {data.part2.ideaSummary}
                  </td>
                </tr>
                <tr className="zebra-row p3-row-02">
                  <td className="sl-col">০২</td>
                  <th scope="row">সম্ভাব্য ক্রেতা</th>
                  <td colSpan={3} className="val-cell multiline-val">{data.part2.targetCustomers}</td>
                </tr>
                <tr className="p3-row-03">
                  <td className="sl-col">০৩</td>
                  <th scope="row">
                    কত সময়ের মধ্যে ব্যবসায় শুরু করার পরিকল্পনা রয়েছে
                  </th>
                  <td colSpan={3} className="val-cell">{data.part2.startTimeline}</td>
                </tr>
                <tr className="zebra-row p3-row-04">
                  <td className="sl-col">০৪</td>
                  <th scope="row">
                    ব্যবসার ধরন<br />(উৎপাদন / সেবা / ব্যবসা)<br />ও বিবরণ
                  </th>
                  <td colSpan={3} className="val-cell multiline-val">{part2TypeText}</td>
                </tr>
                <tr className="p3-row-05">
                  <td className="sl-col">০৫</td>
                  <th scope="row">
                    ব্যবসার সম্ভাব্য অবস্থান (গ্রাম/মহল্লা, ইউনিয়ন, উপজেলা)
                  </th>
                  <td colSpan={3} className="val-cell">{data.part2.probableLocation}</td>
                </tr>
                <tr className="zebra-row p3-row-06">
                  <td className="sl-col">০৬</td>
                  <th scope="row">
                    পণ্যের ধরন<br />(আমদানির বিকল্প বা রপ্তানিযোগ্য পণ্য কিনা)
                  </th>
                  <td colSpan={3} className="val-cell multiline-val">{data.part2.productNature}</td>
                </tr>
                <tr className="p3-row-07">
                  <td className="sl-col">০৭</td>
                  <th scope="row">
                    কাঁচামালের উৎস<br />(প্রযোজ্য ক্ষেত্রে)
                  </th>
                  <td colSpan={3} className="val-cell multiline-val">{data.part2.rawMaterialSource}</td>
                </tr>
                <tr className="zebra-row p3-row-08">
                  <td className="sl-col">০৮</td>
                  <th scope="row">
                    পণ্যের বাজার<br />(স্থানীয়/আন্তর্জাতিক)
                  </th>
                  <td colSpan={3} className="val-cell">{data.part2.marketScope}</td>
                </tr>
                <tr className="row-h-30">
                  <td rowSpan={2} className="sl-col">০৯</td>
                  <th scope="row" rowSpan={2}>
                    সম্ভাব্য বিক্রয়ের পরিমাণ<br />(টাকায়)
                  </th>
                  <th scope="col" className="period-head">মাসিক</th>
                  <th scope="col" className="period-head">ত্রৈমাসিক</th>
                  <th scope="col" className="period-head">বার্ষিক</th>
                </tr>
                <tr className="row-h-40">
                  <td className="period-val">{data.part2.projectedSales.monthly}</td>
                  <td className="period-val">{data.part2.projectedSales.quarterly}</td>
                  <td className="period-val">{data.part2.projectedSales.yearly}</td>
                </tr>
                <tr className="zebra-row row-h-30">
                  <td rowSpan={2} className="sl-col">১০</td>
                  <th scope="row" rowSpan={2}>
                    সম্ভাব্য লাভ/মুনাফা<br />(টাকায়)
                  </th>
                  <th scope="col" className="period-head">মাসিক</th>
                  <th scope="col" className="period-head">ত্রৈমাসিক</th>
                  <th scope="col" className="period-head">বার্ষিক</th>
                </tr>
                <tr className="zebra-row row-h-40">
                  <td className="period-val">{data.part2.projectedProfit.monthly}</td>
                  <td className="period-val">{data.part2.projectedProfit.quarterly}</td>
                  <td className="period-val">{data.part2.projectedProfit.yearly}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <PageFooter pageNumber={3} />
        </article>

        {/* ==================== PAGE 4 ==================== */}
        <article className="a4-sheet" aria-label="আবেদন ফরম পৃষ্ঠা ৪">
          <div className="sheet-body">
            <table className="bb-table">
              <caption className="visually-hidden">পার্ট-২ নতুন ব্যবসায়িক পরিকল্পনা (ক্রম ১১ থেকে ১৩)</caption>
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '66%' }} />
              </colgroup>
              <tbody>
                <tr className="p4-row-11">
                  <td className="sl-col">১১</td>
                  <th scope="row">
                    ব্যবসা পরিচালনার ক্ষেত্রে সম্ভাব্য সমস্যাসমূহ, ঝুঁকিসমূহ এবং ঝুঁকিসমূহ মোকাবেলায় পরিকল্পনা
                  </th>
                  <td className="val-cell multiline-val">
                    {data.part2.risksAndMitigation}
                  </td>
                </tr>
                <tr className="zebra-row p4-row-12">
                  <td className="sl-col">১২</td>
                  <th scope="row">
                    প্রথম বছরে সম্ভাব্য কর্মসংস্থান<br />
                    (মোট {data.part2.firstYearEmploymentTotal || '.........'} জন,<br />
                    তন্মধ্যে নারী {data.part2.firstYearEmploymentFemale || '.........'} জন)
                  </th>
                  <td className="val-cell">
                    {(data.part2.firstYearEmploymentTotal || data.part2.firstYearEmploymentFemale) && (
                      <span>
                        মোট: {data.part2.firstYearEmploymentTotal || '০'} জন (তন্মধ্যে নারী: {data.part2.firstYearEmploymentFemale || '০'} জন)
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="p4-row-13">
                  <td className="sl-col">১৩</td>
                  <th scope="row">
                    যে পণ্য/সেবা বিক্রয় করা হবে, বর্তমানে বাজারে তার অবস্থান কেমন<br />
                    (কমপক্ষে ৩টি সম্ভাব্য প্রতিযোগী প্রতিষ্ঠানের তথ্যসহ)
                  </th>
                  <td className="val-cell multiline-val">
                    {data.part2.marketPositionAndCompetitors}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="section-bar section-bar-spaced">
              পার্ট-৩: ব্যবসা সম্পর্কিত তথ্যাবলি (বর্তমানে কোন ব্যবসা পরিচালনা করে থাকলে)
            </div>

            <table className="bb-table">
              <caption className="visually-hidden">পার্ট-৩ বিদ্যমান ব্যবসা সম্পর্কিত তথ্যাবলি (ক্রম ০১ থেকে ০৮)</caption>
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <tbody>
                <tr className="row-h-36">
                  <td className="sl-col">০১</td>
                  <th scope="row">ব্যবসা প্রতিষ্ঠানের নাম</th>
                  <td colSpan={3} className="val-cell">{data.part3.businessName}</td>
                </tr>
                <tr className="zebra-row p4-p3-row-02">
                  <td className="sl-col">০২</td>
                  <th scope="row">
                    ব্যবসার ধরন<br />(উৎপাদন / সেবা / ব্যবসা)<br />ও বিবরণ
                  </th>
                  <td colSpan={3} className="val-cell multiline-val">{part3TypeText}</td>
                </tr>
                <tr className="row-h-36">
                  <td className="sl-col">০৩</td>
                  <th scope="row">ব্যবসা শুরুর তারিখ</th>
                  <td colSpan={3} className="val-cell">{formatIsoDateBn(data.part3.startDate)}</td>
                </tr>
                <tr className="zebra-row p4-p3-row-04">
                  <td className="sl-col">০৪</td>
                  <th scope="row">
                    ট্রেড লাইসেন্স আছে কিনা (হ্যাঁ/না) এবং থাকলে ইস্যুর তারিখ ও নম্বর
                  </th>
                  <td colSpan={3} className="val-cell">{tradeLicenseText}</td>
                </tr>
                <tr className="p4-p3-row-05">
                  <td className="sl-col">০৫</td>
                  <th scope="row">
                    পণ্য/সেবার গড় বিক্রয়মূল্য (একক প্রতি)
                  </th>
                  <td colSpan={3} className="val-cell">{data.part3.avgSellingPrice}</td>
                </tr>
                <tr className="zebra-row row-h-28">
                  <td rowSpan={2} className="sl-col">০৬</td>
                  <th scope="row" rowSpan={2}>
                    বিক্রয়ের পরিমাণ<br />(টাকায়)
                  </th>
                  <th scope="col" className="period-head">মাসিক</th>
                  <th scope="col" className="period-head">ত্রৈমাসিক</th>
                  <th scope="col" className="period-head">বার্ষিক</th>
                </tr>
                <tr className="zebra-row row-h-36">
                  <td className="period-val">{data.part3.sales.monthly}</td>
                  <td className="period-val">{data.part3.sales.quarterly}</td>
                  <td className="period-val">{data.part3.sales.yearly}</td>
                </tr>
                <tr className="row-h-28">
                  <td rowSpan={2} className="sl-col">০৭</td>
                  <th scope="row" rowSpan={2}>
                    লাভ/মুনাফার পরিমাণ<br />(টাকায়)
                  </th>
                  <th scope="col" className="period-head">মাসিক</th>
                  <th scope="col" className="period-head">ত্রৈমাসিক</th>
                  <th scope="col" className="period-head">বার্ষিক</th>
                </tr>
                <tr className="row-h-36">
                  <td className="period-val">{data.part3.profit.monthly}</td>
                  <td className="period-val">{data.part3.profit.quarterly}</td>
                  <td className="period-val">{data.part3.profit.yearly}</td>
                </tr>
                <tr className="zebra-row p4-p3-row-08">
                  <td className="sl-col">০৮</td>
                  <th scope="row">
                    কাঁচামাল ও ব্যবসা পরিচালনা বাবদ বিভিন্ন খাতে মাসিক সম্ভাব্য খরচ (টাকা)
                  </th>
                  <td colSpan={3} className="val-cell multiline-val">{data.part3.monthlyExpenses}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <PageFooter pageNumber={4} />
        </article>

        {/* ==================== PAGE 5 ==================== */}
        <article className="a4-sheet" aria-label="আবেদন ফরম পৃষ্ঠা ৫">
          <div className="sheet-body">
            <table className="bb-table">
              <caption className="visually-hidden">পার্ট-৩ বিদ্যমান ব্যবসা সম্পর্কিত তথ্যাবলি (ক্রম ০৯ থেকে ১৬)</caption>
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '66%' }} />
              </colgroup>
              <tbody>
                <tr className="p5-row-09">
                  <td className="sl-col">০৯</td>
                  <th scope="row">
                    উদ্যোক্তা কীভাবে আলোচ্য ব্যবসায়ের সঙ্গে জড়িত হয়েছেন
                  </th>
                  <td className="val-cell multiline-val">{data.part3.howInvolved}</td>
                </tr>
                <tr className="zebra-row p5-row-10">
                  <td className="sl-col">১০</td>
                  <th scope="row">
                    ব্যবসার সঙ্গে সম্পর্কিত মোট বিনিয়োগের পরিমাণ (টাকা)
                  </th>
                  <td className="val-cell">{data.part3.totalInvestment}</td>
                </tr>
                <tr className="p5-row-11">
                  <td className="sl-col">১১</td>
                  <th scope="row">
                    কাঁচামালের উৎস<br />(প্রযোজ্য ক্ষেত্রে)
                  </th>
                  <td className="val-cell multiline-val">{data.part3.rawMaterialSource}</td>
                </tr>
                <tr className="zebra-row p5-row-12">
                  <td className="sl-col">১২</td>
                  <th scope="row">পণ্য/সেবা বিপণন এলাকা</th>
                  <td className="val-cell">{data.part3.marketingArea}</td>
                </tr>
                <tr className="p5-row-13">
                  <td className="sl-col">১৩</td>
                  <th scope="row">
                    যে পণ্য/সেবা বিক্রয় করা হয়, বর্তমানে বাজারে তার অবস্থান<br />
                    (কমপক্ষে ৩টি সম্ভাব্য প্রতিযোগী প্রতিষ্ঠানের তথ্যসহ)
                  </th>
                  <td className="val-cell multiline-val">
                    {data.part3.marketPositionAndCompetitors}
                  </td>
                </tr>
                <tr className="zebra-row p5-row-14">
                  <td className="sl-col">১৪</td>
                  <th scope="row">
                    বিদ্যমান ব্যবসায় পরিচালনায় সমস্যাসমূহ, ঝুঁকিসমূহ এবং ঝুঁকিসমূহ মোকাবেলায় পরিকল্পনা
                  </th>
                  <td className="val-cell multiline-val">
                    {data.part3.risksAndMitigation}
                  </td>
                </tr>
                <tr className="p5-row-15">
                  <td className="sl-col">১৫</td>
                  <th scope="row">
                    কর্মীর সংখ্যা<br />
                    (মোট {data.part3.employeeTotal || '.........'} জন,<br />
                    তন্মধ্যে নারী {data.part3.employeeFemale || '.........'} জন)
                  </th>
                  <td className="val-cell">
                    {(data.part3.employeeTotal || data.part3.employeeFemale) && (
                      <span>
                        মোট: {data.part3.employeeTotal || '০'} জন (তন্মধ্যে নারী: {data.part3.employeeFemale || '০'} জন)
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="zebra-row p5-row-16">
                  <td className="sl-col">১৬</td>
                  <th scope="row">
                    চলমান ব্যবসায় সম্প্রসারণসহ কর্মী বাড়ানোর কোনো পরিকল্পনা রয়েছে কিনা; থাকলে বিবরণ
                  </th>
                  <td className="val-cell multiline-val">{data.part3.expansionPlan}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <PageFooter pageNumber={5} />
        </article>

        {/* ==================== PAGE 6 ==================== */}
        <article className="a4-sheet" aria-label="আবেদন ফরম পৃষ্ঠা ৬">
          <div className="sheet-body">
            <div className="section-bar section-bar-top">পার্ট-৪: অর্থায়ন পরিকল্পনা ও ব্যয় বিভাজন</div>

            <div className="sub-section-heading">ক. অর্থায়ন প্যাকেজ</div>
            <table className="bb-table">
              <caption className="visually-hidden">অর্থায়ন প্যাকেজ</caption>
              <colgroup>
                <col style={{ width: '52%' }} />
                <col style={{ width: '48%' }} />
              </colgroup>
              <thead>
                <tr className="row-h-34">
                  <th scope="col" className="center-cell">বিবরণ</th>
                  <th scope="col" className="center-cell">পরিমাণ (টাকা)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-h-34">
                  <th scope="row" className="left-th">০১. প্রয়োজনীয় মোট মূলধনের পরিমাণ</th>
                  <td className="val-cell right-num">{data.part4.totalCapitalNeeded}</td>
                </tr>
                <tr className="row-h-34">
                  <th scope="row" className="left-th">০২. নিজস্ব বিনিয়োগ (যদি থাকে)</th>
                  <td className="val-cell right-num">{data.part4.ownInvestment}</td>
                </tr>
                <tr className="row-h-34">
                  <th scope="row" className="left-th">০৩. আবেদনকৃত অর্থায়নের পরিমাণ</th>
                  <td className="val-cell right-num bold-val">{data.part4.requestedFinancing}</td>
                </tr>
              </tbody>
            </table>

            <div className="sub-section-heading sub-spaced">
              খ. খাতভিত্তিক ব্যয় বিভাজন (প্রযোজ্য ঘরসমূহ পূরণীয়)
            </div>
            <table className="bb-table budget-table">
              <caption className="visually-hidden">খাতভিত্তিক ব্যয় বিভাজন</caption>
              <colgroup>
                <col style={{ width: '7%' }} />
                <col style={{ width: '27%' }} />
                <col style={{ width: '32%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '18%' }} />
              </colgroup>
              <thead>
                <tr className="row-h-34">
                  <th scope="col" className="center-cell">ক্রম</th>
                  <th scope="col" className="center-cell">ব্যয়ের খাত</th>
                  <th scope="col" className="center-cell">বিবরণ</th>
                  <th scope="col" className="center-cell">মোট (টাকা)</th>
                  <th scope="col" className="center-cell">অর্থের উৎস</th>
                </tr>
              </thead>
              <tbody>
                {data.part4.budgetRows.map((row) => (
                  <tr key={row.id} className="row-h-34">
                    <td className="center-cell">{row.serial}</td>
                    <th scope="row" className="left-th">{row.sector}</th>
                    <td className="val-cell">{row.details}</td>
                    <td className="val-cell right-num">{row.amount}</td>
                    <td className="val-cell center-cell">{row.source}</td>
                  </tr>
                ))}
                <tr className="total-row row-h-36">
                  <th scope="row" colSpan={2} className="center-cell bold-val">সর্বমোট</th>
                  <td className="val-cell" />
                  <td className="val-cell right-num bold-val">
                    {totalBudgetSum > 0 ? formatTakaBn(totalBudgetSum) : ''}
                  </td>
                  <td className="val-cell" />
                </tr>
              </tbody>
            </table>
          </div>
          <PageFooter pageNumber={6} />
        </article>

        {/* ==================== PAGE 7 ==================== */}
        <article className="a4-sheet" aria-label="আবেদন ফরম পৃষ্ঠা ৭">
          <div className="sheet-body">
            <div className="section-bar section-bar-top">পার্ট-৫: অন্যান্য তথ্য</div>

            <table className="bb-table">
              <caption className="visually-hidden">পার্ট-৫ অন্যান্য তথ্য</caption>
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '40%' }} />
                <col style={{ width: '54%' }} />
              </colgroup>
              <tbody>
                <tr className="row-h-42">
                  <td className="sl-col">০১</td>
                  <th scope="row">
                    শারীরিক প্রতিবন্ধকতা আছে কিনা (হ্যাঁ / না); থাকলে ধরন
                  </th>
                  <td className="val-cell">{disabilityText}</td>
                </tr>
                <tr className="row-h-42">
                  <td className="sl-col">০২</td>
                  <th scope="row">
                    ক্ষুদ্র নৃগোষ্ঠীভুক্ত কিনা (হ্যাঁ / না)
                  </th>
                  <td className="val-cell">{data.part5.isEthnicMinority}</td>
                </tr>
                <tr className="row-h-48">
                  <td className="sl-col">০৩</td>
                  <th scope="row">অন্যান্য</th>
                  <td className="val-cell multiline-val">{data.part5.otherInfo}</td>
                </tr>
              </tbody>
            </table>

            <div className="declaration-box">
              <div className="declaration-title">ঘোষণা</div>
              <p>
                আমি এই মর্মে ঘোষণা করছি যে, উপরে প্রদত্ত সমস্ত তথ্য সত্য ও সঠিক। কোনো তথ্য অসত্য প্রমাণিত হলে আমার আবেদন/অনুমোদন যেকোনো পর্যায়ে বাতিলযোগ্য হবে।
              </p>
              <p>
                আমি অবগত আছি যে অনুমোদিত হলে, প্রাপ্ত ঋণ ও অনুদান নির্ধারিত খাতে ব্যবহৃত হবে এবং ঋণ অংশ সম্পূর্ণ ও যথাসময়ে পরিশোধ করলেই কেবল অনুদানের প্রাপ্ত অর্থ অনুদান হিসেবে বিবেচিত হবে এবং ঋণের সদ্ব্যবহার না করা হলে অনুদান অংশ ঋণে পরিণত হবে এবং সম্পূর্ণ অর্থ ঋণ হিসেবে গণ্য হয়ে আমি খেলাপি হিসেবে চিহ্নিত হব। আমি অঙ্গীকার করছি যে প্রদানকৃত অর্থ ব্যক্তিগত ভোগ, জমি বা যানবাহন ক্রয়ে ব্যবহার করব না; প্রতিটি ব্যয়ের ভাউচার সংরক্ষণ করব এবং চাহিদামতো প্রতিবেদন দাখিল করব।
              </p>
            </div>

            <div className="signature-line-block">
              <div className="sig-row">
                <span className="sig-label">আবেদনকারীর স্বাক্ষর ও তারিখ:</span>
                <span className="sig-dotted-area">
                  {data.part5.signatureDataUrl && (
                    <img
                      src={data.part5.signatureDataUrl}
                      alt="আবেদনকারীর স্বাক্ষর"
                      className="signature-img"
                    />
                  )}
                  {formattedSignatureDate && (
                    <span className="sig-date-text">{formattedSignatureDate}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="attachments-box">
              <div className="attachments-title">সংযুক্তি (আবেদনের সঙ্গে দাখিলযোগ্য)</div>
              <ul>
                <li>জাতীয় পরিচয়পত্র/জন্মনিবন্ধন সনদের কপি;</li>
                <li>সর্বশেষ শিক্ষাগত যোগ্যতার সনদের কপি; (যদি থাকে)</li>
                <li>দক্ষতা উন্নয়ন/উদ্যোক্তা উন্নয়ন প্রশিক্ষণ সনদ (যদি থাকে);</li>
                <li>ওয়ার্ড কমিশনার/কাউন্সিলর কর্তৃক প্রদত্ত নাগরিক সনদ।</li>
              </ul>
            </div>
          </div>
          <PageFooter pageNumber={7} />
        </article>
      </div>
    );
  }
);
