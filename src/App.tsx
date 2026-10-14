import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { StationsTab } from './components/StationsTab';
import { WorkersTab } from './components/WorkersTab';
import { ShiftsTab } from './components/ShiftsTab';
import { LeavesAndCompensationTab } from './components/LeavesAndCompensationTab';
import { CountersTab } from './components/CountersTab';
import { MaintenanceTab } from './components/MaintenanceTab';
import { MyStationView } from './components/MyStationView';
import { SupervisorsTab } from './components/SupervisorsTab';
import { SplashScreen } from './components/SplashScreen';
import { LoginModal } from './components/LoginModal';
import { PinResetModal } from './components/PinResetModal';
import { TroubleshootingGuideTab } from './components/TroubleshootingGuideTab';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { SupervisorMessagingModal } from './components/SupervisorMessagingModal';
import { ShiftHandoverModal } from './components/ShiftHandoverModal';
import { HtmlExportModal } from './components/HtmlExportModal';
import { storageService, SyncStatus } from './services/storageService';
import { AppData, UserSession, getRolePermissions } from './types';
import { ADMIN_USER } from './data/initialData';
import { WifiOff, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<AppData>(storageService.getData());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(storageService.getSyncStatus());
  
  // Show splash animation on initial app open
  const [showSplash, setShowSplash] = useState(true);

  // User Authentication
  const [currentUser, setCurrentUser] = useState<UserSession | null>({
    workerId: 'admin-01',
    fullName: ADMIN_USER.fullName,
    phone: ADMIN_USER.phone,
    role: ADMIN_USER.role
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('stations');
  const [selectedStationForMeters, setSelectedStationForMeters] = useState<string | undefined>(undefined);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPinResetModalOpen, setIsPinResetModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isHtmlExportModalOpen, setIsHtmlExportModalOpen] = useState(false);

  const activeAlertsCount = (data.emergencyAlerts || []).filter(a => a.status === 'نشط').length;
  const unreadMessagesCount = (data.supervisorMessages || []).filter(m => !m.isRead).length;

  const currentStation = data.stations.find(s => 
    s.id === currentUser?.stationId || 
    s.assignedWorkerIds?.includes(currentUser?.workerId || '')
  ) || data.stations[0];

  useEffect(() => {
    const unsubData = storageService.subscribe(updated => {
      setData({ ...updated });
    });

    const unsubSync = storageService.subscribeSync(status => {
      setSyncStatus({ ...status });
    });

    // Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => {
      unsubData();
      unsubSync();
    };
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    setShowSplash(false);

    // Apply strict role routing:
    const permissions = getRolePermissions(session.role);

    if (permissions.isDirectToStation) {
      // المراقب وعامل المناوبة يتوجه مباشرة لمحطته الخاصة
      setActiveTab('my_station');
    } else if (session.role === 'عون_صيانة') {
      // عون الصيانة بياض عنتر: يتوجه مباشرة لورشة الصيانة الكهروميكانيكية
      setActiveTab('maintenance');
    } else {
      // المشرف ورئيس المركز: يتوجه للمحطات
      setActiveTab('stations');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowSplash(true);
  };

  const handleSelectStationForMeters = (stationId: string) => {
    setSelectedStationForMeters(stationId);
    setActiveTab('counters');
  };

  const handleManualSync = async () => {
    await storageService.manualSync();
  };

  const permissions = currentUser
    ? getRolePermissions(currentUser.role)
    : getRolePermissions('مشرف');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      
      {/* 1. CINEMATIC SPLASH SCREEN ON APP OPEN */}
      {showSplash && (
        <SplashScreen
          workers={data.workers}
          onLoginSuccess={handleLoginSuccess}
          onOpenPinReset={() => setIsPinResetModalOpen(true)}
          onSkip={() => setShowSplash(false)}
        />
      )}

      {/* Offline Alert Banner */}
      {!syncStatus.isOnline && (
        <div className="bg-amber-600/90 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between text-right shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
              <span>
                تنبيه: أنت تعمل حالياً دون اتصال بالإنترنت (Offline Mode). جميع التعديلات والبيانات محفوظة محلياً وسيتم مزامنتها مع السحابة فور عودة الاتصال.
              </span>
            </div>
            {syncStatus.pendingChangesCount > 0 && (
              <span className="bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded text-[11px] font-mono shrink-0">
                {syncStatus.pendingChangesCount} تعديل بانتظار المزامنة
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenPinReset={() => setIsPinResetModalOpen(true)}
        syncStatus={syncStatus}
        onManualSync={handleManualSync}
        onOpenHtmlExport={() => setIsHtmlExportModalOpen(true)}
        onOpenSOSModal={() => setIsSOSModalOpen(true)}
        onOpenMessagingModal={() => setIsMessagingModalOpen(true)}
        activeAlertsCount={activeAlertsCount}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Role Notice Pill for Clear Supervision */}
      {currentUser && (
        <div className="bg-slate-900/60 border-b border-slate-800/60 py-1.5 px-4 text-[11px]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>الصلاحية النشطة:</span>
              <strong className="text-slate-200">
                {currentUser.role === 'مشرف' || currentUser.role === 'مدير_عام'
                  ? 'خباش صلاح الدين (المشرف) — كامل الصلاحيات (إضافة، تعديل، مسح، إدارة دليل الأعطال والصندوق)'
                  : currentUser.role === 'رئيس_مركز'
                  ? 'بوفريس عبد الحكيم (رئيس المركز) — صلاحيات إشرافية ومتابعة المحطات والغيابات'
                  : currentUser.role === 'عون_صيانة'
                  ? 'بياض عنتر (عون صيانة) — ورشة الصيانة الكهروميكانيكية والمؤشرات ومتابعة العدادات'
                  : currentUser.role === 'إداري'
                  ? `${currentUser.fullName} — عضو فريق الإدارة بالمركز`
                  : 'مراقب محطة ميداني — موجه مباشرة لمحطته (سجل المناوبة، تشغيل المولد، إنذار SOS)'}
              </strong>
            </div>

            <div className="flex items-center gap-3">
              {activeAlertsCount > 0 && (
                <span className="px-2.5 py-0.5 bg-red-950 border border-red-600 text-red-300 rounded-lg font-bold flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  <span>{activeAlertsCount} طارئ نشط</span>
                </span>
              )}

              <button
                onClick={() => setShowSplash(true)}
                className="text-cyan-400 hover:underline"
              >
                إعادة عرض الشعار وتبديل المستخدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        
        {/* Dedicated MyStationView for Controller / Shift Worker */}
        {activeTab === 'my_station' && currentUser && (
          <MyStationView
            currentUser={currentUser}
            stations={data.stations}
            workers={data.workers}
            counters={data.counters}
            generatorLogs={data.generatorWeeklyLogs || []}
            handovers={data.shiftHandovers || []}
            onOpenCountersForStation={handleSelectStationForMeters}
            onOpenShiftSchedule={() => setActiveTab('shifts')}
            onOpenMaintenanceRequest={() => setActiveTab('maintenance')}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onOpenMessagingModal={() => setIsMessagingModalOpen(true)}
            onOpenHandoverModal={() => setIsHandoverModalOpen(true)}
            onOpenTroubleshooting={() => setActiveTab('troubleshooting')}
          />
        )}

        {/* Troubleshooting Guide Tab (دليل الأعطال السريع) */}
        {activeTab === 'troubleshooting' && (
          <TroubleshootingGuideTab
            cards={data.troubleshootingGuides || []}
            currentUser={currentUser || { workerId: 'adm-01', fullName: ADMIN_USER.fullName, phone: ADMIN_USER.phone, role: 'مشرف' }}
          />
        )}

        {/* Supervisors Tab (المشرف، رئيس المركز، وعون الصيانة وفريق الإدارة) */}
        {activeTab === 'supervisors' && (
          <SupervisorsTab
            workers={data.workers}
            stations={data.stations}
            administrators={data.administrators || []}
            permissions={permissions}
            onOpenPinReset={() => setIsPinResetModalOpen(true)}
          />
        )}

        {/* Stations Tab */}
        {activeTab === 'stations' && (
          <StationsTab
            stations={data.stations}
            workers={data.workers}
            permissions={permissions}
            onSelectStationForMeters={handleSelectStationForMeters}
          />
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <WorkersTab
            workers={data.workers}
            stations={data.stations}
            permissions={permissions}
            onOpenPinReset={() => setIsPinResetModalOpen(true)}
          />
        )}

        {/* Shifts Tab */}
        {activeTab === 'shifts' && (
          <ShiftsTab
            workers={data.workers}
            stations={data.stations}
          />
        )}

        {/* Leaves and Compensation Tab */}
        {activeTab === 'leaves' && (
          <LeavesAndCompensationTab
            leaves={data.leaves}
            workers={data.workers}
            stations={data.stations}
            currentUser={currentUser || undefined}
          />
        )}

        {/* Counters and 8x2 Grid Tab */}
        {activeTab === 'counters' && (
          <CountersTab
            counters={data.counters}
            stations={data.stations}
            workers={data.workers}
            initialSelectedStationId={selectedStationForMeters}
          />
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <MaintenanceTab
            maintenance={data.maintenance}
            stations={data.stations}
            workers={data.workers}
            equipmentHealth={data.preventiveMaintenances || []}
            currentUser={currentUser || undefined}
          />
        )}
      </main>

      {/* Global Interactive Modals */}
      {currentUser && (
        <>
          <EmergencySOSModal
            isOpen={isSOSModalOpen}
            onClose={() => setIsSOSModalOpen(false)}
            currentUser={currentUser}
            currentStation={currentStation}
            activeAlerts={data.emergencyAlerts || []}
          />
          <SupervisorMessagingModal
            isOpen={isMessagingModalOpen}
            onClose={() => setIsMessagingModalOpen(false)}
            currentUser={currentUser}
            currentStation={currentStation}
            messages={data.supervisorMessages || []}
          />
          <ShiftHandoverModal
            isOpen={isHandoverModalOpen}
            onClose={() => setIsHandoverModalOpen(false)}
            currentUser={currentUser}
            currentStation={currentStation}
            handovers={data.shiftHandovers || []}
          />
        </>
      )}

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950 p-1 border border-cyan-800/60 shadow flex items-center justify-center shrink-0">
              <img
                src="/ona-logo.svg"
                alt="ONA Jijel"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-white text-sm">
                الجمهورية الجزائرية الديمقراطية الشعبية • وزارة الري
              </div>
              <div className="text-slate-300">
                الديوان الوطني للتطهير (ONA) • وحدة جيجل • مركز المحطات (16 محطة رفع)
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            تسيير وإشراف: {ADMIN_USER.fullName} ({ADMIN_USER.phone}) • رئيس المركز: {data.workers.find(w => w.role === 'رئيس_مركز')?.fullName || 'بوفريس عبد الحكيم'} • عون الصيانة: بياض عنتر
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        workers={data.workers}
        onLoginSuccess={handleLoginSuccess}
        onOpenPinReset={() => setIsPinResetModalOpen(true)}
      />

      {/* PIN Reset Modal */}
      <PinResetModal
        isOpen={isPinResetModalOpen}
        onClose={() => setIsPinResetModalOpen(false)}
        workers={data.workers}
        currentUser={currentUser}
        permissions={permissions}
      />

      {/* Standalone HTML Code Export & Download Modal */}
      <HtmlExportModal
        isOpen={isHtmlExportModalOpen}
        onClose={() => setIsHtmlExportModalOpen(false)}
      />

    </div>
  );
}
