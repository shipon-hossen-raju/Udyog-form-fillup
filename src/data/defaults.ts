import { BudgetRow, UdyogFormData } from '../types/form';

export const DEFAULT_BUDGET_ROWS: BudgetRow[] = [
  { id: '01', serial: '০১', sector: 'যন্ত্রপাতি ও সরঞ্জাম ক্রয়', details: '', amount: '', source: '' },
  { id: '02', serial: '০২', sector: 'কাঁচামাল ও উপকরণ', details: '', amount: '', source: '' },
  { id: '03', serial: '০৩', sector: 'পরিচলন ব্যয়', details: '', amount: '', source: '' },
  { id: '04', serial: '০৪', sector: 'প্রোটোটাইপ/নমুনা উন্নয়ন', details: '', amount: '', source: '' },
  { id: '05', serial: '০৫', sector: 'প্যাকেজিং, লেবেল ও ব্র্যান্ডিং', details: '', amount: '', source: '' },
  { id: '06', serial: '০৬', sector: 'ব্যবসা নিবন্ধন, লাইসেন্স ও ছাড়পত্র', details: '', amount: '', source: '' },
  { id: '07', serial: '০৭', sector: 'বিপণন ও প্রচার', details: '', amount: '', source: '' },
  { id: '08', serial: '০৮', sector: 'কর্মীর মজুরি', details: '', amount: '', source: '' },
  { id: '09', serial: '০৯', sector: 'পরিবহন ও সরবরাহ', details: '', amount: '', source: '' },
  { id: '10', serial: '১০', sector: 'প্রযুক্তি, সফটওয়্যার ও ইন্টারনেট', details: '', amount: '', source: '' },
  { id: '11', serial: '১১', sector: 'প্রশিক্ষণ ও দক্ষতা উন্নয়ন', details: '', amount: '', source: '' },
  { id: '12', serial: '১২', sector: 'অন্যান্য (উল্লেখ করুন)', details: '', amount: '', source: '' },
];

export const EMPTY_FORM_DATA: UdyogFormData = {
  office: {
    trackingNumber: '',
    bankAndBranch: '',
    receiveDay: '',
    receiveMonth: '',
    receiveYear: '২০২৬',
    district: '',
    upazila: '',
    branchManagerName: '',
    photoDataUrl: '',
  },
  part1: {
    nameBn: '',
    nameEn: '',
    fatherName: '',
    motherName: '',
    nid: '',
    dob: '',
    ageOverride: '',
    maritalStatus: '',
    spouseName: '',
    spouseNid: '',
    education: '',
    phone: '',
    altPhone: '',
    email: '',
    training: '',
    experience: '',
    bankAccountInfo: '',
    hasExistingLoan: 'না',
    existingLoanDetails: '',
    presentAddress: {
      house: '',
      roadVillage: '',
      postOfficeCode: '',
      upazila: '',
      district: '',
      division: '',
    },
    sameAsPresentAddress: false,
    permanentAddress: {
      house: '',
      roadVillage: '',
      postOfficeCode: '',
      upazila: '',
      district: '',
      division: '',
    },
  },
  businessMode: 'new',
  part2: {
    ideaSummary: '',
    targetCustomers: '',
    startTimeline: '',
    businessType: '',
    businessTypeDetails: '',
    probableLocation: '',
    productNature: '',
    rawMaterialSource: '',
    marketScope: '',
    projectedSales: { monthly: '', quarterly: '', yearly: '' },
    projectedProfit: { monthly: '', quarterly: '', yearly: '' },
    risksAndMitigation: '',
    firstYearEmploymentTotal: '',
    firstYearEmploymentFemale: '',
    marketPositionAndCompetitors: '',
  },
  part3: {
    businessName: '',
    businessType: '',
    businessTypeDetails: '',
    startDate: '',
    hasTradeLicense: '',
    tradeLicenseDetails: '',
    avgSellingPrice: '',
    sales: { monthly: '', quarterly: '', yearly: '' },
    profit: { monthly: '', quarterly: '', yearly: '' },
    monthlyExpenses: '',
    howInvolved: '',
    totalInvestment: '',
    rawMaterialSource: '',
    marketingArea: '',
    marketPositionAndCompetitors: '',
    risksAndMitigation: '',
    employeeTotal: '',
    employeeFemale: '',
    expansionPlan: '',
  },
  part4: {
    totalCapitalNeeded: '',
    ownInvestment: '',
    requestedFinancing: '',
    budgetRows: DEFAULT_BUDGET_ROWS.map((row) => ({ ...row })),
  },
  part5: {
    hasDisability: 'না',
    disabilityType: '',
    isEthnicMinority: 'না',
    otherInfo: '',
    signatureDataUrl: '',
    signatureDate: '',
  },
};

