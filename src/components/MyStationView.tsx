import React from 'react';
import { 
  Building2, 
  MapPin, 
  Droplets, 
  Activity, 
  Users, 
  Clock, 
  Gauge, 
  Wrench, 
  ExternalLink, 
  ShieldCheck, 
  CalendarClock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  MessageSquare,
  ArrowLeftRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Station, Worker, UserSession, MonthlyCounterRecord, GeneratorWeeklyLog, ShiftHandover } from '../types';
import { PhoneLink } from './PhoneLink';
import { ADMIN_USER, CENTER_HEAD, MAINTENANCE_AGENT } from '../data/initialData';
import { getWorkerShiftStatus, isWorkerCurrentlyOnDuty } from '../services/shiftEngine';
import { GeneratorWeeklySection } from './GeneratorWeeklySection';

interface MyStationViewProps {
  currentUser: UserSession;
  stations: Station[];
  workers: Worker[];
  counters: MonthlyCounterRecord[];
  generatorLogs?: GeneratorWeeklyLog[];
  handovers?: ShiftHandover[];
  onOpenCountersForStation: (stationId: string) => void;
  onOpenShiftSchedule: () => void;
  onOpenMaintenanceRequest: () => void;
  onOpenSOSModal: () => void;
  onOpenMessagingModal: () => void;
  onOpenHandoverModal: () => void;
  onOpenTroubleshooting: () => void;
}

