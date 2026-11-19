import React, { useState } from 'react';
import { 
  VehicleUnit, 
  VehicleModel, 
  Customer, 
  Branch, 
  PaymentMethod, 
  SaleRecord, 
  AuthUser,
  Language
} from '../../types';
import { formatVehicleColor } from '../../i18n/translations';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: VehicleUnit[];
  models: VehicleModel[];
  customers: Customer[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onSaleCompleted: (newSale: SaleRecord, updatedUnit: VehicleUnit) => void;
  language?: Language;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  onClose,
  units,
  models,
  customers,
  branches,
  currentUser,
  onSaleCompleted,
  language = 'sw',
}) => {
  const isSw = language === 'sw';
  const [step, setStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<'2W' | '3W'>('2W');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  // Customer selection or new
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerNida, setNewCustomerNida] = useState('');
  const [newCustomerLocation, setNewCustomerLocation] = useState('');

  // Sale specifics
  const [sellingPrice, setSellingPrice] = useState<number>(3450000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');
  
  // Delivery & Handover specifics
  const [deliveryType, setDeliveryType] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Filter available units
  const availableUnits = units.filter((u) => {
    const isAvailable = u.status === 'IN STOCK';
    const matchesType = u.vehicleType === selectedType;
    const matchesModel = selectedModelId ? u.modelId === selectedModelId : true;
    const matchesBranch = 
      currentUser?.role === 'branch_manager' && currentUser.branchCode
        ? u.branchCode === currentUser.branchCode
        : true;
    return isAvailable && matchesType && matchesModel && matchesBranch;
  });

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const selectedModel = models.find((m) => m.id === selectedModelId);

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedModelId) {
        setErrorMsg(isSw ? 'Tafadhali chagua modeli ya pikipiki.' : 'Please select a motorcycle model.');
        return;
      }
      // Update default price
      if (selectedModel) {
        setSellingPrice(selectedModel.defaultPrice);
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedUnitId) {
        setErrorMsg(isSw ? 'Tafadhali chagua chombo halisi (Chassis) kilichopo stoo.' : 'Please select a physical unit (Chassis) in stock.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (isNewCustomer) {
        if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
          setErrorMsg(isSw ? 'Weka jina na namba ya simu ya mteja.' : 'Please enter the customer name and phone number.');
          return;
        }
      } else {
        if (!selectedCustomerId) {
          setErrorMsg(isSw ? 'Chagua mteja kutoka kwenye orodha au bonyeza "Mteja Mpya".' : 'Please select a customer from the list or click "New Customer".');
          return;
        }
      }
      setStep(5);
    } else if (step === 5) {
      if (sellingPrice <= 0) {
        setErrorMsg(isSw ? 'Weka kiasi halisi cha mauzo.' : 'Please enter a valid selling price.');
        return;
      }
      if (deliveryType === 'SCHEDULED' && !pickupDate) {
        setErrorMsg(isSw ? 'Tafadhali chagua tarehe ambayo mteja atakuja kuchukua chombo (Pick-up Date).' : 'Please select the scheduled customer pick-up date.');
        return;
      }
      setStep(6);
    }
  };

  const handleFinalizeSale = () => {
    if (!selectedUnit) return;

    let custName = '';
    let custPhone = '';
    let custId = selectedCustomerId;

    if (isNewCustomer) {
      custId = `c-${Date.now()}`;
      custName = newCustomerName;
      custPhone = newCustomerPhone;
    } else {
      const existing = customers.find((c) => c.id === selectedCustomerId);
      if (existing) {
        custName = existing.name;
        custPhone = existing.phone;
      }
    }

    const receiptNum = `RCT-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;
    const todayStr = '2026-09-23';
    const isImmediate = deliveryType === 'IMMEDIATE';

    // Updated Unit depending on Handover Mode
    const updatedUnit: VehicleUnit = {
      ...selectedUnit,
      status: isImmediate ? 'SOLD' : 'RESERVED',
      soldToCustomerName: custName,
      soldDate: isImmediate ? todayStr : undefined,
      soldAmount: sellingPrice,
      deliveryType,
      pickupDate: isImmediate ? undefined : pickupDate,
      deliveryStatus: isImmediate ? 'RELEASED' : 'PENDING_PICKUP',
      reservedCustomerName: isImmediate ? undefined : custName,
      reservedCustomerPhone: isImmediate ? undefined : custPhone,
      reservedDate: isImmediate ? undefined : todayStr,
      releasedDate: isImmediate ? todayStr : undefined,
      releasedBy: isImmediate ? (currentUser?.name || (isSw ? 'Msimamizi wa Mauzo' : 'Sales Officer')) : undefined,
      journey: [
        ...selectedUnit.journey,
        isImmediate
          ? {
              id: `j-sold-${Date.now()}`,
              date: todayStr,
              title: isSw ? `Imekabidhiwa kwa ${custName}` : `Handed Over to ${custName}`,
              description: isSw 
                ? `Mauzo yamekamilika na chombo kimekabidhiwa papo hapo kwa bei ya TZS ${sellingPrice.toLocaleString()}. Risiti Na: ${receiptNum}. Njia ya malipo: ${paymentMethod}`
                : `Sale completed and vehicle released immediately for TZS ${sellingPrice.toLocaleString()}. Receipt #: ${receiptNum}. Payment method: ${paymentMethod}`,
              branch: selectedUnit.branchName,
              actor: currentUser?.name || (isSw ? 'Msimamizi wa Mauzo' : 'Sales Officer'),
              type: 'sold' as const,
            }
          : {
              id: `j-reserved-${Date.now()}`,
              date: todayStr,
              title: isSw ? `Imewekewa Hifadhi (Reserved for ${custName})` : `Reserved for ${custName}`,
              description: isSw 
                ? `Mteja amelipia TZS ${sellingPrice.toLocaleString()}. Chombo kimehifadhiwa stoo hadi tarehe ya kuchukua: ${pickupDate}. Risiti: ${receiptNum}.`
                : `Payment completed for TZS ${sellingPrice.toLocaleString()}. Reserved in stock until pick-up on ${pickupDate}. Receipt: ${receiptNum}.`,
              branch: selectedUnit.branchName,
              actor: currentUser?.name || (isSw ? 'Msimamizi wa Mauzo' : 'Sales Officer'),
              type: 'reserved' as const,
            },
      ],
    };

    const unitCost = selectedUnit.costPrice || selectedModel?.buyingPrice || Math.round(sellingPrice * 0.82);

    // New Sale Record
    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      receiptNumber: receiptNum,
      date: todayStr,
      unitId: selectedUnit.id,
      chassisNumber: selectedUnit.chassisNumber,
      engineNumber: selectedUnit.engineNumber,
      modelName: selectedUnit.modelName,
      vehicleType: selectedUnit.vehicleType,
      branchId: selectedUnit.branchId,
      branchName: selectedUnit.branchName,
      branchCode: selectedUnit.branchCode,
      dealerCode: selectedUnit.dealerCode || currentUser?.dealerCode || 'C-DAR-N00988',
      dealerName: selectedUnit.dealerName || currentUser?.dealerName || 'Dealer',
      customerId: custId,
      customerName: custName,
      customerPhone: custPhone,
      salespersonName: currentUser?.name || (isSw ? 'Msimamizi wa Mauzo' : 'Sales Manager'),
      amount: sellingPrice,
      costPrice: unitCost,
      unitPrice: sellingPrice,
      amountPaid: sellingPrice,
      remainedAmount: 0,
      paymentStatus: 'PAID',
      paymentMethod,
      paymentRef: paymentRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'COMPLETED',
      notes,
      deliveryType,
      pickupDate: isImmediate ? undefined : pickupDate,
      deliveryStatus: isImmediate ? 'RELEASED' : 'PENDING_PICKUP',
      releasedDate: isImmediate ? todayStr : undefined,
      releasedBy: isImmediate ? (currentUser?.name || (isSw ? 'Msimamizi wa Mauzo' : 'Sales Officer')) : undefined,
    };

    onSaleCompleted(newSale, updatedUnit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0F172A] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006948] to-[#00855d] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isSw ? 'Sajili Mauzo ya Pikipiki' : 'Record Motorcycle Sale'}
              </h2>
              <p className="text-xs text-slate-500">
                {isSw ? `Hatua ${step} ya 6` : `Step ${step} of 6`} • {
                  step === 1 ? (isSw ? 'Chagua Aina (2W/3W)' : 'Select Category (2W/3W)') :
                  step === 2 ? (isSw ? 'Chagua Modeli ya Pikipiki' : 'Select Vehicle Model') :
                  step === 3 ? (isSw ? 'Chagua Chassis / Nambari ya Chombo' : 'Select Chassis / Unit') :
                  step === 4 ? (isSw ? 'Taarifa za Mteja' : 'Customer Information') :
                  step === 5 ? (isSw ? 'Bei na Njia ya Malipo' : 'Pricing & Payment') : 
                  (isSw ? 'Uhakiki & Kamilisha' : 'Review & Complete')
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between gap-1">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s === step 
                    ? 'bg-[#00855d]' 
                    : s < step 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: 2W vs 3W */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                {isSw ? 'Chagua Aina ya Chombo:' : 'Select Vehicle Category:'}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedType('2W')}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedType === '2W'
                      ? 'border-[#00855d] bg-emerald-500/10 ring-2 ring-[#00855d]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-emerald-600 mb-2">two_wheeler</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isSw ? 'Magurudumu 2 (2W)' : '2-Wheelers (2W)'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">TVS HLX 125, Boxer BM150, Apache RTR, CT100</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('3W')}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedType === '3W'
                      ? 'border-[#00855d] bg-emerald-500/10 ring-2 ring-[#00855d]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-emerald-600 mb-2">electric_rickshaw</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isSw ? 'Magurudumu 3 / Bajaji (3W)' : '3-Wheelers / Bajaj (3W)'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">TVS King Deluxe, Bajaj Maxima Z Abiria</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MODEL SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                {isSw ? `Chagua Modeli ya ${selectedType}:` : `Select ${selectedType} Model:`}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {models
                  .filter((m) => m.type === selectedType)
                  .map((m) => {
                    const isSelected = selectedModelId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModelId(m.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#00855d] bg-emerald-500/10 ring-2 ring-[#00855d]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {m.brand} • {m.engineCapacity}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            TZS {m.defaultPrice.toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {isSw ? `Zilizopo Stoo: ${m.inStockCount} vitengo` : `In Stock: ${m.inStockCount} units`}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT SPECIFIC PHYSICAL UNIT (CHASSIS / VIN) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {isSw ? 'Chagua Chombo Halisi (Chassis & Injini):' : 'Select Physical Unit (Chassis & Engine):'}
                </label>
                <span className="text-xs font-semibold text-emerald-600">
                  {isSw ? `Zinazopatikana: ${availableUnits.length}` : `Available: ${availableUnits.length}`}
                </span>
              </div>

              {availableUnits.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                  <p className="text-sm font-bold">
                    {isSw ? 'Hakuna Pikipiki ya Modeli Hii Iliyopo Stoo Kwa Tawi Lako' : 'No Units of this Model in Stock for Your Branch'}
                  </p>
                  <p className="text-xs mt-1">
                    {isSw ? 'Omba uhamisho kutoka tawi jingine au chagua modeli nyingine.' : 'Request a transfer from another branch or select another model.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {availableUnits.map((u) => {
                    const isSelected = selectedUnitId === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUnitId(u.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#00855d] bg-emerald-500/10 ring-2 ring-[#00855d]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {u.id}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {isSw ? 'Rangi' : 'Color'}: {formatVehicleColor(u.color, language || 'sw')}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-900 dark:text-white mt-1">
                            VIN: <strong className="text-[#00855d]">{u.chassisNumber}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Eng: {u.engineNumber} • {isSw ? 'Tawi' : 'Branch'}: {u.branchName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {isSw ? `Ipo Stoo (${u.stockAgeDays}d)` : `In Stock (${u.stockAgeDays}d)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CUSTOMER DETAILS */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {isSw ? 'Taarifa za Mteja:' : 'Customer Information:'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(false)}
                    className={`text-xs px-3 py-1 rounded-lg border font-semibold cursor-pointer ${
                      !isNewCustomer ? 'bg-[#006948] text-white' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isSw ? 'Mteja Aliyepo' : 'Existing Customer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(true)}
                    className={`text-xs px-3 py-1 rounded-lg border font-semibold cursor-pointer ${
                      isNewCustomer ? 'bg-[#006948] text-white' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isSw ? '+ Mteja Mpya' : '+ New Customer'}
                  </button>
                </div>
              </div>

              {!isNewCustomer ? (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {customers.map((c) => {
                    const isSelected = selectedCustomerId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#00855d] bg-emerald-500/10 ring-2 ring-[#00855d]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {isSw ? 'Simu' : 'Phone'}: {c.phone} • NIDA: {c.nidaNumber}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">{c.location}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      {isSw ? 'Jina Kamili la Mteja:' : 'Customer Full Name:'}
                    </label>
                    <input
                      type="text"
                      placeholder={isSw ? 'mfano: Juma Salum Bakari' : 'e.g. John Doe'}
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        {isSw ? 'Nambari ya Simu:' : 'Phone Number:'}
                      </label>
                      <input
                        type="text"
                        placeholder="0713 000 000"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        {isSw ? 'NIDA / Kitambulisho:' : 'NIDA / National ID:'}
                      </label>
                      <input
                        type="text"
                        placeholder="19890412-xxxxx-xxxxx-xx"
                        value={newCustomerNida}
                        onChange={(e) => setNewCustomerNida(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      {isSw ? 'Mahali / Makazi:' : 'Location / Address:'}
                    </label>
                    <input
                      type="text"
                      placeholder={isSw ? 'mfano: Kariakoo, Dar Es Salaam au Mjini Zanzibar' : 'e.g. Kariakoo, Dar Es Salaam'}
                      value={newCustomerLocation}
                      onChange={(e) => setNewCustomerLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: PRICING & PAYMENT */}
          {step === 5 && (() => {
            const detectedCost = selectedUnit?.costPrice || selectedModel?.buyingPrice || Math.round(sellingPrice * 0.82);
            const calculatedProfit = sellingPrice - detectedCost;
            const calculatedMargin = sellingPrice > 0 ? Math.round((calculatedProfit / sellingPrice) * 100) : 0;

            return (
              <div className="space-y-4">
                {/* Cost vs Selling Live Calculation Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 dark:from-emerald-950/30 dark:via-slate-900/40 dark:to-slate-900 border border-emerald-300/80 dark:border-emerald-800/60 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isSw ? 'Hesabu ya Faida ya Mauzo:' : 'Live Profit Calculation:'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      {isSw ? '✓ Bei ya Kununua Imetambuliwa' : '✓ Cost Detected'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-emerald-200/60 dark:border-emerald-800/50">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        {isSw ? 'Bei ya Kununua:' : 'Cost Price:'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        TZS {detectedCost.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">
                        {isSw ? 'Bei ya Kuuza:' : 'Selling Price:'}
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-300">
                        TZS {sellingPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-700/80">
                      <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-200 uppercase block">
                        {isSw ? 'Faida (Margin):' : 'Profit (Margin):'}
                      </span>
                      <span className={`text-xs font-mono font-black ${calculatedProfit >= 0 ? 'text-[#006948] dark:text-emerald-300' : 'text-rose-600'}`}>
                        {calculatedProfit >= 0 ? '+' : ''}TZS {calculatedProfit.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        ({calculatedMargin}% Margin)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selling Price Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {isSw ? 'Weka Bei Halisi ya Kuuzia Mteja (TZS):' : 'Enter Negotiated Selling Price (TZS):'} <span className="text-red-500">*</span>
                    </label>
                    {selectedModel?.defaultPrice && (
                      <span className="text-[10px] text-slate-500">
                        {isSw ? `Bei Elekezi: TZS ${selectedModel.defaultPrice.toLocaleString()}` : `Guide: TZS ${selectedModel.defaultPrice.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-emerald-600">TZS</span>
                    <input
                      type="number"
                      step={10000}
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full pl-13 pr-4 py-2.5 text-base font-mono font-black rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/30 text-slate-900 dark:text-white outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    {isSw ? 'Njia ya Malipo:' : 'Payment Method:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'CASH', label: isSw ? 'Pesa Taslimu' : 'Cash', icon: 'payments' },
                      { id: 'MOBILE_MONEY', label: isSw ? 'Pesa ya Simu' : 'Mobile Money', icon: 'smartphone' },
                      { id: 'BANK_TRANSFER', label: isSw ? 'Uhamisho wa Benki' : 'Bank Transfer', icon: 'account_balance' },
                      { id: 'INSTALLMENT', label: isSw ? 'Malipo ya Awamu' : 'Installment / Deposit', icon: 'credit_card' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as PaymentMethod)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          paymentMethod === p.id
                            ? 'border-[#00855d] bg-emerald-500/10 text-[#006948] dark:text-emerald-400 font-bold ring-2 ring-[#00855d]'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                        <span className="text-xs">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Reference */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {isSw ? 'Kumbukumbu ya Malipo:' : 'Payment Reference:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isSw ? 'mfano: MPESA-QK89230 au Hundi ya NMB' : 'e.g. MPESA-QK89230 or NMB Cheque'}
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                  />
                </div>

                {/* Handover & Delivery Mode (Anachukua Hapo Hapo au Atachukua Baadaye) */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      {isSw ? 'Utaratibu wa Kuchukua Chombo (Handover):' : 'Delivery & Handover Schedule:'} <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      deliveryType === 'IMMEDIATE'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {deliveryType === 'IMMEDIATE' 
                        ? (isSw ? '⚡ Anachukua Sasa' : '⚡ Instant Handover') 
                        : (isSw ? '⏳ Hifadhi (Reserved)' : '⏳ Reserved')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('IMMEDIATE')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        deliveryType === 'IMMEDIATE'
                          ? 'border-[#00855d] bg-emerald-500/10 text-slate-900 dark:text-white font-bold ring-2 ring-[#00855d]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400 mt-0.5">bolt</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isSw ? 'Anachukua Hapo Hapo' : 'Instant Handover / Today'}
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isSw ? 'Chombo kinatolewa stoo sasa hivi na kukabidhiwa mteja.' : 'Vehicle is released immediately to customer.'}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('SCHEDULED')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        deliveryType === 'SCHEDULED'
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white font-bold ring-2 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-amber-600 dark:text-amber-400 mt-0.5">event_upcoming</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isSw ? 'Atachukua Baadaye (Reserved)' : 'Scheduled Pick-up (Reserved)'}
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isSw ? 'Kitabaki stoo kikiwa kimehifadhiwa (Reserved) hadi siku ya kuchukua.' : 'Vehicle stays in stock as Reserved until customer collects.'}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Pick-up Date Input (shown when Scheduled is selected) */}
                  {deliveryType === 'SCHEDULED' && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-amber-600">calendar_month</span>
                          <span>{isSw ? 'Tarehe ya Kuchukua Chombo (Pick-up Date):' : 'Scheduled Pick-up Date:'}</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                          {isSw ? 'Chombo Kitakuwa RESERVED' : 'Will be set to RESERVED'}
                        </span>
                      </div>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                      />
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">
                        {isSw 
                          ? 'ℹ️ Chombo kitalindwa stoo kisionekane kuwa tayari kuuzwa kwa mtu mwingine hadi siku mteja anapokuja kukabidhiwa (Release).'
                          : 'ℹ️ The unit will be protected in stock as RESERVED to prevent resale until release.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* STEP 6: REVIEW & COMPLETE */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-900 dark:text-white space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs text-slate-500">{isSw ? 'Chombo:' : 'Vehicle:'}</span>
                  <span className="text-sm font-bold text-[#00855d]">{selectedUnit?.modelName} ({selectedUnit?.vehicleType})</span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs text-slate-500">{isSw ? 'Chassis (VIN):' : 'Chassis (VIN):'}</span>
                  <span className="text-xs font-mono font-bold">{selectedUnit?.chassisNumber}</span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs text-slate-500">{isSw ? 'Namba ya Injini:' : 'Engine Number:'}</span>
                  <span className="text-xs font-mono">{selectedUnit?.engineNumber}</span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs text-slate-500">{isSw ? 'Tawi la Mauzo:' : 'Sales Branch:'}</span>
                  <span className="text-xs font-semibold">{selectedUnit?.branchName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs text-slate-500">{isSw ? 'Mteja:' : 'Customer:'}</span>
                  <span className="text-xs font-semibold">{isNewCustomer ? newCustomerName : customers.find(c => c.id === selectedCustomerId)?.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs text-slate-500">{isSw ? 'Utaratibu wa Kuchukua:' : 'Handover / Pick-up:'}</span>
                  {deliveryType === 'IMMEDIATE' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-sm">bolt</span>
                      {isSw ? 'Anachukua Hapo Hapo' : 'Instant Handover'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <span className="material-symbols-outlined text-sm">event</span>
                      {isSw ? `Kimehifadhiwa (Kuchukua: ${pickupDate})` : `Reserved (Pick-up: ${pickupDate})`}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold">{isSw ? 'Jumla ya Bei:' : 'Total Amount:'}</span>
                  <span className="text-lg font-black text-[#006948] dark:text-emerald-400 font-mono">
                    TZS {sellingPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {isSw ? 'Maelezo ya Ziada (Hiari):' : 'Optional Notes:'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isSw ? 'Maelezo yoyote kuhusu mkataba wa mauzo au vifaa vilivyotolewa.' : 'Any additional notes regarding the sales agreement or accessories provided.'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 rounded-b-2xl">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isSw ? '← Rudi' : '← Back'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              {isSw ? 'Ghairi' : 'Cancel'}
            </button>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#005a3e] text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{isSw ? 'Endelea' : 'Continue'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalizeSale}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#005a3e] text-white flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{isSw ? 'Kamilisha Mauzo' : 'Complete Sale'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
