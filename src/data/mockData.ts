import {
  Dealer,
  Branch,
  VehicleModel,
  VehicleUnit,
  Customer,
  SaleRecord,
  StockTransfer,
  SupplierOrder,
  TeamMember,
  Expense,
} from '../types';
import { vehicleModelCatalog } from './catalog';

/**
 * Default dealer profile metadata (used as fallback label when no dealer is active).
 * All operational datasets come live from PostgreSQL via /api/v1.
 */
export const DEALER_INFO = {
  code: 'C-DAR-N00988',
  secondaryCode: 'C-DAR-N01042',
  name: 'Nassor Salum Abdallah',
  type: 'Units Mbo & Parts Dealer',
  country: 'Tanzania',
  phone: '255713759553',
  email: 'owner@nassor.co.tz',
};

export const mockVehicleModels: VehicleModel[] = vehicleModelCatalog;

// Empty arrays — no demo/mock records in production app
export const mockDealers: Dealer[] = [];
export const mockBranches: Branch[] = [];
export const mockCustomers: Customer[] = [];
export const mockVehicleUnits: VehicleUnit[] = [];
export const mockSalesRecords: SaleRecord[] = [];
export const mockStockTransfers: StockTransfer[] = [];
export const mockSupplierOrders: SupplierOrder[] = [];
export const mockTeamMembers: TeamMember[] = [];
export const mockExpenses: Expense[] = [];
