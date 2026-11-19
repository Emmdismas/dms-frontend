import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AuthUser,
  Dealer, 
  Branch, 
  VehicleUnit, 
  SaleRecord, 
  SupplierOrder, 
  StockTransfer, 
  Expense, 
  Customer, 
  TeamMember,
  NavTab
} from './types';
import { dealerService } from './services/dealerService';
import { authService } from './services/authService';
import { dealerPricingService } from './services/dealerPricingService';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';

// Views
import { DashboardView } from './views/DashboardView';
import { DealersView } from './views/DealersView';
import { BranchesView } from './views/BranchesView';
import { BranchDetailView } from './views/BranchDetailView';
import { InventoryView } from './views/InventoryView';
import { ReceiveStockView } from './views/ReceiveStockView';
import { SalesView } from './views/SalesView';
import { PricingView } from './views/PricingView';
import { ExpensesView } from './views/ExpensesView';
import { TransfersView } from './views/TransfersView';
import { OrdersView } from './views/OrdersView';
import { CustomersView } from './views/CustomersView';
import { ReportsView } from './views/ReportsView';
import { TeamView } from './views/TeamView';
import { SettingsView } from './views/SettingsView';

// Modals
import { RecordSaleModal } from './components/modals/RecordSaleModal';
import { ReceiveStockModal } from './components/modals/ReceiveStockModal';
import { TransferModal } from './components/modals/TransferModal';
import { AddCustomerModal } from './components/modals/AddCustomerModal';
import { VehicleDetailModal } from './components/modals/VehicleDetailModal';
import { SaleReceiptModal } from './components/modals/SaleReceiptModal';

import { Language } from './i18n/translations';

interface AuthenticatedAppProps {
  currentUser: AuthUser;
  setCurrentUser: (user: AuthUser | null) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({
  currentUser,
  setCurrentUser,
  onLogout,
  isDarkMode,
  onToggleTheme,
  language,
  onToggleLanguage,
}) => {
  // Live Backend-Connected State
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [units, setUnits] = useState<VehicleUnit[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [, setPricingVersion] = useState<number>(0);

  const refreshWorkspace = useCallback(async () => {
    try {
      const payload = await dealerService.fetchBootstrap();
      setDealers(payload.dealers || []);
      setBranches(payload.branches || []);
      setTeamMembers(payload.teamMembers || []);
      setUnits(payload.units || []);
      setSales(payload.sales || []);
      setCustomers(payload.customers || []);
      setTransfers(payload.transfers || []);
      setOrders(payload.orders || []);
      setExpenses(payload.expenses || []);
    } catch {
      // ignore network error on initial load
    }
  }, []);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace, currentUser.id, currentUser.dealerCode]);

