import React from 'react';
import { 
  Building2, 
  Users, 
  CalendarClock, 
  UserCheck, 
  Gauge, 
  Wrench, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  KeyRound, 
  ShieldAlert, 
  LogOut, 
  Home,
  Crown,
  Download,
  AlertOctagon,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { UserSession, getRolePermissions } from '../types';
import { SyncStatus } from '../services/storageService';

export type ActiveTab = 
  | 'stations' 
  | 'supervisors' 
  | 'workers' 
  | 'shifts' 
  | 'leaves' 
  | 'counters' 
  | 'maintenance' 
  | 'my_station'
  | 'troubleshooting';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenPinReset: () => void;
  syncStatus: SyncStatus;
  onManualSync: () => void;
  onOpenHtmlExport?: () => void;
  onOpenSOSModal?: () => void;
  onOpenMessagingModal?: () => void;
  activeAlertsCount?: number;
  unreadMessagesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenPinReset,
  syncStatus,
  onManualSync,
  onOpenHtmlExport,
  onOpenSOSModal,
  onOpenMessagingModal,
  activeAlertsCount = 0,
  unreadMessagesCount = 0
}) => {
  const permissions = currentUser
    ? getRolePermissions(currentUser.role)
    : getRolePermissions('مشرف');

  const allTabs = [
    { id: 'my_station' as ActiveTab, label: 'محطتي الميدانية 📍', icon: Home, desc: 'لوحة تحكم المحطة الخاصة بالمراقب' },
    { id: 'supervisors' as ActiveTab, label: 'المسؤولون والإشراف 🏛️', icon: Crown, desc: 'المشرف، رئيس المركز، عون الصيانة وفريق الإدارة' },
    { id: 'troubleshooting' as ActiveTab, label: 'دليل الأعطال السريع 📖', icon: BookOpen, desc: 'حلول سريعة للأعطال وصلاحية تعديل للمشرف' },
    { id: 'stations' as ActiveTab, label: 'المحطات (16)', icon: Building2, desc: 'إشراف وتسيير 16 محطة رفع' },
    { id: 'workers' as ActiveTab, label: 'العمال (76)', icon: Users, desc: 'دليل العمال وأماكن السكن وإضافة عمال' },
    { id: 'shifts' as ActiveTab, label: 'نظام المناوبة', icon: CalendarClock, desc: 'جدول الـ 48 ساعة والدورات' },
    { id: 'leaves' as ActiveTab, label: 'العطل والتعويض الذكي', icon: UserCheck, desc: 'خوارزمية تعويض الغياب' },
    { id: 'counters' as ActiveTab, label: 'العدادات والمولدات', icon: Gauge, desc: 'العدادات الساعية وشبكة 8×2' },
    { id: 'maintenance' as ActiveTab, label: 'الصيانة الكهروميكانيكية', icon: Wrench, desc: 'ورشة بياض عنتر وتتبع المؤشرات اللونية' }
  ];

  // Filter tabs strictly by permissions
  const visibleTabs = allTabs.filter(tab => {
    if (permissions.isDirectToStation && tab.id === 'my_station') return true;
    if (!permissions.isDirectToStation && tab.id === 'my_station') return false;
    return permissions.accessibleTabs.includes(tab.id);
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      
      {/* 1. Official National Institutional Banner (Top) */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          
          {/* Institutional Heading */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-white tracking-wide">الجمهورية الجزائرية الديمقراطية الشعبية</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-cyan-400 font-semibold hidden sm:inline">وزارة الري</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-emerald-400 font-bold hidden sm:inline">الديوان الوطني للتطهير (ONA) — وحدة جيجل</span>
          </div>

          {/* Sync & Connectivity & User Profile Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onManualSync}
              disabled={syncStatus.isSyncing}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                syncStatus.isOnline
                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              }`}
              title="مزامنة فورية مع قاعدة البيانات"
            >
              {syncStatus.isOnline ? (
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>
                {syncStatus.isOnline
                  ? syncStatus.isSyncing
                    ? 'جارٍ المزامنة...'
                    : 'السحابة متصلة'
                  : 'وضع أوفلاين'}
              </span>
              {syncStatus.pendingChangesCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {syncStatus.pendingChangesCount}
                </span>
              )}
              <RefreshCw className={`w-3 h-3 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Download and Copy standalone HTML app button */}
            <button
              onClick={onOpenHtmlExport}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="عرض ونسخ كود HTML بالكامل أو تحميله كملف مستقل بدون إنترنت"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">تحميل / نسخ HTML</span>
            </button>

            {/* PIN Reset button */}
            <button
              onClick={onOpenPinReset}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors p-1"
              title="تحديث أو استعادة الرقم السري"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">الرمز السري</span>
            </button>

            {/* User Session Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-r border-slate-800 pr-2">
                <div className="text-right">
                  <div className="text-slate-200 font-bold leading-tight">{currentUser.fullName}</div>
                  <div className="text-[10px] text-cyan-400">
                    {currentUser.role === 'مشرف' || currentUser.role === 'مدير_عام'
                      ? 'المشرف (كامل الصلاحيات)'
                      : currentUser.role === 'رئيس_مركز'
                      ? 'رئيس المركز'
                      : currentUser.role === 'عون_صيانة'
                      ? 'عون صيانة كهروميكانيك'
                      : currentUser.role === 'إداري'
                      ? 'عضو فريق الإدارة'
                      : 'مراقب محطة'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="تسجيل الخروج والعودة للشعار"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>دخول برقم الهاتف</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. Main Brand Bar with Prominent ONA Logo & Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Official Emblem Logo */}
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-slate-950 p-1 border-2 border-cyan-500/40 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/ona-logo.svg"
              alt="شعار الديوان الوطني للتطهير وحدة جيجل"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">مركز المحطات</h1>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                ONA • وحدة جيجل
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              نظام تسيير وإشراف على 16 محطة رفع و76 عاملاً بنظام مناوبة 48 ساعة
            </p>
          </div>
        </div>

        {/* Emergency Action Buttons & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Direct Emergency SOS & Messaging Buttons */}
          <div className="flex items-center gap-2">
            {activeAlertsCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/90 border border-red-500 text-red-200 rounded-xl text-xs font-bold animate-pulse">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>{activeAlertsCount} إنذار نشط</span>
              </div>
            )}

            {onOpenSOSModal && (
              <button
                type="button"
                onClick={onOpenSOSModal}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-black text-xs shadow-lg shadow-red-900/50 flex items-center gap-2 transition-all transform active:scale-95 animate-pulse shrink-0 border border-red-400/40"
                title="زر إنذار طارئ SOS مسجل في النظام"
              >
                <AlertOctagon className="w-4 h-4 fill-white" />
                <span>إنذار طارئ SOS</span>
              </button>
            )}

            {onOpenMessagingModal && (
              <button
                type="button"
                onClick={onOpenMessagingModal}
                className="relative px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center gap-2 transition-all transform active:scale-95 shrink-0 border border-emerald-400/30"
                title="مراسلة مباشرة للمشرف"
              >
                <MessageSquare className="w-4 h-4" />
                <span>مراسلة المشرف</span>
                {unreadMessagesCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
                )}
              </button>
            )}
          </div>

          {/* Dynamic Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        </div>
      </div>
    </header>
  );
};
