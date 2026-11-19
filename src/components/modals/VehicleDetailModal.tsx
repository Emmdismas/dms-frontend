import React from 'react';
import { VehicleUnit, Language } from '../../types';
import { formatVehicleColor } from '../../i18n/translations';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: VehicleUnit | null;
  onInitiateSale: (unit: VehicleUnit) => void;
  onInitiateTransfer: (unit: VehicleUnit) => void;
  onReleaseVehicle?: (unit: VehicleUnit) => void;
  language?: Language;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  unit,
  onInitiateSale,
  onInitiateTransfer,
  onReleaseVehicle,
  language = 'sw',
}) => {
  if (!isOpen || !unit) return null;
  const isSw = language === 'sw';

  const getStatusBadge = (status: VehicleUnit['status']) => {
    switch (status) {
      case 'IN STOCK':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'SOLD':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'RESERVED':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'TRANSFERRED':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'DAMAGED':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0F172A] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006948] to-[#00855d] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {unit.modelName}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {unit.vehicleType}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                SN: {unit.id} • {isSw ? 'Rangi' : 'Color'}: {formatVehicleColor(unit.color, language)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadge(unit.status)}`}>
              {unit.status}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Main Vehicle Particulars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Chassis (VIN):</span>
              <span className="text-xs font-mono font-bold text-[#006948] dark:text-emerald-400 mt-1 block truncate">
                {unit.chassisNumber}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">{isSw ? 'Namba ya Engine:' : 'Engine Number:'}</span>
              <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white mt-1 block truncate">
                {unit.engineNumber}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">{isSw ? 'Tawi Lililopo:' : 'Current Branch:'}</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1 block truncate">
                {unit.branchName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">{isSw ? 'Umri wa Stoo:' : 'Stock Age:'}</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1 block">
                {unit.stockAgeDays} {isSw ? 'Siku' : 'Days'}
              </span>
            </div>
          </div>

          {/* If Reserved, show Reservation Banner */}
          {unit.status === 'RESERVED' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <p className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                    {isSw ? 'Chombo Kimehifadhiwa (Reserved Stock):' : 'Reserved Unit (Awaiting Handover):'}
                  </p>
                </div>
                <p className="text-sm font-bold mt-1 text-slate-900 dark:text-white">
                  {unit.reservedCustomerName || unit.soldToCustomerName || (isSw ? 'Mteja Aliyeweka Oda' : 'Customer')}
                  {unit.reservedCustomerPhone && (
                    <span className="text-xs font-mono text-slate-500 font-normal ml-2">
                      ({unit.reservedCustomerPhone})
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-amber-800 dark:text-amber-300 font-medium">
                  <span className="material-symbols-outlined text-[15px]">event</span>
                  <span>
                    {isSw ? 'Tarehe ya Kuchukua Chombo:' : 'Scheduled Pick-up Date:'} <strong className="font-mono font-bold underline">{unit.pickupDate || 'Inasubiri kupangwa'}</strong>
                  </span>
                </div>
              </div>

              {onReleaseVehicle && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(isSw ? `Je, una uhakika wa kumkabidhi mteja (${unit.reservedCustomerName || 'Mteja'}) chombo hiki (Chassis: ${unit.chassisNumber}) na kukitoa rasmi stoo?` : `Are you sure you want to release this unit (Chassis: ${unit.chassisNumber}) to the customer?`)) {
                      onReleaseVehicle(unit);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#006948] hover:bg-[#005a3e] text-white flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-center"
                >
                  <span className="material-symbols-outlined text-[17px]">task_alt</span>
                  <span>{isSw ? 'Kabidhi Chombo (Release)' : 'Release Vehicle'}</span>
                </button>
              )}
            </div>
          )}

          {/* If Sold, show Customer Banner */}
          {unit.status === 'SOLD' && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-900 dark:text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                  {isSw ? 'Taarifa za Mnunuzi:' : 'Buyer Information:'}
                </p>
                <p className="text-sm font-semibold mt-0.5">{unit.soldToCustomerName || (isSw ? 'Mteja Rasmi' : 'Registered Customer')}</p>
                <p className="text-xs text-slate-500">
                  {isSw ? `Iliuzwa tarehe: ${unit.soldDate || unit.releasedDate || '2026-09-23'} • TZS ${unit.soldAmount?.toLocaleString()}` : `Sold on: ${unit.soldDate || unit.releasedDate || '2026-09-23'} • TZS ${unit.soldAmount?.toLocaleString()}`}
                </p>
              </div>
              <span className="material-symbols-outlined text-blue-500 text-3xl">verified</span>
            </div>
          )}

          {/* Vehicle Journey Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00855d] text-[20px]">timeline</span>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                {isSw ? 'Historia & Safari ya Chombo' : 'Vehicle Journey Timeline'}
              </h3>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {unit.journey.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                    <span className="material-symbols-outlined text-[12px]">
                      {event.type === 'received' ? 'download' :
                       event.type === 'assigned' ? 'store' :
                       event.type === 'transferred' ? 'local_shipping' :
                       event.type === 'reserved' ? 'event_upcoming' :
                       event.type === 'sold' ? 'check' : 'event'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">{event.title}</span>
                      <span className="text-[11px] font-mono text-slate-400">{event.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{event.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                      <span>{isSw ? 'Tawi' : 'Branch'}: {event.branch}</span>
                      <span>•</span>
                      <span>{isSw ? 'Afisa' : 'Officer'}: {event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Verification Block */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-3xl">qr_code_2</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {isSw ? 'QR Code & Usajili wa Dijitali' : 'Digital Registry & QR Code'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isSw ? 'Scan ili kufungua jalada la pikipiki hii mtandaoni popote.' : 'Scan to access digital records for this motorcycle anytime.'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              SCAN-READY
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            {isSw ? 'Funga' : 'Close'}
          </button>

          {unit.status === 'RESERVED' && onReleaseVehicle && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(isSw ? `Je, unathibitisha kumkabidhi mteja chombo hiki (Chassis: ${unit.chassisNumber}) na kukamilisha makabidhiano (Release)?` : `Confirm vehicle handover and release to customer (Chassis: ${unit.chassisNumber})?`)) {
                    onReleaseVehicle(unit);
                    onClose();
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#006948] hover:bg-[#005a3e] text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>{isSw ? 'Kabidhi Chombo Sasa (Release)' : 'Release Vehicle Now'}</span>
              </button>
            </div>
          )}

          {unit.status === 'IN STOCK' && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onInitiateTransfer(unit);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                <span>{isSw ? 'Hamisha Tawi' : 'Transfer Branch'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onInitiateSale(unit);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#005a3e] text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">point_of_sale</span>
                <span>{isSw ? 'Sajili Mauzo' : 'Record Sale'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
