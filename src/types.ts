export type { Language } from './i18n/translations';

export type UserRole = 'super_admin' | 'dealer' | 'owner' | 'branch_manager' | 'admin' | 'storekeeper' | 'sales_person';

export type NavTab = 
  | 'dealers'
  | 'dashboard' 
  | 'branches' 
  | 'inventory' 
  | 'sales' 
  | 'pricing'
  | 'expenses'
  | 'orders' 
  | 'customers' 
  | 'transfers' 
  | 'reports' 
  | 'team' 
  | 'settings'
  | 'receive-stock';

export interface Dealer {
  id: string;
  code: string; // e.g. C-DAR-N00988
  secondaryCode?: string;
  name: string; // Dealership Name
  ownerName: string; // Owner Name
  email: string;
  phone: string;
  password?: string;
  status: 'Active' | 'Inactive';
  city: string;
  region?: string;
  country: string;
  branchesCount: number;
  totalVehicles: number;
  totalSalesRevenueTZS: number;
  joinedDate: string;
  notes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  dealerCode: string;
  dealerName: string;
  branchCode?: string;
  branchName?: string;
  branchLocation?: string;
  avatarUrl?: string;
  isSuperAdminImpersonating?: boolean;
  impersonatingDealer?: Dealer;
}

export interface Branch {
  id: string;
  code: string; // e.g. C-DAR-N00988-0001
  name: string;
  location: string;
  zone: string;
  region: string;
  phone: string;
  contactPerson: string;
  status: 'Active' | 'Inactive';
  totalUnitsInStock: number;
  mtdUnitsSold: number;
  mtdRevenueTZS: number;
  managerName: string;
  dealerCode?: string;
  dealerName?: string;
}

export type VehicleType = '2W' | '3W';

export interface PriceHistoryEntry {
  id: string;
  buyingPrice: number;
  startDate: string;
  endDate: string;
  updatedAt: string;
  updatedBy?: string;
  notes?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'UPCOMING';
}

export interface VehicleModel {
  id: string;
  name: string;
  type: VehicleType;
  brand: 'TVS' | 'Bajaj' | 'Honda' | string;
  buyingPrice: number; // Cost Price / Bei ya Kununulia Kiwandani
  defaultPrice: number; // Recommended Base Price / Bei Elekezi ya Kuuzia
  engineCapacity: string;
  inStockCount: number;
  startDate?: string; // Effective Start Date
  endDate?: string;   // Effective End Date
  lastUpdated?: string;
  priceHistory?: PriceHistoryEntry[];
}

export type UnitStatus = 'IN STOCK' | 'RESERVED' | 'TRANSFERRED' | 'SOLD' | 'DAMAGED' | 'RETURNED';

export interface VehicleJourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  branch: string;
  actor: string;
  type: 'received' | 'assigned' | 'transferred' | 'reserved' | 'sold' | 'service';
}

export interface VehicleUnit {
  id: string; // UNIT-000101
  chassisNumber: string; // e.g. MD625AR34P8812301
  engineNumber: string; // e.g. ENG-AF992011
  modelId: string;
  modelName: string;
  vehicleType: VehicleType;
  color: string;
  branchId: string;
  branchCode: string;
  branchName: string;
  status: UnitStatus;
  receivedDate: string;
  stockAgeDays: number;
  costPrice?: number; // Cost price recorded at time of receiving stock
  price: number; // Selling retail price
  qrCodeUrl?: string;
  journey: VehicleJourneyEvent[];
  soldToCustomerName?: string;
  soldDate?: string;
  soldAmount?: number;
  // Delivery & Reservation workflow
  deliveryType?: 'IMMEDIATE' | 'SCHEDULED';
  pickupDate?: string;
  deliveryStatus?: 'PENDING_PICKUP' | 'RELEASED';
  reservedCustomerName?: string;
  reservedCustomerPhone?: string;
  reservedDate?: string;
  releasedDate?: string;
  releasedBy?: string;
  dealerCode?: string;
  dealerName?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  nidaNumber: string;
  location: string;
  branchId: string;
  dealerCode?: string;
  dealerName?: string;
  totalPurchases: number;
  lastPurchaseDate: string;
}

export type PaymentMethod = 'CASH' | 'INSTALLMENT' | 'BANK_TRANSFER' | 'MOBILE_MONEY';

export type PaymentStatus = 'PAID' | 'PARTIAL';

export interface SaleRecord {
  id: string;
  receiptNumber: string;
  date: string;
  unitId: string;
  chassisNumber: string;
  engineNumber: string;
  modelName: string;
  vehicleType: VehicleType;
  branchId: string;
  branchName: string;
  branchCode: string;
  dealerCode?: string;
  dealerName?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  salespersonName: string;
  amount: number;
  costPrice?: number;
  unitPrice?: number;
  amountPaid?: number;
  remainedAmount?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  notes?: string;
  // Delivery & Reservation fields
  deliveryType?: 'IMMEDIATE' | 'SCHEDULED';
  pickupDate?: string;
  deliveryStatus?: 'PENDING_PICKUP' | 'RELEASED';
  releasedDate?: string;
  releasedBy?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  unitIds: string[];
  chassisList: string[];
  modelName: string;
  vehicleType: VehicleType;
  status: 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  initiatedBy: string;
  notes?: string;
  dealerCode?: string;
  dealerName?: string;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  qty2W: number;
  qty3W: number;
  totalUnits: number;
  status: 'ORDERED' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  totalAmountTZS: number;
  dealerCode?: string;
  dealerName?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  branchName: string;
  dealerCode?: string;
  dealerName?: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  mtdSalesCount?: number;
  avatarUrl?: string;
}

export type ExpenseCategory = 
  | 'USAFIRISHAJI' // Logistics & Transport (Mzigo toka bandarini / viwandani)
  | 'KODI_LESENI' // Taxes, Business License / TRA / Halmashauri
  | 'UMEME_MAJI' // Utilities (LUKU, Maji, Internet)
  | 'MISHAHARA_POSHO' // Staff Salaries, Commission & Allowances
  | 'MATENGENEZO' // Maintenance & Yard Repairs
  | 'MAFUTA_LOGISTICS' // Fuel & Vehicle Operation
  | 'MATANGAZO_MASOKO' // Marketing & Promotions
  | 'CHAKULA_KINYWAJI' // Staff Welfare & Refreshments
  | 'VINGINEVYO'; // Other Operating Costs

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: ExpenseCategory;
  categoryLabel: string;
  amount: number;
  branchId: string;
  branchName: string;
  branchCode?: string;
  description: string; // Summary of what the money was spent on
  recordedBy: string;
  receiptNumber?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  dealerCode?: string;
  dealerName?: string;
}
