import React, { useState } from 'react';
import { AlertOctagon, X, PhoneCall, CheckCircle2, ShieldAlert, Clock, Bell, Radio } from 'lucide-react';
import { UserSession, Station, EmergencyAlert } from '../types';
import { storageService } from '../services/storageService';
import { ADMIN_USER } from '../data/initialData';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  currentStation?: Station;
  activeAlerts?: EmergencyAlert[];
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentStation,
  activeAlerts = []
}) => {
  const [selectedType, setSelectedType] = useState<EmergencyAlert['type']>('فيضان_المحطة');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const emergencyTypes: { type: EmergencyAlert['type']; label: string; desc: string }[] = [
    { type: 'فيضان_المحطة', label: '🚨 فيضان أو تجاوز منسوب الحوض', desc: 'المياه وصلت إلى الحد الأقصى ومضخات الرفع عاجزة أو متوقفة' },
    { type: 'انقطاع_كهربائي_شامل', label: '⚡ انقطاع الكهرباء وتعثر المولد', desc: 'شبكة سونلغاز مفصولة والمولد الاحتياطي لم يقلع' },
    { type: 'توقف_المضخات', label: '⛔ توقف كامل لمضخات المحطة', desc: 'انفصال القواطع أو حرق المحركات أو عطل لوحة التحكم' },
    { type: 'تسرب_مفاجئ', label: '💧 انفجار أنبوب أو تسرب مياه غزير', desc: 'كسر في ماسورة الدفع أو الصمامات الرئيسية' },
    { type: 'حريق_أو_خطر_أمني', label: '🔥 حريق أو خطر أمني / اقتحام', desc: 'دخان، ماس كهربائي خطير، أو تهديد بالموقع' },
    { type: 'أخرى', label: '⚠️ طارئ ميداني آخر', desc: 'حالة غير اعتيادية تستدعي تدخل فوري للمسؤولين' }
  ];

  const handleSendSOS = () => {
    setIsSubmitting(true);
    const chosenTypeObj = emergencyTypes.find(t => t.type === selectedType);

    // Beep sound alert using Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}

    const newAlert: EmergencyAlert = {
      id: `emg-${Date.now()}`,
      stationId: currentStation?.id || currentUser.stationId || 'st-unknown',
      stationName: currentStation?.name || 'محطة غير محددة',
      workerId: currentUser.workerId,
      workerName: currentUser.fullName,
      workerPhone: currentUser.phone,
      type: selectedType,
      typeLabel: chosenTypeObj?.label || selectedType,
      notes: customNotes.trim() || undefined,
      timestamp: new Date().toISOString(),
      status: 'نشط'
    };

    storageService.addEmergencyAlert(newAlert);
    setIsSubmitting(false);
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-right font-['Cairo',sans-serif]">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-red-600/80 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(220,38,38,0.4)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-600 flex items-center justify-center text-red-500 animate-pulse shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>إطلاق إنذار طارئ SOS</span>
                <span className="text-[11px] px-2 py-0.5 bg-red-600 text-white rounded-full font-bold">تسجيل فوري</span>
              </h2>
              <p className="text-xs text-red-300 font-semibold">
                المحطة: {currentStation?.name || 'المحطة الميدانية'} • المراقب: {currentUser.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-6 bg-red-950/80 border border-red-600 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-white">تم إرسال وتسجيل الإنذار الطارئ بنجاح!</h3>
            <p className="text-xs text-red-200">
              تم إشعار المشرف خباش صلاح الدين ورئيس المركز وعون الصيانة بالإنذار مع تسجيل التوقيت والمحطة.
            </p>
            <div className="pt-2">
              <a
                href={`tel:${ADMIN_USER.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow"
              >
                <PhoneCall className="w-4 h-4" />
                <span>الاتصال الفوري بالمشرف الآن ({ADMIN_USER.phone})</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Emergency Type Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                اختر نوع الطارئ بنقرة واحدة:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {emergencyTypes.map(item => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedType(item.type)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      selectedType === item.type
                        ? 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-400'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                ملاحظة سريعة إضافية (اختياري):
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="مثال: منسوب المياه وصل لارتفاع 3 أمتار والمضخة 1 تفصل..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Direct Call Recommendation */}
            <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-xl flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span>للطوارئ القصوى اتصل مباشرة بالمشرف:</span>
              </div>
              <a
                href={`tel:${ADMIN_USER.phone}`}
                className="font-mono font-bold text-red-300 hover:text-white underline"
                dir="ltr"
              >
                {ADMIN_USER.phone}
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSendSOS}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <AlertOctagon className="w-5 h-5 animate-bounce" />
                <span>إطلاق وتسجيل إنذار SOS الآن</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
