import React, { useState } from 'react';
import { 
  Wrench, 
  Zap, 
  Lightbulb, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Building2, 
  Calendar,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { MaintenanceTicket, Station, Worker, StationEquipmentHealth, UserSession } from '../types';
import { PhoneLink } from './PhoneLink';
import { MAINTENANCE_AGENT, ADMIN_USER } from '../data/initialData';
import { storageService } from '../services/storageService';
import { PreventiveMaintenanceSection } from './PreventiveMaintenanceSection';

interface MaintenanceTabProps {
  maintenance: MaintenanceTicket[];
  stations: Station[];
  workers: Worker[];
  equipmentHealth?: StationEquipmentHealth[];
  currentUser?: UserSession;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  maintenance,
  stations,
  workers,
  equipmentHealth = [],
  currentUser = { workerId: 'adm-01', fullName: ADMIN_USER.fullName, phone: ADMIN_USER.phone, role: 'مشرف' }
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'preventive' | 'tickets'>('preventive');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form
  const [formStationId, setFormStationId] = useState<string>(stations[0]?.id || 'st-01');
  const [formTechName, setFormTechName] = useState<string>(MAINTENANCE_AGENT.fullName);
  const [formTechPhone, setFormTechPhone] = useState<string>(MAINTENANCE_AGENT.phone);
  const [formCategory, setFormCategory] = useState<MaintenanceTicket['category']>('مضخات');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStatus, setFormStatus] = useState<MaintenanceTicket['status']>('قيد_المعالجة');
  const [formPriority, setFormPriority] = useState<MaintenanceTicket['priority']>('عاجلة');
  const [formResolutionNotes, setFormResolutionNotes] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingTicket(null);
    setFormStationId(stations[0]?.id || 'st-01');
    setFormTechName(MAINTENANCE_AGENT.fullName);
    setFormTechPhone(MAINTENANCE_AGENT.phone);
    setFormCategory('مضخات');
    setFormTitle('');
    setFormDescription('');
    setFormStatus('قيد_المعالجة');
    setFormPriority('عاجلة');
    setFormResolutionNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (ticket: MaintenanceTicket) => {
    setEditingTicket(ticket);
    setFormStationId(ticket.stationId);
    setFormTechName(ticket.technicianName);
    setFormTechPhone(ticket.technicianPhone);
    setFormCategory(ticket.category);
    setFormTitle(ticket.title);
    setFormDescription(ticket.description);
    setFormStatus(ticket.status);
    setFormPriority(ticket.priority);
    setFormResolutionNotes(ticket.resolutionNotes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stations.find(s => s.id === formStationId);

    const ticketData: MaintenanceTicket = {
      id: editingTicket ? editingTicket.id : `maint-${Date.now()}`,
      stationId: formStationId,
      stationName: st?.name || 'محطة غير محددة',
      technicianName: formTechName,
      technicianPhone: formTechPhone,
      category: formCategory,
      title: formTitle,
      description: formDescription,
      status: formStatus,
      priority: formPriority,
      date: new Date().toISOString().split('T')[0],
      resolutionNotes: formResolutionNotes
    };

    if (editingTicket) {
      storageService.updateMaintenanceTicket(ticketData);
    } else {
      storageService.addMaintenanceTicket(ticketData);
    }

    setIsAddModalOpen(false);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (id: string) => {
    storageService.deleteMaintenanceTicket(id);
    setDeleteConfirmId(null);
  };

  const filteredTickets = maintenance.filter(t => {
    const matchesCat = filterCategory === 'all' || t.category === filterCategory;
    const matchesStat = filterStatus === 'all' || t.status === filterStatus;
    return matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6 text-right">
      
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('preventive')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'preventive'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>سجل الصيانة الوقائية والمؤشرات اللونية (16 محطة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('tickets')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'tickets'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>سجل التدخلات وطلبات الصيانة ({maintenance.length})</span>
        </button>
      </div>

      {activeSubTab === 'preventive' ? (
        <PreventiveMaintenanceSection
          stations={stations}
          equipmentHealth={equipmentHealth}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* Officer Bio Card: Bayadh Antar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wrench className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{MAINTENANCE_AGENT.fullName}</h2>
                <span className="bg-amber-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded text-xs font-bold">
                  عون الصيانة الكهروميكانيكية
                </span>
              </div>
              <p className="text-xs text-slate-300">
                المختص في الأمور الكهربائية والميكانيكية لمحطات الرفع الـ 16 من{' '}
                <span className="text-cyan-300 font-bold">مضخات</span>، و
                <span className="text-amber-300 font-bold">إنارة</span>، و
                <span className="text-blue-300 font-bold">مولدات كهربائية</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2.5 px-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">الاتصال المباشر بعون الصيانة:</span>
            <PhoneLink phone={MAINTENANCE_AGENT.phone} name={MAINTENANCE_AGENT.fullName} variant="button" />
          </div>
        </div>

        {/* 3 Main Specialties Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-900/40 flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">المضخات وموانع التسرب</div>
              <div className="text-[11px] text-slate-400">فحص دوري، محامل، حواشي العزل</div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">إنارة المحطات والكواشف</div>
              <div className="text-[11px] text-slate-400">الإنارة الليلية وأمان المحيط</div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-blue-900/40 flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">المولدات ولوحات التحكم</div>
              <div className="text-[11px] text-slate-400">إقلاع آلي، شواحن البطاريات، الوقود</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control bar: Filters & Add Intervention Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الكل ({maintenance.length})
          </button>
          <button
            onClick={() => setFilterCategory('مضخات')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === 'مضخات'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            المضخات
          </button>
          <button
            onClick={() => setFilterCategory('مولدات_كهربائية')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === 'مولدات_كهربائية'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            المولدات الكهربائية
          </button>
          <button
            onClick={() => setFilterCategory('إنارة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === 'إنارة'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الإنارة
          </button>
        </div>

        {/* Add Intervention */}
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل تدخل صيانة جديد</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3.5">
        {filteredTickets.map(ticket => {
          const station = stations.find(s => s.id === ticket.stationId);

          const statusColor = 
            ticket.status === 'تم_الإصلاح'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : ticket.status === 'في_انتظار_قطع_غيار'
              ? 'bg-purple-950/80 text-purple-300 border-purple-800'
              : 'bg-amber-950/80 text-amber-300 border-amber-800';

          const priorityColor = 
            ticket.priority === 'عاجلة'
              ? 'text-rose-400 bg-rose-950/60 border-rose-800'
              : ticket.priority === 'متوسطة'
              ? 'text-amber-400 bg-amber-950/60 border-amber-800'
              : 'text-slate-400 bg-slate-800 border-slate-700';

          return (
            <div
              key={ticket.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColor}`}>
                      أولوية {ticket.priority}
                    </span>
                    <h3 className="font-bold text-white text-sm">{ticket.title}</h3>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>المحطة: <strong>{ticket.stationName}</strong></span>
                    {station && <PhoneLink phone={station.phone} name={station.name} variant="compact" />}
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>تاريخ التدخل: {ticket.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${statusColor}`}>
                    {ticket.status === 'تم_الإصلاح' ? '✓ تم الإصلاح بنجاح' : ticket.status === 'في_انتظار_قطع_غيار' ? '⌛ بانتظار قطع غيار' : '⚙ قيد المعالجة'}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(ticket)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(ticket.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded text-xs border border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                <strong className="text-slate-400">التشخيص والعطل: </strong>
                {ticket.description}
              </div>

              {/* Resolution / Technician notes */}
              {ticket.resolutionNotes && (
                <div className="text-xs text-emerald-300/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40 flex items-center justify-between">
                  <div>
                    <strong>إجراءات الإصلاح والقطع: </strong>
                    {ticket.resolutionNotes}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-400">المكلف: {ticket.technicianName}</span>
                    <PhoneLink phone={ticket.technicianPhone} name={ticket.technicianName} variant="compact" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            لا توجد بطاقات صيانة مسجلة في هذا القسم.
          </div>
        )}
      </div>
    </>
  )}

  {/* Add / Edit Maintenance Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right max-h-[92vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {editingTicket ? 'تعديل تقرير الصيانة' : 'تسجيل تدخل كهروميكانيكي جديد'}
                </span>
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <form onSubmit={handleSaveTicket} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المحطة المعنية بالتدخل
                </label>
                <select
                  value={formStationId}
                  onChange={e => setFormStationId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تصنيف العطل
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="مضخات">مضخات</option>
                    <option value="مولدات_كهربائية">مولدات كهربائية</option>
                    <option value="إنارة">إنارة المحطة</option>
                    <option value="لوحات_تحكم">لوحات تحكم وقواطع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    درجة الأولوية
                  </label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="عاجلة">عاجلة (توقف ضخ)</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="عادية">عادية (روتينية)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  عنوان التدخل / العطل
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: فحص دورة تبريد المولد وتغيير مانع التسرب للمضخة 1"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  التشخيص وتفاصيل العطل
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="شرح المشكل الملاحظ، الأصوات غير الطبيعية، أو الإنذارات الكهربائية..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    حالة الإصلاح
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="قيد_المعالجة">قيد المعالجة</option>
                    <option value="تم_الإصلاح">تم الإصلاح بنجاح</option>
                    <option value="في_انتظار_قطع_غيار">في انتظار قطع غيار</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    عون الصيانة المكلف
                  </label>
                  <input
                    type="text"
                    value={formTechName}
                    onChange={e => setFormTechName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  إجراءات المعالجة والملاحظات الفنية
                </label>
                <textarea
                  rows={2}
                  value={formResolutionNotes}
                  onChange={e => setFormResolutionNotes(e.target.value)}
                  placeholder="القطع المستبدلة، القياسات بعد الإصلاح، وتوصيات التشغيل..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow-md"
                >
                  حفظ تقرير التدخل
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
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>تأكيد مسح تقرير الصيانة</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من مسح بطاقة الصيانة هذه نهائياً؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                تراجع
              </button>
              <button
                onClick={() => handleDeleteTicket(deleteConfirmId)}
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
