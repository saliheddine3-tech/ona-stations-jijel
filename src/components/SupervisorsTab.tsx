import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  Wrench, 
  Phone, 
  UserPlus, 
  Building2, 
  CheckCircle2, 
  KeyRound, 
  Sparkles,
  MapPin,
  Clock,
  Radio,
  Download,
  Edit3,
  Trash2,
  PlusCircle,
  Briefcase
} from 'lucide-react';
import { PhoneLink } from './PhoneLink';
import { INITIAL_ADMINISTRATORS } from '../data/initialData';
import { Worker, Station, Administrator, WorkerRole, RolePermissions } from '../types';
import { storageService } from '../services/storageService';

interface SupervisorsTabProps {
  workers: Worker[];
  stations: Station[];
  administrators?: Administrator[];
  permissions?: RolePermissions;
  onOpenPinReset: () => void;
}

export const SupervisorsTab: React.FC<SupervisorsTabProps> = ({
  workers,
  stations,
  administrators,
  permissions,
  onOpenPinReset
}) => {
  const isSupervisor = permissions ? permissions.canManageAll : false;
  const canAddWorker = permissions ? permissions.canAddWorker : false;
  const canManagePins = permissions ? permissions.canManagePins : false;

  // Use passed administrators or fallback to storageService
  const adminList = administrators && administrators.length > 0
    ? administrators
    : storageService.getData().administrators || INITIAL_ADMINISTRATORS;

  // State for Adding/Editing Administrators
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState<{
    id: string;
    fullName: string;
    phone: string;
    pin: string;
    role: WorkerRole;
    title: string;
    badge: string;
    badgeColor: 'cyan' | 'blue' | 'amber' | 'emerald' | 'purple';
    residence: string;
    workplace: string;
    tasksText: string;
    isDefault?: boolean;
  }>({
    id: '',
    fullName: '',
    phone: '',
    pin: '',
    role: 'إداري',
    title: 'عضو فريق الإدارة بالمركز',
    badge: 'فريق الإدارة',
    badgeColor: 'emerald',
    residence: 'جيجل',
    workplace: 'مركز المحطات - وحدة جيجل',
    tasksText: 'التنسيق الإداري والمتابعة الميدانية للمحطات\nمساعدة رئيس المركز والمشرف في التسيير اليومي'
  });

  // State for Adding Shift Workers
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({
    fullName: '',
    phone: `066${Math.floor(1000000 + Math.random() * 9000000)}`,
    pin: String(Math.floor(1000 + Math.random() * 9000)),
    role: 'عامل_مناوبة' as const,
    residence: 'جيجل وسط',
    stationId: stations[0]?.id || 'st-01',
    cycleOffset: 0,
    isActive: true,
    notes: 'عامل مسجل من قسم الإشراف'
  });

  // Open Add Admin Modal
  const handleOpenAddAdmin = () => {
    setIsEditingAdmin(false);
    setAdminFormData({
      id: `adm-${Date.now()}`,
      fullName: '',
      phone: `066${Math.floor(1000000 + Math.random() * 9000000)}`,
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      role: 'إداري',
      title: 'عضو فريق الإدارة بالمركز',
      badge: 'فريق الإدارة',
      badgeColor: 'emerald',
      residence: 'جيجل',
      workplace: 'مركز المحطات - وحدة جيجل',
      tasksText: 'متابعة شؤون العمال والمحطات\nالتنسيق الميداني والتقارير الدورية'
    });
    setIsAdminModalOpen(true);
  };

  // Open Edit Admin Modal
  const handleOpenEditAdmin = (admin: Administrator) => {
    setIsEditingAdmin(true);
    setAdminFormData({
      id: admin.id,
      fullName: admin.fullName,
      phone: admin.phone,
      pin: admin.pin,
      role: admin.role,
      title: admin.title || (admin.role === 'مشرف' ? 'المشرف (عون المكتب)' : admin.role === 'رئيس_مركز' ? 'رئيس مركز المحطات' : 'عون الصيانة الكهروميكانيكية'),
      badge: admin.badge || (admin.role === 'مشرف' ? 'كامل الصلاحيات' : admin.role === 'رئيس_مركز' ? 'صلاحيات إشرافية' : 'مختص كهروميكانيك'),
      badgeColor: admin.badgeColor || (admin.role === 'مشرف' ? 'cyan' : admin.role === 'رئيس_مركز' ? 'blue' : 'amber'),
      residence: admin.residence || 'جيجل',
      workplace: admin.workplace || 'مركز المحطات - وحدة جيجل',
      tasksText: (admin.tasks || []).join('\n'),
      isDefault: admin.isDefault
    });
    setIsAdminModalOpen(true);
  };

  // Save Admin (Add or Edit)
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormData.fullName.trim() || !adminFormData.phone.trim()) return;

    const tasksList = adminFormData.tasksText
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const savedAdmin: Administrator = {
      id: adminFormData.id || `adm-${Date.now()}`,
      fullName: adminFormData.fullName.trim(),
      phone: adminFormData.phone.trim(),
      pin: adminFormData.pin.trim() || '1234',
      role: adminFormData.role,
      title: adminFormData.title.trim() || 'مسؤول إداري',
      badge: adminFormData.badge.trim() || 'فريق الإدارة',
      badgeColor: adminFormData.badgeColor,
      residence: adminFormData.residence.trim() || 'جيجل',
      workplace: adminFormData.workplace.trim() || 'مركز المحطات',
      tasks: tasksList.length > 0 ? tasksList : ['المتابعة الإدارية والتنسيق اليومي'],
      isDefault: adminFormData.isDefault
    };

    if (isEditingAdmin) {
      storageService.updateAdministrator(savedAdmin);
    } else {
      storageService.addAdministrator(savedAdmin);
    }

    setIsAdminModalOpen(false);
  };

  // Delete Admin
  const handleDeleteAdmin = (admin: Administrator) => {
    if (confirm(`هل أنت متأكد من حذف المسؤول الإداري "${admin.fullName}" من فريق الإدارة؟`)) {
      storageService.deleteAdministrator(admin.id);
    }
  };

  // Open Add Shift Worker
  const handleOpenAddWorker = () => {
    setNewWorkerData({
      fullName: '',
      phone: `066${Math.floor(1000000 + Math.random() * 9000000)}`,
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      role: 'عامل_مناوبة',
      residence: 'جيجل وسط',
      stationId: stations[0]?.id || 'st-01',
      cycleOffset: workers.length % 4,
      isActive: true,
      notes: 'عامل جديد مسجل'
    });
    setIsAddWorkerOpen(true);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerData.fullName.trim()) return;

    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      fullName: newWorkerData.fullName.trim(),
      phone: newWorkerData.phone.trim(),
      pin: newWorkerData.pin,
      role: newWorkerData.role,
      residence: newWorkerData.residence,
      stationId: newWorkerData.stationId,
      cycleOffset: Number(newWorkerData.cycleOffset),
      isActive: true,
      notes: newWorkerData.notes
    };

    storageService.addWorker(newWorker);
    setIsAddWorkerOpen(false);
  };

  // Helper for card styling by badge color
  const getCardBorder = (color?: string) => {
    switch (color) {
      case 'cyan': return 'border-cyan-700/60';
      case 'blue': return 'border-blue-700/60';
      case 'amber': return 'border-amber-700/60';
      case 'purple': return 'border-purple-700/60';
      default: return 'border-emerald-700/60';
    }
  };

  const getAccentBar = (color?: string) => {
    switch (color) {
      case 'cyan': return 'bg-cyan-500';
      case 'blue': return 'bg-blue-500';
      case 'amber': return 'bg-amber-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-emerald-500';
    }
  };

  const getRoleIcon = (role: WorkerRole, color?: string) => {
    switch (role) {
      case 'مشرف':
      case 'مدير_عام':
        return <Crown className="w-4 h-4 text-cyan-400" />;
      case 'رئيس_مركز':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'عون_صيانة':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getPillBadge = (badge: string, color?: string) => {
    switch (color) {
      case 'cyan':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'blue':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'amber':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'purple':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* 1. Official Header with Prominent ONA Logo */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            {/* Prominent ONA Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 p-1.5 border-2 border-cyan-500/50 shadow-2xl flex items-center justify-center shrink-0">
              <img
                src="/ona-logo.svg"
                alt="شعار الديوان الوطني للتطهير وحدة جيجل"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                  الديوان الوطني للتطهير • وحدة جيجل
                </span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  وزارة الري
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                قسم الإدارة والإشراف الفني على المحطات
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                الهيئة الإدارية والتقنية المسؤولة عن تسيير ومراقبة 16 محطة رفع وإدارة مناوبات 76 عاملاً والصيانة الدورية والطارئة.
              </p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-stretch sm:items-center gap-2 shrink-0 w-full md:w-auto">
            {/* 1. Add Administrator Button (Supervisor only) */}
            {isSupervisor && (
              <button
                onClick={handleOpenAddAdmin}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title="إضافة مسؤول إداري أو منسق جديد لفريق الإدارة بالمركز (صلاحية المشرف فقط)"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ إضافة مسؤول إداري</span>
              </button>
            )}

            {/* 2. Add Worker Button (Supervisor only) */}
            {canAddWorker && (
              <button
                onClick={handleOpenAddWorker}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title="إضافة عامل جديد للمحطات (صلاحية المشرف فقط)"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ إضافة عامل محطة</span>
              </button>
            )}

            {/* 3. Download HTML file */}
            <a
              href="/markaz_al_mahattat.html"
              download="markaz_al_mahattat.html"
              className="px-3.5 py-2.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800/80 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow"
              title="تحميل ملف HTML مستقل كامل وشامل لمشاركته وتوزيعه على العمال"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>تحميل كود التطبيق HTML</span>
            </a>

            {/* 4. PIN Reset (Supervisor only) */}
            {canManagePins && (
              <button
                onClick={onOpenPinReset}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-amber-800/40 flex items-center justify-center gap-1.5 transition-colors"
                title="تعديل واسترجاع الأرقام السرية (صلاحية المشرف فقط)"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>الأرقام السرية</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. SECTION HEADER WITH ACTIONS */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-5 py-3.5 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white">
              خانة المسؤولين الإداريين وفريق الإشراف بالمركز
            </h2>
            <p className="text-[11px] text-slate-400">
              {isSupervisor 
                ? 'يمكنك تعديل بيانات وصلاحيات أي مسؤول، أو إضافة أعضاء جدد لفريق إدارة المركز' 
                : 'الهيئة الإشرافية والإدارية لوحدة جيجل — الديوان الوطني للتطهير'}
            </p>
          </div>
        </div>

        {isSupervisor && (
          <button
            onClick={handleOpenAddAdmin}
            className="px-3.5 py-2 bg-slate-800 hover:bg-cyan-950 hover:border-cyan-700 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>إضافة عضو جديد للإدارة</span>
          </button>
        )}
      </div>

      {/* 3. DYNAMIC EXECUTIVE CARDS (with Edit and Add buttons) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminList.map(admin => (
          <div
            key={admin.id}
            className={`bg-slate-900 border-2 ${getCardBorder(admin.badgeColor)} rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-5 transition-all`}
          >
            <div className={`absolute top-0 right-0 w-2 h-full ${getAccentBar(admin.badgeColor)}`} />
            
            <div className="space-y-4">
              {/* Badge, Title & Edit/Delete buttons */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      {getRoleIcon(admin.role, admin.badgeColor)}
                      <span className="text-cyan-400 font-bold">
                        {admin.title || (admin.role === 'مشرف' ? 'المشرف (عون المكتب)' : admin.role === 'رئيس_مركز' ? 'رئيس مركز المحطات' : 'عون الصيانة الكهروميكانيكية')}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white">{admin.fullName}</h2>
                  </div>

                  <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold ${getPillBadge(admin.badge, admin.badgeColor)}`}>
                    {admin.badge}
                  </span>
                </div>

                {/* Quick Edit / Delete Action Buttons on Card (Supervisor only) */}
                {isSupervisor && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditAdmin(admin)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
                      title="تعديل الاسم، رقم الهاتف، المنصب، المهام أو الرمز السري"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تعديل المسؤول</span>
                    </button>

                    {!admin.isDefault && (
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-rose-800/40"
                        title="حذف هذا المسؤول الإداري"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Phone Call Button */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 font-medium">رقم الهاتف الرسمي للاتصال المباشر:</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-cyan-300 tracking-wider" dir="ltr">
                    {admin.phone}
                  </span>
                  <PhoneLink phone={admin.phone} name={admin.fullName} variant="button" />
                </div>
              </div>

              {/* Roles & Responsibilities */}
              <div className="space-y-2 text-xs">
                <div className="text-slate-400 font-bold">المهام والصلاحيات التنفيذية:</div>
                <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  {(admin.tasks || []).map((task, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>مقر العمل: {admin.workplace || 'مركز المحطات'}</span>
              {canManagePins ? (
                <span className="text-cyan-400 font-mono">PIN: {admin.pin}</span>
              ) : (
                <span className="text-slate-500 font-mono text-[10px]">PIN: •••• (محمي)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Overview of Stations & Workers assigned */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">
              إحصائيات الإشراف الميداني لـ ONA وحدة جيجل
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            16 محطة • {workers.length} عاملاً مناوباً • {adminList.length} مسؤولين إداريين
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">فريق الإشراف الإداري</div>
            <div className="text-xl font-black text-cyan-300 font-mono mt-1">{adminList.length} مسؤولين</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">محطات الرفع الإجمالية</div>
            <div className="text-xl font-black text-cyan-300 font-mono mt-1">{stations.length} محطة</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">إجمالي العمال المناوبين</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">{workers.length} عامل</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">نظام المناوبة</div>
            <div className="text-xl font-black text-amber-300 font-mono mt-1">48 ساعة راحة</div>
          </div>
        </div>
      </div>

      {/* 5. MODAL: ADD / EDIT ADMINISTRATOR */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-right">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  {isEditingAdmin ? 'تعديل بيانات المسؤول الإداري' : 'إضافة مسؤول جديد لفريق الإدارة'}
                </span>
                <Briefcase className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <form onSubmit={handleSaveAdmin} className="p-6 space-y-4 overflow-y-auto">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم واللقب للمسؤول <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={adminFormData.fullName}
                  onChange={e => setAdminFormData({ ...adminFormData, fullName: e.target.value })}
                  placeholder="مثال: خباش صلاح الدين، أو اسم المسؤول..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Phone & PIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم هاتف العمل <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={adminFormData.phone}
                    onChange={e => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                    placeholder="0669436843"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-left"
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
                    value={adminFormData.pin}
                    onChange={e => setAdminFormData({ ...adminFormData, pin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-center tracking-widest"
                    required
                  />
                </div>
              </div>

              {/* Title / Role description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المسمى والصفة الإدارية <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={adminFormData.title}
                  onChange={e => setAdminFormData({ ...adminFormData, title: e.target.value })}
                  placeholder="مثال: المشرف (عون المكتب) / رئيس مركز المحطات / منسق إداري..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Role Type & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نوع الصلاحية
                  </label>
                  <select
                    value={adminFormData.role}
                    onChange={e => setAdminFormData({ 
                      ...adminFormData, 
                      role: e.target.value as WorkerRole,
                      badge: e.target.value === 'مشرف' ? 'كامل الصلاحيات' : e.target.value === 'رئيس_مركز' ? 'صلاحيات إشرافية' : e.target.value === 'عون_صيانة' ? 'مختص كهروميكانيك' : 'فريق الإدارة',
                      badgeColor: e.target.value === 'مشرف' ? 'cyan' : e.target.value === 'رئيس_مركز' ? 'blue' : e.target.value === 'عون_صيانة' ? 'amber' : 'emerald'
                    })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="مشرف">المشرف (كامل الصلاحيات)</option>
                    <option value="رئيس_مركز">رئيس المركز</option>
                    <option value="عون_صيانة">عون صيانة كهروميكانيك</option>
                    <option value="إداري">إداري / عضو فريق الإدارة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    شارة الصفة
                  </label>
                  <input
                    type="text"
                    value={adminFormData.badge}
                    onChange={e => setAdminFormData({ ...adminFormData, badge: e.target.value })}
                    placeholder="مثال: كامل الصلاحيات"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              {/* Residence & Workplace */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    مكان السكن
                  </label>
                  <input
                    type="text"
                    value={adminFormData.residence}
                    onChange={e => setAdminFormData({ ...adminFormData, residence: e.target.value })}
                    placeholder="مثال: جيجل - وسط المدينة"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    مقر العمل
                  </label>
                  <input
                    type="text"
                    value={adminFormData.workplace}
                    onChange={e => setAdminFormData({ ...adminFormData, workplace: e.target.value })}
                    placeholder="مثال: مقر وحدة جيجل ONA"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              {/* Responsibilities and Tasks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المهام والصلاحيات التنفيذية (كل مهمة في سطر منفصل)
                </label>
                <textarea
                  rows={4}
                  value={adminFormData.tasksText}
                  onChange={e => setAdminFormData({ ...adminFormData, tasksText: e.target.value })}
                  placeholder="الإشراف العام وتسيير 16 محطة رفع&#10;إدارة قاعدة البيانات والمناوبات&#10;التنسيق مع إدارة الديوان"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {isEditingAdmin ? 'حفظ التعديلات' : 'تسجيل المسؤول الإداري'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: ADD STATION WORKER */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-right">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => setIsAddWorkerOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">إضافة عامل جديد إلى المحطات</span>
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم واللقب <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkerData.fullName}
                  onChange={e => setNewWorkerData({ ...newWorkerData, fullName: e.target.value })}
                  placeholder="مثال: رابح بوعزيز"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
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
                    value={newWorkerData.phone}
                    onChange={e => setNewWorkerData({ ...newWorkerData, phone: e.target.value })}
                    placeholder="0661234567"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-left"
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
                    value={newWorkerData.pin}
                    onChange={e => setNewWorkerData({ ...newWorkerData, pin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-center tracking-widest"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  مكان السكن <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkerData.residence}
                  onChange={e => setNewWorkerData({ ...newWorkerData, residence: e.target.value })}
                  placeholder="مثال: أولاد بوالنار، العوانة، برج بليدة..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المحطة المعين بها <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newWorkerData.stationId}
                  onChange={e => setNewWorkerData({ ...newWorkerData, stationId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    فوج المناوبة
                  </label>
                  <select
                    value={newWorkerData.cycleOffset}
                    onChange={e => setNewWorkerData({ ...newWorkerData, cycleOffset: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value={0}>الفوج 1 (المناوبة النهارية)</option>
                    <option value={1}>الفوج 2 (المناوبة الليلية)</option>
                    <option value={2}>الفوج 3 (راحة اليوم 1)</option>
                    <option value={3}>الفوج 4 (راحة اليوم 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الصفة
                  </label>
                  <select
                    value={newWorkerData.role}
                    onChange={e => setNewWorkerData({ ...newWorkerData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="عامل_مناوبة">عامل مناوبة</option>
                    <option value="مراقب">مراقب محطة</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  حفظ وتسجيل العامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
