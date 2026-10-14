import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, CheckCircle2, ShieldCheck, Clock, BatteryCharging, Gauge, Check, Calendar } from 'lucide-react';
import { Station, UserSession, GeneratorWeeklyLog } from '../types';
import { storageService } from '../services/storageService';

interface GeneratorWeeklySectionProps {
  currentStation: Station;
  currentUser: UserSession;
  generatorLogs?: GeneratorWeeklyLog[];
}

export const GeneratorWeeklySection: React.FC<GeneratorWeeklySectionProps> = ({
  currentStation,
  currentUser,
  generatorLogs = []
}) => {
  // Check if today is Wednesday (day 3 in JS 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday)
  const today = new Date();
  const isWednesday = today.getDay() === 3;

  // 10 minutes = 600 seconds
  const INITIAL_SECONDS = 600;
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Confirmation form fields
  const [fuelPercent, setFuelPercent] = useState<number>(85);
  const [batteryStatus, setBatteryStatus] = useState<'ممتازة' | 'جيدة' | 'تحتاج_شحن'>('ممتازة');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [testNotes, setTestNotes] = useState('');
  const [isConfirmedDone, setIsConfirmedDone] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(sec => sec - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      // Play ding sound
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => setIsActive(true);
  const handlePauseTimer = () => setIsActive(false);
  const handleResetTimer = () => {
    setIsActive(false);
    setSecondsLeft(INITIAL_SECONDS);
    setIsCompleted(false);
  };

  const handleConfirmLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: GeneratorWeeklyLog = {
      id: `gen-${Date.now()}`,
      stationId: currentStation.id,
      stationName: currentStation.name,
      workerName: currentUser.fullName,
      workerPhone: currentUser.phone,
      workerPinUsed: pinConfirmation ? '****' : 'تأكيد بالبصمة',
      durationMinutes: 10,
      timestamp: new Date().toISOString(),
      fuelLevelPercent: fuelPercent,
      batteryStatus,
      notes: testNotes.trim() || 'تشغيل أسبوعي ناجح للمولد لمدة 10 دقائق لتزييت المحرك والبطارية.'
    };

    storageService.addGeneratorWeeklyLog(newLog);
    setIsConfirmedDone(true);
    setTimeout(() => {
      setIsConfirmedDone(false);
      handleResetTimer();
    }, 2500);
  };

  const stationLogs = generatorLogs.filter(l => l.stationId === currentStation.id);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-right font-['Cairo',sans-serif]">
      
      {/* Wednesday Special Alert Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg ${
        isWednesday
          ? 'bg-gradient-to-r from-amber-950 via-yellow-900/30 to-slate-900 border-amber-500/80'
          : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isWednesday
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
              : 'bg-slate-900 text-cyan-400 border-slate-700'
          }`}>
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isWednesday ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {isWednesday ? '⚡ اليوم هو الأربعاء (تنبيه إلزامي)' : 'نظام تشغيل المولد الأسبوعي'}
              </span>
              <span className="text-[11px] text-slate-400">بروتوكول ONA الميداني</span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              تشغيل المولد الاحتياطي لمدة 10 دقائق لضمان التزييت وجاهزية البطارية
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              كل يوم أربعاء، يُلزم مراقب المحطة بتشغيل المولد في وضع الاختبار (Test) وتأكيد البصمة في التطبيق.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-center bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono">المدة المقررة</div>
          <div className="text-lg font-black text-amber-300 font-mono">10:00 دقيقة</div>
        </div>
      </div>

      {/* Main Interactive Controls & Timer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timer Box (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-bold">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>عداد الـ 10 دقائق الميداني للمولد</span>
          </div>

          <div className="relative flex items-center justify-center">
            <div className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
              isActive
                ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-amber-950/20'
                : isCompleted
                ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-emerald-950/20'
                : 'border-slate-800 bg-slate-900/40'
            }`}>
              <span className={`text-4xl font-black font-mono tracking-wider ${
                isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-200'
              }`}>
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                {isCompleted ? 'اكتملت الـ 10 دقائق!' : isActive ? 'المولد قيد التشغيل...' : 'جاهز للبدء'}
              </span>
            </div>
          </div>

          {/* Timer Buttons */}
          <div className="flex items-center gap-2 w-full justify-center">
            {!isActive ? (
              <button
                type="button"
                onClick={handleStartTimer}
                disabled={isCompleted}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>بدء تشغيل المولد (10 د)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseTimer}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-700 flex items-center gap-1.5 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>إيقاف مؤقت</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetTimer}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800"
              title="إعادة ضبط العداد"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confirmation Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>تسجيل وتأكيد البصمة الميدانية للتشغيل</span>
            </h4>
            <span className="text-[11px] text-cyan-400 font-mono font-semibold">
              المحطة: {currentStation.name}
            </span>
          </div>

          {isConfirmedDone ? (
            <div className="p-6 bg-emerald-950/60 border border-emerald-600 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <div className="font-black text-white text-sm">تم تسجيل توثيق تشغيل المولد بنجاح!</div>
              <p className="text-xs text-slate-300">
                سُجلت بصمة المراقب {currentUser.fullName} في السجل الأسبوعي لوحدة جيجل مع التوقيت والوقود.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmLog} className="space-y-3.5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fuel Level */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>مستوى الوقود في الخزان (%):</span>
                    <span className="text-amber-400 font-mono">{fuelPercent}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={fuelPercent}
                    onChange={e => setFuelPercent(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Battery Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    حالة بطارية الإقلاع (24V / 12V):
                  </label>
                  <select
                    value={batteryStatus}
                    onChange={e => setBatteryStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ممتازة">🟢 ممتازة (إقلاع فوري)</option>
                    <option value="جيدة">🟡 جيدة (مقبولة)</option>
                    <option value="تحتاج_شحن">🔴 ضعيفة وتحتاج شحن/استبدال</option>
                  </select>
                </div>
              </div>

              {/* Pin or Footprint confirmation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  الرمز السري لتأكيد البصمة الميدانية:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinConfirmation}
                  onChange={e => setPinConfirmation(e.target.value)}
                  placeholder="أدخل رمزك السري المكون من 4 أرقام للتوقيع"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ملاحظات فنية أثناء التشغيل (اختياري):
                </label>
                <input
                  type="text"
                  value={testNotes}
                  onChange={e => setTestNotes(e.target.value)}
                  placeholder="مثال: ضغط الزيت 4.2 بار، المحرك استقر سريعاً، لا يوجد دخان أسود"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>تأكيد تشغيل المولد 10 دقائق وتسجيل البصمة في السجل</span>
              </button>

            </form>
          )}

        </div>

      </div>

      {/* Recent Generator Log History Table */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
          <span>أرشيف تشغيل المولدات الأسبوعية لمحطة {currentStation.name}:</span>
          <span className="text-[11px] text-cyan-400 font-mono">{stationLogs.length} توثيق مسجل</span>
        </div>

        {stationLogs.length === 0 ? (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
            لم يُسجل تشغيل أسبوعي سابق لهذه المحطة حتى الآن.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stationLogs.map(log => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{log.workerName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleDateString('ar-DZ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>المدة: <strong className="text-amber-400">{log.durationMinutes} د</strong></span>
                  <span>الوقود: <strong className="text-cyan-400">{log.fuelLevelPercent}%</strong></span>
                  <span>البطارية: <strong className="text-emerald-400">{log.batteryStatus}</strong></span>
                </div>
                <div className="text-[11px] text-slate-300 italic">
                  "{log.notes}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
