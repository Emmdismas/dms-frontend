export type Language = 'en' | 'sw';

export interface Translations {
  // App brand
  appName: string;
  systemName: string;
  appSubtitle: string;
  erpTag: string;

  // Nav
  navOverview: string;
  navDealers: string;
  navBranches: string;
  navInventory: string;
  navSales: string;
  navPricing: string;
  navExpenses: string;
  navTransfers: string;
  navOrders: string;
  navCustomers: string;
  navReports: string;
  navTeam: string;
  navSettings: string;
  navMenu: string;

  // Actions
  actionRecordSale: string;
  actionReceiveStock: string;
  actionRecordExpense: string;
  actionUpdatePrice: string;
  actionTransfer: string;
  actionAddCustomer: string;
  actionExportExcel: string;
  actionExportPdf: string;
  actionViewDetails: string;
  actionPrintReceipt: string;
  actionClose: string;
  actionCancel: string;
  actionNext: string;
  actionBack: string;
  actionSave: string;
  actionCompleteSale: string;
  actionConfirmTransfer: string;
  actionConfirmReceipt: string;
  actionSignIn: string;
  actionLogout: string;
  quickRecordSale: string;
  buyingPrice: string;
  profitPerUnit: string;
  grossProfit: string;
  margin: string;

  // Dashboard
  dashTitle: string;
  dashSubtitle: string;
  totalStock: string;
  soldToday: string;
  todayRevenue: string;
  expenses: string;
  netProfit: string;
  onOrder: string;
  stockAgingTitle: string;
  branchesPerformance: string;
  recentSales: string;
  recentSalesSub: string;
  unitPrice: string;
  amountPaid: string;
  remained: string;
  statusPaid: string;
  statusPartial: string;
  chassisSearchPlaceholder: string;
  chassisSearchTitle: string;
  chassisSearchSub: string;
  viewAll: string;
  units: string;
  days: string;
  newStock0to30: string;
  midStock31to60: string;
  oldStock60Plus: string;

  // Inventory
  inventoryTitle: string;
  inventorySubtitle: string;
  allUnits: string;
  inStock: string;
  sold: string;
  reserved: string;
  transferred: string;
  damaged: string;
  allCategories: string;
  allTypes: string;
  type2W: string;
  type3W: string;
  allModels: string;
  allBranches: string;
  allAges: string;
  noUnitsFound: string;
  colUnitId: string;
  colVehicle: string;
  colChassis: string;
  colEngine: string;
  colBranch: string;
  colStatus: string;
  colStockAge: string;
  colActions: string;

  // Sales
  salesTitle: string;
  salesSubtitle: string;
  totalUnitsSold: string;
  totalRevenueTitle: string;
  cashSales: string;
  totalOutstandingTitle: string;
  allPaymentStatuses: string;
  dateFrom: string;
  dateTo: string;
  clearFilters: string;
  receiptNumber: string;
  date: string;
  customer: string;
  amount: string;
  paymentMethod: string;
  receipt: string;

  // Customers
  customersTitle: string;
  customersSubtitle: string;
  searchCustomersPlaceholder: string;
  colCustomerName: string;
  colPhoneAndNida: string;
  colLocation: string;
  colRegisteredBranch: string;
  colPurchasedUnits: string;
  colLastPurchase: string;

  // Transfers
  transfersTitle: string;
  transfersSubtitle: string;
  actionNewTransfer: string;
  colTransferNumber: string;
  colTransferDate: string;
  colFromBranch: string;
  colToBranch: string;
  colTransferredUnits: string;
  statusInTransit: string;
  statusCompleted: string;

  // Orders
  ordersTitle: string;
  ordersSubtitle: string;
  colOrderNumber: string;
  colSupplier: string;
  colOrderDate: string;
  colExpectedDate: string;
  colSplit: string;
  colTotalAmount: string;
  colOrderStatus: string;

  // Reports
  reportsTitle: string;
  reportsSubtitle: string;
  periodToday: string;
  period7Days: string;
  period30Days: string;
  periodMtd: string;
  salesByBranchTitle: string;
  colMarketShare: string;

