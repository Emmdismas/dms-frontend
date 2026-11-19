import React, { useState } from 'react';
import { VehicleUnit, Branch, StockTransfer, AuthUser, Language } from '../../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: VehicleUnit[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onTransferCompleted: (newTransfer: StockTransfer, updatedUnits: VehicleUnit[]) => void;
  preselectedUnitId?: string;
  language?: Language;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  units,
  branches,
  currentUser,
  onTransferCompleted,
  preselectedUnitId,
  language = 'sw',
}) => {
  const isBranchStaff = currentUser?.role === 'branch_manager' || currentUser?.role === 'storekeeper' || currentUser?.role === 'sales_person';
  const isSw = language === 'sw';
  
  // Find current branch ID
  const defaultFromBranch = isBranchStaff && currentUser?.branchCode
    ? branches.find(b => b.code === currentUser.branchCode)?.id || branches[0]?.id
    : branches[0]?.id;

  const [fromBranchId, setFromBranchId] = useState<string>(defaultFromBranch || '');
  const [toBranchId, setToBranchId] = useState<string>(
    branches.find(b => b.id !== defaultFromBranch)?.id || ''
  );
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(
    preselectedUnitId ? [preselectedUnitId] : []
  );
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const availableUnitsForFromBranch = units.filter(
    (u) => u.status === 'IN STOCK' && u.branchId === fromBranchId
  );

  const toggleUnitSelection = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
    } else {
      setSelectedUnitIds([...selectedUnitIds, unitId]);
    }
  };

  const handleConfirmTransfer = () => {
    setErrorMsg('');
    if (!fromBranchId || !toBranchId) {
      setErrorMsg(isSw ? 'Tafadhali chagua tawi linalotoa na tawi linalopokea.' : 'Please select both source and destination branches.');
      return;
    }
    if (fromBranchId === toBranchId) {
      setErrorMsg(isSw ? 'Tawi linalotoa haliwezi kuwa sawa na tawi linalopokea.' : 'Source and destination branches cannot be the same.');
      return;
    }
    if (selectedUnitIds.length === 0) {
      setErrorMsg(isSw ? 'Tafadhali chagua angalau pikipiki moja ya kuhamisha.' : 'Please select at least one motorcycle to transfer.');
      return;
    }

    const fromBranch = branches.find(b => b.id === fromBranchId);
    const toBranch = branches.find(b => b.id === toBranchId);
    if (!fromBranch || !toBranch) return;

    const unitsToMove = units.filter(u => selectedUnitIds.includes(u.id));
    const todayStr = '2026-09-23';
    const transferNo = `TRF-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const updatedUnits: VehicleUnit[] = unitsToMove.map(u => ({
      ...u,
      branchId: toBranch.id,
      branchCode: toBranch.code,
      branchName: toBranch.name,
      journey: [
        ...u.journey,
        {
          id: `j-trf-${Date.now()}-${u.id}`,
          date: todayStr,
          title: isSw ? `Uhamisho: ${fromBranch.name} → ${toBranch.name}` : `Transfer: ${fromBranch.name} → ${toBranch.name}`,
          description: isSw 
            ? `Ilihamishwa kuelekea ${toBranch.name} kwa idhini ya ${currentUser?.name || 'Msimamizi'}. Nambari ya uhamisho: ${transferNo}`
            : `Transferred to ${toBranch.name} authorized by ${currentUser?.name || 'Manager'}. Transfer number: ${transferNo}`,
          branch: toBranch.name,
          actor: currentUser?.name || (isSw ? 'Msimamizi wa Stoo' : 'Inventory Manager'),
          type: 'transferred',
        }
      ]
    }));

    const newTransfer: StockTransfer = {
      id: `tr-${Date.now()}`,
      transferNumber: transferNo,
      date: todayStr,
      fromBranchId: fromBranch.id,
      fromBranchName: fromBranch.name,
      toBranchId: toBranch.id,
      toBranchName: toBranch.name,
      unitIds: selectedUnitIds,
      chassisList: unitsToMove.map(u => u.chassisNumber),
      modelName: unitsToMove[0]?.modelName || 'Multiple Models',
      vehicleType: unitsToMove[0]?.vehicleType || '2W',
      status: 'IN_TRANSIT',
      initiatedBy: currentUser?.name || (isSw ? 'Msimamizi' : 'Manager'),
      notes,
    };

    onTransferCompleted(newTransfer, updatedUnits);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0F172A] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006948] to-[#00855d] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isSw ? 'Uhamisho wa Pikipiki' : 'Motorcycle Stock Transfer'}
              </h2>
              <p className="text-xs text-slate-500">
                {isSw ? 'Hamisha chombo toka tawi moja kwenda tawi jingine' : 'Transfer inventory between dealership branches'}
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* From & To Branch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                {isSw ? 'Kutoka Tawi:' : 'From Branch:'}
              </label>
              <select
                disabled={isBranchStaff}
                value={fromBranchId}
                onChange={(e) => {
                  setFromBranchId(e.target.value);
                  setSelectedUnitIds([]);
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                {isSw ? 'Kwenda Tawi:' : 'To Branch:'}
              </label>
              <select
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
              >
                {branches
                  .filter((b) => b.id !== fromBranchId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.zone})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Select Units */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {isSw ? 'Chagua Pikipiki za Kuhamisha:' : 'Select Motorcycles to Transfer:'}
              </label>
              <span className="text-xs text-[#006948] dark:text-emerald-400 font-semibold">
                {isSw ? `Zilizochaguliwa: ${selectedUnitIds.length}` : `Selected: ${selectedUnitIds.length}`}
              </span>
            </div>

            {availableUnitsForFromBranch.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-xs">
                {isSw ? 'Hakuna pikipiki zilizopo stoo kwenye tawi hili.' : 'No available motorcycles in stock at this branch.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {availableUnitsForFromBranch.map((u) => {
                  const isChecked = selectedUnitIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUnitSelection(u.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-[#00855d] bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#006948] cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {u.modelName} ({u.vehicleType})
                          </p>
                          <p className="text-[11px] font-mono text-[#006948] dark:text-emerald-400 font-medium">
                            Chassis: {u.chassisNumber}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                        {u.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              {isSw ? 'Sababu ya Uhamisho / Maelekezo:' : 'Transfer Reason / Instructions:'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isSw ? 'Mfano: Uhitaji wa wateja Pemba, kundi la bodaboda limeomba units 2.' : 'E.g. High demand in Pemba, bodaboda cooperative requested 2 units.'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            {isSw ? 'Ghairi' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirmTransfer}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#005a3e] text-white flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            <span>{isSw ? 'Thibitisha Uhamisho' : 'Confirm Transfer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