export const SAMPLE_IT_FORM_DATA: UdyogFormData = {
  office: {
    trackingNumber: '',
    bankAndBranch: 'সোনালী ব্যাংক পিএলসি, সদর উপজেলা শাখা',
    receiveDay: '',
    receiveMonth: '',
    receiveYear: '২০২৬',
    district: 'ঢাকা',
    upazila: 'সাভার',
    branchManagerName: '',
    photoDataUrl: '',
  },
  part1: {
    nameBn: 'মোঃ তানভীর আহমেদ',
    nameEn: 'MD. TANVIR AHMED',
    fatherName: 'মোঃ আব্দুল করিম',
    motherName: 'মোছাঃ রহিমা বেগম',
    nid: '১৯৯৯২৬১৭২৩৪৫৬৭৮৯০',
    dob: '1999-05-14',
    ageOverride: '',
    maritalStatus: 'অবিবাহিত',
    spouseName: '',
    spouseNid: '',
    education: 'বিএসসি ইন কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE), জাতীয় বিশ্ববিদ্যালয়, ২০২৩',
    phone: '০১৭০০-১২৩৪৫৬',
    altPhone: '০১৮০০-৬৫৪৩২১',
    email: 'tanvir.udyog@example.com',
    training: 'ওয়েব ডেভেলপমেন্ট ও ডিজিটাল মার্কেটিং (৬ মাস), যুব উন্নয়ন অধিদপ্তর, ২০২৩; এআই প্রোডাক্টিভিটি ও ফ্রিল্যান্সিং (৩ মাস), ২০২৫',
    experience: 'গত ২ বছর ধরে ফ্রিল্যান্স ওয়েব ডেভেলপার ও স্থানীয় ব্যবসা প্রতিষ্ঠানের আইটি পরামর্শদাতা হিসেবে কাজের অভিজ্ঞতা রয়েছে।',
    bankAccountInfo: 'সোনালী ব্যাংক পিএলসি, সাভার শাখা; সঞ্চয়ী হিসাব; হিসাব নং: ০১০০২৩৪৫৬৭৮৯১',
    hasExistingLoan: 'না',
    existingLoanDetails: '',
    presentAddress: {
      house: 'বাড়ি নং-১২, শাপলা মহল্লা',
      roadVillage: 'থানা রোড, বাজার এলাকা',
      postOfficeCode: 'সাভার - ১৩৪০',
      upazila: 'সাভার',
      district: 'ঢাকা',
      division: 'ঢাকা',
    },
    sameAsPresentAddress: true,
    permanentAddress: {
      house: 'বাড়ি নং-১২, শাপলা মহল্লা',
      roadVillage: 'থানা রোড, বাজার এলাকা',
      postOfficeCode: 'সাভার - ১৩৪০',
      upazila: 'সাভার',
      district: 'ঢাকা',
      division: 'ঢাকা',
    },
  },
  businessMode: 'new',
  part2: {
    ideaSummary:
      'উপজেলা পর্যায়ে একটি আধুনিক "AI-Integrated IT Center & Skill Development Hub" স্থাপন করা হবে, যা দুটি সমন্বিত শাখায় পরিচালিত হবে: (১) দক্ষতা উন্নয়ন একাডেমি এবং (২) স্থানীয় আইটি সার্ভিস এজেন্সি। উপজেলা পর্যায়ের তরুণ-তরুণীদের আধুনিক কৃত্রিম বুদ্ধিমত্তা (AI) টুলস, ফ্রিল্যান্সিং, নো-কোড ওয়েব ডেভেলপমেন্ট, এআই ভিডিও এডিটিং, ডিজিটাল মার্কেটিং এবং স্মার্ট অফিস ম্যানেজমেন্ট বিষয়ে হাতে-কলমে প্রশিক্ষণ দেওয়া হবে। পাশাপাশি প্রশিক্ষিত শিক্ষার্থীদের যুক্ত করে স্থানীয় স্কুল-কলেজ, ডায়াগনস্টিক সেন্টার, শোরুম ও ক্ষুদ্র উদ্যোক্তাদের জন্য ওয়েবসাইট, পিওএস সফটওয়্যার এবং সোশ্যাল মিডিয়া মার্কেটিং সেবা প্রদান করা হবে। এর মাধ্যমে প্রথম বছরেই শতাধিক তরুণের কর্মসংস্থান ও আয়বর্ধন নিশ্চিত হবে।',
    targetCustomers:
      '১) উপজেলার কলেজ ও বিশ্ববিদ্যালয়ের শিক্ষার্থী ও বেকার তরুণ-তরুণী (বয়স ১৬–৩০); ২) স্থানীয় ক্ষুদ্র ও মাঝারি ব্যবসা প্রতিষ্ঠান, ক্লিনিক, শোরুম ও শিক্ষা প্রতিষ্ঠান; ৩) আন্তর্জাতিক ফ্রিল্যান্সিং মার্কেটপ্লেসের ক্লায়েন্ট।',
    startTimeline: 'অর্থায়ন প্রাপ্তির ৪৫ দিনের মধ্যে ল্যাব সেটআপ ও প্রথম ব্যাচের কার্যক্রম শুরু।',
    businessType: 'সেবা',
    businessTypeDetails: 'আইটি ও এআই দক্ষতা উন্নয়ন প্রশিক্ষণ কেন্দ্র (EdTech) এবং ডিজিটাল মার্কেটিং ও সফটওয়্যার সার্ভিস এজেন্সি।',
    probableLocation: 'উপজেলা সদর বাজার প্রধান সড়ক সংলগ্ন বাণিজ্যিক ভবন, সাভার, ঢাকা।',
    productNature: 'আধুনিক প্রযুক্তিভিত্তিক সেবা ও রপ্তানিযোগ্য ফ্রিল্যান্সিং/আইটি সার্ভিস (বৈদেশিক মুদ্রা অর্জনে সহায়ক)।',
    rawMaterialSource: 'কম্পিউটার হার্ডওয়্যার (ঢাকা আইডিবি/মাল্টিপ্ল্যান), উচ্চগতির ব্রডব্যান্ড ইন্টারনেট ও ক্লাউড/এআই সফটওয়্যার সাবস্ক্রিপশন।',
    marketScope: 'স্থানীয় ও আন্তর্জাতিক',
    projectedSales: {
      monthly: '২,২০,০০০',
      quarterly: '৬,৬০,০০০',
      yearly: '২৬,৪০,০০০',
    },
    projectedProfit: {
      monthly: '৯৫,০০০',
      quarterly: '২,৮৫,০০০',
      yearly: '১১,৪০,০০০',
    },
    risksAndMitigation:
      '১) বিদ্যুৎ বিভ্রাট: সার্বক্ষণিক অনলাইন ইউপিএস/আইপিএস ব্যাকআপ রাখা হবে। ২) শিক্ষার্থী ভর্তি হ্রাস: স্কুল-কলেজে ফ্রি সেমিনার, স্কলারশিপ ও বাস্তব আয়ের সাপোর্ট নিশ্চিত করা হবে। ৩) প্রযুক্তির দ্রুত পরিবর্তন: প্রতি ৬ মাস পরপর এআই ও আধুনিক ইন্ডাস্ট্রি অনুযায়ী সিলেবাস হালনাগাদ করা হবে।',
    firstYearEmploymentTotal: '০৬',
    firstYearEmploymentFemale: '০২',
    marketPositionAndCompetitors:
      'উপজেলায় প্রচলিত কম্পিউটার টাইপিং সেন্টার থাকলেও আধুনিক এআই ও ফ্রিল্যান্সিং-ভিত্তিক সমন্বিত ল্যাব নেই। সম্ভাব্য ৩টি প্রতিযোগী: (১) উপজেলা যুব কম্পিউটার ট্রেনিং সেন্টার — শুধু বেসিক এমএস অফিস শেখায়; (২) ডিজিটাল আইটি পয়েন্ট — আধুনিক ল্যাব ও এআই সিলেবাসের অভাব; (৩) অনলাইন কোর্স প্ল্যাটফর্ম — সরাসরি মেন্টরিং ও ফিজিক্যাল ল্যাব সুবিধা নেই। আমাদের হাতে-কলমে এআই প্রশিক্ষণ ও লোকাল এজেন্সি সাপোর্ট আমাদের অনন্য সুবিধা দেবে।',
  },
  part3: {
    businessName: '',
    businessType: '',
    businessTypeDetails: '',
    startDate: '',
    hasTradeLicense: '',
    tradeLicenseDetails: '',
    avgSellingPrice: '',
    sales: { monthly: '', quarterly: '', yearly: '' },
    profit: { monthly: '', quarterly: '', yearly: '' },
    monthlyExpenses: '',
    howInvolved: '',
    totalInvestment: '',
    rawMaterialSource: '',
    marketingArea: '',
    marketPositionAndCompetitors: '',
    risksAndMitigation: '',
    employeeTotal: '',
    employeeFemale: '',
    expansionPlan: '',
  },
  part4: {
    totalCapitalNeeded: '১৮,০০,০০০',
    ownInvestment: '২,০০,০০০',
    requestedFinancing: '১৬,০০,০০০',
    budgetRows: [
      { id: '01', serial: '০১', sector: 'যন্ত্রপাতি ও সরঞ্জাম ক্রয়', details: '১২টি আধুনিক কম্পিউটার, প্রজেক্টর, রাউটার, আইপিএস ও এসি', amount: '৮,৫০,০০০', source: 'ঋণ ও অনুদান' },
      { id: '02', serial: '০২', sector: 'কাঁচামাল ও উপকরণ', details: 'ল্যাব ফার্নিচার, কম্পিউটার টেবিল-চেয়ার ও ডেকোরেশন', amount: '২,৩০,০০০', source: 'ঋণ ও অনুদান' },
      { id: '03', serial: '০৩', sector: 'পরিচলন ব্যয়', details: 'অফিস ভাড়া (অগ্রিম ও ৩ মাস), বিদ্যুৎ ও ইউটিলিটি', amount: '১,৫০,০০০', source: 'নিজস্ব বিনিয়োগ' },
      { id: '04', serial: '০৪', sector: 'প্রোটোটাইপ/নমুনা উন্নয়ন', details: 'লার্নিং ম্যানেজমেন্ট ওয়েবসাইট ও কোর্স মডিউল তৈরি', amount: '৬০,০০০', source: 'ঋণ ও অনুদান' },
      { id: '05', serial: '০৫', sector: 'প্যাকেজিং, লেবেল ও ব্র্যান্ডিং', details: 'সাইনবোর্ড, ব্যানার, ব্রোশিওর ও শিক্ষার্থী কিট', amount: '৪০,০০০', source: 'ঋণ ও অনুদান' },
      { id: '06', serial: '০৬', sector: 'ব্যবসা নিবন্ধন, লাইসেন্স ও ছাড়পত্র', details: 'ট্রেড লাইসেন্স, টিআইএন ও কারিগরি বোর্ড অনুমোদন ফি', amount: '২৫,০০০', source: 'নিজস্ব বিনিয়োগ' },
      { id: '07', serial: '০৭', sector: 'বিপণন ও প্রচার', details: 'ডিজিটাল মার্কেটিং, ক্যাম্পাস সেমিনার ও লিফলেট', amount: '৬৫,০০০', source: 'ঋণ ও অনুদান' },
      { id: '08', serial: '০৮', sector: 'কর্মীর মজুরি', details: '২ জন প্রশিক্ষক ও ১ জন অফিস সহায়কের প্রাথমিক ৩ মাসের বেতন', amount: '১,৫০,০০০', source: 'ঋণ ও অনুদান' },
      { id: '09', serial: '০৯', sector: 'পরিবহন ও সরবরাহ', details: 'কম্পিউটার ও ফার্নিচার পরিবহন এবং ইনস্টলেশন', amount: '২৫,০০০', source: 'নিজস্ব বিনিয়োগ' },
      { id: '10', serial: '১০', sector: 'প্রযুক্তি, সফটওয়্যার ও ইন্টারনেট', details: 'ডেডিকেটেড ব্রডব্যান্ড, প্রিমিয়াম এআই টুলস ও ডোমেইন-হোস্টিং', amount: '১,১০,০০০', source: 'ঋণ ও অনুদান' },
      { id: '11', serial: '১১', sector: 'প্রশিক্ষণ ও দক্ষতা উন্নয়ন', details: 'প্রশিক্ষকদের আধুনিক এআই ওয়ার্কশপ ও মেন্টরশিপ', amount: '৫৫,০০০', source: 'ঋণ ও অনুদান' },
      { id: '12', serial: '১২', sector: 'অন্যান্য (উল্লেখ করুন)', details: 'জরুরি ফান্ড ও সিসিটিভি নিরাপত্তা ব্যবস্থা', amount: '৪০,০০০', source: 'ঋণ ও অনুদান' },
    ],
  },
  part5: {
    hasDisability: 'না',
    disabilityType: '',
    isEthnicMinority: 'না',
    otherInfo: 'উপজেলার নারী শিক্ষার্থীদের জন্য কোর্স ফিতে ৩০% বিশেষ ছাড় প্রদান করা হবে।',
    signatureDataUrl: '',
    signatureDate: '২০২৬-১০-১০',
  },
};

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function toEnglishDigits(input: string): string {
  return input.replace(/[০-৯]/g, (ch) => String(BN_DIGITS.indexOf(ch)));
}

