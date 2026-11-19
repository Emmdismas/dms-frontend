import React, { useState, useRef, useEffect } from 'react';
import { Branch, AuthUser } from '../../types';
import { CreateTeamMemberInput } from '../../services/authService';
import { Language } from '../../i18n/translations';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  currentUser: AuthUser | null;
  onAddTeamMember: (newMember: CreateTeamMemberInput) => Promise<void> | void;
  language?: Language;
}

const ROLE_OPTIONS: Array<{
  key: 'sales_person' | 'branch_manager' | 'storekeeper';
  icon: string;
  labelSw: string;
  labelEn: string;
  hintSw: string;
  hintEn: string;
}> = [
  {
    key: 'sales_person',
    icon: 'point_of_sale',
    labelSw: 'Afisa Mauzo',
    labelEn: 'Sales Person',
    hintSw: 'Kurekodi mauzo & wateja',
    hintEn: 'Record sales & buyers',
  },
  {
    key: 'branch_manager',
    icon: 'admin_panel_settings',
    labelSw: 'Meneja wa Tawi',
    labelEn: 'Branch Manager',
    hintSw: 'Kusimamia stoo & tawi',
    hintEn: 'Manage branch & team',
  },
  {
    key: 'storekeeper',
    icon: 'inventory_2',
    labelSw: 'Msimamizi wa Stoo',
    labelEn: 'Storekeeper',
    hintSw: 'Kupokea & kuhamisha stoo',
    hintEn: 'Receive & transfer stock',
  },
];

function toProperCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  branches,
  currentUser,
  onAddTeamMember,
  language = 'sw',
}) => {
  const isSw = language === 'sw';

  // Form Fields
  const [name, setName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'sales_person' | 'branch_manager' | 'storekeeper'>('sales_person');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Camera & Upload States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validation Error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (branches.length > 0 && !branchId) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  // Lifecycle stream cleanup and form reset
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      setName('');
      setPhoneRaw('');
      setEmail('');
      setPassword('');
      setRole('sales_person');
      setBranchId(branches[0]?.id || '');
      setAvatarUrl('');
      setErrorMsg('');
      setCameraError('');
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, branches]);

  // Camera Stop Helper
  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start Camera Helper
  const handleStartCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(isSw ? 'Kamera haipatikani kwenye kivinjari hiki.' : 'Camera not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      setCameraError(
        isSw 
          ? 'Imeshindwa kufungua kamera. Tafadhali ruhusu ruhusa (permission) au tumia Pakia Picha.' 
          : 'Unable to access camera. Please allow permission or upload an image.'
      );
      setIsCameraActive(false);
    }
  };

  // Capture Photo Snapshot
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setAvatarUrl(dataUrl);
      handleStopCamera();
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isSw ? 'Tafadhali chagua faili ya picha pekee.' : 'Please select an image file only.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Name input handler (only letters and spaces, proper case)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanedVal = rawVal.replace(/[^a-zA-Z\s]/g, '');
    const properVal = toProperCase(cleanedVal);
    setName(properVal);

    if (!email || email.includes('@nassor.co.tz')) {
      const slug = cleanedVal.trim().toLowerCase().replace(/\s+/g, '.');
      if (slug) {
        setEmail(`${slug}@nassor.co.tz`);
      } else {
        setEmail('');
      }
    }
  };

  // Phone input handler (locked +255, cannot start with 0, max 9 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '');

    if (digits.startsWith('255')) {
      digits = digits.slice(3);
    }

    if (digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '');
    }

    if (digits.length > 9) {
      digits = digits.slice(0, 9);
    }

    setPhoneRaw(digits);
  };

  const formatPhoneDisplay = (digits: string): string => {
    if (!digits) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg('');

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 3) {
      setErrorMsg(isSw ? 'Tafadhali ingiza jina kamili lenye angalau herufi 3.' : 'Please enter a valid full name with at least 3 letters.');
      return;
    }

    if (phoneRaw.length !== 9) {
      setErrorMsg(
        isSw 
          ? 'Namba ya simu inapaswa kuwa na tarakimu 9 baada ya +255 (mfano: +255 713 759 553).' 
          : 'Phone number must have exactly 9 digits after +255 (e.g. +255 713 759 553).'
      );
      return;
    }

    if (!email.trim()) {
      setErrorMsg(isSw ? 'Tafadhali ingiza barua pepe ya mfanyakazi.' : 'Please enter the staff member email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg(isSw ? 'Nenosiri lazima liwe na angalau herufi 8.' : 'Password must be at least 8 characters.');
      return;
    }

    if (!branchId) {
      setErrorMsg(isSw ? 'Tafadhali chagua tawi.' : 'Please select a branch.');
      return;
    }

    setIsSaving(true);
    try {
      await onAddTeamMember({
        name: cleanName,
        email: email.trim(),
        phone: `255${phoneRaw}`,
        password,
        roleKey: role,
        branchId,
      });
      onClose();
    } catch (err: any) {
      const firstFieldError = err?.errors ? (Object.values(err.errors)[0] as string[] | undefined)?.[0] : undefined;
      setErrorMsg(firstFieldError || err?.message || (isSw ? 'Imeshindwa kuhifadhi. Jaribu tena.' : 'Could not save. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#006948] via-[#007a54] to-[#00855d] text-white flex items-center justify-center shadow-md shadow-emerald-950/30">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-sans">
                {isSw ? 'Sajili Mfanyakazi Mpya' : 'Register New Staff Member'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSw ? 'Weka taarifa, picha, panga tawi na jukumu lake' : 'Enter details, photo, assign branch & role'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-lg shrink-0 mt-0.5 text-red-500">error</span>
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* 1. PHOTO SECTION (Camera Capture & File Upload) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
              {isSw ? 'Picha ya Mfanyakazi (Piga au Pakia):' : 'Staff Profile Photo:'}
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Photo Avatar Preview */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 border-dashed border-emerald-500/50 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl">photo_camera</span>
                    <span className="text-[9px] uppercase font-bold mt-0.5">{isSw ? 'Hakuna' : 'None'}</span>
                  </div>
                )}

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-red-700"
                    title={isSw ? 'Ondoa Picha' : 'Remove Photo'}
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Piga Picha / Pakia */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Live Camera Button */}
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="flex-1 min-h-[38px] px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 cursor-pointer transition-all shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    <span>{isSw ? 'Piga Picha (Kamera)' : 'Take Photo (Camera)'}</span>
                  </button>

                  {/* Upload from device */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-h-[38px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    <span>{isSw ? 'Pakia Faili' : 'Upload File'}</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isSw 
                    ? 'Unaweza kumpiga picha moja kwa moja kwa webcam au kupakia picha kutoka kwenye simu/laptop.' 
                    : 'Take a live snapshot or upload a profile image from your device.'}
                </p>

                {cameraError && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {cameraError}
                  </p>
                )}
              </div>
            </div>

            {/* LIVE CAMERA VIEWFINDER MODAL/DRAWER */}
            {isCameraActive && (
              <div className="mt-3 p-3 rounded-2xl bg-black border border-emerald-500/40 text-center animate-in fade-in space-y-2.5">
                <div className="relative w-full max-w-xs mx-auto aspect-4/3 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-emerald-400/50 rounded-xl pointer-events-none m-3" />
                </div>

                <div className="flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">camera</span>
                    <span>{isSw ? 'Piga Sasa' : 'Capture Snapshot'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    {isSw ? 'Funga Kamera' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. FULL NAME (Proper Case, No Numbers, No Special Characters) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {isSw ? 'Jina Kamili la Mfanyakazi:' : 'Full Name:'} <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {isSw ? 'Herufi Pekee (Proper Case)' : 'Letters Only (Proper Case)'}
              </span>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
                badge
              </span>
              <input
                type="text"
                required
                placeholder={isSw ? 'mfano: Kassim Mussa Juma' : 'e.g. Kassim Mussa Juma'}
                value={name}
                onChange={handleNameChange}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium outline-hidden focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* 3. PHONE NUMBER (Locked +255, Cannot Start with 0, Max 9 digits) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {isSw ? 'Namba ya Simu:' : 'Phone Number:'} <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {phoneRaw.length}/9 {isSw ? 'tarakimu' : 'digits'}
              </span>
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 overflow-hidden focus-within:border-[#006948] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              {/* Permanent Locked Country Code Badge */}
              <div className="px-3.5 py-2.5 bg-slate-200/80 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 select-none shrink-0">
                <span className="text-base">🇹🇿</span>
                <span>+255</span>
              </div>

              {/* 9 Digits Input (Cannot start with 0) */}
              <input
                type="tel"
                inputMode="numeric"
                required
                placeholder="713 759 553"
                value={formatPhoneDisplay(phoneRaw)}
                onChange={handlePhoneChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white font-mono font-bold tracking-wider outline-hidden placeholder-slate-400"
              />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-emerald-500">lock</span>
              <span>
                {isSw 
                  ? '+255 imefungwa moja kwa moja. Anza na 7 au 6 bila kuweka 0 (mfano: 713 759 553).' 
                  : '+255 is locked. Enter 9 digits starting without 0 (e.g. 713 759 553).'}
              </span>
            </p>
          </div>

          {/* 4. EMAIL ADDRESS */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
              {isSw ? 'Barua Pepe (Email ya Kazi):' : 'Work Email Address:'}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
                mail
              </span>
              <input
                type="email"
                placeholder="kassim.juma@nassor.co.tz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium outline-hidden focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* 5. ROLE SELECTION */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              {isSw ? 'Jukumu / Cheo cha Kazi:' : 'Designation / Role:'} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRole(opt.key)}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                    role === opt.key
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-[#006948] dark:border-emerald-500 text-[#006948] dark:text-emerald-300 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                    <span>{isSw ? opt.labelSw : opt.labelEn}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {isSw ? opt.hintSw : opt.hintEn}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* 6. ASSIGNED BRANCH */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
              {isSw ? 'Tawi Analopangiwa Kufanya Kazi:' : 'Assigned Dealership Branch:'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
                storefront
              </span>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium outline-hidden focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.zone} - {b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7. PASSWORD (required, set by the owner) */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
              {isSw ? 'Nenosiri la Kuingia:' : 'Login Password:'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
                key
              </span>
              <input
                type="password"
                autoComplete="new-password"
                placeholder={isSw ? 'Angalau herufi 8' : 'At least 8 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium outline-hidden focus:border-[#006948] focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isSw
                ? 'Mfanyakazi ataingia kwa simu au email na nenosiri hili. Mshauri alibadilishe baada ya kuingia mara ya kwanza.'
                : 'The staff member signs in with their phone or email and this password. Ask them to change it after first login.'}
            </p>
          </div>


          {/* Action Buttons (Submit & Cancel) */}
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
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#006948] via-[#007a54] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] rounded-xl shadow-lg shadow-emerald-950/30 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 ring-1 ring-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>{isSw ? 'Sajili Mfanyakazi Sasa' : 'Save Staff Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