  // Modals & Details
  stepOf: (curr: number, total: number) => string;
  selectCategory: string;
  selectModel: string;
  selectUnit: string;
  customerInfo: string;
  priceAndPayment: string;
  reviewAndConfirm: string;
  buyerName: string;
  phoneNumber: string;
  nidaNumber: string;
  location: string;
  sellingPrice: string;
  paymentCash: string;
  paymentMobile: string;
  paymentBank: string;
  paymentInstallment: string;
  journeyTitle: string;

  // Pagination
  showingEntries: (start: number, end: number, total: number) => string;
  rowsPerPage: string;
  prevPage: string;
  nextPage: string;
  page: string;
  of: string;
  noDataAvailable: string;

  // Login
  loginTitle: string;
  loginSubtitle: string;
  tabOwner: string;
  tabBranch: string;
  phoneOrEmailLabel: string;
  branchCodeLabel: string;
  passwordLabel: string;
  demoHint: string;
  quickPickTitle: string;
  demoPasswordNote: string;
}

export const translations: Record<Language, Translations> = {
  sw: {
    appName: 'Nassor Salum Abdallah',
    systemName: 'Dealer Management System',
    appSubtitle: 'Mfumo wa Usimamizi wa Pikipiki (2W & 3W ERP)',
    erpTag: '2W & 3W ERP',

    navOverview: 'Muhtasari',
    navDealers: 'Ma-Dealer Wote',
    navBranches: 'Matawi Yote',
    navInventory: 'Stoo ya Pikipiki',
    navSales: 'Mauzo',
    navPricing: 'Bei za Vyombo',
    navExpenses: 'Matumizi',
    navTransfers: 'Uhamisho',
    navOrders: 'Oda Kiwandani',
    navCustomers: 'Wateja',
    navReports: 'Ripoti',
    navTeam: 'Wafanyakazi',
    navSettings: 'Mipangilio',
    navMenu: 'Menyu',

    actionRecordSale: 'Sajili Mauzo',
    actionReceiveStock: 'Pokea Mzigo',
    actionRecordExpense: 'Sajili Matumizi',
    actionUpdatePrice: 'Badili Bei',
    actionTransfer: 'Hamisha Mzigo',
    actionAddCustomer: 'Sajili Mteja',
    actionExportExcel: 'Pakua Excel',
    actionExportPdf: 'Pakua PDF',
    actionViewDetails: 'Tazama',
    actionPrintReceipt: 'Chapa Risiti',
    actionClose: 'Funga',
    actionCancel: 'Ghairi',
    actionNext: 'Endelea',
    actionBack: 'Rudi',
    actionSave: 'Hifadhi',
    actionCompleteSale: 'Kamilisha Mauzo',
    actionConfirmTransfer: 'Thibitisha Uhamisho',
    actionConfirmReceipt: 'Thibitisha Upokeaji',
    actionSignIn: 'Ingia kwenye Mfumo',
    actionLogout: 'Ondoka',
    quickRecordSale: 'Sajili Mauzo Haraka',
    buyingPrice: 'Bei ya Kununulia',
    profitPerUnit: 'Faida kwa Chombo',
    grossProfit: 'Faida Ghafi',
    margin: 'Asilimia ya Faida',

    dashTitle: 'Muhtasari wa Biashara ya Matawi',
    dashSubtitle: 'Hali halisi ya mauzo ya leo, stoo ya pikipiki na mapato ya matawi yote',
    totalStock: 'Pikipiki Zilizopo Stoo',
    soldToday: 'Zilizouzwa Leo',
    todayRevenue: 'Mapato ya Leo',
    expenses: 'Matumizi',
    netProfit: 'Faida Halisi',
    onOrder: 'Mzigo Unaokuja',
    stockAgingTitle: 'Umri wa Stoo',
    branchesPerformance: 'Ufanisi wa Matawi ya Biashara',
    recentSales: 'Mauzo ya Hivi Karibuni',
    recentSalesSub: 'Miamala ya mauzo iliyokamilika leo na hivi punde',
    unitPrice: 'Bei ya Chombo',
    amountPaid: 'Kiasi Kilicholipwa',
    remained: 'Iliyobaki',
    statusPaid: 'Imelipwa',
    statusPartial: 'Sehemu',
    chassisSearchPlaceholder: 'Andika Chassis VIN, Engine au SN... (⌘K)',
    chassisSearchTitle: 'Tafuta Chassis / VIN kwa Haraka:',
    chassisSearchSub: 'Pata historia na eneo la chombo papo hapo',
    viewAll: 'Tazama Yote',
    units: 'Vitengo',
    days: 'Siku',
    newStock0to30: 'Siku 0 - 30 (Mpya)',
    midStock31to60: 'Siku 31 - 60 (Wastani)',
    oldStock60Plus: 'Zaidi ya Siku 60 (Zilizochelewa)',

    inventoryTitle: 'Stoo ya Pikipiki na Namba za Chassis (VIN)',
    inventorySubtitle: 'Orodha kamili ya vitengo vyote vilivyopo stoo, vilivyouzwa na vinavyohamishwa',
    allUnits: 'Vitengo Vyote',
    inStock: 'Zilizopo Stoo',
    sold: 'Zilizouzwa',
    reserved: 'Zilizohifadhiwa',
    transferred: 'Zinazohamishwa',
    damaged: 'Zilizoharibika',
    allCategories: 'Aina Zote (2W & 3W)',
    allTypes: 'Aina Zote za Vyombo',
    type2W: 'Pikipiki (2W)',
    type3W: 'Bajaj (3W)',
    allModels: 'Modeli Zote za Pikipiki',
    allBranches: 'Matawi Yote',
    allAges: 'Umri Wote wa Stoo',
    noUnitsFound: 'Hakuna pikipiki inayolingana na vigezo ulivyochagua.',
    colUnitId: 'SN',
    colVehicle: 'Chombo & Mfano',
    colChassis: 'Chassis (VIN)',
    colEngine: 'Engine Number',
    colBranch: 'Tawi',
    colStatus: 'Hali',
    colStockAge: 'Umri wa Stoo',
    colActions: 'Vitendo',

    salesTitle: 'Daftari Rasmi la Mauzo na Risiti',
    salesSubtitle: 'Ufuatiliaji wa mauzo yote ya pikipiki, mikataba na malipo ya wateja',
    totalUnitsSold: 'Jumla ya Vitengo Vilivyouzwa',
    totalRevenueTitle: 'Jumla ya Mapato Yaliyokusanywa',
    cashSales: 'Mauzo ya Taslimu',
    totalOutstandingTitle: 'Baki ya Madeni / Sehemu',
    allPaymentStatuses: 'Hali Zote za Malipo',
    dateFrom: 'Kuanzia Tarehe',
    dateTo: 'Mpaka Tarehe',
    clearFilters: 'Futa Vichujio',
    receiptNumber: 'Nambari ya Risiti',
    date: 'Tarehe',
    customer: 'Mteja',
    amount: 'Kiasi (TZS)',
    paymentMethod: 'Njia ya Malipo',
    receipt: 'Risiti',

    customersTitle: 'Orodha ya Wateja Waliosajiliwa',
    customersSubtitle: 'Kumbukumbu kamili za wateja waliowahi kununua na vitambulisho vyao',
    searchCustomersPlaceholder: 'Tafuta jina la mteja, simu, NIDA au makazi...',
    colCustomerName: 'Jina la Mteja',
    colPhoneAndNida: 'Simu & NIDA',
    colLocation: 'Makazi / Mahali',
    colRegisteredBranch: 'Tawi Lililosajili',
    colPurchasedUnits: 'Pikipiki Alizonunua',
    colLastPurchase: 'Ununuzi wa Mwisho',

    transfersTitle: 'Uhamisho wa Pikipiki Kati ya Matawi',
    transfersSubtitle: 'Ufuatiliaji wa vitengo vinavyohama kutoka Dar Es Salaam kwenda Unguja na Pemba',
    actionNewTransfer: 'Anzisha Uhamisho Mpya',
    colTransferNumber: 'Namba ya Uhamisho',
    colTransferDate: 'Tarehe ya Uhamisho',
    colFromBranch: 'Kutoka Tawi',
    colToBranch: 'Kwenda Tawi',
    colTransferredUnits: 'Pikipiki Zilizohamishwa',
    statusInTransit: 'Safarini',
    statusCompleted: 'Imepokelewa',

    ordersTitle: 'Oda toka kwa Wasambazaji (TVS & Bajaj)',
    ordersSubtitle: 'Mizigo iliyoagizwa kiwandani inayotegemewa kuingia bandarini',
    colOrderNumber: 'Namba ya Oda',
    colSupplier: 'Kiwanda / Msambazaji',
    colOrderDate: 'Tarehe ya Oda',
    colExpectedDate: 'Inatarajiwa Kufika',
    colSplit: 'Mgawanyo (2W / 3W)',
    colTotalAmount: 'Thamani (TZS)',
    colOrderStatus: 'Hali ya Oda',

    reportsTitle: 'Kituo cha Ripoti na Takwimu',
    reportsSubtitle: 'Uchambuzi wa mapato ya matawi, mgawanyo wa mauzo na mwenendo wa biashara',
    periodToday: 'Leo',
    period7Days: 'Siku 7 Zilizopita',
    period30Days: 'Siku 30 Zilizopita',
    periodMtd: 'Mwezi Huu (MTD)',
    salesByBranchTitle: 'Ripoti ya Mauzo na Ufanisi kwa Kila Tawi',
    colMarketShare: 'Gawanyo la Soko (%)',

    stepOf: (curr, total) => `Hatua ya ${curr} kati ya ${total}`,
    selectCategory: 'Chagua Aina ya Chombo',
    selectModel: 'Chagua Mfano wa Pikipiki',
    selectUnit: 'Chagua Pikipiki Halisi (Chassis / VIN)',
    customerInfo: 'Taarifa za Mteja',
    priceAndPayment: 'Bei na Njia ya Malipo',
    reviewAndConfirm: 'Uhakiki na Kamilisha Mauzo',
    buyerName: 'Jina Kamili la Mteja',
    phoneNumber: 'Nambari ya Simu',
    nidaNumber: 'Nambari ya NIDA',
    location: 'Makazi / Mahali',
    sellingPrice: 'Bei ya Mauzo (TZS)',
    paymentCash: 'Pesa Taslimu',
    paymentMobile: 'Pesa ya Simu',
    paymentBank: 'Uhamisho wa Benki',
    paymentInstallment: 'Malipo ya Awamu',
    journeyTitle: 'Historia na Safari ya Chombo',

    showingEntries: (start, end, total) => `Inaonyesha ${start} hadi ${end} kati ya ${total}`,
    rowsPerPage: 'Mstari kwa ukurasa:',
    prevPage: 'Awali',
    nextPage: 'Inayofuata',
    page: 'Ukurasa',
    of: 'kati ya',
    noDataAvailable: 'Hakuna taarifa zilizopatikana',

    loginTitle: 'Nassor Salum Abdallah',
    loginSubtitle: 'Mfumo wa Usimamizi wa Matawi ya Pikipiki',
    tabOwner: 'Mfanyabiashara Mkuu',
    tabBranch: 'Meneja wa Tawi',
    phoneOrEmailLabel: 'Nambari ya Simu au Barua Pepe:',
    branchCodeLabel: 'Msimbo wa Tawi:',
    passwordLabel: 'Nenosiri:',
    demoHint: 'Ingia ukitumia Nambari ya Simu au Barua Pepe ya Dealer',
    quickPickTitle: 'Chagua tawi kuingia moja kwa moja:',
    demoPasswordNote: 'Nenosiri la awali kwa kila akaunti ni 123456',
  },

  en: {
    appName: 'Nassor Salum Abdallah',
    systemName: 'Dealer Management System',
    appSubtitle: 'Motorcycle Dealer Management System (2W & 3W ERP)',
    erpTag: '2W & 3W ERP',

    navOverview: 'Overview',
    navDealers: 'All Dealers',
    navBranches: 'All Branches',
    navInventory: 'Inventory',
    navSales: 'Sales',
    navPricing: 'Price List',
    navExpenses: 'Expenses',
    navTransfers: 'Transfers',
    navOrders: 'Supplier Orders',
    navCustomers: 'Customers',
    navReports: 'Reports',
    navTeam: 'Team',
    navSettings: 'Settings',
    navMenu: 'Menu',

    actionRecordSale: 'Record Sale',
    actionReceiveStock: 'Receive Stock',
    actionRecordExpense: 'Record Expense',
    actionUpdatePrice: 'Update Price',
    actionTransfer: 'Transfer Stock',
    actionAddCustomer: 'Add Customer',
    actionExportExcel: 'Export Excel',
    actionExportPdf: 'Download PDF',
    actionViewDetails: 'View',
    actionPrintReceipt: 'Print Receipt',
    actionClose: 'Close',
    actionCancel: 'Cancel',
    actionNext: 'Next',
    actionBack: 'Back',
    actionSave: 'Save',
    actionCompleteSale: 'Complete Sale',
    actionConfirmTransfer: 'Confirm Transfer',
    actionConfirmReceipt: 'Confirm Receipt',
    actionSignIn: 'Sign In',
    actionLogout: 'Sign Out',
    quickRecordSale: 'Quick Record Sale',
    buyingPrice: 'Cost / Buying Price',
    profitPerUnit: 'Profit per Unit',
    grossProfit: 'Gross Profit',
    margin: 'Margin',

    dashTitle: 'Dealership Network Executive Dashboard',
    dashSubtitle: 'Real-time daily sales, inventory levels, and revenue across all branches',
    totalStock: 'Available Stock',
    soldToday: 'Sold Today',
    todayRevenue: 'Today\'s Revenue',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
    onOrder: 'Incoming Stock',
    stockAgingTitle: 'Stock Aging Health',
    branchesPerformance: 'Branch Network Performance',
    recentSales: 'Recent Sales Stream',
    recentSalesSub: 'Motorcycle transactions finalized today and recently',
    unitPrice: 'Unit Price',
    amountPaid: 'Amount Paid',
    remained: 'Remained',
    statusPaid: 'Paid',
    statusPartial: 'Partial',
    chassisSearchPlaceholder: 'Search Chassis VIN, Engine or SN... (⌘K)',
    chassisSearchTitle: 'Fast Chassis / VIN Lookup in 1s:',
    chassisSearchSub: 'Access vehicle location, history, and status instantly',
    viewAll: 'View All',
    units: 'Units',
    days: 'Days',
    newStock0to30: '0 - 30 Days (Fast Moving)',
    midStock31to60: '31 - 60 Days (Moderate)',
    oldStock60Plus: '60+ Days (Aging Stock)',

    inventoryTitle: 'Motorcycle Inventory & VIN Registry',
    inventorySubtitle: 'Comprehensive physical registry of all motorcycle units in stock and in transit',
    allUnits: 'All Units',
    inStock: 'In Stock',
    sold: 'Sold',
    reserved: 'Reserved',
    transferred: 'In Transit',
    damaged: 'Damaged',
    allCategories: 'All Categories (2W & 3W)',
    allTypes: 'All Types (2W & 3W)',
    type2W: '2-Wheeler (Motorcycle)',
    type3W: '3-Wheeler (Tricycle/Bajaj)',
    allModels: 'All Vehicle Models',
    allBranches: 'All Branches',
    allAges: 'All Stock Ages',
    noUnitsFound: 'No vehicles match your selected filter criteria.',
    colUnitId: 'SN',
    colVehicle: 'Vehicle & Model',
    colChassis: 'Chassis (VIN)',
    colEngine: 'Engine Number',
    colBranch: 'Branch',
    colStatus: 'Status',
    colStockAge: 'Stock Age',
    colActions: 'Actions',

    salesTitle: 'Official Sales Ledger & Receipts',
    salesSubtitle: 'Complete track record of motorcycle sales, buyer agreements, and payments',
    totalUnitsSold: 'Total Units Sold',
    totalRevenueTitle: 'Total Revenue Collected',
    cashSales: 'Cash Sales',
    totalOutstandingTitle: 'Outstanding Balance',
    allPaymentStatuses: 'All Payment Statuses',
    dateFrom: 'From Date',
    dateTo: 'To Date',
    clearFilters: 'Clear Filters',
    receiptNumber: 'Receipt #',
    date: 'Date',
    customer: 'Customer',
    amount: 'Amount (TZS)',
    paymentMethod: 'Payment Method',
    receipt: 'Receipt',

    customersTitle: 'Customer Registry & Buyer Profiles',
    customersSubtitle: 'Complete database of customers, verified NIDA numbers, and purchase history',
    searchCustomersPlaceholder: 'Search customer name, phone, NIDA or location...',
    colCustomerName: 'Customer Name',
    colPhoneAndNida: 'Phone & NIDA',
    colLocation: 'Location / Address',
    colRegisteredBranch: 'Registered Branch',
    colPurchasedUnits: 'Units Purchased',
    colLastPurchase: 'Last Purchase',

    transfersTitle: 'Inter-Branch Stock Transfers',
    transfersSubtitle: 'Track motorcycle movements between Dar Es Salaam, Unguja, and Pemba',
    actionNewTransfer: 'Initiate Transfer',
    colTransferNumber: 'Transfer #',
    colTransferDate: 'Transfer Date',
    colFromBranch: 'Origin Branch',
    colToBranch: 'Destination Branch',
    colTransferredUnits: 'Transferred Units',
    statusInTransit: 'In Transit',
    statusCompleted: 'Completed',

    ordersTitle: 'Supplier Orders (TVS & Bajaj Factory)',
    ordersSubtitle: 'Factory orders scheduled for port arrival and assembly distribution',
    colOrderNumber: 'Order #',
    colSupplier: 'Manufacturer / Supplier',
    colOrderDate: 'Order Date',
    colExpectedDate: 'Expected Arrival',
    colSplit: 'Category Split (2W / 3W)',
    colTotalAmount: 'Value (TZS)',
    colOrderStatus: 'Order Status',

    reportsTitle: 'Reporting & Analytics Hub',
    reportsSubtitle: 'In-depth branch revenue, category performance, and stock velocity analytics',
    periodToday: 'Today',
    period7Days: 'Last 7 Days',
    period30Days: 'Last 30 Days',
    periodMtd: 'This Month (MTD)',
    salesByBranchTitle: 'Branch Sales & Performance Breakdown',
    colMarketShare: 'Market Share (%)',

    stepOf: (curr, total) => `Step ${curr} of ${total}`,
    selectCategory: 'Select Vehicle Category',
    selectModel: 'Select Motorcycle Model',
    selectUnit: 'Select Physical Unit (VIN)',
    customerInfo: 'Customer Information',
    priceAndPayment: 'Price & Payment Details',
    reviewAndConfirm: 'Review & Finalize Sale',
    buyerName: 'Customer Full Name',
    phoneNumber: 'Phone Number',
    nidaNumber: 'NIDA / National ID',
    location: 'Location / Address',
    sellingPrice: 'Selling Price (TZS)',
    paymentCash: 'Cash Payment',
    paymentMobile: 'Mobile Money',
    paymentBank: 'Bank Transfer',
    paymentInstallment: 'Installment / Deposit',
    journeyTitle: 'Vehicle History & Journey Timeline',

    showingEntries: (start, end, total) => `Showing ${start} to ${end} of ${total} entries`,
    rowsPerPage: 'Rows per page:',
    prevPage: 'Previous',
    nextPage: 'Next',
    page: 'Page',
    of: 'of',
    noDataAvailable: 'No records available',

    loginTitle: 'Nassor Salum Abdallah',
    loginSubtitle: 'Motorcycle Dealership Network Management System',
    tabOwner: 'Dealer',
    tabBranch: 'Branch Manager',
    phoneOrEmailLabel: 'Phone Number or Email:',
    branchCodeLabel: 'Branch Code:',
    passwordLabel: 'Password:',
    demoHint: 'Sign in using Dealer Phone Number or Email',
    quickPickTitle: 'Quick select a branch for instant access:',
    demoPasswordNote: 'Default password for all accounts is 123456',
  },
};

