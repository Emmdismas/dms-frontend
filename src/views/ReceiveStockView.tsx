import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { VehicleUnit, VehicleModel, Branch, AuthUser, Language } from '../types';

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
  addedAt: string;
}

interface ReceiveStockViewProps {
  models: VehicleModel[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onStockReceived: (newUnits: VehicleUnit[]) => void;
  onBack: () => void;
  isDarkMode: boolean;
  language?: Language;
}

// Audio beep feedback helper for instant scan recognition
const playScanChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz (A5)
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1); // Upward chirp (E6)

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // AudioContext blocked or unsupported - fail silently
  }
};

export const ReceiveStockView: React.FC<ReceiveStockViewProps> = ({
  models,
  branches,
  currentUser,
  onStockReceived,
  onBack,
  isDarkMode,
  language = 'sw',
}) => {
  const isSw = language === 'sw';

  // Auto-detect user's branch
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
  const [successToast, setSuccessToast] = useState<string>('');
  
  // Cart Drawer State
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Camera & Real-Time Auto-Decoder State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [scanFlashMessage, setScanFlashMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  
  // Cooldown tracker to avoid scanning same barcode 20 times in a row
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimestampRef = useRef<number>(0);

  // Selected Model calculation
  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  // Add unit automatically from QR Code or Manual Input
  const addUnitToQueue = useCallback((rawChassis: string) => {
    setErrorMsg('');
    let clean = rawChassis.trim().toUpperCase();
    
    // Clean potential prefixes from QR payload (e.g. "VIN:MD625...", "CHASSIS:...", "http://.../MD625...")
    clean = clean.replace(/^(VIN|CHASSIS|FRAME|NO|ID)[:=\s]+/i, '');
    if (clean.includes('/')) {
      clean = clean.split('/').pop() || clean;
    }
    clean = clean.replace(/[^A-Z0-9]/g, '');

    if (!clean) {
      return;
    }

    if (!currentModel) {
      setErrorMsg(isSw ? 'Tafadhali chagua Model ya chombo.' : 'Please select vehicle model.');
      return;
    }

    // Check duplicate in cart
    setQueuedUnits((prev) => {
      if (prev.some((u) => u.chassisNumber === clean)) {
        setErrorMsg(isSw ? `Chassis hii (${clean}) tayari ipo kwenye orodha.` : `VIN (${clean}) is already in the list.`);
        return prev;
      }

      // Play audio chirp & vibrate phone
      playScanChime();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(80);
      }

      // Flash visual indicator on scanner
      setScanFlashMessage(clean);
      setTimeout(() => setScanFlashMessage(null), 1600);

      const cost = currentModel.buyingPrice || Math.round(currentModel.defaultPrice * 0.82);
      const retail = currentModel.defaultPrice;

      setSuccessToast(isSw ? `✓ Imesoma na Kuweka Orodhani: ${clean}` : `✓ Scanned & Added: ${clean}`);
      setTimeout(() => setSuccessToast(''), 3500);

      return [
        {
          id: `q-${Date.now()}-${Math.random()}`,
          chassisNumber: clean,
          modelId: currentModel.id,
          modelName: currentModel.name,
          vehicleType: currentModel.type,
          brand: currentModel.brand,
          color: color || (isSw ? 'Nyeusi' : 'Black'),
          costPrice: cost,
          sellingPrice: retail,
          addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ];
    });

    setChassisInput('');
  }, [currentModel, color, isSw]);

  // Real-time automatic barcode & QR code detection loop
  const startScanLoop = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = () => {
      if (!videoRef.current || !streamRef.current) return;

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 1. Run jsQR decoder
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data.trim()) {
          const detectedString = code.data.trim();
          const now = Date.now();

          // Cooldown check (2.5s) to avoid multi-fire on same QR code
          if (
            lastScannedCodeRef.current !== detectedString ||
            now - lastScanTimestampRef.current > 2500
          ) {
            lastScannedCodeRef.current = detectedString;
            lastScanTimestampRef.current = now;
            addUnitToQueue(detectedString);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  }, [addUnitToQueue]);

  const handleStopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
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
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            startScanLoop();
          }).catch(() => {});
        }
      }, 150);
    } catch {
      setErrorMsg(isSw ? 'Imeshindwa kufungua kamera. Tafadhali andika namba ya chassis kwa mkono.' : 'Unable to access camera. Please enter chassis manually.');
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, []);

  // Manual Add Unit button
  const handleManualAdd = () => {
    if (!chassisInput.trim()) {
      setErrorMsg(isSw ? 'Tafadhali andika namba ya Chassis (VIN) kwanza.' : 'Please enter a Chassis (VIN) number first.');
      return;
    }
    addUnitToQueue(chassisInput);
  };

  // Test Sample QR / Barcode generator for instant testing
  const handleTestSimulateQR = () => {
    if (!currentModel) return;
    const brandPrefix = (currentModel.brand || 'TVS').substring(0, 3).toUpperCase();
    const testChassis = `${brandPrefix}${String(Date.now()).slice(-5)}${Math.floor(1000 + Math.random() * 9000)}`;
    addUnitToQueue(testChassis);
  };

  const handleRemoveFromCart = (id: string) => {
    setQueuedUnits((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setQueuedUnits([]);
    setIsCartOpen(false);
  };

  // Submit all items
  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    let finalItems = [...queuedUnits];

    // If user typed a chassis but didn't click "Add", include it automatically
    if (chassisInput.trim()) {
      const cleanChassis = chassisInput.trim().toUpperCase();
      if (!finalItems.some((u) => u.chassisNumber === cleanChassis) && currentModel) {
        finalItems = [
          {
            id: `q-${Date.now()}`,
            chassisNumber: cleanChassis,
            modelId: currentModel.id,
            modelName: currentModel.name,
            vehicleType: currentModel.type,
            brand: currentModel.brand,
            color: color || (isSw ? 'Nyeusi' : 'Black'),
            costPrice: currentModel.buyingPrice || Math.round(currentModel.defaultPrice * 0.82),
            sellingPrice: currentModel.defaultPrice,
            addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...finalItems,
        ];
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
    onBack();
  };

  const totalCount = queuedUnits.length + (chassisInput.trim() ? 1 : 0);

  return (
    <div className="space-y-4 sm:space-y-5 pb-28 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0E131F] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
            title={isSw ? 'Rudi Nyuma' : 'Go Back'}
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white font-sans truncate tracking-tight">
                {isSw ? 'Pokea Mzigo wa Pikipiki' : 'Receive Motorcycle Stock'}
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-[#006948] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">store</span>
                {userBranch?.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isSw ? 'Lenga QR code ya chassis kusoma kiotomatiki au andika kwa mkono' : 'Auto-detect chassis QR codes or type manually'}
            </p>
          </div>
        </div>

        {/* COMPACT CART ICON ONLY (With Top-Right Count Badge) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`relative w-11 h-11 rounded-2xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-sm ${
              queuedUnits.length > 0
                ? 'bg-[#006948] text-white border-emerald-600 shadow-emerald-950/30 ring-2 ring-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            aria-label="View cart"
            title={isSw ? `Orodha ya Mzigo (${queuedUnits.length})` : `Queued Stock (${queuedUnits.length})`}
          >
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            
            {/* Numeric Top-Right Badge */}
            {queuedUnits.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black font-mono flex items-center justify-center ring-2 ring-white dark:ring-[#0E131F] shadow-sm animate-in zoom-in duration-200">
                {queuedUnits.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* FEEDBACK TOASTS */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-emerald-500">check_circle</span>
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="text-[11px] font-black underline hover:no-underline cursor-pointer"
          >
            {isSw ? 'Fungua Orodha (Cart)' : 'View Cart'}
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-bold flex items-center gap-2 shadow-xs animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-lg text-red-500 shrink-0">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. MAIN RECEIVING FORM WORKSTATION */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="bg-white dark:bg-[#0E131F] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          
          {/* STEP 1: CHASSIS ENTRY METHOD (Auto QR Scan vs Type) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#006948] text-white text-[10px] font-bold flex items-center justify-center">1</span>
              {isSw ? 'Njia ya Kuingiza Chassis (VIN):' : 'Chassis Entry Mode:'}
              <span className="text-red-500">*</span>
            </label>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setInputMode('scan');
                  handleStartCamera();
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 active:scale-95 ${
                  inputMode === 'scan'
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-[#006948] ring-2 ring-emerald-500/25 text-[#006948] dark:text-emerald-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inputMode === 'scan' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold block">{isSw ? 'Scan QR / Barcode' : 'Auto QR / Barcode'}</span>
                  <span className="text-[11px] opacity-75">{isSw ? 'Inasoma kiotomatiki' : 'Continuous auto-detect'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode('manual');
                  handleStopCamera();
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 active:scale-95 ${
                  inputMode === 'manual'
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-[#006948] ring-2 ring-emerald-500/25 text-[#006948] dark:text-emerald-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inputMode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <span className="material-symbols-outlined text-[22px]">keyboard</span>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold block">{isSw ? 'Andika kwa Mkono' : 'Type Manually'}</span>
                  <span className="text-[11px] opacity-75">{isSw ? 'Weka namba moja kwa moja' : 'Direct VIN input'}</span>
                </div>
              </button>
            </div>

            {/* AUTOMATIC CAMERA SCANNER VIEWFINDER */}
            {inputMode === 'scan' && isCameraActive && (
              <div className="p-3 sm:p-4 rounded-3xl bg-black border border-emerald-500/40 text-center animate-in fade-in space-y-3 mt-3 shadow-2xl overflow-hidden relative">
                
                {/* Viewfinder Window */}
                <div className="relative w-full max-w-sm mx-auto aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Laser Scanning Animation Beam */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                    <div className="relative w-full h-full border-2 border-dashed border-emerald-400/80 rounded-xl flex items-center justify-center overflow-hidden">
                      
                      {/* Moving Laser Beam */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse" 
                           style={{ animation: 'scanBeam 2.2s infinite ease-in-out' }}
                      />

                      {/* Instant Success Flash Overlay */}
                      {scanFlashMessage && (
                        <div className="absolute inset-0 bg-emerald-600/80 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-in zoom-in duration-200 p-3">
                          <span className="material-symbols-outlined text-4xl animate-bounce">check_circle</span>
                          <span className="font-mono font-black text-sm mt-1">{scanFlashMessage}</span>
                          <span className="text-[11px] font-bold text-emerald-100">{isSw ? 'Imeongezwa!' : 'Added!'}</span>
                        </div>
                      )}

                      {!scanFlashMessage && (
                        <div className="bg-black/75 px-3 py-1.5 rounded-xl border border-emerald-400/40 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>{isSw ? 'Inasoma QR Code kiotomatiki...' : 'Auto-detecting QR code...'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-controls */}
                <div className="flex items-center justify-between gap-2 max-w-sm mx-auto pt-1">
                  <button
                    type="button"
                    onClick={handleTestSimulateQR}
                    className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 text-[11px] font-bold rounded-xl border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title={isSw ? 'Jaribu kuscan QR mfano' : 'Test sample QR capture'}
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>{isSw ? 'Jaribu Scan (Simulate)' : 'Sample QR Test'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    {isSw ? 'Funga Kamera' : 'Close Camera'}
                  </button>
                </div>
              </div>
            )}

            {/* MANUAL CHASSIS INPUT */}
            {inputMode === 'manual' && (
              <div className="space-y-2 pt-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
                    pin
                  </span>
                  <input
                    type="text"
                    placeholder={isSw ? 'Andika namba ya chassis (mfano: MD625AX089450A)...' : 'Type VIN number (e.g. MD625AX089450A)...'}
                    value={chassisInput}
                    onChange={(e) => setChassisInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleManualAdd();
                      }
                    }}
                    className="w-full pl-11 pr-3 py-3 text-xs sm:text-sm font-mono font-bold uppercase rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pl-1">
                  <span>{isSw ? 'Bonyeza kitufe cha chini kuongeza kwenye orodha.' : 'Click button below to append to list.'}</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: MODEL & COLOR SELECTION */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#006948] text-white text-[10px] font-bold flex items-center justify-center">2</span>
              {isSw ? 'Mfano wa Chombo & Rangi:' : 'Vehicle Model & Color:'}
              <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Model */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {isSw ? 'Model ya Chombo' : 'Vehicle Model'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
                    two_wheeler
                  </span>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-[#006948] cursor-pointer"
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
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {isSw ? 'Rangi ya Chombo' : 'Color'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
                    palette
                  </span>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-[#006948] cursor-pointer"
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
          </div>

          {/* MANUAL ADD TO CART ACTION BUTTON (Only when typing manually) */}
          {inputMode === 'manual' && (
            <button
              type="button"
              onClick={handleManualAdd}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-md shadow-emerald-950/20"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              <span>{isSw ? '+ Weka Chombo Kwenye Orodha (Cart)' : '+ Add Unit to Stock Queue'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. STICKY BOTTOM ACTION BAR (Cancel & Confirm Buttons Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/90 p-3 sm:p-4 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onBack}
            className="flex-1 sm:flex-initial sm:min-w-[120px] py-3 px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer transition-all active:scale-95 text-center"
          >
            {isSw ? 'Ghairi' : 'Cancel'}
          </button>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => handleFinalSubmit()}
            disabled={totalCount === 0}
            className={`flex-2 sm:flex-1 py-3 px-6 text-xs sm:text-sm font-bold text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              totalCount > 0
                ? 'bg-gradient-to-r from-[#006948] via-[#007a54] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] shadow-emerald-950/30 active:scale-98'
                : 'bg-slate-400 dark:bg-slate-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">done_all</span>
            <span>
              {totalCount > 1 
                ? (isSw ? `Thibitisha na Pokea (${totalCount})` : `Confirm & Receive (${totalCount} Units)`)
                : (isSw ? 'Thibitisha na Pokea' : 'Confirm & Receive')}
            </span>
          </button>

        </div>
      </div>

      {/* 4. CART SLIDE-OVER DRAWER / MODAL (Opens only when Cart Icon is clicked) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E131F] border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isSw ? `Orodha ya Mzigo (${queuedUnits.length})` : `Queued Stock (${queuedUnits.length})`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isSw ? 'Vyombo vilivyosubiri kuthibitishwa stoo' : 'Units waiting to be received'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close cart"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Drawer Body: Scanned Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
              {queuedUnits.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {isSw ? 'Orodha haina chombo chochote' : 'No units in cart'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                    {isSw ? 'Scan au andika namba za chassis kwenye ukurasa mkuu kisha weka hapa.' : 'Scan or type chassis VIN numbers on the main page to add items.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {isSw ? `Vitengo Vilivyosubiri (${queuedUnits.length})` : `Items in Batch (${queuedUnits.length})`}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-[11px] font-bold text-red-500 hover:text-red-400 cursor-pointer"
                    >
                      {isSw ? 'Futa Zote' : 'Clear All'}
                    </button>
                  </div>

                  {queuedUnits.map((unit, idx) => (
                    <div
                      key={unit.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 transition-all hover:border-emerald-500/30"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">
                          {idx + 1}
                        </span>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-emerald-300 tracking-wide truncate">
                              {unit.chassisNumber}
                            </p>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700">
                              {unit.color}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                            {unit.modelName} <span className="text-slate-400 dark:text-slate-500 font-normal">({unit.vehicleType} • {unit.brand})</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(unit.id)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title={isSw ? 'Ondoa' : 'Remove'}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            {queuedUnits.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    handleFinalSubmit();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#006948] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 cursor-pointer active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  <span>{isSw ? `Thibitisha Vitengo Vyote (${queuedUnits.length})` : `Confirm All Units (${queuedUnits.length})`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceiveStockView;
