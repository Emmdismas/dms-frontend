import React, { useState } from 'react';
import { VehicleModel, AuthUser, PriceHistoryEntry, Dealer } from '../types';
import { Language, translations } from '../i18n/translations';
import { dealerPricingService } from '../services/dealerPricingService';

interface PricingViewProps {
  models: VehicleModel[];
  dealers?: Dealer[];
  currentUser: AuthUser | null;
  onUpdateModelPrice: (
    modelId: string, 
    newBuyingPrice: number, 
    newSellingPrice: number, 
    startDate?: string, 
    endDate?: string,
    dealerCode?: string
  ) => void;
  isDarkMode: boolean;
  language: Language;
}

export const PricingView: React.FC<PricingViewProps> = ({
  models: initialModels,
  dealers = [],
  currentUser,
  onUpdateModelPrice,
  isDarkMode: _isDarkMode,
  language,
}) => {
  const _t = translations[language];
  const isSw = language === 'sw';
  const isSuperAdmin = currentUser?.role === 'super_admin' && !currentUser?.isSuperAdminImpersonating;
  const isOwner = currentUser?.role === 'dealer' || currentUser?.role === 'owner' || currentUser?.role === 'admin' || isSuperAdmin;

  // Selected Dealer for Super Admin
  const [selectedDealerCode, setSelectedDealerCode] = useState<string>(() => {
    if (isSuperAdmin && dealers && dealers.length > 0) {
      return dealers[0].code;
    }
    return currentUser?.dealerCode || 'C-DAR-N00988';
  });

  const activeDealerCode = isSuperAdmin
    ? selectedDealerCode
    : (currentUser?.dealerCode || 'C-DAR-N00988');

  const activeDealer = dealers.find((d) => d.code === activeDealerCode) || null;

  // Load effective models for the selected dealer (independent isolated pricing per dealer)
  const models = dealerPricingService.getDealerModels(activeDealerCode);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | '2W' | '3W'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // Modal State for Editing Price
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
  const [editBuyingPrice, setEditBuyingPrice] = useState<number>(0);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);
  const [editStartDate, setEditStartDate] = useState<string>('2026-01-01');
  const [editEndDate, setEditEndDate] = useState<string>('2026-12-31');
  const [priceSuccessMsg, setPriceSuccessMsg] = useState<string>('');

  // Modal State for Price Trend / History
  const [selectedTrendModel, setSelectedTrendModel] = useState<VehicleModel | null>(null);

  const handleOpenEdit = (model: VehicleModel) => {
    setEditingModel(model);
    setEditBuyingPrice(model.buyingPrice || Math.round(model.defaultPrice * 0.82));
    setEditSellingPrice(model.defaultPrice || 3500000);
    setEditStartDate(model.startDate || '2026-01-01');
    setEditEndDate(model.endDate || '2026-12-31');
    setPriceSuccessMsg('');
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    if (editBuyingPrice <= 0) {
      alert(isSw ? 'Tafadhali ingiza bei ya kununulia sahihi zaidi ya 0.' : 'Please enter a valid buying cost above 0.');
      return;
    }

    if (!editStartDate || !editEndDate) {
      alert(isSw ? 'Tafadhali weka tarehe ya kuanza na tarehe ya kuisha kwa bei hii.' : 'Please set start and end date for this price.');
      return;
    }

    onUpdateModelPrice(
      editingModel.id, 
      editBuyingPrice, 
      editSellingPrice, 
      editStartDate, 
      editEndDate, 
      activeDealerCode
    );
    setPriceSuccessMsg(isSw ? 'Bei ya Dealer imebadilishwa kikamilifu!' : 'Dealer price updated successfully!');
    setTimeout(() => {
      setEditingModel(null);
      setPriceSuccessMsg('');
    }, 700);
  };

  // Filtered Models
  const filteredModels = models.filter((m) => {
    if (selectedType !== 'ALL' && m.type !== selectedType) return false;
    if (selectedBrand !== 'ALL' && m.brand !== selectedBrand) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.engineCapacity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Analytics Metrics
  const totalStockCount = models.reduce((acc, m) => acc + (m.inStockCount || 0), 0);
  const totalCostValue = models.reduce(
    (acc, m) => acc + (m.buyingPrice || Math.round(m.defaultPrice * 0.82)) * (m.inStockCount || 0),
    0
  );

  // Helper to extract or fallback price history for trend view
  const getModelPriceHistory = (model: VehicleModel): PriceHistoryEntry[] => {
    if (model.priceHistory && model.priceHistory.length > 0) {
      return [...model.priceHistory].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }
    // Default mock history if none exists
    const currentCost = model.buyingPrice || Math.round(model.defaultPrice * 0.82);
    const prev1 = Math.round(currentCost * 0.93 / 10000) * 10000;
    const prev2 = Math.round(currentCost * 0.96 / 10000) * 10000;
    return [
      {
        id: `ph-${model.id}-1`,
        buyingPrice: prev1,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        updatedAt: '2025-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: isSw ? 'Bei ya mkataba 2025 H1' : 'Contract price 2025 H1',
      },
      {
        id: `ph-${model.id}-2`,
        buyingPrice: prev2,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        updatedAt: '2025-07-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: isSw ? 'Marekebisho ya nusu mwaka' : 'Mid-year cost adjustment',
      },
      {
        id: `ph-${model.id}-3`,
        buyingPrice: currentCost,
        startDate: model.startDate || '2026-01-01',
        endDate: model.endDate || '2026-12-31',
        updatedAt: model.lastUpdated || '2026-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'ACTIVE',
        notes: isSw ? 'Bei inayotumika sasa kiwandani' : 'Current active factory cost',
      },
    ];
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      
      {/* 0. SUPER ADMIN DEALER SELECTOR */}
      {isSuperAdmin && dealers && dealers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-[#006948] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">store</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {isSw ? 'Chagua Dealer kuona na kurekebisha bei zake binafsi:' : 'Select Dealer to manage custom price catalog:'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isSw 
                  ? `Sasa unarekebisha bei za ${activeDealer?.name || selectedDealerCode}. Mabadiliko hayataathiri madealer wengine.`
                  : `Currently managing prices for ${activeDealer?.name || selectedDealerCode}. Changes are completely isolated.`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedDealerCode}
              onChange={(e) => setSelectedDealerCode(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#006948] cursor-pointer shadow-xs min-w-[260px]"
            >
              {dealers.map((d) => (
                <option key={d.id} value={d.code}>
                  {d.name} ({d.code} • {d.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 1. EXECUTIVE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#00422c] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 ring-4 ring-emerald-500/10 shrink-0">
            <span className="material-symbols-outlined text-[26px]">price_change</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                {isSuperAdmin
                  ? (isSw ? `Orodha ya Bei: ${activeDealer?.name || selectedDealerCode}` : `Pricing Catalog: ${activeDealer?.name || selectedDealerCode}`)
                  : (isSw ? `Orodha ya Bei za Kiwandani - ${currentUser?.dealerName || 'Dealer'}` : `Factory Buying Cost Catalog - ${currentUser?.dealerName || 'Dealer'}`)}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {models.length} {isSw ? 'Miundo Inayotumika' : 'Active Models'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSw 
                ? 'Weka bei ya kununulia kiwandani na uone mwenendo wa bei (trend) kwa kila chombo. Bei za kuuzia na faida huingizwa wakati wa mauzo kulingana na mteja.'
                : 'Manage supplier buying cost and track price trends per model. Selling prices and realized profit are captured per transaction at point of sale.'}
            </p>
          </div>
        </div>

        {/* Pricing Notice */}
        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300 max-w-sm">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base shrink-0">
            verified
          </span>
          <span className="text-[11px] leading-tight">
            {isSw 
              ? 'Mzigo mpya unapoingia stoo hupokea bei ya kununulia iliyopo kwenye kipindi husika. Bei za kuuzia zinarikodiwa kwenye mauzo.' 
              : 'New stock deliveries inherit active factory cost. Selling prices and profit are recorded during sale.'}
          </span>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Models & Stock */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isSw ? 'Pikipiki Stoo' : 'In-Stock Fleet'}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-lg">two_wheeler</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalStockCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{isSw ? 'Vyombo' : 'Units'}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {models.length} {isSw ? 'Miundo Tofauti' : 'Catalog Models'}
          </span>
        </div>

        {/* Total Cost Asset Value */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isSw ? 'Mtaji wa Stoo (Cost)' : 'Inventory Cost Value'}
            </span>
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">account_balance</span>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-black text-[#006948] dark:text-emerald-300 font-mono">
              TZS {(totalCostValue / 1000000).toFixed(1)}M
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isSw ? 'Gharama ya kununua mzigo stoo' : 'Total factory cost of inventory'}
          </span>
        </div>

        {/* 2W Models */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isSw ? 'Miundo ya Pikipiki (2W)' : '2W Models'}
            </span>
            <span className="material-symbols-outlined text-blue-500 text-lg">two_wheeler</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {models.filter((m) => m.type === '2W').length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{isSw ? 'Chapa' : 'Brands'}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            HLX 125, Boxer BM150, Apache RTR
          </span>
        </div>

        {/* 3W Models */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isSw ? 'Miundo ya Bajaj (3W)' : '3W Models'}
            </span>
            <span className="material-symbols-outlined text-amber-500 text-lg">electric_rickshaw</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {models.filter((m) => m.type === '3W').length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{isSw ? 'Chapa' : 'Brands'}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            King Deluxe, Maxima Z
          </span>
        </div>
      </div>

      {/* 3. FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder={isSw ? 'Tafuta mfano kwa jina au chapa (k.m. HLX 125, Boxer BM150)...' : 'Search model by name or brand...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Type: All / 2W / 3W */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['ALL', '2W', '3W'] as const).map((tType) => (
              <button
                key={tType}
                type="button"
                onClick={() => setSelectedType(tType)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedType === tType
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tType === 'ALL' ? (isSw ? 'Aina Zote' : 'All Types') : tType === '2W' ? (isSw ? 'Pikipiki (2W)' : '2W Motorcycles') : (isSw ? 'Bajaj (3W)' : '3W Tricycles')}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">{isSw ? 'Chapa Zote' : 'All Brands'}</option>
            <option value="TVS">TVS</option>
            <option value="Bajaj">Bajaj</option>
            <option value="Honda">Honda</option>
          </select>
        </div>
      </div>

      {/* 4. PRICE LIST TABLE / CARDS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Desktop / Tablet Table View (Column-Wise Grid Structure) */}
        <div className="overflow-x-auto enterprise-scrollbar hidden md:block w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b-2 border-[#004d34] bg-[#006948] text-xs font-bold text-white whitespace-nowrap">
                <th className="py-3.5 px-3 text-center border-r border-white/15 w-14 whitespace-nowrap">SN</th>
                <th className="py-3.5 px-4 border-r border-white/15 whitespace-nowrap">{isSw ? 'Modeli' : 'Model'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 whitespace-nowrap">{isSw ? 'Uwezo wa Injini' : 'Engine Capacity'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{isSw ? 'Aina' : 'Category'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{isSw ? 'Chapa' : 'Brand'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{isSw ? 'Zilizopo Stoo' : 'In Stock'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-right whitespace-nowrap">{isSw ? 'Bei ya Kiwanda (TZS)' : 'Factory Price (TZS)'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{isSw ? 'Tarehe ya Kuanza' : 'Start Date'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{isSw ? 'Tarehe ya Kuisha' : 'End Date'}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{isSw ? 'Hali ya Bei' : 'Status'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isSw ? 'Vitendo' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
              {filteredModels.map((m, index) => {
                const cost = m.buyingPrice || Math.round(m.defaultPrice * 0.82);
                const startDate = m.startDate || '2026-01-01';
                const endDate = m.endDate || '2026-12-31';

                return (
                  <tr 
                    key={m.id} 
                    className={`hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors border-b border-slate-200 dark:border-slate-800 ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/60'
                    }`}
                  >
                    {/* SN */}
                    <td className="py-3.5 px-3 text-center border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300 text-xs">
                      {index + 1}
                    </td>

                    {/* Model */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white text-sm">
                      {m.name}
                    </td>

                    {/* Engine Capacity */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {m.engineCapacity}
                    </td>

                    {/* Category (2W / 3W) */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        m.type === '3W' 
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {m.type}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {m.brand}
                      </span>
                    </td>

                    {/* In Stock Count (Clean Number without units) */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 font-mono">
                        {m.inStockCount || 0}
                      </span>
                    </td>

                    {/* Factory Price (Clean Number) */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-right font-mono text-slate-900 dark:text-white font-black text-sm">
                      {cost.toLocaleString()}
                    </td>

                    {/* Start Date (Clean text without calendar icon) */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                        {startDate}
                      </span>
                    </td>

                    {/* End Date (Clean text without calendar icon) */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                        {endDate}
                      </span>
                    </td>

                    {/* Price Status */}
                    <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {isSw ? 'Inatumika' : 'Active'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Price Trend Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedTrendModel(m)}
                          title={isSw ? 'Mwenendo wa Bei' : 'Price Trend'}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">trending_up</span>
                          <span>{isSw ? 'Mwenendo' : 'Trend'}</span>
                        </button>

                        {/* Edit Price Button */}
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            title={isSw ? 'Badili Bei' : 'Edit Price'}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-[#006948] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            <span>{isSw ? 'Badili Bei' : 'Edit Price'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredModels.map((m, index) => {
            const cost = m.buyingPrice || Math.round(m.defaultPrice * 0.82);
            const startDate = m.startDate || '2026-01-01';
            const endDate = m.endDate || '2026-12-31';

            return (
              <div key={m.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {m.brand}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {m.engineCapacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono">
                    {m.inStockCount || 0}
                  </span>
                </div>

                {/* Price & Period Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">
                      {isSw ? 'Bei ya Kiwanda (TZS):' : 'Factory Price (TZS):'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                      {cost.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">
                      {isSw ? 'Kipindi cha Bei:' : 'Validity Period:'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {startDate} → {endDate}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* View Trend */}
                  <button
                    type="button"
                    onClick={() => setSelectedTrendModel(m)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">trending_up</span>
                    <span>{isSw ? 'Mwenendo' : 'Price Trend'}</span>
                  </button>

                  {/* Edit Price */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(m)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-[#006948] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>{isSw ? 'Badili Bei' : 'Edit Price'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRICE TREND MODAL (NORMAL / CLEAN MODAL)                               */}
      {/* ========================================================================= */}
      {selectedTrendModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/75 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006948] to-[#00422c] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {isSw ? 'Mwenendo wa Bei ya Kiwanda' : 'Factory Price Trend & History'}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {selectedTrendModel.brand}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedTrendModel.name} • {selectedTrendModel.engineCapacity}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrendModel(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* KPI Summary Cards */}
              {(() => {
                const history = getModelPriceHistory(selectedTrendModel);
                const currentEntry = history[history.length - 1];
                const firstEntry = history[0];
                const priceDiff = currentEntry.buyingPrice - firstEntry.buyingPrice;
                const percentDiff = ((priceDiff / firstEntry.buyingPrice) * 100).toFixed(1);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {/* Current Cost */}
                    <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        {isSw ? 'Bei ya Kiwanda (Active Price)' : 'Active Factory Price'}
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#006948] dark:text-emerald-300 font-mono mt-0.5 block">
                        TZS {currentEntry.buyingPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {currentEntry.startDate} → {currentEntry.endDate}
                      </span>
                    </div>

                    {/* Overall Trend Variance */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {isSw ? 'Mabadiliko ya Jumla' : 'Overall Price Growth'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-base sm:text-lg font-black font-mono ${priceDiff >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
                          {priceDiff >= 0 ? `+TZS ${priceDiff.toLocaleString()}` : `TZS ${priceDiff.toLocaleString()}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {priceDiff >= 0 ? `+${percentDiff}%` : `${percentDiff}%`} {isSw ? 'tangu mwanzo' : 'since initial period'}
                      </span>
                    </div>

                    {/* History Count */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {isSw ? 'Vipindi vya Bei' : 'Price Periods Recorded'}
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                        {history.length} {isSw ? 'Vipindi' : 'Periods'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isSw ? 'Historia kamili ya mikataba' : 'Catalog contract history'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Visual Price Trend Chart - Modern Financial Market Line Graph */}
              {(() => {
                const history = getModelPriceHistory(selectedTrendModel);
                const prices = history.map((h) => h.buyingPrice);
                const minPrice = Math.min(...prices) * 0.96;
                const maxPrice = Math.max(...prices) * 1.04;
                const range = maxPrice - minPrice || 1;

                const n = history.length;
                const chartW = 540;
                const chartH = 150;
                const padX = 55;
                const padTop = 32;
                const padBottom = 26;
                const usableW = chartW - padX * 2;
                const usableH = chartH - padTop - padBottom;
                const baseY = chartH - padBottom;

                const points = history.map((entry, idx) => {
                  const x = n === 1 ? chartW / 2 : padX + (idx / (n - 1)) * usableW;
                  const y = padTop + (1 - (entry.buyingPrice - minPrice) / range) * usableH;
                  return { x, y, entry, isLatest: idx === n - 1 };
                });

                // Construct smooth cubic bezier curve
                let linePathD = `M ${points[0].x} ${points[0].y}`;
                if (points.length === 2) {
                  linePathD += ` L ${points[1].x} ${points[1].y}`;
                } else if (points.length > 2) {
                  for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[i];
                    const p1 = points[i + 1];
                    const cpx1 = p0.x + (p1.x - p0.x) * 0.5;
                    const cpy1 = p0.y;
                    const cpx2 = p0.x + (p1.x - p0.x) * 0.5;
                    const cpy2 = p1.y;
                    linePathD += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
                  }
                }

                const areaPathD = points.length === 1
                  ? ''
                  : `${linePathD} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;

                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg shadow-black/40 text-white relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">trending_up</span>
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          {isSw ? 'Mwenendo wa Bei (Market Price Trendline)' : 'Market Price Trendline Over Time'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{isSw ? 'Mwelekeo Chanya' : 'Live Trend'}</span>
                        </span>
                        <span>{history[0]?.startDate} — {history[history.length - 1]?.endDate}</span>
                      </div>
                    </div>

                    {/* Pure SVG Market Line Chart */}
                    <div className="w-full overflow-hidden select-none">
                      <svg 
                        viewBox={`0 0 ${chartW} ${chartH}`} 
                        className="w-full h-36 sm:h-44 overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          {/* Gradient for area under the market line */}
                          <linearGradient id="marketAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>

                          {/* Gradient for the line stroke */}
                          <linearGradient id="marketLineStroke" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#059669" />
                            <stop offset="50%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                          </linearGradient>

                          {/* Drop shadow for line */}
                          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.35" />
                          </filter>
                        </defs>

                        {/* Background Grid Lines */}
                        <line x1="20" y1={padTop} x2={chartW - 20} y2={padTop} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                        <line x1="20" y1={padTop + usableH * 0.5} x2={chartW - 20} y2={padTop + usableH * 0.5} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />
                        <line x1="20" y1={baseY} x2={chartW - 20} y2={baseY} stroke="#334155" strokeWidth="1" opacity="0.4" />

                        {/* Area Shading */}
                        {areaPathD && (
                          <path d={areaPathD} fill="url(#marketAreaGradient)" />
                        )}

                        {/* Main Trend Line */}
                        <path 
                          d={linePathD} 
                          fill="none" 
                          stroke="url(#marketLineStroke)" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          filter="url(#lineGlow)"
                        />

                        {/* Vertical Drop Indicators and Nodes */}
                        {points.map((p, i) => (
                          <g key={i}>
                            {/* Vertical guideline */}
                            <line 
                              x1={p.x} 
                              y1={p.y} 
                              x2={p.x} 
                              y2={baseY} 
                              stroke="#10b981" 
                              strokeWidth="1" 
                              strokeDasharray="2 3" 
                              opacity={p.isLatest ? "0.6" : "0.25"} 
                            />

                            {/* Node Point */}
                            {p.isLatest ? (
                              <g>
                                <circle cx={p.x} cy={p.y} r="11" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                                <circle cx={p.x} cy={p.y} r="7" fill="#10b981" />
                                <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" />
                              </g>
                            ) : (
                              <g>
                                <circle cx={p.x} cy={p.y} r="6" fill="#0E131F" stroke="#10b981" strokeWidth="2.5" />
                                <circle cx={p.x} cy={p.y} r="2.5" fill="#10b981" />
                              </g>
                            )}

                            {/* Price Floating Pill Badge above Node */}
                            <g transform={`translate(${p.x}, ${p.y - 18})`}>
                              {p.isLatest ? (
                                <>
                                  <rect 
                                    x="-44" 
                                    y="-11" 
                                    width="88" 
                                    height="22" 
                                    rx="6" 
                                    fill="#006948" 
                                    stroke="#34d399" 
                                    strokeWidth="1" 
                                  />
                                  <text 
                                    x="0" 
                                    y="1" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    fill="#ffffff" 
                                    fontSize="10" 
                                    fontWeight="800" 
                                    fontFamily="ui-monospace, monospace"
                                  >
                                    TZS {(p.entry.buyingPrice / 1000000).toFixed(2)}M
                                  </text>
                                </>
                              ) : (
                                <>
                                  <rect 
                                    x="-38" 
                                    y="-9" 
                                    width="76" 
                                    height="18" 
                                    rx="5" 
                                    fill="#1e293b" 
                                    stroke="#334155" 
                                    strokeWidth="1" 
                                  />
                                  <text 
                                    x="0" 
                                    y="1" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    fill="#94a3b8" 
                                    fontSize="9" 
                                    fontWeight="600" 
                                    fontFamily="ui-monospace, monospace"
                                  >
                                    TZS {(p.entry.buyingPrice / 1000000).toFixed(2)}M
                                  </text>
                                </>
                              )}
                            </g>
                          </g>
                        ))}
                      </svg>
                    </div>

                    {/* Bottom Date Markers */}
                    <div className="flex items-center justify-between px-6 pt-1 text-[11px] font-mono text-slate-400">
                      {points.map((p, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <span className={`font-semibold ${p.isLatest ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                            {p.entry.startDate.substring(0, 7)}
                          </span>
                          {p.isLatest && (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded mt-0.5">
                              {isSw ? 'Hali ya Sasa' : 'Active'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Detailed Price History Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isSw ? 'Orodha ya Vipindi vya Bei' : 'Price Periods Log'}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {isSw ? 'Marekebisho yote ya bei' : 'All recorded price periods'}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#004d34] bg-[#006948] text-xs font-bold text-white whitespace-nowrap">
                        <th className="py-2.5 px-3 border-r border-white/15 whitespace-nowrap">{isSw ? 'Kipindi (Tarehe)' : 'Period (Dates)'}</th>
                        <th className="py-2.5 px-3 border-r border-white/15 text-right whitespace-nowrap">{isSw ? 'Bei ya Kiwanda (TZS)' : 'Factory Price (TZS)'}</th>
                        <th className="py-2.5 px-3 border-r border-white/15 text-center whitespace-nowrap">{isSw ? 'Mabadiliko' : 'Variance'}</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">{isSw ? 'Hali' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-sans">
                      {getModelPriceHistory(selectedTrendModel).map((entry, idx, arr) => {
                        const prevEntry = idx > 0 ? arr[idx - 1] : null;
                        const diff = prevEntry ? entry.buyingPrice - prevEntry.buyingPrice : 0;
                        const diffPct = prevEntry ? ((diff / prevEntry.buyingPrice) * 100).toFixed(1) : '0.0';
                        const isActive = entry.status === 'ACTIVE' || idx === arr.length - 1;

                        return (
                          <tr key={entry.id} className={`border-b border-slate-200 dark:border-slate-800 ${isActive ? 'bg-emerald-50/40 dark:bg-emerald-950/30 font-bold' : idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/60'}`}>
                            {/* Date Period (clean text) */}
                            <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
                              {entry.startDate} → {entry.endDate}
                            </td>

                            {/* Cost (clean number) */}
                            <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {entry.buyingPrice.toLocaleString()}
                            </td>

                            {/* Difference */}
                            <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-[11px]">
                              {idx === 0 ? (
                                <span className="text-slate-400 font-semibold">{isSw ? 'Awali' : 'Baseline'}</span>
                              ) : diff > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400 font-bold">
                                  +{diff.toLocaleString()} (+{diffPct}%)
                                </span>
                              ) : diff < 0 ? (
                                <span className="text-emerald-600 font-bold">
                                  -{Math.abs(diff).toLocaleString()} ({diffPct}%)
                                </span>
                              ) : (
                                <span className="text-slate-500 font-bold">0.0%</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3 text-center">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {isSw ? 'Inatumika' : 'Active'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {isSw ? 'Imekwisha' : 'Expired'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedTrendModel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isSw ? 'Funga' : 'Close'}
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedTrendModel;
                    setSelectedTrendModel(null);
                    handleOpenEdit(m);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#006948] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>{isSw ? 'Badili Bei' : 'Edit Price'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EDIT PRICE MODAL (OPENS WITH COST AND PERIOD DATES)                    */}
      {/* ========================================================================= */}
      {editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-xl">price_change</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isSw ? 'Badili Bei ya Chombo' : 'Edit Vehicle Price'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {editingModel.name} ({editingModel.brand} • {editingModel.engineCapacity})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingModel(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePrice} className="p-4 sm:p-6 space-y-4">
              {priceSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{priceSuccessMsg}</span>
                </div>
              )}

              {/* Buying Price Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  {isSw ? '1. Bei Mpya ya Kiwanda (Factory Price):' : '1. Factory Price (TZS):'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">
                    TZS
                  </span>
                  <input
                    type="number"
                    min={100000}
                    step={10000}
                    required
                    value={editBuyingPrice}
                    onChange={(e) => setEditBuyingPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-13 pr-4 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isSw ? 'Bei unayonunua toka kiwandani / msambazaji mkuu' : 'Cost from manufacturer / main supplier per unit'}
                </span>
              </div>

              {/* Start Date & End Date (Period) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    {isSw ? '2. Tarehe ya Kuanza:' : '2. Start Date:'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    {isSw ? '3. Tarehe ya Kuisha:' : '3. End Date:'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                  />
                </div>
              </div>

              {/* Policy Explanation */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">info</span>
                  <span>{isSw ? 'Kanuni ya Mfumo (ERP Policy):' : 'System Rule:'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isSw 
                    ? 'Mzigo utakaoingia stoo kwenye kipindi hiki utatumia bei hii ya kununulia. Wakati wa kuuza, afisa mauzo atatambuliwa bei hii na kuweka bei halisi ya kuuzia mteja ili faida (Profit) na asilimia (Margin %) zihesabiwe moja kwa moja kwenye ripoti ya mauzo.'
                    : 'Incoming stock in this period will adopt this cost. During sale, actual selling price is negotiated and profit/margin are calculated live in the sales report.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isSw ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#006948] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] shadow-md shadow-emerald-950/30 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>{isSw ? 'Hifadhi Bei' : 'Save Price'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