export const MyStationView: React.FC<MyStationViewProps> = ({
  currentUser,
  stations,
  workers,
  counters,
  generatorLogs = [],
  handovers = [],
  onOpenCountersForStation,
  onOpenShiftSchedule,
  onOpenMaintenanceRequest,
  onOpenSOSModal,
  onOpenMessagingModal,
  onOpenHandoverModal,
  onOpenTroubleshooting
}) => {
  // Find current user's worker record
  const currentWorker = workers.find(w => w.id === currentUser.workerId || w.phone === currentUser.phone);
  const stationId = currentWorker?.stationId || currentUser.stationId || stations[0]?.id;
  const myStation = stations.find(s => s.id === stationId) || stations[0];

  // Station workers
  const stationWorkers = workers.filter(w => w.stationId === myStation.id);
  const onDutyNow = stationWorkers.filter(w => isWorkerCurrentlyOnDuty(w));

  // My shift status
  const myShift = currentWorker ? getWorkerShiftStatus(currentWorker) : null;

  // Station counter records
  const stationCounters = counters.filter(c => c.stationId === myStation.id);
  const latestCounter = stationCounters[0];

  const statusBadge = 
    myStation.status === 'جاهزة'
      ? { text: 'جاهزة وتعمل بشكل جيد', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800', icon: CheckCircle2 }
      : myStation.status === 'صيانة'
      ? { text: 'في حالة صيانة دورية/طارئة', bg: 'bg-amber-950/80 text-amber-300 border-amber-800', icon: Wrench }
      : { text: 'المحطة متوقفة حالياً', bg: 'bg-rose-950/80 text-rose-300 border-rose-800', icon: AlertTriangle };

  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner for the Controller / Shift Worker */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-xl text-right">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800/80">
                لوحة تحكم المراقب المباشرة
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              مرحباً بك، {currentUser.fullName}
            </h1>
            <p className="text-xs text-slate-300">
              أنت مكلف بالمناوبة والإشراف الميداني على <strong className="text-white font-bold">{myStation.name}</strong>
            </p>
          </div>

          {/* Current Worker Status badge */}
          {myShift && (
            <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl text-right shrink-0">
              <div className="text-[11px] text-slate-400">وضع مناوبتك اليوم:</div>
              <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{myShift.label}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{myShift.hours}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Station Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Header of Station */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-black text-white">{myStation.name}</h2>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{myStation.commune}</span>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusBadge.bg}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{statusBadge.text}</span>
          </div>
        </div>

        {/* Station Direct Calling & Hotlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">هاتف المحطة الثابت:</span>
            <PhoneLink phone={myStation.phone} name={myStation.name} variant="button" />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">المشرف خباش صلاح الدين:</span>
            <PhoneLink phone={ADMIN_USER.phone} name={ADMIN_USER.fullName} variant="button" />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">عون الصيانة بياض عنتر:</span>
            <PhoneLink phone={MAINTENANCE_AGENT.phone} name={MAINTENANCE_AGENT.fullName} variant="button" />
          </div>

        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>سعة التدفق</span>
            </div>
            <div className="text-lg font-black text-cyan-300 font-mono mt-1">
              {myStation.capacity} <span className="text-xs">م³/سا</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>عدد المضخات</span>
            </div>
            <div className="text-lg font-black text-blue-300 font-mono mt-1">
              {myStation.pumpsCount} مضخات
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>عمال المحطة</span>
            </div>
            <div className="text-lg font-black text-emerald-300 font-mono mt-1">
              {myStation.workersCount} عمال
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>المناوبون حالياً</span>
            </div>
            <div className="text-lg font-black text-amber-300 font-mono mt-1">
              {onDutyNow.length} عمال
            </div>
          </div>
        </div>

        {/* Geographic Coordinates */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">إحداثيات المحطة:</span>
            <span className="font-mono text-slate-300" dir="ltr">
              Lat: {myStation.latitude?.toFixed(6) || 'N/A'}, Lng: {myStation.longitude?.toFixed(6) || 'N/A'}
            </span>
          </div>

          {myStation.latitude && myStation.longitude && (
            <a
              href={`https://www.google.com/maps?q=${myStation.latitude},${myStation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <span>فتح في خرائط Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Colleagues at this Station & On-duty */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>طاقم عمال المحطة الزملاء ({stationWorkers.length}):</span>
            <span className="text-[11px] text-slate-500 font-normal">نظام مناوبة 48 ساعة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stationWorkers.map(w => {
              const isOnDuty = isWorkerCurrentlyOnDuty(w);
              const wShift = getWorkerShiftStatus(w);
              const isMe = w.id === currentWorker?.id;

              return (
                <div
                  key={w.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isMe
                      ? 'bg-cyan-950/40 border-cyan-700/80'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="font-bold text-white">
                        {w.fullName} {isMe && <span className="text-[10px] text-cyan-400">(أنت)</span>}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      السكن: {w.residence} • {wShift.label}
                    </div>
                  </div>

                  <PhoneLink phone={w.phone} name={w.fullName} variant="compact" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Prominent Emergency & Field Operations Bar */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-400">عمليات المراقب الميدانية المباشرة:</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* SOS Red Button */}
            <button
              type="button"
              onClick={onOpenSOSModal}
              className="p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-xs shadow-xl shadow-red-900/50 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 animate-pulse border border-red-400/40"
            >
              <AlertOctagon className="w-5 h-5 fill-white shrink-0" />
              <div className="text-right">
                <div className="text-sm font-black">إنذار طارئ SOS</div>
                <div className="text-[10px] text-red-200 font-normal">تسجيل فوري للمسؤولين</div>
              </div>
            </button>

            {/* Direct Messaging Green Button */}
            <button
              type="button"
              onClick={onOpenMessagingModal}
              className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 border border-emerald-400/30"
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <div className="text-right">
                <div className="text-sm font-black">مراسلة المشرف (Admin)</div>
                <div className="text-[10px] text-emerald-200 font-normal">طلب وقود، عتاد، استفسار</div>
              </div>
            </button>

            {/* 3-Click Shift Handover Button */}
            <button
              type="button"
              onClick={onOpenHandoverModal}
              className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 border border-cyan-400/30"
            >
              <ArrowLeftRight className="w-5 h-5 shrink-0" />
              <div className="text-right">
                <div className="text-sm font-black">سجل المناوبة (3 نقرات)</div>
                <div className="text-[10px] text-cyan-200 font-normal">تسليم وتسلم سريع وموثق</div>
              </div>
            </button>

            {/* Troubleshooting Guide Link */}
            <button
              type="button"
              onClick={onOpenTroubleshooting}
              className="p-4 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl font-bold text-xs border border-slate-700 flex items-center justify-center gap-2.5 transition-all transform active:scale-95"
            >
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-right">
                <div className="text-sm font-black">دليل الأعطال السريع</div>
                <div className="text-[10px] text-amber-400/80 font-normal">حلول فورية للمضخات والكهرباء</div>
              </div>
            </button>

          </div>
        </div>

        {/* Existing Technical Actions */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onOpenCountersForStation(myStation.id)}
            className="flex-1 py-3 px-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all"
          >
            <Gauge className="w-4 h-4" />
            <span>تسجيل العداد الساعي للمضخات والمولد (8×2) لمحطتي</span>
          </button>

          <button
            onClick={onOpenShiftSchedule}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <CalendarClock className="w-4 h-4 text-cyan-400" />
            <span>جدول المناوبة والأفواج</span>
          </button>

          <button
            onClick={onOpenMaintenanceRequest}
            className="py-3 px-4 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold text-xs rounded-xl border border-amber-800/80 flex items-center justify-center gap-2 transition-colors"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>طلب صيانة من بياض عنتر</span>
          </button>
        </div>

      </div>

      {/* Feature 4: Weekly Generator Section (10-minute test & Wednesday Protocol) */}
      <GeneratorWeeklySection
        currentStation={myStation}
        currentUser={currentUser}
        generatorLogs={generatorLogs}
      />

    </div>
  );
};

