export interface AddressFields {
  house: string;
  roadVillage: string;
  postOfficeCode: string;
  upazila: string;
  district: string;
  division: string;
}

export interface PeriodMoney {
  monthly: string;
  quarterly: string;
  yearly: string;
}

export interface BudgetRow {
  id: string;
  serial: string;
  sector: string;
  details: string;
  amount: string;
  source: string;
}

export interface UdyogFormData {
  // Bank Office Use Section
  office: {
    trackingNumber: string;
    bankAndBranch: string;
    receiveDay: string;
    receiveMonth: string;
    receiveYear: string;
    district: string;
    upazila: string;
    branchManagerName: string;
    photoDataUrl: string;
  };

  // Part 1: Personal Info
  part1: {
    nameBn: string;
    nameEn: string;
    fatherName: string;
    motherName: string;
    nid: string;
    dob: string; // YYYY-MM-DD
    ageOverride: string;
    maritalStatus: 'অবিবাহিত' | 'বিবাহিত' | 'অন্যান্য' | '';
    spouseName: string;
    spouseNid: string;
    education: string;
    phone: string;
    altPhone: string;
    email: string;
    training: string;
    experience: string;
    bankAccountInfo: string;
    hasExistingLoan: 'হ্যাঁ' | 'না' | '';
    existingLoanDetails: string;
    presentAddress: AddressFields;
    sameAsPresentAddress: boolean;
    permanentAddress: AddressFields;
  };

  // Business status helper (user can still fill either or both)
  businessMode: 'new' | 'existing';

  // Part 2: New Business Plan
  part2: {
    ideaSummary: string;
    targetCustomers: string;
    startTimeline: string;
    businessType: 'উৎপাদন' | 'সেবা' | 'ব্যবসা' | '';
    businessTypeDetails: string;
    probableLocation: string;
    productNature: string;
    rawMaterialSource: string;
    marketScope: 'স্থানীয়' | 'আন্তর্জাতিক' | 'স্থানীয় ও আন্তর্জাতিক' | '';
    projectedSales: PeriodMoney;
    projectedProfit: PeriodMoney;
    risksAndMitigation: string;
    firstYearEmploymentTotal: string;
    firstYearEmploymentFemale: string;
    marketPositionAndCompetitors: string;
  };

  // Part 3: Existing Business Info
  part3: {
    businessName: string;
    businessType: 'উৎপাদন' | 'সেবা' | 'ব্যবসা' | '';
    businessTypeDetails: string;
    startDate: string;
    hasTradeLicense: 'হ্যাঁ' | 'না' | '';
    tradeLicenseDetails: string;
    avgSellingPrice: string;
    sales: PeriodMoney;
    profit: PeriodMoney;
    monthlyExpenses: string;
    howInvolved: string;
    totalInvestment: string;
    rawMaterialSource: string;
    marketingArea: string;
    marketPositionAndCompetitors: string;
    risksAndMitigation: string;
    employeeTotal: string;
    employeeFemale: string;
    expansionPlan: string;
  };

  // Part 4: Financing Plan & Budget Breakdown
  part4: {
    totalCapitalNeeded: string;
    ownInvestment: string;
    requestedFinancing: string;
    budgetRows: BudgetRow[];
  };

  // Part 5: Other Info & Declaration
  part5: {
    hasDisability: 'হ্যাঁ' | 'না' | '';
    disabilityType: string;
    isEthnicMinority: 'হ্যাঁ' | 'না' | '';
    otherInfo: string;
    signatureDataUrl: string;
    signatureDate: string;
  };
}

export type FormStepId = 'office' | 'part1' | 'part2' | 'part3' | 'part4' | 'part5';
export type ViewMode = 'split' | 'editor' | 'preview';
