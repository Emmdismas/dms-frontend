import {
  Branch,
  Customer,
  Dealer,
  Expense,
  SaleRecord,
  StockTransfer,
  SupplierOrder,
  TeamMember,
  VehicleUnit,
} from '../types';
import { http } from './api';
import { dealerPricingService } from './dealerPricingService';

export interface BootstrapPayload {
  dealers: Dealer[];
  branches: Branch[];
  teamMembers: TeamMember[];
  units: VehicleUnit[];
  sales: SaleRecord[];
  customers: Customer[];
  transfers: StockTransfer[];
  orders: SupplierOrder[];
  expenses: Expense[];
}

export const dealerService = {
  async fetchBootstrap(): Promise<BootstrapPayload> {
    return http.get<BootstrapPayload>('/bootstrap');
  },

  async fetchDealers(): Promise<Dealer[]> {
    const res = await http.get<{ data: Dealer[] }>('/dealers');
    return res.data;
  },

  async fetchBranches(): Promise<Branch[]> {
    const res = await http.get<{ data: Branch[] }>('/branches');
    return res.data;
  },

  async addDealer(dealerData: {
    code: string;
    secondaryCode?: string;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    password?: string;
    status: 'Active' | 'Inactive';
    city: string;
    country: string;
    branchesCount?: number;
    notes?: string;
  }): Promise<Dealer> {
    const res = await http.post<{ data: Dealer }>('/dealers', {
      code: dealerData.code.trim().toUpperCase(),
      secondaryCode: dealerData.secondaryCode?.trim().toUpperCase() || null,
      name: dealerData.name.trim(),
      ownerName: dealerData.ownerName.trim(),
      email: dealerData.email.trim().toLowerCase(),
      phone: dealerData.phone.trim(),
      password: dealerData.password?.trim() || 'ChangeMe@2026',
      status: dealerData.status,
      city: dealerData.city.trim() || 'Dar Es Salaam',
      country: dealerData.country.trim() || 'Tanzania',
      notes: dealerData.notes || '',
    });

    try {
      dealerPricingService.createBaselineCatalog(res.data.code);
      dealerPricingService.getDealerModels(res.data.code);
    } catch {
      // ignore local catalog init error
    }

    return res.data;
  },

  async updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer> {
    const res = await http.put<{ data: Dealer }>(`/dealers/${id}`, updates);
    return res.data;
  },

  async toggleDealerStatus(id: string): Promise<{ dealer: Dealer; newStatus: 'Active' | 'Inactive' }> {
    const res = await http.post<{ data: Dealer; newStatus: 'Active' | 'Inactive' }>(`/dealers/${id}/toggle-status`);
    return { dealer: res.data, newStatus: res.newStatus };
  },

  async resetDealerPassword(id: string, newPassword: string): Promise<void> {
    await http.post(`/dealers/${id}/reset-password`, { password: newPassword.trim() });
  },

  async deleteDealer(id: string): Promise<void> {
    await http.delete(`/dealers/${id}`);
  },

  async receiveStock(units: Partial<VehicleUnit>[], supplier?: string): Promise<{ units: VehicleUnit[]; order: SupplierOrder }> {
    return http.post<{ units: VehicleUnit[]; order: SupplierOrder }>('/inventory/receive', {
      units,
      supplier,
    });
  },

  async recordSale(payload: {
    unitId: string;
    customerName: string;
    customerPhone: string;
    customerNida?: string;
    customerLocation?: string;
    salespersonName?: string;
    amount: number;
    costPrice?: number;
    unitPrice?: number;
    amountPaid?: number;
    remainedAmount?: number;
    paymentStatus?: string;
    paymentMethod: string;
    paymentRef?: string;
    deliveryType?: string;
    pickupDate?: string;
    notes?: string;
  }): Promise<{ sale: SaleRecord; unit: VehicleUnit; customer: Customer }> {
    return http.post<{ sale: SaleRecord; unit: VehicleUnit; customer: Customer }>('/sales', payload);
  },

  async releaseUnit(unitId: string): Promise<{ unit: VehicleUnit; sale: SaleRecord | null }> {
    return http.post<{ unit: VehicleUnit; sale: SaleRecord | null }>(`/units/${encodeURIComponent(unitId)}/release`);
  },

  async createTransfer(payload: {
    unitId: string;
    toBranchId: string;
    notes?: string;
  }): Promise<{ transfer: StockTransfer; unit: VehicleUnit }> {
    return http.post<{ transfer: StockTransfer; unit: VehicleUnit }>('/transfers', payload);
  },

  async createCustomer(payload: {
    name: string;
    phone: string;
    nidaNumber?: string;
    location?: string;
    branchId?: string;
  }): Promise<Customer> {
    const res = await http.post<{ data: Customer }>('/customers', payload);
    return res.data;
  },

  async createExpense(payload: {
    date?: string;
    category: string;
    categoryLabel: string;
    amount: number;
    branchId: string;
    description: string;
    receiptNumber?: string;
    paymentMethod: string;
    notes?: string;
  }): Promise<Expense> {
    const res = await http.post<{ data: Expense }>('/expenses', payload);
    return res.data;
  },
};
