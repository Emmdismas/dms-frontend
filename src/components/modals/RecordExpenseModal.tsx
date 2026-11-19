import React, { useState } from 'react';
import { Expense, ExpenseCategory, Branch, AuthUser, PaymentMethod, Language } from '../../types';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  currentUser: AuthUser | null;
  onAddExpense: (newExpense: Expense) => void;
  language?: Language;
}

const CATEGORIES: { id: ExpenseCategory; labelSw: string; labelEn: string; icon: string }[] = [
  { id: 'USAFIRISHAJI', labelSw: 'Usafirishaji & Bandari', labelEn: 'Transport & Port Logistics', icon: 'local_shipping' },
  { id: 'KODI_LESENI', labelSw: 'Kodi & Leseni za Biashara', labelEn: 'Taxes & Business License', icon: 'gavel' },
  { id: 'UMEME_MAJI', labelSw: 'LUKU, Maji & Internet', labelEn: 'Electricity, Water & Internet', icon: 'bolt' },
  { id: 'MISHAHARA_POSHO', labelSw: 'Mishahara & Posho za Wafanyakazi', labelEn: 'Staff Salaries & Allowances', icon: 'payments' },
  { id: 'MATENGENEZO', labelSw: 'Matengenezo ya Stoo & Yard', labelEn: 'Maintenance & Facility Repairs', icon: 'handyman' },
  { id: 'MAFUTA_LOGISTICS', labelSw: 'Mafuta ya Magari / Jenereta', labelEn: 'Fuel & Transportation', icon: 'local_gas_station' },
  { id: 'MATANGAZO_MASOKO', labelSw: 'Matangazo & Masoko', labelEn: 'Marketing & Advertisements', icon: 'campaign' },
  { id: 'CHAKULA_KINYWAJI', labelSw: 'Chakula & Ustawi wa Wafanyakazi', labelEn: 'Staff Refreshments & Welfare', icon: 'restaurant' },
  { id: 'VINGINEVYO', labelSw: 'Gharama Nyinginezo za Uendeshaji', labelEn: 'Other Operating Expenses', icon: 'receipt' },
];

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({
  isOpen,
  onClose,
  branches,
  currentUser,
  onAddExpense,
  language = 'sw',
}) => {
  const isBranchStaff = currentUser?.role === 'branch_manager' || currentUser?.role === 'storekeeper' || currentUser?.role === 'sales_person';
  const isSw = language === 'sw';

  const defaultBranch = isBranchStaff && currentUser?.branchCode
    ? branches.find((b) => b.code === currentUser.branchCode)?.id || branches[0]?.id
    : branches[0]?.id;

  const [category, setCategory] = useState<ExpenseCategory>('USAFIRISHAJI');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [branchId, setBranchId] = useState<string>(defaultBranch || '');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('2026-09-23');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const amountNumber = parseInt(amountRaw.replace(/\D/g, '')) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setAmountRaw(digits ? parseInt(digits, 10).toLocaleString() : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amountNumber <= 0) {
      setErrorMsg(isSw ? 'Tafadhali ingiza kiasi sahihi cha pesa zilizotumika.' : 'Please enter a valid expense amount.');
      return;
    }

    const cleanDesc = description.trim();
    if (!cleanDesc || cleanDesc.length < 5) {
      setErrorMsg(
        isSw 
          ? 'Tafadhali toa maelezo kamili ya matumizi (katumia hela kwa ajili ya nini).' 
          : 'Please provide a detailed summary of what the money was spent on.'
      );
      return;
    }

    const branch = branches.find((b) => b.id === branchId) || branches[0];
    const categoryInfo = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
    const categoryLabel = isSw ? categoryInfo.labelSw : categoryInfo.labelEn;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: expenseDate || '2026-09-23',
      category,
      categoryLabel,
      amount: amountNumber,
      branchId: branch.id,
      branchName: branch.name,
      description: cleanDesc,
      recordedBy: currentUser?.name || (isSw ? 'Msimamizi wa Fedha' : 'Finance Admin'),
      receiptNumber: receiptNumber.trim() || undefined,
      paymentMethod,
    };

    onAddExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-950/30">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-sans">
                {isSw ? 'Sajili Matumizi Mapya (Expense)' : 'Record Business Expense'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSw ? 'Weka aina ya matumizi, kiasi na maelezo ya kina' : 'Enter expense category, amount, and detailed summary'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-lg shrink-0 text-red-500">error</span>
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* 1. EXPENSE CATEGORY */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              {isSw ? '1. Aina ya Matumizi (Category):' : '1. Expense Category:'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
                category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isSw ? c.labelSw : c.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. AMOUNT & BRANCH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                {isSw ? '2. Kiasi cha Pesa (TZS):' : '2. Expense Amount (TZS):'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  TZS
                </span>
                <input
                  type="text"
                  required
                  placeholder="k.m. 150,000"
                  value={amountRaw}
                  onChange={handleAmountChange}
                  className="w-full pl-13 pr-4 py-2.5 text-sm font-mono font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                {isSw ? '3. Tawi Lililotumia:' : '3. Branch Incurred:'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-base">
                  storefront
                </span>
                <select
                  disabled={isBranchStaff}
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500 cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. MAELEZO YA MATUMIZI (Summary / Purpose of expense) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isSw ? '4. Maelezo ya Matumizi (Summary):' : '4. Expense Details / Purpose:'} <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {isSw ? 'Eleza katumia hela kwa ajili ya nini' : 'State what money was spent for'}
              </span>
            </div>
            <textarea
              rows={3}
              required
              placeholder={
                isSw
                  ? 'mfano: Malipo ya mafuta ya gari la kusafirisha pikipiki 10 toka Kariakoo kwenda bandari ya Unguja.'
                  : 'e.g. Purchased fuel for delivery truck moving 10 units to Unguja ferry port.'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* 4. PAYMENT METHOD & RECEIPT REF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payment Method */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                {isSw ? '5. Njia ya Malipo:' : '5. Payment Mode:'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-base">
                  wallet
                </span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="CASH">{isSw ? 'Pesa Taslimu' : 'Cash'}</option>
                  <option value="MOBILE_MONEY">{isSw ? 'Pesa ya Simu' : 'Mobile Money'}</option>
                  <option value="BANK_TRANSFER">{isSw ? 'Uhamisho wa Benki' : 'Bank Transfer'}</option>
                </select>
              </div>
            </div>

            {/* Receipt Number (Optional) */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                {isSw ? 'Namba ya Risiti / Kumbukumbu:' : 'Receipt / Ref Number:'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-base">
                  tag
                </span>
                <input
                  type="text"
                  placeholder="k.m. RCT-8842 / LUKU-990"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Recorded By Badge */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="font-semibold">{isSw ? 'Mrekodi Matumizi:' : 'Recorded By:'}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentUser?.name || 'Admin User'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              {isSw ? 'Ghairi' : 'Cancel'}
            </button>
            
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 hover:from-rose-700 hover:to-red-800 rounded-xl shadow-lg shadow-rose-950/30 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 ring-1 ring-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{isSw ? 'Hifadhi Matumizi' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