export const formatVehicleColor = (color: string, language: Language): string => {
  if (!color) return '';
  const c = color.toLowerCase();
  if (language === 'sw') {
    if (c.includes('red') || c.includes('nyekundu')) return 'Nyekundu';
    if (c.includes('black') || c.includes('nyeusi')) return 'Nyeusi';
    if (c.includes('blue') || c.includes('bluu')) return 'Bluu';
    if (c.includes('green') || c.includes('kijani')) return 'Kijani';
    if (c.includes('silver') || c.includes('grey') || c.includes('gray') || c.includes('kijivu')) return 'Kijivu';
    if (c.includes('white') || c.includes('nyeupe')) return 'Nyeupe';
    if (c.includes('yellow') || c.includes('njano')) return 'Njano';
    return color.replace(/\s*\([^)]*\)/g, '').trim();
  } else {
    if (c.includes('red') || c.includes('nyekundu')) return 'Red';
    if (c.includes('black') || c.includes('nyeusi')) return 'Black';
    if (c.includes('blue') || c.includes('bluu')) return 'Blue';
    if (c.includes('green') || c.includes('kijani')) return 'Green';
    if (c.includes('silver') || c.includes('grey') || c.includes('gray') || c.includes('kijivu')) return 'Silver';
    if (c.includes('white') || c.includes('nyeupe')) return 'White';
    if (c.includes('yellow') || c.includes('njano')) return 'Yellow';
    const enMatch = color.match(/\(([^)]+)\)/);
    if (enMatch) return enMatch[1].trim();
    return color.trim();
  }
};

