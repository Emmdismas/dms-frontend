import React, { useState, useRef, useEffect } from 'react';
import { VehicleUnit, VehicleModel, Branch, AuthUser, Language } from '../../types';

interface QueuedItem {
  id: string;
  chassisNumber: string;
  modelId: string;
  modelName: string;
  vehicleType: VehicleModel['type'];
  brand: string;
  color: string;
  costPrice: number;
  sellingPrice: number;
}

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: VehicleModel[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onStockReceived: (newUnits: VehicleUnit[]) => void;
  language?: Language;
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  isOpen,
  onClose,
  models,
  branches,
  currentUser,
  onStockReceived,
  language = 'sw',
}) => {
  const isSw = language === 'sw';

  // Auto-detect user's branch (No manual selector needed per user rule)
  const userBranch = (currentUser?.branchCode
    ? branches.find((b) => b.code === currentUser.branchCode)
    : null) || branches[0];

  // Input states
  const [inputMode, setInputMode] = useState<'scan' | 'manual'>('manual');
  const [chassisInput, setChassisInput] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');
  const [color, setColor] = useState<string>(isSw ? 'Nyeusi' : 'Black');
  const [queuedUnits, setQueuedUnits] = useState<QueuedItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Selected Model calculation
  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  // Cleanup on modal close
  useEffect(() => {
    if (!isOpen) {
      handleStopCamera();
      setChassisInput('');
      setQueuedUnits([]);
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleStartCamera = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg(isSw ? 'Kamera haipatikani kwenye kivinjari hiki.' : 'Camera not supported in browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setErrorMsg(isSw ? 'Imeshindwa kufungua kamera. Tafadhali andika namba ya chassis kwa mkono.' : 'Unable to access camera. Please enter chassis manually.');
      setIsCameraActive(false);
    }
  };

  // Mock scan capture
  const handleSimulateScan = () => {
    if (!currentModel) return;
    const brandPrefix = (currentModel.brand || 'TVS').substring(0, 3).toUpperCase();
    const scannedChassis = `${brandPrefix}${String(Date.now()).slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Add directly to queue on scan
    const cost = currentModel.buyingPrice || Math.round(currentModel.defaultPrice * 0.82);
    const retail = currentModel.defaultPrice;

    setQueuedUnits((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${Math.random()}`,
        chassisNumber: scannedChassis,
        modelId: currentModel.id,
        modelName: currentModel.name,
        vehicleType: currentModel.type,
        brand: currentModel.brand,
        color: color || (isSw ? 'Nyeusi' : 'Black'),
        costPrice: cost,
        sellingPrice: retail,
      },
    ]);

    setChassisInput('');
    handleStopCamera();
  };

  // Add currently typed unit to the queue
  const handleAddToQueue = () => {
    setErrorMsg('');
    const cleanChassis = chassisInput.trim().toUpperCase();

    if (!cleanChassis) {
      setErrorMsg(isSw ? 'Tafadhali andika namba ya Chassis (VIN) kwanza.' : 'Please enter a Chassis (VIN) number first.');
      return;
    }

    // Check duplicate in current queue
    if (queuedUnits.some((u) => u.chassisNumber === cleanChassis)) {
      setErrorMsg(isSw ? `Chassis hii (${cleanChassis}) tayari ipo kwenye orodha ya kupokea.` : `VIN (${cleanChassis}) is already in the list.`);
      return;
    }

    if (!currentModel) {
      setErrorMsg(isSw ? 'Tafadhali chagua Model ya chombo.' : 'Please select vehicle model.');
      return;
    }

    const cost = currentModel.buyingPrice || Math.round(currentModel.defaultPrice * 0.82);
    const retail = currentModel.defaultPrice;

    setQueuedUnits((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${Math.random()}`,
        chassisNumber: cleanChassis,
        modelId: currentModel.id,
        modelName: currentModel.name,
        vehicleType: currentModel.type,
        brand: currentModel.brand,
        color: color || (isSw ? 'Nyeusi' : 'Black'),
        costPrice: cost,
        sellingPrice: retail,
      },
    ]);

    // Clear input for next entry
    setChassisInput('');
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueuedUnits((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    setQueuedUnits([]);
  };

  // Submit all items
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let finalItems = [...queuedUnits];

    // If user typed a chassis but didn't press "Add", include it automatically
    if (chassisInput.trim()) {
      const cleanChassis = chassisInput.trim().toUpperCase();
      if (!finalItems.some((u) => u.chassisNumber === cleanChassis) && currentModel) {
        finalItems.push({
          id: `q-${Date.now()}`,
          chassisNumber: cleanChassis,
          modelId: currentModel.id,
          modelName: currentModel.name,
          vehicleType: currentModel.type,
          brand: currentModel.brand,
          color: color || (isSw ? 'Nyeusi' : 'Black'),
          costPrice: currentModel.buyingPrice || Math.round(currentModel.defaultPrice * 0.82),
          sellingPrice: currentModel.defaultPrice,
        });
      }
    }

    if (finalItems.length === 0) {
      setErrorMsg(isSw ? 'Tafadhali weka angalau chombo kimoja kwenye orodha kabla ya kuthibitisha.' : 'Please add at least one vehicle to the receiving list.');
      return;
    }

    const todayStr = '2026-09-23';
    const branchCode = userBranch?.code || 'DAR-0001';
    const branchName = userBranch?.name || 'Main Branch';
    const branchId = userBranch?.id || 'b1';

    const newUnits: VehicleUnit[] = finalItems.map((item, idx) => {
      const unitId = `UNT-${branchCode.split('-').pop()}-${String(Math.floor(100 + idx * 17 + Math.random() * 800))}`;
      const engineNo = `ENG-${item.brand.substring(0, 2).toUpperCase()}-${item.chassisNumber.slice(-5)}`;

      return {
        id: unitId,
        modelId: item.modelId,
        modelName: item.modelName,
        vehicleType: item.vehicleType,
        chassisNumber: item.chassisNumber,
        engineNumber: engineNo,
        color: item.color,
        branchId: branchId,
        branchCode: branchCode,
        branchName: branchName,
        dealerCode: userBranch?.dealerCode || currentUser?.dealerCode || 'C-DAR-N00988',
        dealerName: userBranch?.dealerName || currentUser?.dealerName || 'Dealer',
        status: 'IN STOCK',
        receivedDate: todayStr,
        stockAgeDays: 0,
        costPrice: item.costPrice,
        price: item.sellingPrice,
        journey: [
          {
            id: `j-rcv-${Date.now()}-${idx}`,
            date: todayStr,
            title: isSw ? `Kupokelewa Tawi la ${branchName}` : `Stock Received at ${branchName}`,
            description: isSw 
              ? `Chombo kipya kimepokelewa stoo ya ${branchName}. Namba ya Chassis: ${item.chassisNumber}.`
              : `New unit received at ${branchName}. Chassis VIN: ${item.chassisNumber}.`,
            branch: branchName,
            actor: currentUser?.name || (isSw ? 'Mtunza Stoo' : 'Storekeeper'),
            type: 'received',
          },
        ],
      };
    });

    onStockReceived(newUnits);
    onClose();
  };

  if (!isOpen) return null;

  const totalCount = queuedUnits.length + (chassisInput.trim() ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[94vh]">
        
        {/* Header with Auto-Assigned Branch Badge */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#006948] via-[#007a54] to-[#00855d] text-white flex items-center justify-center shadow-md shadow-emerald-950/30 shrink-0">
              <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-sans truncate">
                  {isSw ? 'Pokea Mzigo wa Pikipiki' : 'Receive Motorcycle Stock'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-[#006948] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                  🏬 {userBranch?.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {isSw ? 'Scan au andika namba ya Chassis kisha weka kwenye orodha' : 'Scan or enter Chassis VIN to add units to receiving list'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinalSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-lg shrink-0 text-red-500">error</span>
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* 1. CHASSIS INPUT: Clean Option Cards (Scan vs Manual Type) */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              {isSw ? '1. Njia ya Kuingiza Chassis (VIN):' : '1. Chassis Entry Mode:'} <span className="text-red-500">*</span>
            </label>

            {/* Selection Cards */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputMode('scan');
                  handleStartCamera();
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                  inputMode === 'scan'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-[#006948] ring-2 ring-emerald-500/20 text-[#006948] dark:text-emerald-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                <span className="text-xs font-bold">{isSw ? 'Scan kwa Kamera' : 'Scan with Camera'}</span>
                <span className="text-[10px] opacity-75">{isSw ? 'Soma Barcode/QR' : 'Barcode/QR reader'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode('manual');
                  handleStopCamera();
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                  inputMode === 'manual'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-[#006948] ring-2 ring-emerald-500/20 text-[#006948] dark:text-emerald-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">keyboard</span>
                <span className="text-xs font-bold">{isSw ? 'Andika kwa Mkono' : 'Type Manually'}</span>
                <span className="text-[10px] opacity-75">{isSw ? 'Weka namba moja kwa moja' : 'Direct text input'}</span>
              </button>
            </div>

            {/* Camera Scanner Viewfinder */}
            {inputMode === 'scan' && isCameraActive && (
              <div className="p-3 rounded-2xl bg-black border border-emerald-500/40 text-center animate-in fade-in space-y-2 mt-2">
                <div className="relative w-full max-w-xs mx-auto aspect-4/3 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none m-4 flex items-center justify-center">
                    <span className="text-[10px] text-emerald-300 font-mono bg-black/70 px-2 py-0.5 rounded">
                      {isSw ? 'Lenga Barcode ya Chassis' : 'Align Chassis Barcode'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{isSw ? 'Soma & Weka Orodhani' : 'Capture & Add Unit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    {isSw ? 'Funga' : 'Close'}
                  </button>
                </div>
              </div>
            )}

            {/* Manual Chassis Input Field */}
            {inputMode === 'manual' && (
              <div className="relative pt-1">
                <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-slate-400 text-base">
                  pin
                </span>
                <input
                  type="text"
                  placeholder={isSw ? 'Mfano: MD625AX089450A' : 'e.g. MD625AX089450A'}
                  value={chassisInput}
                  onChange={(e) => setChassisInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToQueue();
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}
          </div>

          {/* 2. MODEL & COLOR ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Model */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                {isSw ? '2. Mfano wa Chombo (Model):' : '2. Vehicle Model:'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">
                  two_wheeler
                </span>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-[#006948] cursor-pointer"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.type} • {m.brand})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                {isSw ? 'Rangi ya Chombo:' : 'Color:'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">
                  palette
                </span>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-[#006948] cursor-pointer"
                >
                  <option value={isSw ? 'Nyeusi' : 'Black'}>{isSw ? 'Nyeusi (Black)' : 'Black'}</option>
                  <option value={isSw ? 'Nyekundu' : 'Red'}>{isSw ? 'Nyekundu (Red)' : 'Red'}</option>
                  <option value={isSw ? 'Bluu' : 'Blue'}>{isSw ? 'Bluu (Blue)' : 'Blue'}</option>
                  <option value={isSw ? 'Kijani' : 'Green'}>{isSw ? 'Kijani (Green)' : 'Green'}</option>
                  <option value={isSw ? 'Kijivu' : 'Silver'}>{isSw ? 'Kijivu (Silver)' : 'Silver'}</option>
                  <option value={isSw ? 'Nyeupe' : 'White'}>{isSw ? 'Nyeupe (White)' : 'White'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* ADD TO LIST BUTTON */}
          <button
            type="button"
            onClick={handleAddToQueue}
            className="w-full py-2.5 px-4 rounded-xl border border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#006948] dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{isSw ? '+ Weka Kwenye Orodha ya Kupokea' : '+ Add Unit to Receiving Queue'}</span>
          </button>

          {/* 3. RECEIVING QUEUE LIST (Shows all units ready to be saved) */}
          {queuedUnits.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">checklist</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {isSw ? `Vitengo Vilivyo Orodhani (${queuedUnits.length})` : `Queued Units (${queuedUnits.length})`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleClearQueue}
                  className="text-[11px] font-bold text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                >
                  {isSw ? 'Futa Zote' : 'Clear All'}
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
                {queuedUnits.map((unit, idx) => (
                  <div
                    key={unit.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 transition-all hover:border-emerald-500/30"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Index / Vehicle Icon Badge */}
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">
                        {idx + 1}
                      </span>

                      {/* Info */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-emerald-300 tracking-wide truncate">
                            {unit.chassisNumber}
                          </p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {unit.color}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                          {unit.modelName} <span className="text-slate-400 dark:text-slate-500 font-normal">({unit.vehicleType} • {unit.brand})</span>
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromQueue(unit.id)}
                      className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-500 dark:text-red-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title={isSw ? 'Ondoa chombo hiki' : 'Remove this unit'}
                      aria-label="Remove unit"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isSw ? `Jumla: ${totalCount} Vitengo` : `Total: ${totalCount} Units`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              >
                {isSw ? 'Ghairi' : 'Cancel'}
              </button>
              
              <button
                type="submit"
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#006948] via-[#007a54] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] rounded-xl shadow-lg shadow-emerald-950/30 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 ring-1 ring-white/20"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>
                  {totalCount > 1 
                    ? (isSw ? `Thibitisha na Pokea Vitengo (${totalCount})` : `Confirm & Receive (${totalCount} Units)`)
                    : (isSw ? 'Thibitisha na Pokea Stoo' : 'Confirm & Receive Stock')}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiveStockModal;
