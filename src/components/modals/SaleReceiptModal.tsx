import React from 'react';
import { SaleRecord, Language } from '../../types';
import { DEALER_INFO } from '../../data/mockData';

interface SaleReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
  language?: Language;
}

export const SaleReceiptModal: React.FC<SaleReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  language = 'sw',
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSw = language === 'sw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-white uppercase tracking-wider">
              {isSw ? 'Risiti Rasmi ya Mauzo' : 'Official Sales Receipt'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-8 space-y-5 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[75vh]" id="printable-receipt">
          {/* Company Branding */}
          <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans uppercase">
              {DEALER_INFO.name}
            </h2>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-0.5">
              {DEALER_INFO.type}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
              <span>{isSw ? 'KODI YA DEALER' : 'DEALER CODE'}: <span className="font-semibold text-slate-700 dark:text-slate-300">{DEALER_INFO.code}</span></span>
              <span>•</span>
              <span>TEL: {DEALER_INFO.phone}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isSw ? 'Tawi' : 'Branch'}: <span className="font-semibold text-slate-800 dark:text-slate-200">{sale.branchName}</span> ({sale.branchCode})
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-medium">{isSw ? 'Nambari ya Risiti:' : 'Receipt Number:'}</p>
              <p className="font-mono font-semibold text-[#006948] dark:text-emerald-400 text-sm mt-0.5">
                {sale.receiptNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] uppercase font-medium">{isSw ? 'Tarehe ya Mauzo:' : 'Sale Date:'}</p>
              <p className="font-mono font-medium text-slate-700 dark:text-slate-200 mt-0.5">{sale.date}</p>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{isSw ? 'Taarifa za Mteja:' : 'Customer Information:'}</p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{sale.customerName}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-500 font-mono pt-0.5">
              <span>{isSw ? 'Simu' : 'Phone'}: {sale.customerPhone}</span>
              <span>•</span>
              <span className="font-sans">{isSw ? 'Mhudumu' : 'Salesperson'}: {sale.salespersonName}</span>
            </div>
          </div>

          {/* Vehicle Particulars (Crucial for Motorcycle Dealer) */}
          <div className="space-y-2.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-4">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              {isSw ? 'Maelezo ya Chombo:' : 'Vehicle Particulars:'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">{isSw ? 'Model & Aina:' : 'Model & Type:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{sale.modelName} ({sale.vehicleType})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isSw ? 'Nambari ya Chombo:' : 'Unit ID:'}</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{sale.unitId}</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-slate-500 text-[10px] block font-medium">CHASSIS / VIN NUMBER:</span>
                <span className="font-mono font-bold text-sm text-[#006948] dark:text-emerald-400 tracking-wider">
                  {sale.chassisNumber}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-[10px] block">{isSw ? 'NAMBARI YA ENGINE:' : 'ENGINE NUMBER:'}</span>
                <span className="font-mono font-semibold text-xs text-slate-800 dark:text-slate-200">{sale.engineNumber}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Payment Method */}
          {(() => {
            const unitPrice = sale.unitPrice ?? sale.amount;
            const isPartial = sale.paymentStatus === 'PARTIAL' || (sale.remainedAmount !== undefined && sale.remainedAmount > 0);
            const amountPaid = sale.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
            const remained = sale.remainedAmount ?? Math.max(0, unitPrice - amountPaid);

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{isSw ? 'Njia ya Malipo:' : 'Payment Method:'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {sale.paymentMethod.replace('_', ' ')} {sale.paymentRef ? `(${sale.paymentRef})` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{isSw ? 'Hali ya Malipo:' : 'Payment Status:'}</span>
                  {isPartial ? (
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">timelapse</span>
                      {isSw ? 'MALIPO YA SEHEMU' : 'PARTIALLY PAID'}
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {isSw ? 'IMELIPWA KAMILI' : 'FULLY PAID'}
                    </span>
                  )}
                </div>

                {isPartial && (
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="text-slate-500">{isSw ? 'Bei Kamili ya Chombo:' : 'Full Unit Price:'}</span>
                    <span className="font-mono font-semibold">TZS {unitPrice.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm sm:text-base pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{isSw ? 'Kiasi Kilicholipwa:' : 'Total Amount Paid:'}</span>
                  <span className="font-bold text-base sm:text-lg text-[#006948] dark:text-emerald-400 font-mono">
                    TZS {amountPaid.toLocaleString()}
                  </span>
                </div>

                {remained > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1 text-amber-700 dark:text-amber-400">
                    <span className="font-medium">{isSw ? 'Baki Inayodaiwa:' : 'Remaining Balance:'}</span>
                    <span className="font-bold font-mono">TZS {remained.toLocaleString()}</span>
                  </div>
                )}

                {sale.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                    {isSw ? 'Maelezo' : 'Notes'}: {sale.notes}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Official Footer Verification */}
          <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 space-y-1">
            <p className="font-medium text-emerald-600 dark:text-emerald-400">
              {isSw ? '✓ CHOMBO HIKI KIMEONDOLEWA KWENYE STOO NA KUSAJILIWA KISHERIA' : '✓ THIS VEHICLE HAS BEEN DISPATCHED FROM INVENTORY AND LEGALLY REGISTERED'}
            </p>
            <p>{isSw ? `Asante kwa kufanya biashara na ${DEALER_INFO.name}.` : `Thank you for doing business with ${DEALER_INFO.name}.`}</p>
            <p className="font-mono text-slate-400">{isSw ? 'Mfumo wa Dealer Management System • v4.8' : 'Dealer Management System ERP • v4.8'}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            {isSw ? 'Funga' : 'Close'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#005a3e] text-white flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>{isSw ? 'Chapa Risiti' : 'Print Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