export const getExpenseCategoryLabel = (category: string, language: Language): string => {
  const isSw = language === 'sw';
  switch (category) {
    case 'USAFIRISHAJI':
      return isSw ? 'Usafirishaji na Bandari' : 'Transport & Port Logistics';
    case 'KODI_LESENI':
      return isSw ? 'Kodi na Leseni za Biashara' : 'Taxes & Business License';
    case 'UMEME_MAJI':
      return isSw ? 'LUKU, Maji na Intaneti' : 'Electricity, Water & Internet';
    case 'MISHAHARA_POSHO':
      return isSw ? 'Mishahara na Posho za Wafanyakazi' : 'Staff Salaries & Allowances';
    case 'MATENGENEZO':
      return isSw ? 'Matengenezo ya Stoo na Yard' : 'Maintenance & Facility Repairs';
    case 'MAFUTA_LOGISTICS':
      return isSw ? 'Mafuta ya Magari na Jenereta' : 'Fuel & Transportation';
    case 'MATANGAZO_MASOKO':
      return isSw ? 'Matangazo na Masoko' : 'Marketing & Advertisements';
    case 'CHAKULA_KINYWAJI':
      return isSw ? 'Chakula na Ustawi wa Wafanyakazi' : 'Staff Refreshments & Welfare';
    case 'VINGINEVYO':
      return isSw ? 'Gharama Nyinginezo za Uendeshaji' : 'Other Operating Expenses';
    default:
      return category;
  }
};

export const getPaymentMethodLabel = (method: string, language: Language): string => {
  const isSw = language === 'sw';
  switch (method) {
    case 'CASH':
      return isSw ? 'Pesa Taslimu' : 'Cash';
    case 'MOBILE_MONEY':
      return isSw ? 'Pesa ya Simu' : 'Mobile Money';
    case 'BANK_TRANSFER':
      return isSw ? 'Uhamisho wa Benki' : 'Bank Transfer';
    case 'INSTALLMENT':
      return isSw ? 'Malipo ya Awamu' : 'Installment';
    default:
      return method;
  }
};

