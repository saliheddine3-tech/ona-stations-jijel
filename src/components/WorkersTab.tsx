import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Building2, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Worker, Station, WorkerRole, RolePermissions } from '../types';
import { PhoneLink } from './PhoneLink';
import { storageService } from '../services/storageService';
import { getWorkerShiftStatus, isWorkerCurrentlyOnDuty } from '../services/shiftEngine';

interface WorkersTabProps {
  workers: Worker[];
  stations: Station[];
  permissions?: RolePermissions;
  onOpenPinReset: () => void;
}

export const WorkersTab: React.FC<WorkersTabProps> = ({
  workers,
  stations,
  permissions,
  onOpenPinReset
}) => {
  const canAdd = permissions ? permissions.canAddWorker : false;
  const canEdit = permissions ? permissions.canEditWorker : false;
  const canDelete = permissions ? permissions.canDeleteWorker : false;
  const canManagePins = permissions ? permissions.canManagePins : false;
  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [residenceFilter, setResidenceFilter] = useState<string>('all');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // Modals
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    pin: '1234',
    role: 'عامل_مناوبة' as WorkerRole,
    residence: '',
    stationId: stations[0]?.id || 'st-01',
    cycleOffset: 0,
    isActive: true,
    notes: ''
  });

  const togglePinVisibility = (workerId: string) => {
    setShowPins(prev => ({ ...prev, [workerId]: !prev[workerId] }));
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      phone: `066${Math.floor(1000000 + Math.random() * 9000000)}`,
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      role: 'عامل_مناوبة',
      residence: 'جيجل وسط',
      stationId: stations[0]?.id || 'st-01',
      cycleOffset: workers.length % 4,
      isActive: true,
      notes: 'عامل مناوبة جديد'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      fullName: worker.fullName,
      phone: worker.phone,
      pin: worker.pin,
      role: worker.role,
      residence: worker.residence,
      stationId: worker.stationId,
      cycleOffset: worker.cycleOffset,
      isActive: worker.isActive,
      notes: worker.notes || ''
    });
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      const updated: Worker = {
        ...editingWorker,
        fullName: formData.fullName,
        phone: formData.phone,
        pin: formData.pin,
        role: formData.role,
        residence: formData.residence,
        stationId: formData.stationId,
        cycleOffset: Number(formData.cycleOffset),
        isActive: formData.isActive,
        notes: formData.notes
      };
      storageService.updateWorker(updated);
      setEditingWorker(null);
    } else {
      const newWorker: Worker = {
        id: `w-${Date.now()}`,
        fullName: formData.fullName,
        phone: formData.phone,
        pin: formData.pin,
        role: formData.role,
        residence: formData.residence,
        stationId: formData.stationId,
        cycleOffset: Number(formData.cycleOffset),
        isActive: formData.isActive,
        notes: formData.notes
      };
      storageService.addWorker(newWorker);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteWorker = (workerId: string) => {
    storageService.deleteWorker(workerId);
    setDeleteConfirmId(null);
  };

  // Unique residences for filter
  const residences = Array.from(new Set(workers.map(w => w.residence).filter(Boolean)));

  // Filtered workers
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = 
      w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.phone.includes(searchQuery) ||
      w.residence.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStation = stationFilter === 'all' || w.stationId === stationFilter;
    const matchesResidence = residenceFilter === 'all' || w.residence === residenceFilter;
    return matchesSearch && matchesStation && matchesResidence;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Quick stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-black text-white">دليل العمال وأماكن السكن والمحطات</h2>
          </div>
          <p className="text-xs text-slate-400">
            إجمالي العمال: <span className="font-bold text-cyan-300 font-mono">{workers.length} عاملاً</span> موزعين على 16 محطة رفع بنظام مناوبة 48 ساعة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManagePins && (
            <button
              onClick={onOpenPinReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-amber-800/40 flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>تحديث الرمز السري</span>
            </button>
          )}

          {canAdd && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عامل جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، رقم الهاتف، مكان السكن..."
            className="w-full pl-9 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div>
          <select
            value={stationFilter}
            onChange={e => setStationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل المحطات ({stations.length})</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={residenceFilter}
            onChange={e => setResidenceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل مناطق السكن ({residences.length})</option>
            {residences.map(res => (
              <option key={res} value={res}>{res}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredWorkers.map(worker => {
          const station = stations.find(s => s.id === worker.stationId);
          const shiftInfo = getWorkerShiftStatus(worker);
          const isOnDutyNow = isWorkerCurrentlyOnDuty(worker);
          const isPinVisible = showPins[worker.id];

          return (
            <div
              key={worker.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Worker Top Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isOnDutyNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <h3 className="font-bold text-white text-sm">{worker.fullName}</h3>
                    </div>
                    <div className="text-[11px] text-cyan-400">
                      {worker.role === 'مراقب' ? 'مراقب مناوبات' : 'عامل مناوبة دورية'}
                    </div>
                  </div>

                  {/* Shift Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      shiftInfo.type === 'نهارية'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                        : shiftInfo.type === 'ليلية'
                        ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                        : shiftInfo.type === 'راحة_2'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800'
                    }`}
                  >
                    {shiftInfo.label}
                  </span>
                </div>

                {/* Direct Phone Number - Clear & Clickable */}
                <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">رقم الهاتف:</span>
                  <PhoneLink phone={worker.phone} name={worker.fullName} variant="button" />
                </div>

                {/* Residence Location & Station Assigned */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>مكان السكن:</span>
                    </span>
                    <span className="font-bold text-slate-200">{worker.residence}</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>محطة العمل:</span>
                    </span>
                    <span className="font-bold text-cyan-300 text-right truncate max-w-[180px]">
                      {station?.name || 'غير محدد'}
                    </span>
                  </div>
                </div>

                {/* PIN Code Box */}
                <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>الرمز السري (PIN):</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canManagePins ? (
                      <>
                        <span className="font-mono tracking-widest text-amber-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {isPinVisible ? worker.pin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(worker.id)}
                          className="text-slate-400 hover:text-slate-200 p-1"
                          title={isPinVisible ? 'إخفاء الرمز' : 'إظهار الرمز (صلاحية المشرف)'}
                        >
                          {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    ) : (
                      <span className="font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                        •••• (محمي للمشرف)
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">ID: {worker.id}</span>
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(worker)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs border border-slate-700 transition-colors"
                      title="تعديل بيانات العامل (صلاحية المشرف فقط)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirmId(worker.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded text-xs border border-slate-700 transition-colors"
                      title="مسح العامل (صلاحية المشرف خباش فقط)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-300">لا يوجد عمال يطابقون خيارات البحث</p>
        </div>
      )}

      {/* Add / Edit Worker Modal */}
      {(isAddModalOpen || editingWorker) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingWorker(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {editingWorker ? `تعديل العامل ${editingWorker.fullName}` : 'إضافة عامل جديد'}
                </span>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم واللقب <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: أحمد بوعزة"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم هاتف العمل <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0661234567"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الرمز السري (4 أرقام) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={formData.pin}
                    onChange={e => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="••••"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  مكان السكن (العنوان) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.residence}
                  onChange={e => setFormData({ ...formData, residence: e.target.value })}
                  placeholder="مثال: أولاد بوالنار، العوانة، جيجل وسط..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المحطة التي يزاول عمله بها <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.stationId}
                  onChange={e => setFormData({ ...formData, stationId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    طاقم الدورة (Cycle Offset)
                  </label>
                  <select
                    value={formData.cycleOffset}
                    onChange={e => setFormData({ ...formData, cycleOffset: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value={0}>الفوج 1 (اليوم 1)</option>
                    <option value={1}>الفوج 2 (اليوم 2)</option>
                    <option value={2}>الفوج 3 (اليوم 3 - راحة 1)</option>
                    <option value={3}>الفوج 4 (اليوم 4 - راحة 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الصفة / الدور
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as WorkerRole })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="عامل_مناوبة">عامل مناوبة</option>
                    <option value="مراقب">مراقب</option>
                    <option value="عون_صيانة">عون صيانة</option>
                    <option value="رئيس_مركز">رئيس مركز</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingWorker(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md"
                >
                  حفظ العامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-900/60 rounded-2xl p-6 text-right space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>تأكيد مسح العامل</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من مسح هذا العامل من قائمة عمال المحطات؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                تراجع
              </button>
              <button
                onClick={() => handleDeleteWorker(deleteConfirmId)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg"
              >
                تأكيد المسح
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