export function parseNumericAmount(value: string): number {
  if (!value) return 0;
  const cleaned = toEnglishDigits(value).replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatTakaBn(amount: number): string {
  if (!amount || amount <= 0) return '';
  // Bangladeshi / Indian comma grouping (e.g. 18,00,000)
  const rounded = Math.round(amount);
  const str = String(rounded);
  let formatted = str;
  if (str.length > 3) {
    const last3 = str.slice(-3);
    const rest = str.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${rest},${last3}`;
  }
  return toBengaliDigits(formatted);
}

export function calculateAgeAsOfDeadline(dobIso: string): {
  years: number;
  months: number;
  days: number;
  isEligible: boolean;
  formattedBn: string;
} | null {
  if (!dobIso) return null;
  const dob = new Date(`${dobIso}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;

  // Application deadline in official form: 15 October 2026
  const deadline = new Date('2026-10-15T00:00:00');
  let years = deadline.getFullYear() - dob.getFullYear();
  let months = deadline.getMonth() - dob.getMonth();
  let days = deadline.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(deadline.getFullYear(), deadline.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return null;

  const isEligible = years >= 18 && (years < 28 || (years === 28 && months === 0 && days === 0));
  const formattedBn = `${toBengaliDigits(years)} বছর ${toBengaliDigits(months)} মাস ${toBengaliDigits(days)} দিন`;
  return { years, months, days, isEligible, formattedBn };
}

export function formatIsoDateBn(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${toBengaliDigits(parts[2])}/${toBengaliDigits(parts[1])}/${toBengaliDigits(parts[0])}`;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
