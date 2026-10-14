import React, { useState } from 'react';
import { 
  UserCheck, 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  Phone, 
  Trash2, 
  Edit3,
  Coffee,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { LeaveRecord, Worker, Station, LeaveType, UserSession } from '../types';
import { PhoneLink } from './PhoneLink';
import { storageService } from '../services/storageService';
import { findSmartReplacements, ReplacementCandidate } from '../services/shiftEngine';
import { SmartCoverageModal } from './SmartCoverageModal';
import { ADMIN_USER } from '../data/initialData';

interface LeavesTabProps {
  leaves: LeaveRecord[];
  workers: Worker[];
  stations: Station[];
  currentUser?: UserSession;
}

export const LeavesAndCompensationTab: React.FC<LeavesTabProps> = ({
  leaves,
  workers,
  stations,
  currentUser = { workerId: 'adm-01', fullName: ADMIN_USER.fullName, phone: ADMIN_USER.phone, role: 'مشرف' }
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | LeaveType>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSmartCoverageModalOpen, setIsSmartCoverageModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Smart Finder Tool state
  const [selectedWorkerForReplacement, setSelectedWorkerForReplacement] = useState<string>(workers[0]?.id || '');
  const [targetDateStr, setTargetDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shiftTypeNeeded, setShiftTypeNeeded] = useState<'نهارية' | 'ليلية'>('نهارية');

  // Form State for New / Edit Leave
  const [formWorkerId, setFormWorkerId] = useState<string>(workers[0]?.id || '');
  const [formType, setFormType] = useState<LeaveType>('عطلة_سنوية');
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState<string>(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [formReason, setFormReason] = useState<string>('');
  const [formSubstituteId, setFormSubstituteId] = useState<string>('');
  const [formCompensationNotes, setFormCompensationNotes] = useState<string>('');

  // Calculate live smart candidates for the modal or the standalone widget
  const targetWorker = workers.find(w => w.id === (isAddModalOpen || editingLeave ? formWorkerId : selectedWorkerForReplacement));
  const candidateList = targetWorker
    ? findSmartReplacements(
        targetWorker,
        workers,
        new Date(isAddModalOpen || editingLeave ? formStartDate : targetDateStr),
        shiftTypeNeeded,
        stations
      )
    : [];

  const handleOpenAdd = () => {
    setFormWorkerId(workers[0]?.id || '');
    setFormType('عطلة_سنوية');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
    setFormReason('');
    setFormSubstituteId('');
    setFormCompensationNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (leave: LeaveRecord) => {
    setEditingLeave(leave);
    setFormWorkerId(leave.workerId);
    setFormType(leave.type);
    setFormStartDate(leave.startDate);
    setFormEndDate(leave.endDate);
    setFormReason(leave.reason);
    setFormSubstituteId(leave.substituteWorkerId || '');
    setFormCompensationNotes(leave.compensationNotes || '');
  };

  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const workerObj = workers.find(w => w.id === formWorkerId);
    const subObj = workers.find(w => w.id === formSubstituteId);

    if (editingLeave) {
      const updated: LeaveRecord = {
        ...editingLeave,
        workerId: formWorkerId,
        workerName: workerObj?.fullName || 'عامل غير محدد',
        type: formType,
        startDate: formStartDate,
        endDate: formEndDate,
        reason: formReason,
        substituteWorkerId: formSubstituteId || undefined,
        substituteWorkerName: subObj?.fullName || undefined,
        compensationNotes: formCompensationNotes || (subObj ? `تم التعويض بالعامل ${subObj.fullName}` : undefined)
      };
      storageService.updateLeave(updated);
      setEditingLeave(null);
    } else {
      const newLeave: LeaveRecord = {
        id: `leave-${Date.now()}`,
        workerId: formWorkerId,
        workerName: workerObj?.fullName || 'عامل غير محدد',
        type: formType,
        startDate: formStartDate,
        endDate: formEndDate,
        reason: formReason,
        substituteWorkerId: formSubstituteId || undefined,
        substituteWorkerName: subObj?.fullName || undefined,
        status: 'جارية',
        createdAt: new Date().toISOString().split('T')[0],
        compensationNotes: formCompensationNotes || (subObj ? `تم التعويض الذكي بالعامل ${subObj.fullName}` : undefined)
      };
      storageService.addLeave(newLeave);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteLeave = (id: string) => {
    storageService.deleteLeave(id);
    setDeleteConfirmId(null);
  };

  const filteredLeaves = leaves.filter(
    l => activeCategory === 'all' || l.type === activeCategory
  );

  const annualCount = leaves.filter(l => l.type === 'عطلة_سنوية').length;
  const sickCount = leaves.filter(l => l.type === 'عطلة_مرضية').length;
  const emergencyCount = leaves.filter(l => l.type === 'عطلة_طارئة').length;

  return (
    <div className="space-y-6">
      
      {/* Smart Compensation Engine Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-black text-white">
                خوارزمية التعويض الذكي لغياب وعطل العمال
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              تحديد البديل الأنسب فوراً وفقاً لـ: 
              <span className="text-cyan-300 font-bold"> أقرب عامل بالسكن أو المحطة</span>، 
              مع مراعاة فترة الراحة (<span className="text-emerald-300 font-bold">يومه الثاني للراحة</span> أولوية قصوى، أو <span className="text-amber-300 font-bold">يومه الأول للراحة</span> لمناوبة الليل بعد قسط كافٍ من الراحة).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSmartCoverageModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>قائمة التغطية الذكية (أولوية الفائض البشري)</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/40 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل عطلة جديدة وتكليف بديل</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Categories Selector Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeCategory === 'all'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          كل العطل المسجلة ({leaves.length})
        </button>

        <button
          onClick={() => setActiveCategory('عطلة_سنوية')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeCategory === 'عطلة_سنوية'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-blue-300'
          }`}
        >
          عطلة سنوية / ثانوية ({annualCount})
        </button>

        <button
          onClick={() => setActiveCategory('عطلة_مرضية')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeCategory === 'عطلة_مرضية'
              ? 'bg-amber-600 text-white'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          عطلة مرضية ({sickCount})
        </button>

        <button
          onClick={() => setActiveCategory('عطلة_طارئة')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeCategory === 'عطلة_طارئة'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          عطلة طارئة ({emergencyCount})
        </button>
      </div>

      {/* Interactive Standalone Smart Replacement Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              أداة التعويض الذكي المباشر (بحث سريع عن بديل فوري)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            اختر العامل الغائب لمعرفة المرشحين الأنسب للتعويض فوراً
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">
              العامل الغائب أو صاحب العطلة
            </label>
            <select
              value={selectedWorkerForReplacement}
              onChange={e => setSelectedWorkerForReplacement(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {workers.map(w => {
                const st = stations.find(s => s.id === w.stationId);
                return (
                  <option key={w.id} value={w.id}>
                    {w.fullName} ({w.residence} - {st?.name || 'محطة'})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">
              تاريخ التعويض المطلوب
            </label>
            <input
              type="date"
              value={targetDateStr}
              onChange={e => setTargetDateStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">
              المناوبة المراد تعويضها
            </label>
            <select
              value={shiftTypeNeeded}
              onChange={e => setShiftTypeNeeded(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
            >
              <option value="نهارية">مناوبة نهارية (08:00 - 16:30)</option>
              <option value="ليلية">مناوبة ليلية (16:30 - 08:00)</option>
            </select>
          </div>
        </div>

        {/* Top 3 Smart Candidates Output */}
        {targetWorker && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>
                أفضل البدائل المقترحة لتعويض <span className="text-cyan-400 font-bold">"{targetWorker.fullName}"</span> (سكنه: {targetWorker.residence}):
              </span>
              <span className="text-slate-500 font-normal">مرتبين حسب التوافق والراحة والقرب الجغرافي</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {candidateList.slice(0, 3).map((candidate, idx) => {
                const candStation = stations.find(s => s.id === candidate.worker.stationId);
                const badgeColor = 
                  idx === 0 
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' 
                    : idx === 1 
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300' 
                    : 'border-slate-700 bg-slate-800/80 text-slate-300';

                return (
                  <div
                    key={candidate.worker.id}
                    className={`p-3.5 rounded-xl border ${badgeColor} space-y-2.5 relative flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">
                          #{idx + 1} {candidate.worker.fullName}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                          توافق {candidate.score}%
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>السكن: <strong className="text-slate-200">{candidate.worker.residence}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          <span>محطته: <strong className="text-slate-200">{candStation?.name}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Coffee className="w-3 h-3 text-amber-400" />
                          <span>وضعه: <strong className="text-amber-300">{candidate.shiftStatus.label}</strong></span>
                        </div>
                      </div>

                      {/* Reasons bullet points */}
                      <div className="mt-2 text-[10px] space-y-1 bg-slate-950/60 p-2 rounded">
                        {candidate.reasons.map((r, i) => (
                          <div key={i} className="text-slate-300 flex items-center gap-1">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Direct phone call button */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">اتصال فوري:</span>
                      <PhoneLink phone={candidate.worker.phone} name={candidate.worker.fullName} variant="button" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Existing Leaves List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">سجل العطل والتعويضات المعتمدة</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredLeaves.length} عطلة مسجلة
          </span>
        </div>

        <div className="space-y-3">
          {filteredLeaves.map(leave => {
            const worker = workers.find(w => w.id === leave.workerId);
            const subWorker = workers.find(w => w.id === leave.substituteWorkerId);
            const station = stations.find(s => s.id === worker?.stationId);

            const typeBadge = 
              leave.type === 'عطلة_سنوية'
                ? { label: 'عطلة سنوية / ثانوية', color: 'bg-blue-950/80 text-blue-300 border-blue-800' }
                : leave.type === 'عطلة_مرضية'
                ? { label: 'عطلة مرضية', color: 'bg-amber-950/80 text-amber-300 border-amber-800' }
                : { label: 'عطلة طارئة', color: 'bg-rose-950/80 text-rose-300 border-rose-800' };

            return (
              <div
                key={leave.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{leave.workerName}</span>
                    {worker && <PhoneLink phone={worker.phone} name={worker.fullName} variant="compact" />}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      محطة: {station?.name || 'غير محدد'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1 text-slate-300 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>من {leave.startDate} إلى {leave.endDate}</span>
                    </div>

                    {leave.reason && (
                      <div className="text-slate-400">
                        <strong className="text-slate-300">السبب:</strong> {leave.reason}
                      </div>
                    )}
                  </div>

                  {/* Assigned Substitute */}
                  {subWorker ? (
                    <div className="flex items-center gap-2 text-xs bg-emerald-950/30 border border-emerald-800/40 p-2 rounded-lg text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>البديل المكلف: <strong>{subWorker.fullName}</strong> ({subWorker.residence})</span>
                      <PhoneLink phone={subWorker.phone} name={subWorker.fullName} variant="compact" />
                      {leave.compensationNotes && (
                        <span className="text-[11px] text-slate-400 mr-2">• {leave.compensationNotes}</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400/90 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>لم يتم تكليف بديل حتى الآن</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(leave)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                    title="تعديل العطلة والبديل"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(leave.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                    title="مسح العطلة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredLeaves.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              لا توجد عطل مسجلة في هذا القسم حالياً.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Leave Modal with Built-in Smart Compensation */}
      {(isAddModalOpen || editingLeave) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right max-h-[92vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingLeave(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {editingLeave ? 'تعديل بيانات العطلة' : 'تسجيل عطلة واختيار البديل الذكي'}
                </span>
                <UserCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <form onSubmit={handleSaveLeave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  العامل المعني بالعطلة <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formWorkerId}
                  onChange={e => setFormWorkerId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {workers.map(w => {
                    const st = stations.find(s => s.id === w.stationId);
                    return (
                      <option key={w.id} value={w.id}>
                        {w.fullName} ({w.residence} - {st?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نوع العطلة <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as LeaveType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="عطلة_سنوية">عطلة ثانوية / سنوية</option>
                    <option value="عطلة_مرضية">عطلة مرضية</option>
                    <option value="عطلة_طارئة">عطلة طارئة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاريخ البدء
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  سبب أو تفاصيل العطلة
                </label>
                <textarea
                  rows={2}
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  placeholder="مبرر العطلة، تقرير طبي، أو ظرف طارئ..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              {/* Smart Candidate Selector */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توصيات التعويض الذكي (أقرب سكن ومحطة وفترة راحة):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">انقر لاختيار البديل</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {candidateList.slice(0, 5).map(cand => {
                    const isSelected = formSubstituteId === cand.worker.id;
                    return (
                      <button
                        type="button"
                        key={cand.worker.id}
                        onClick={() => {
                          setFormSubstituteId(cand.worker.id);
                          setFormCompensationNotes(cand.reasons.join(' • '));
                        }}
                        className={`w-full text-right p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{cand.worker.fullName}</span>
                            <span className="text-[10px] text-cyan-400">({cand.worker.residence})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {cand.shiftStatus.label} • توافق {cand.score}%
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <PhoneLink phone={cand.worker.phone} name={cand.worker.fullName} variant="compact" />
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isSelected ? 'محدد كبديل ✓' : 'اختيار'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ملاحظات التعويض
                </label>
                <input
                  type="text"
                  value={formCompensationNotes}
                  onChange={e => setFormCompensationNotes(e.target.value)}
                  placeholder="مثال: تم الاتفاق على التعويض النهاري بالتنسيق مع رئيس المركز"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingLeave(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md"
                >
                  حفظ العطلة والتعويض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-900/60 rounded-2xl p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>تأكيد مسح العطلة</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من مسح سجل هذه العطلة والتعويض من النظام؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                تراجع
              </button>
              <button
                onClick={() => handleDeleteLeave(deleteConfirmId)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg"
              >
                تأكيد المسح
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Coverage Modal */}
      <SmartCoverageModal
        isOpen={isSmartCoverageModalOpen}
        onClose={() => setIsSmartCoverageModalOpen(false)}
        workers={workers}
        stations={stations}
        currentUser={currentUser}
        onSelectSubstitute={(subWorker) => {
          setFormSubstituteId(subWorker.id);
        }}
      />

    </div>
  );
};
