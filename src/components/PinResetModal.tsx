import React, { useState } from 'react';
import { X, KeyRound, Phone, CheckCircle, ShieldAlert, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { Worker, WorkerRole, RolePermissions } from '../types';
import { storageService } from '../services/storageService';
import { ADMIN_USER } from '../data/initialData';

interface PinResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  currentUser?: { role: WorkerRole; fullName: string; pin?: string } | null;
  permissions?: RolePermissions;
}

export const PinResetModal: React.FC<PinResetModalProps> = ({
  isOpen,
  onClose,
  workers,
  currentUser,
  permissions
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [workerPhone, setWorkerPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Strictly check if current user has permission to manage PINs
  const isSupervisorUser = permissions ? permissions.canManagePins : (currentUser?.role === 'مشرف' || currentUser?.role === 'مدير_عام');

  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkerId(workerId);
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setWorkerPhone(worker.phone);
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!isSupervisorUser) {
      setStatusMsg({
        type: 'error',
        text: 'عذراً، صلاحية تعديل الأرقام السرية محصورة بالمشرف خباش صلاح الدين فقط.'
      });
      return;
    }

    const cleanInput = workerPhone.replace(/[^\d]/g, '');
    const matchedWorker = workers.find(
      w => w.id === selectedWorkerId || w.phone.replace(/[^\d]/g, '') === cleanInput
    );

    if (!matchedWorker) {
      setStatusMsg({
        type: 'error',
        text: 'يرجى اختيار عامل صحيح أو إدخال رقم هاتف مسجل.'
      });
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setStatusMsg({
        type: 'error',
        text: 'يجب أن يتكون الرقم السري الجديد من 4 أرقام عددية حصرية.'
      });
      return;
    }

    if (newPin !== confirmPin) {
      setStatusMsg({
        type: 'error',
        text: 'تأكيد الرمز السري الجديد غير متطابق.'
      });
      return;
    }

    // Update in storage service
    storageService.updateWorkerPin(matchedWorker.id, newPin);

    setStatusMsg({
      type: 'success',
      text: `تم تحديث الرمز السري بنجاح للعامل "${matchedWorker.fullName}". الرمز السري الجديد هو: ${newPin}`
    });

    setNewPin('');
    setConfirmPin('');

    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">إدارة وتحديث الأرقام السرية (PIN)</span>
            <KeyRound className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Content */}
        {!isSupervisorUser ? (
          // View for non-supervisors (Center Head, Maintenance, Shift Workers)
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 bg-rose-950/60 border-2 border-rose-600 rounded-full flex items-center justify-center mx-auto text-rose-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">صلاحية محصورة بالمشرف العام فقط</h3>
              <p className="text-xs text-rose-300 font-semibold">
                تم حصر إمكانية تعديل الأرقام السرية وإعادة تعيينها للمشرف خباش صلاح الدين فقط منعاً لأي تلاعب وحفاظاً على أمن المنظومة.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 text-right">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>إجراء استعادة أو تعديل الرمز السري:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                في حال نسيانك لرقمك السري أو رغبتك في تحديثه، يرجى الاتصال هاتفياً بالمشرف المعتمد لإجراء التحديث في النظام وتزويدك بالرمز الجديد فوراً:
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="font-bold text-slate-200">{ADMIN_USER.fullName} (المشرف)</span>
                <a
                  href={`tel:${ADMIN_USER.phone}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow"
                  dir="ltr"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{ADMIN_USER.phone}</span>
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        ) : (
          // View for Supervisor only (full authorized interface)
          <form onSubmit={handleReset} className="p-6 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-cyan-950/40 border border-cyan-800/80 rounded-2xl text-xs text-cyan-300">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <strong className="block text-white">لوحة تحكم المشرف الحصرية</strong>
                <span>بصفتك المشرف (خباش صلاح الدين)، يمكنك اختيار أي عامل وتعديل رمزه السري فوراً.</span>
              </div>
            </div>

            {statusMsg && (
              <div
                className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                    : 'bg-red-950/60 text-red-300 border border-red-800/80'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اختر العامل المراد تغيير رمزه السري:
              </label>
              <select
                value={selectedWorkerId}
                onChange={e => handleSelectWorker(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.fullName} — PIN الحالي: ({w.pin}) — هاتف: {w.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الرمز السري الجديد (4 أرقام) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm text-center focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  تأكيد الرمز الجديد <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm text-center focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all"
              >
                تأكيد وحفظ الرمز السري الجديد
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
