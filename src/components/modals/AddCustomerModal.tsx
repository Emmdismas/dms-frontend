import React, { useState } from 'react';
import { Customer, Branch, AuthUser, Language } from '../../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  currentUser: AuthUser | null;
  onAddCustomer: (newCustomer: Customer) => void;
  language?: Language;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  branches,
  currentUser,
  onAddCustomer,
  language = 'sw',
}) => {
  const isSw = language === 'sw';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nidaNumber, setNidaNumber] = useState('');
  const [location, setLocation] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'br-1');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg(isSw ? 'Tafadhali weka jina na namba ya simu ya mteja.' : 'Please enter customer name and phone number.');
      return;
    }

    const newCust: Customer = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      nidaNumber: nidaNumber.trim() || (isSw ? 'Hana NIDA' : 'No NIDA'),
      location: location.trim() || 'Dar Es Salaam / Zanzibar',
      branchId,
      totalPurchases: 0,
      lastPurchaseDate: isSw ? 'Haijanunua' : 'No purchases yet',
    };

    onAddCustomer(newCust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006948] to-[#00855d] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isSw ? 'Sajili Mteja Mpya' : 'Add New Customer'}
              </h2>
              <p className="text-xs text-slate-500">
                {isSw ? 'Weka taarifa za mnunuzi kwenye orodha' : 'Register buyer details in the directory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
              {isSw ? 'Jina Kamili la Mteja:' : 'Full Name:'}
            </label>
            <input
              type="text"
              required
              placeholder={isSw ? 'mfano: Juma Salum Bakari' : 'e.g. Juma Salum Bakari'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
              {isSw ? 'Nambari ya Simu:' : 'Phone Number:'}
            </label>
            <input
              type="text"
              required
              placeholder="0713 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
              {isSw ? 'Kitambulisho cha NIDA:' : 'NIDA / ID Number:'}
            </label>
            <input
              type="text"
              placeholder="19900214-xxxxx-xxxxx-xx"
              value={nidaNumber}
              onChange={(e) => setNidaNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
              {isSw ? 'Mahali / Makazi:' : 'Location / Address:'}
            </label>
            <input
              type="text"
              placeholder={isSw ? 'Kariakoo, Pemba, Amani, Mjini Magharibi...' : 'Kariakoo, Pemba, Amani, Urban West...'}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
              {isSw ? 'Tawi Lililomsajili:' : 'Registered Branch:'}
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              {isSw ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#005a3e] text-white shadow-xs cursor-pointer"
            >
              {isSw ? 'Hifadhi Mteja' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
