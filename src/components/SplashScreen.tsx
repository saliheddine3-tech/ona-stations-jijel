import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Lock, ArrowLeft, KeyRound, Building2 } from 'lucide-react';
import { Worker, UserSession } from '../types';
import { ADMIN_USER, CENTER_HEAD, MAINTENANCE_AGENT } from '../data/initialData';
import { storageService } from '../services/storageService';

interface SplashScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  workers: Worker[];
  onOpenPinReset: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onLoginSuccess,
  workers,
  onOpenPinReset,
  onSkip
}) => {
  // animation phases:
  // 'zoom_in': logo starts small and zooms up to fill screen (0 - 1500ms)
  // 'receding': logo scales back into background (1500 - 2500ms)
  // 'login_ready': login card is fully revealed over the watermark (2500ms+)
  const [phase, setPhase] = useState<'zoom_in' | 'receding' | 'login_ready'>('zoom_in');
  
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Zoom in sequence
    const t1 = setTimeout(() => {
      setPhase('receding');
    }, 1600);

    // Settle to login sequence
    const t2 = setTimeout(() => {
      setPhase('login_ready');
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = phone.replace(/[^\d]/g, '');

    // Check administrators from storageService
    const currentAdmins = storageService.getData().administrators || [];
    const matchedAdmin = currentAdmins.find(
      a => a.phone.replace(/[^\d]/g, '') === cleanInput
    );

    if (matchedAdmin) {
      if (matchedAdmin.pin !== pin) {
        setError('الرمز السري غير صحيح للمسؤول. يرجى التأكد وإعادة المحاولة.');
        return;
      }
      onLoginSuccess({
        workerId: matchedAdmin.id,
        fullName: matchedAdmin.fullName,
        phone: matchedAdmin.phone,
        role: matchedAdmin.role
      });
      return;
    }

    // 1. Admin Khebache Salaheddine (المشرف - كل الصلاحيات)
    if (
      cleanInput === ADMIN_USER.phone.replace(/[^\d]/g, '') &&
      pin === ADMIN_USER.pin
    ) {
      onLoginSuccess({
        workerId: 'admin-01',
        fullName: ADMIN_USER.fullName,
        phone: ADMIN_USER.phone,
        role: 'مشرف'
      });
      return;
    }

    // 2. Center Head Boufris Abdelhakim (صلاحيات إشرافية أقل)
    if (
      cleanInput === CENTER_HEAD.phone.replace(/[^\d]/g, '') &&
      pin === CENTER_HEAD.pin
    ) {
      onLoginSuccess({
        workerId: 'head-01',
        fullName: CENTER_HEAD.fullName,
        phone: CENTER_HEAD.phone,
        role: CENTER_HEAD.role
      });
      return;
    }

    // 3. Maintenance Agent Bayadh Antar (الاطلاع على ما يخصه فقط)
    if (
      cleanInput === MAINTENANCE_AGENT.phone.replace(/[^\d]/g, '') &&
      pin === MAINTENANCE_AGENT.pin
    ) {
      onLoginSuccess({
        workerId: 'maint-01',
        fullName: MAINTENANCE_AGENT.fullName,
        phone: MAINTENANCE_AGENT.phone,
        role: MAINTENANCE_AGENT.role
      });
      return;
    }

    // 4. Station Workers / Controllers (يتوجه مباشرة لمحطته)
    const matched = workers.find(
      w => w.phone.replace(/[^\d]/g, '') === cleanInput
    );

    if (!matched) {
      setError('رقم هاتف العمل غير مسجل في النظام. تواصل مع المشرف خباش صلاح الدين.');
      return;
    }

    if (matched.pin !== pin) {
      setError('الرقم السري (PIN) غير صحيح. يمكنك طلب تحديث الرمز إذا نسيته.');
      return;
    }

    onLoginSuccess({
      workerId: matched.id,
      fullName: matched.fullName,
      phone: matched.phone,
      role: matched.role,
      stationId: matched.stationId
    });
  };

  const handleQuickFill = (roleKey: 'admin' | 'head' | 'maint' | 'controller') => {
    if (roleKey === 'admin') {
      setPhone(ADMIN_USER.phone);
      setPin(ADMIN_USER.pin);
    } else if (roleKey === 'head') {
      setPhone(CENTER_HEAD.phone);
      setPin(CENTER_HEAD.pin);
    } else if (roleKey === 'maint') {
      setPhone(MAINTENANCE_AGENT.phone);
      setPin(MAINTENANCE_AGENT.pin);
    } else if (workers.length > 0) {
      const controller = workers.find(w => w.role === 'مراقب') || workers[0];
      setPhone(controller.phone);
      setPin(controller.pin);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 font-['Cairo',sans-serif]">
      
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 opacity-95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Official Government Headers on Top (Always legible) */}
      <div className="absolute top-4 inset-x-0 text-center z-20 px-4 space-y-1">
        <div className="text-xs sm:text-sm font-bold text-slate-300 tracking-wide">
          الجمهورية الجزائرية الديمقراطية الشعبية
        </div>
        <div className="text-[11px] sm:text-xs text-cyan-400 font-semibold">
          وزارة الري • الديوان الوطني للتطهير • وحدة جيجل
        </div>
      </div>

      {/* CINEMATIC LOGO CONTAINER */}
      {/* Dynamic transform based on phase */}
      <div
        className={`absolute flex flex-col items-center justify-center transition-all duration-1000 ease-out z-10 ${
          phase === 'zoom_in'
            ? 'scale-[1.3] opacity-100 blur-0 translate-y-0'
            : phase === 'receding'
            ? 'scale-[0.8] opacity-75 blur-0 -translate-y-8'
            : 'scale-[0.55] opacity-25 -translate-y-28 md:-translate-y-36 pointer-events-none'
        }`}
      >
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full p-2 bg-gradient-to-tr from-cyan-500/30 via-emerald-500/20 to-blue-500/30 shadow-[0_0_80px_rgba(2,132,199,0.35)] flex items-center justify-center">
          <img
            src="/ona-logo.svg"
            alt="شعار الديوان الوطني للتطهير - مركز المحطات وحدة جيجل"
            className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Text showing during initial zoom */}
        <div
          className={`text-center mt-4 transition-opacity duration-700 ${
            phase === 'zoom_in' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            مركــز المحطـــات
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300 font-bold mt-1">
            الديوان الوطني للتطهير - ONA وحدة جيجل
          </p>
        </div>
      </div>

      {/* FOREGROUND LOGIN CARD (Fades in when logo recedes) */}
      <div
        className={`relative z-30 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
          phase === 'login_ready'
            ? 'opacity-100 translate-y-8 sm:translate-y-6 scale-100'
            : 'opacity-0 translate-y-16 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-right space-y-4">
          
          {/* Card Header */}
          <div className="text-center space-y-1 border-b border-slate-800 pb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-[11px] font-bold text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>تسجيل الدخول المؤسساتي</span>
            </div>
            <h2 className="text-lg font-black text-white">تسيير وإشراف 16 محطة رفع</h2>
            <p className="text-[11px] text-slate-400">
              ادخل برقم هاتف العمل والرمز السري المحدد لك من طرف المشرف
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-300 bg-red-950/60 border border-red-800/80 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رقم هاتف العمل (المسجل لدى المشرف)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0669436843"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-left"
                  dir="ltr"
                  required
                />
                <Phone className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <button
                  type="button"
                  onClick={onOpenPinReset}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  نسيت أو فقدت الرمز السري؟
                </button>
                <label className="text-xs font-semibold text-slate-300">
                  الرمز السري (4 أرقام)
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-base tracking-widest placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-center"
                  required
                />
                <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2"
            >
              <span>دخول إلى المركز</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* QUICK PRESETS FOR ROLES DEMONSTRATION */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>تحديد الصلاحية والتجربة السريعة:</span>
              <span className="text-slate-500">نظام الصلاحيات 4 مستويات</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              
              {/* 1. Admin */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-200 rounded-lg text-right border border-cyan-800/50 transition-colors"
              >
                <div className="font-bold text-cyan-300 truncate">1. خباش صلاح الدين</div>
                <div className="text-[10px] text-slate-400">المشرف (كل الصلاحيات)</div>
              </button>

              {/* 2. Center Head */}
              <button
                type="button"
                onClick={() => handleQuickFill('head')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-200 rounded-lg text-right border border-blue-800/50 transition-colors"
              >
                <div className="font-bold text-blue-300 truncate">2. بوفريس عبد الحكيم</div>
                <div className="text-[10px] text-slate-400">رئيس المركز (صلاحيات أقل)</div>
              </button>

              {/* 3. Maintenance Agent */}
              <button
                type="button"
                onClick={() => handleQuickFill('maint')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-200 rounded-lg text-right border border-amber-800/50 transition-colors"
              >
                <div className="font-bold text-amber-300 truncate">3. بياض عنتر</div>
                <div className="text-[10px] text-slate-400">عون صيانة (ما يخصه فقط)</div>
              </button>

              {/* 4. Controller */}
              <button
                type="button"
                onClick={() => handleQuickFill('controller')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-200 rounded-lg text-right border border-emerald-800/50 transition-colors"
              >
                <div className="font-bold text-emerald-300 truncate">4. المراقب / المناوب</div>
                <div className="text-[10px] text-slate-400">يتوجه مباشرة لمحطته 📍</div>
              </button>

            </div>
          </div>

          {/* Quick preview bypass */}
          {onSkip && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onSkip}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                المتابعة كمسؤول النظام خباش صلاح الدين دون تسجيل ←
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
