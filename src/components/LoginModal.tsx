import React, { useState } from 'react';
import { X, Lock, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Worker, UserSession } from '../types';
import { ADMIN_USER, CENTER_HEAD, MAINTENANCE_AGENT } from '../data/initialData';
import { storageService } from '../services/storageService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  onLoginSuccess: (session: UserSession) => void;
  onOpenPinReset: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  workers,
  onLoginSuccess,
  onOpenPinReset
}) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInputPhone = phone.replace(/[^\d]/g, '');

    // Check administrators from storageService or defaults
    const currentAdmins = storageService.getData().administrators || [];
    const matchedAdmin = currentAdmins.find(
      a => a.phone.replace(/[^\d]/g, '') === cleanInputPhone
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
      onClose();
      return;
    }

    // Fallback check Admin Master
    if (
      cleanInputPhone === ADMIN_USER.phone.replace(/[^\d]/g, '') &&
      pin === ADMIN_USER.pin
    ) {
      onLoginSuccess({
        workerId: 'admin-01',
        fullName: ADMIN_USER.fullName,
        phone: ADMIN_USER.phone,
        role: 'مشرف'
      });
      onClose();
      return;
    }

    // Check registered workers
    const matchedWorker = workers.find(
      w => w.phone.replace(/[^\d]/g, '') === cleanInputPhone
    );

    if (!matchedWorker) {
      setError('رقم هاتف العمل غير مسجل في النظام. يرجى التواصل مع المشرف لإضافته.');
      return;
    }

    if (matchedWorker.pin !== pin) {
      setError('الرقم السري غير صحيح (4 أرقام). يمكنك طلب تحديث الرمز إذا نسيته.');
      return;
    }

    onLoginSuccess({
      workerId: matchedWorker.id,
      fullName: matchedWorker.fullName,
      phone: matchedWorker.phone,
      role: matchedWorker.role,
      stationId: matchedWorker.stationId
    });
    onClose();
  };

  const handleQuickLogin = (roleType: 'admin' | 'head' | 'maint' | 'worker') => {
    if (roleType === 'admin') {
      setPhone(ADMIN_USER.phone);
      setPin(ADMIN_USER.pin);
    } else if (roleType === 'head') {
      setPhone(CENTER_HEAD.phone);
      setPin(CENTER_HEAD.pin);
    } else if (roleType === 'maint') {
      setPhone(MAINTENANCE_AGENT.phone);
      setPin(MAINTENANCE_AGENT.pin);
    } else if (workers.length > 0) {
      setPhone(workers[0].phone);
      setPin(workers[0].pin);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">تسجيل الدخول إلى مركز المحطات</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            يتم الدخول بواسطة رقم هاتف العمل الذي أدخله المشرف، متبوعاً بالرمز السري المكون من 4 أرقام.
          </p>

          {error && (
            <div className="p-3 text-xs text-red-300 bg-red-950/50 border border-red-800/60 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رقم هاتف العمل
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0669436843"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-left"
                dir="ltr"
                required
              />
              <Phone className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPinReset();
                }}
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
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono text-sm tracking-widest placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-center"
                required
              />
              <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد وتسجيل الدخول</span>
          </button>

          {/* Quick Access for testing/supervisors */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              دخول سريع حسب الصلاحية (تجربة النظام):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-right border border-slate-700/60"
              >
                <div className="font-bold text-cyan-300">{ADMIN_USER.fullName}</div>
                <div className="text-[10px] text-slate-400">المشرف (0669436843)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('head')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-right border border-slate-700/60"
              >
                <div className="font-bold text-blue-300">{CENTER_HEAD.fullName}</div>
                <div className="text-[10px] text-slate-400">رئيس المركز (صلاحيات)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('maint')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-right border border-slate-700/60"
              >
                <div className="font-bold text-amber-300">{MAINTENANCE_AGENT.fullName}</div>
                <div className="text-[10px] text-slate-400">عون صيانة (كهروميكانيك)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('worker')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-right border border-slate-700/60"
              >
                <div className="font-bold text-emerald-300">عامل مناوبة</div>
                <div className="text-[10px] text-slate-400">تسجيل مباشر للعامل</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