  const handleRefreshDealers = () => {
    void refreshWorkspace();
  };

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isWideScreen, setIsWideScreen] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PWA Install Prompt State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallPrompt(null);
        }
      } catch {
        // ignore
      }
    } else {
      alert(
        language === 'sw'
          ? 'Ili kusakinisha kama App kwenye kifaa chako:\n\n1. Kwenye Android/Chrome/Edge: Bonyeza alama ya mistari mitatu (⋮) juu kulia au alama ya (⊕) kwenye bar ya browser kisha chagua "Install DMS app" au "Add to Home screen".\n2. Kwenye iPhone (Safari): Bonyeza kitufe cha Share (⎋) chini kisha chagua "Add to Home Screen".'
          : 'To install as an App on your device:\n\n1. In Chrome/Edge: Click (⋮) or the Install (⊕) icon in the browser address bar and select "Install app" or "Add to Home screen".\n2. On iPhone (Safari): Tap Share (⎋) and select "Add to Home Screen".'
      );
    }
  };

  // Modal States
  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferPreselectedUnitId, setTransferPreselectedUnitId] = useState<string | undefined>(undefined);
  const [isReceiveStockModalOpen, setIsReceiveStockModalOpen] = useState<boolean>(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState<boolean>(false);
  
  // Detail & Receipt Modals
  const [activeVehicleDetailUnit, setActiveVehicleDetailUnit] = useState<VehicleUnit | null>(null);
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleRecord | null>(null);

  // Keyboard shortcut ESC to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImpersonateDealer = (dealer: Dealer) => {
    const impUser = authService.impersonateDealer(dealer);
    setCurrentUser(impUser);
    setCurrentTab('dashboard');
    setSelectedBranch(null);
    void refreshWorkspace();
  };

  const handleRevertToSuperAdmin = () => {
    const adminUser = authService.revertToSuperAdmin();
    setCurrentUser(adminUser);
    setCurrentTab('dealers');
    setSelectedBranch(null);
    void refreshWorkspace();
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setSelectedBranch(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Connected Flow: Complete Sale
  const handleSaleCompleted = (newSale: SaleRecord, updatedUnit: VehicleUnit) => {
    void (async () => {
      try {
        const res = await dealerService.recordSale({
          unitId: updatedUnit.id,
          customerName: newSale.customerName,
          customerPhone: newSale.customerPhone,
          salespersonName: newSale.salespersonName,
          amount: newSale.amount,
          costPrice: newSale.costPrice,
          unitPrice: newSale.unitPrice,
          amountPaid: newSale.amountPaid,
          remainedAmount: newSale.remainedAmount,
          paymentStatus: newSale.paymentStatus,
          paymentMethod: newSale.paymentMethod,
          paymentRef: newSale.paymentRef,
          deliveryType: newSale.deliveryType,
          pickupDate: newSale.pickupDate,
          notes: newSale.notes,
        });
        setSales((prev) => [res.sale, ...prev]);
        setUnits((prev) => prev.map((u) => (u.id === res.unit.id ? res.unit : u)));
        await refreshWorkspace();
      } catch {
        setSales((prev) => [newSale, ...prev]);
        setUnits((prev) => prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u)));
      }
    })();
  };

  // Connected Flow: Complete Stock Transfer
  const handleTransferCompleted = (
    newTransfer: StockTransfer,
    updatedUnits: VehicleUnit[]
  ) => {
    void (async () => {
      try {
        const unitIdsToTransfer = newTransfer.unitIds?.length
          ? newTransfer.unitIds
          : updatedUnits.map((u) => u.id);

        for (const uId of unitIdsToTransfer) {
          await dealerService.createTransfer({
            unitId: uId,
            toBranchId: newTransfer.toBranchId,
            notes: newTransfer.notes,
          });
        }
        await refreshWorkspace();
      } catch {
        setTransfers((prev) => [newTransfer, ...prev]);
        const updatedMap = new Map(updatedUnits.map((u) => [u.id, u]));
        setUnits((prev) => prev.map((u) => updatedMap.get(u.id) || u));
      }
    })();
  };

  // Connected Flow: Release Sold Unit to Customer
  const handleReleaseUnit = (targetUnit: VehicleUnit) => {
    void (async () => {
      try {
        const res = await dealerService.releaseUnit(targetUnit.id);
        setUnits((prev) => prev.map((u) => (u.id === res.unit.id ? res.unit : u)));
        if (res.sale) {
          setSales((prev) => prev.map((s) => (s.id === res.sale!.id ? res.sale! : s)));
        }
        if (activeVehicleDetailUnit?.id === targetUnit.id) {
          setActiveVehicleDetailUnit(res.unit);
        }
        await refreshWorkspace();
      } catch {
        // ignore
      }
    })();
  };

  const handleReleaseSaleUnit = (sale: SaleRecord) => {
    const matchingUnit = units.find((u) => u.id === sale.unitId || u.chassisNumber === sale.chassisNumber);
    if (matchingUnit) {
      handleReleaseUnit(matchingUnit);
    } else if (sale.unitId) {
      void dealerService.releaseUnit(sale.unitId).then(() => refreshWorkspace());
    }
  };

  // Connected Flow: Receive Stock into Inventory
  const handleStockReceived = (newUnits: VehicleUnit[]) => {
    void (async () => {
      try {
        const res = await dealerService.receiveStock(newUnits);
        setUnits((prev) => [...res.units, ...prev]);
        setOrders((prev) => [res.order, ...prev]);
        await refreshWorkspace();
      } catch {
        setUnits((prev) => [...newUnits, ...prev]);
      }
    })();
  };

  // Connected Flow: Add Customer
  const handleAddCustomer = (newCustomer: Customer) => {
    void (async () => {
      try {
        const saved = await dealerService.createCustomer({
          name: newCustomer.name,
          phone: newCustomer.phone,
          nidaNumber: newCustomer.nidaNumber,
          location: newCustomer.location,
          branchId: newCustomer.branchId,
        });
        setCustomers((prev) => [saved, ...prev]);
      } catch {
        setCustomers((prev) => [newCustomer, ...prev]);
      }
    })();
  };

  const handleAddTeamMember = async (input: import('./services/authService').CreateTeamMemberInput) => {
    const created = await authService.createTeamMember(input);
    setTeamMembers((prev) => [created, ...prev]);
  };

  // Connected Flow: Update Model Price (Per-Dealer Isolated Pricing)
  const handleUpdateModelPrice = (
    modelId: string, 
    newBuyingPrice: number, 
    newSellingPrice: number, 
    startDate?: string, 
    endDate?: string,
    targetDealerCode?: string
  ) => {
    const code = targetDealerCode || currentUser.dealerCode || 'C-DAR-N00988';
    dealerPricingService.updateDealerModelPrice(
      code,
      modelId,
      newBuyingPrice,
      newSellingPrice,
      startDate,
      endDate,
      currentUser.name || 'Msimamizi Mkuu'
    );
    setPricingVersion((v) => v + 1);
  };

  // Connected Flow: Add Business Expense
  const handleAddExpense = (newExpense: Expense) => {
    void (async () => {
      try {
        const saved = await dealerService.createExpense({
          date: newExpense.date,
          category: newExpense.category,
          categoryLabel: newExpense.categoryLabel,
          amount: newExpense.amount,
          branchId: newExpense.branchId,
          description: newExpense.description,
          receiptNumber: newExpense.receiptNumber,
          paymentMethod: newExpense.paymentMethod,
          notes: newExpense.notes,
        });
        setExpenses((prev) => [saved, ...prev]);
      } catch {
        setExpenses((prev) => [newExpense, ...prev]);
      }
    })();
  };

  // User authorization checks
  const isSystemAdmin = 
    (currentUser.role === 'super_admin' || currentUser.role === 'admin') && 
    !currentUser.isSuperAdminImpersonating;

  const isOwner = currentUser.role === 'dealer' || currentUser.role === 'owner';
  const currentDealerCode = currentUser.dealerCode || 'C-DAR-N00988';
  const userBranchCode = currentUser.branchCode?.toUpperCase().trim();
  const userBranchName = currentUser.branchName?.toLowerCase().trim();

  // Dynamic models for current dealer (per-dealer isolated catalog)
  const scopedModels = isSystemAdmin 
    ? dealerPricingService.getDealerModels('C-DAR-N00988')
    : dealerPricingService.getDealerModels(currentDealerCode);

  // 1. Dealership branches (all branches belonging to the user's dealership)
  const dealerBranches = useMemo(() => {
    if (isSystemAdmin) return branches;
    return branches.filter((b) => {
      const curDealer = currentDealerCode.toUpperCase().trim();
      const bDealer = (b.dealerCode || '').toUpperCase().trim();
      const bCode = (b.code || '').toUpperCase().trim();
      return bDealer === curDealer || bCode.startsWith(curDealer);
    });
  }, [branches, isSystemAdmin, currentDealerCode]);

  // 2. Active scoped branches
  const scopedBranches = useMemo(() => {
    if (isSystemAdmin) return branches;
    if (isOwner) return dealerBranches;

    const matched = dealerBranches.filter((b) => {
      if (userBranchCode && (b.code.toUpperCase() === userBranchCode || b.id.toUpperCase() === userBranchCode)) return true;
      if (userBranchName && (b.name.toLowerCase().includes(userBranchName) || userBranchName.includes(b.name.toLowerCase()))) return true;
      return false;
    });
    return matched.length > 0 ? matched : dealerBranches.slice(0, 1);
  }, [branches, isSystemAdmin, isOwner, dealerBranches, userBranchCode, userBranchName]);

  const scopedBranchIds = useMemo(() => new Set(scopedBranches.map((b) => b.id)), [scopedBranches]);
  const scopedBranchCodes = useMemo(() => new Set(scopedBranches.map((b) => b.code.toUpperCase())), [scopedBranches]);
  const scopedBranchNames = useMemo(() => new Set(scopedBranches.map((b) => b.name.toLowerCase())), [scopedBranches]);

  // Dealership sets for owner-level queries
  const dealerBranchIds = useMemo(() => new Set(dealerBranches.map((b) => b.id)), [dealerBranches]);
  const dealerBranchCodes = useMemo(() => new Set(dealerBranches.map((b) => b.code.toUpperCase())), [dealerBranches]);
  const dealerBranchNames = useMemo(() => new Set(dealerBranches.map((b) => b.name.toLowerCase())), [dealerBranches]);

  const scopedUnits = useMemo(() => {
    if (isSystemAdmin) return units;
    const curDealer = currentDealerCode.toUpperCase().trim();

    return units.filter((u) => {
      const uDealer = (u.dealerCode || '').toUpperCase().trim();
      const uBranchCode = (u.branchCode || '').toUpperCase().trim();

      if (isOwner) {
        if (uDealer && uDealer === curDealer) return true;
        if (uBranchCode && (dealerBranchCodes.has(uBranchCode) || uBranchCode.startsWith(curDealer))) return true;
        if (u.branchId && dealerBranchIds.has(u.branchId)) return true;
        return false;
      }

      if (u.branchId && scopedBranchIds.has(u.branchId)) return true;
      if (uBranchCode && scopedBranchCodes.has(uBranchCode)) return true;
      return false;
    });
  }, [units, isSystemAdmin, isOwner, currentDealerCode, dealerBranchCodes, dealerBranchIds, scopedBranchCodes, scopedBranchIds]);

  const scopedSales = useMemo(() => {
    if (isSystemAdmin) return sales;
    const curDealer = currentDealerCode.toUpperCase().trim();

    return sales.filter((s) => {
      const sDealer = (s.dealerCode || '').toUpperCase().trim();
      const sBranchCode = (s.branchCode || '').toUpperCase().trim();

      if (isOwner) {
        if (sDealer && sDealer === curDealer) return true;
        if (sBranchCode && (dealerBranchCodes.has(sBranchCode) || sBranchCode.startsWith(curDealer))) return true;
        if (s.branchId && dealerBranchIds.has(s.branchId)) return true;
        return false;
      }

      if (s.branchId && scopedBranchIds.has(s.branchId)) return true;
      if (sBranchCode && scopedBranchCodes.has(sBranchCode)) return true;
      return false;
    });
  }, [sales, isSystemAdmin, isOwner, currentDealerCode, dealerBranchCodes, dealerBranchIds, scopedBranchCodes, scopedBranchIds]);

  const scopedExpenses = useMemo(() => {
    if (isSystemAdmin) return expenses;
    const curDealer = currentDealerCode.toUpperCase().trim();

    return expenses.filter((e) => {
      if (isOwner) {
        if (e.branchId && dealerBranchIds.has(e.branchId)) return true;
        if (e.dealerCode && e.dealerCode.toUpperCase() === curDealer) return true;
        return false;
      }

      return e.branchId && scopedBranchIds.has(e.branchId);
    });
  }, [expenses, isSystemAdmin, isOwner, currentDealerCode, dealerBranchIds, scopedBranchIds]);

  const scopedCustomers = useMemo(() => {
    if (isSystemAdmin) return customers;
    if (isOwner) {
      return customers.filter((c) => c.branchId && dealerBranchIds.has(c.branchId));
    }
    return customers.filter((c) => c.branchId && scopedBranchIds.has(c.branchId));
  }, [customers, isSystemAdmin, isOwner, dealerBranchIds, scopedBranchIds]);

  const scopedTransfers = useMemo(() => {
    if (isSystemAdmin) return transfers;
    if (isOwner) {
      return transfers.filter((t) => dealerBranchIds.has(t.fromBranchId) || dealerBranchIds.has(t.toBranchId));
    }
    return transfers.filter((t) => scopedBranchIds.has(t.fromBranchId) || scopedBranchIds.has(t.toBranchId));
  }, [transfers, isSystemAdmin, isOwner, dealerBranchIds, scopedBranchIds]);

  const scopedOrders = useMemo(() => {
    if (isSystemAdmin) return orders;
    return orders.filter((o) => {
      if (o.dealerCode && o.dealerCode.toUpperCase() === currentDealerCode.toUpperCase()) return true;
      if (!o.dealerCode && currentDealerCode === 'C-DAR-N00988') return true;
      return false;
    });
  }, [orders, isSystemAdmin, currentDealerCode]);

  const scopedTeamMembers = useMemo(() => {
    const internalMembers = teamMembers.filter((m) => {
      const r = m.role.toLowerCase();
      return !r.includes('owner') && !r.includes('mkurugenzi') && !r.includes('mmiliki');
    });

    if (isSystemAdmin) return internalMembers;
    const curDealer = currentDealerCode.toUpperCase().trim();

    return internalMembers.filter((m) => {
      if (isOwner) {
        if (m.dealerCode && m.dealerCode.toUpperCase() === curDealer) return true;
        if (m.branchName && dealerBranchNames.has(m.branchName.toLowerCase())) return true;
        return false;
      }
      return m.branchName && scopedBranchNames.has(m.branchName.toLowerCase());
    });
  }, [teamMembers, isSystemAdmin, isOwner, currentDealerCode, dealerBranchNames, scopedBranchNames]);

  const scopedDealers = useMemo(() => {
    if (isSystemAdmin) return dealers;
    return dealers.filter((d) => d.code.toUpperCase() === currentDealerCode.toUpperCase());
  }, [dealers, isSystemAdmin, currentDealerCode]);

  const totalInStockCount = scopedUnits.filter((u) => u.status === 'IN STOCK').length;

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors duration-200 ${
      isDarkMode ? 'bg-[#090D16] text-slate-100' : 'bg-[#f7f9fb] text-[#191c1e]'
    }`}>
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenRecordSaleModal={() => setIsRecordSaleModalOpen(true)}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        totalInStockCount={totalInStockCount}
        language={language}
      />

      {/* Main App Container that shifts smoothly with the sidebar */}
      <div 
        className="flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isSidebarOpen && isWideScreen ? '280px' : '0px',
        }}
      >
        {/* Sticky Header with Search & Mode Switch */}
        <Header
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          currentUser={currentUser}
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          language={language}
          onToggleLanguage={onToggleLanguage}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Super Admin Impersonation Notice Bar */}
        {currentUser.isSuperAdminImpersonating && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold shadow-md z-20 sticky top-[57px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg animate-pulse">visibility</span>
              <span>
                {language === 'sw'
                  ? `Uko kwenye akaunti ya Dealer: ${currentUser.dealerName} (${currentUser.name}) kama Super Admin.`
                  : `Currently inspecting Dealer: ${currentUser.dealerName} (${currentUser.name}) as Super Admin.`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRevertToSuperAdmin}
              className="px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>{language === 'sw' ? 'Rudi Super Admin' : 'Return to Super Admin'}</span>
            </button>
          </div>
        )}

        {/* Dynamic Main View Body */}
        <main className="flex-1 pb-24 lg:pb-16 px-3 sm:px-6 lg:px-8 pt-4 w-full">
          {selectedBranch ? (
            <BranchDetailView
              branch={selectedBranch}
              units={scopedUnits}
              sales={scopedSales}
              currentUser={currentUser}
              onBack={() => setSelectedBranch(null)}
              onOpenUnitDetail={(u) => setActiveVehicleDetailUnit(u)}
              onOpenRecordSaleModal={() => setIsRecordSaleModalOpen(true)}
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
              isDarkMode={isDarkMode}
              language={language}
            />
          ) : (
            <>
              {currentTab === 'dealers' && (
                <DealersView
                  dealers={dealers}
                  units={units}
                  sales={sales}
                  branches={branches}
                  teamMembers={teamMembers}
                  onRefreshDealers={handleRefreshDealers}
                  onImpersonateDealer={handleImpersonateDealer}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'dashboard' && (
                <DashboardView
                  onSelectTab={handleSelectTab}
                  branches={scopedBranches}
                  dealers={scopedDealers}
                  units={scopedUnits}
                  sales={scopedSales}
                  orders={scopedOrders}
                  expenses={scopedExpenses}
                  models={scopedModels}
                  currentUser={currentUser}
                  onOpenRecordSaleModal={() => setIsRecordSaleModalOpen(true)}
                  onOpenReceiveStockModal={() => setCurrentTab('receive-stock')}
                  onOpenUnitDetail={(u) => setActiveVehicleDetailUnit(u)}
                  onOpenReceipt={(s) => setActiveReceiptSale(s)}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'pricing' && (
                <PricingView
                  models={scopedModels}
                  dealers={scopedDealers}
                  currentUser={currentUser}
                  onUpdateModelPrice={handleUpdateModelPrice}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'expenses' && (
                <ExpensesView
                  expenses={scopedExpenses}
                  branches={scopedBranches}
                  currentUser={currentUser}
                  onAddExpense={handleAddExpense}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'branches' && (
                <BranchesView
                  branches={scopedBranches}
                  units={scopedUnits}
                  sales={scopedSales}
                  currentUser={currentUser}
                  onSelectBranchDetail={(b) => setSelectedBranch(b)}
                  onOpenRecordSaleModal={() => setIsRecordSaleModalOpen(true)}
                  onOpenTransferModal={() => setIsTransferModalOpen(true)}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'inventory' && (
                <InventoryView
                  units={scopedUnits}
                  branches={scopedBranches}
                  models={scopedModels}
                  currentUser={currentUser}
                  onOpenUnitDetail={(u) => setActiveVehicleDetailUnit(u)}
                  onOpenReceiveStockModal={() => setCurrentTab('receive-stock')}
                  onOpenRecordSaleModal={() => setIsRecordSaleModalOpen(true)}
                  onOpenTransferModal={(uId) => {
                    setTransferPreselectedUnitId(uId);
                    setIsTransferModalOpen(true);
                  }}
                  onReleaseUnit={handleReleaseUnit}
                  searchQuery={searchQuery}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'receive-stock' && (
                <ReceiveStockView
                  models={scopedModels}
                  branches={scopedBranches}
                  currentUser={currentUser}
                  onStockReceived={handleStockReceived}
                  onBack={() => setCurrentTab('inventory')}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'sales' && (
                <SalesView
                  sales={scopedSales}
                  branches={scopedBranches}
                  dealers={scopedDealers}
                  models={scopedModels}
                  currentUser={currentUser}
                  onOpenRecordSaleModal={() => setIsRecordSaleModalOpen(true)}
                  onOpenReceipt={(s) => setActiveReceiptSale(s)}
                  onReleaseSaleUnit={handleReleaseSaleUnit}
                  isDarkMode={isDarkMode}
                  searchQuery={searchQuery}
                  language={language}
                />
              )}

              {currentTab === 'transfers' && (
                <TransfersView
                  transfers={scopedTransfers}
                  branches={isSystemAdmin ? branches : dealerBranches}
                  currentUser={currentUser}
                  onOpenTransferModal={() => {
                    setTransferPreselectedUnitId(undefined);
                    setIsTransferModalOpen(true);
                  }}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'orders' && (
                <OrdersView
                  orders={scopedOrders}
                  currentUser={currentUser}
                  onOpenReceiveStockModal={() => setCurrentTab('receive-stock')}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'customers' && (
                <CustomersView
                  customers={scopedCustomers}
                  branches={scopedBranches}
                  currentUser={currentUser}
                  onOpenAddCustomerModal={() => setIsAddCustomerModalOpen(true)}
                  isDarkMode={isDarkMode}
                  searchQuery={searchQuery}
                  language={language}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  branches={scopedBranches}
                  sales={scopedSales}
                  units={scopedUnits}
                  currentUser={currentUser}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'team' && (
                <TeamView
                  teamMembers={scopedTeamMembers}
                  branches={scopedBranches}
                  currentUser={currentUser}
                  onAddTeamMember={handleAddTeamMember}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  isDarkMode={isDarkMode}
                  onToggleTheme={onToggleTheme}
                  language={language}
                  onChangeLanguage={(newLang) => {
                    localStorage.setItem('dealer_app_language', newLang);
                  }}
                  onLogout={onLogout}
                  onSelectTab={handleSelectTab}
                  onInstallPwa={handleInstallPwa}
                  canInstallPwa={Boolean(installPrompt)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenRecordSaleModal={() => setIsRecordSaleModalOpen(true)}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onOpenMoreMenu={() => setIsSidebarOpen(true)}
        language={language}
      />

      {/* MODALS */}
      <RecordSaleModal
        isOpen={isRecordSaleModalOpen}
        onClose={() => setIsRecordSaleModalOpen(false)}
        units={scopedUnits}
        models={scopedModels}
        customers={scopedCustomers}
        branches={scopedBranches}
        currentUser={currentUser}
        onSaleCompleted={handleSaleCompleted}
        language={language}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferPreselectedUnitId(undefined);
        }}
        units={scopedUnits}
        branches={isSystemAdmin ? branches : dealerBranches}
        currentUser={currentUser}
        onTransferCompleted={handleTransferCompleted}
        preselectedUnitId={transferPreselectedUnitId}
        language={language}
      />

      <ReceiveStockModal
        isOpen={isReceiveStockModalOpen}
        onClose={() => setIsReceiveStockModalOpen(false)}
        models={scopedModels}
        branches={scopedBranches}
        currentUser={currentUser}
        onStockReceived={handleStockReceived}
        language={language}
      />

      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        branches={scopedBranches}
        currentUser={currentUser}
        onAddCustomer={handleAddCustomer}
        language={language}
      />

      <VehicleDetailModal
        isOpen={!!activeVehicleDetailUnit}
        onClose={() => setActiveVehicleDetailUnit(null)}
        unit={activeVehicleDetailUnit}
        onInitiateSale={() => {
          setIsRecordSaleModalOpen(true);
        }}
        onInitiateTransfer={(u) => {
          setTransferPreselectedUnitId(u.id);
          setIsTransferModalOpen(true);
        }}
        onReleaseVehicle={handleReleaseUnit}
        language={language}
      />

      <SaleReceiptModal
        isOpen={!!activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
        sale={activeReceiptSale}
        language={language}
      />
    </div>
  );
};
