import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, X, Clock, Layers, Droplets, Check, History, ArrowLeftRight } from 'lucide-react';
import { UserSession, Station, ShiftHandover, HandoverStationState, HandoverPumpsState } from '../types';
import { storageService } from '../services/storageService';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  currentStation: Station;
  handovers?: ShiftHandover[];
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentStation,
  handovers = []
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  // 3 Clicks State
  const [stationState, setStationState] = useState<HandoverStationState>('ممتازة_وعادية');
  const [pumpsState, setPumpsState] = useState<HandoverPumpsState>('تعمل_بسلاسة');
  const [quickNote, setQuickNote] = useState<string>('تم تسليم المفاتيح والمحطة نظيفة ومستوى الحوض طبيعي');
  const [incomingTeam, setIncomingTeam] = useState<string>('الفوج المناوب القادم');
  const [additionalNote, setAdditionalNote] = useState<string>('');
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  // Station State Options (Click 1)
  const stationOptions: { value: HandoverStationState; label: string; desc: string; color: string }[] = [
    { value: 'ممتازة_وعادية', label: '✅ ممتازة وعادية', desc: 'كل التجهيزات والأحواض سليمة وبدون أي مشاكل', color: 'border-emerald-600 bg-emerald-950/40 text-emerald-300' },
    { value: 'تحت_الملاحظة', label: '⚠️ تحت الملاحظة', desc: 'تذبذب خفيف أو ملاحظة تحتاج انتباه الفوج القادم', color: 'border-amber-600 bg-amber-950/40 text-amber-300' },
    { value: 'توقف_جزئي', label: '🚨 توقف جزئي', desc: 'مضخة متوقفة أو عطل في أحد الخطوط', color: 'border-orange-600 bg-orange-950/40 text-orange-300' },
    { value: 'توقف_كلي', label: '⛔ توقف كلي / طارئ', desc: 'المحطة متوقفة بالكامل وتتطلب تدخلاً فورياً', color: 'border-rose-600 bg-rose-950/40 text-rose-300' }
  ];

  // Pumps State Options (Click 2)
  const pumpOptions: { value: HandoverPumpsState; label: string; desc: string }[] = [
    { value: 'تعمل_بسلاسة', label: '💧 تعمل بسلاسة وتناوب', desc: 'المضخات تعمل بكفاءة طبيعية والضغط متوازن' },
    { value: 'مضخة_احتياطية_متوقفة', label: '🔧 مضخة احتياطية متوقفة', desc: 'إحدى المضخات مفصولة أو تحت الصيانة الوقائية' },
    { value: 'تسرب_أو_حرارة', label: '⚠️ وجود تسرب أو حرارة', desc: 'تسرب مياه حول الحشوة أو سخونة في المحمل' },
    { value: 'عطل_كهربائي', label: '⚡ عطل كهربائي / قاطع', desc: 'انفصال في لوحة التحكم أو عطل في مرحل الإقلاع' }
  ];

  // Quick Notes Options (Click 3)
  const quickNoteOptions: string[] = [
    'تم تسليم المفاتيح والمحطة نظيفة ومستوى الحوض طبيعي',
    'المولد الاحتياطي جاهز وخزان الوقود كافي',
    'مستوى الحوض منخفض، تم تشغيل مضخة واحدة فقط بالتناوب',
    'يرجى تفقد حرارة المضخة رقم 2 وتسجيل عدادها في الصباح',
    'تم تفقد المصافي وتنظيف الشوائب العالقة من شبكة السحب'
  ];

  const handleSaveHandover = () => {
    const record: ShiftHandover = {
      id: `hnd-${Date.now()}`,
      stationId: currentStation.id,
      stationName: currentStation.name,
      outgoingWorkerName: currentUser.fullName,
      outgoingWorkerPhone: currentUser.phone,
      incomingTeamOrWorker: incomingTeam.trim() || 'الفوج القادم',
      stationGeneralStatus: stationState,
      pumpsStatus: pumpsState,
      quickNote,
      additionalNotes: additionalNote.trim() || undefined,
      timestamp: new Date().toISOString()
    };

    storageService.addShiftHandover(record);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      onClose();
    }, 2000);
  };

  const stationHandovers = handovers.filter(h => h.stationId === currentStation.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-right font-['Cairo',sans-serif]">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-600/70 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400 shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>سجل المناوبات الخفيف (تسليم وتسلم فوري)</span>
                <span className="text-[11px] px-2 py-0.5 bg-cyan-900 text-cyan-200 rounded-full font-bold">3 نقرات</span>
              </h2>
              <p className="text-xs text-slate-400">
                المحطة: <strong className="text-white">{currentStation.name}</strong> • المسلّم: {currentUser.fullName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-950 text-slate-400'
            }`}
          >
            ⚡ تسليم سريع بنظام 3 نقرات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'history' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-950 text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل التسليمات السابقة ({stationHandovers.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'create' ? (
            isDone ? (
              <div className="p-8 bg-cyan-950/60 border border-cyan-600 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-base font-black text-white">تم توثيق تسليم المناوبة بنجاح!</h3>
                <p className="text-xs text-slate-300">
                  تم تسجيل حالة المحطة والمضخات وملاحظاتك في السجل الميداني وإشعار الإدارة.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* 1. First Click: Station Status */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-mono">1</span>
                      <span>النقرة الأولى: حالة المحطة العامة</span>
                    </span>
                    <span className="text-[10px] text-cyan-400">حدد بنقرة واحدة</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {stationOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStationState(opt.value)}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                          stationState === opt.value
                            ? `${opt.color} ring-1 ring-cyan-400 shadow-md`
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Second Click: Pump Status */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-mono">2</span>
                      <span>النقرة الثانية: وضع ومردود المضخات</span>
                    </span>
                    <span className="text-[10px] text-cyan-400">حدد وضع الضخ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {pumpOptions.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPumpsState(p.value)}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                          pumpsState === p.value
                            ? 'bg-cyan-950/80 border-cyan-500 text-white ring-1 ring-cyan-400 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{p.label}</div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-snug">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Third Click: Quick Notes */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-mono">3</span>
                      <span>النقرة الثالثة: ملاحظة التسليم السريعة</span>
                    </span>
                    <span className="text-[10px] text-cyan-400">اختر من القائمة</span>
                  </div>
                  <div className="space-y-1.5">
                    {quickNoteOptions.map((note, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuickNote(note)}
                        className={`w-full p-2.5 rounded-xl border text-right text-xs transition-all flex items-center justify-between ${
                          quickNote === note
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{note}</span>
                        {quickNote === note && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional additional notes & incoming party */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المسلَّم إليه (الفوج أو العامل البديل):</label>
                    <input
                      type="text"
                      value={incomingTeam}
                      onChange={e => setIncomingTeam(e.target.value)}
                      placeholder="مثال: فوج الليل (حمري رشيد)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">سطر إضافي أو قراءة استثنائية (اختياري):</label>
                    <input
                      type="text"
                      value={additionalNote}
                      onChange={e => setAdditionalNote(e.target.value)}
                      placeholder="مثال: مستوى الوقود 70%، عداد المضخة 43210"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Confirmation Footer */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHandover}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد وتسجيل تسليم المناوبة فوراً</span>
                  </button>
                </div>

              </div>
            )
          ) : (
            /* History Sub-tab */
            <div className="space-y-3">
              {stationHandovers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  لا توجد تسليمات مسجلة سابقاً لهذه المحطة.
                </div>
              ) : (
                stationHandovers.map(h => (
                  <div key={h.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{h.outgoingWorkerName}</span>
                        <span className="text-[10px] text-slate-400">سلم إلى:</span>
                        <span className="text-[10px] font-bold text-cyan-300">{h.incomingTeamOrWorker}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(h.timestamp).toLocaleString('ar-DZ')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-slate-400">حالة المحطة: </span>
                        <strong className="text-cyan-300">{h.stationGeneralStatus.replace(/_/g, ' ')}</strong>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-slate-400">وضع المضخات: </span>
                        <strong className="text-emerald-300">{h.pumpsStatus.replace(/_/g, ' ')}</strong>
                      </div>
                    </div>

                    <div className="p-2.5 bg-cyan-950/20 border border-cyan-900/40 rounded-xl text-slate-200">
                      💬 {h.quickNote}
                      {h.additionalNotes && (
                        <div className="text-[11px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
                          {h.additionalNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
