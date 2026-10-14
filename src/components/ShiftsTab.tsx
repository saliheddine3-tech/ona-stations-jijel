import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Sun, 
  Moon, 
  Coffee, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  Clock, 
  Users, 
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { Worker, Station } from '../types';
import { PhoneLink } from './PhoneLink';
import { getWorkerCycleDay, getWorkerShiftStatus, isWorkerCurrentlyOnDuty } from '../services/shiftEngine';

interface ShiftsTabProps {
  workers: Worker[];
  stations: Station[];
}

export const ShiftsTab: React.FC<ShiftsTabProps> = ({ workers, stations }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const changeDateByDays = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Filter workers by station
  const stationWorkers = workers.filter(
    w => selectedStationId === 'all' || w.stationId === selectedStationId
  );

  // Categorize workers for the selected date
  const dayShiftWorkers: Worker[] = [];
  const nightShiftWorkers: Worker[] = [];
  const rest1Workers: Worker[] = [];
  const rest2Workers: Worker[] = [];

  stationWorkers.forEach(worker => {
    const cycleDay = getWorkerCycleDay(worker, selectedDate);
    if (cycleDay === 0) dayShiftWorkers.push(worker);
    else if (cycleDay === 1) nightShiftWorkers.push(worker);
    else if (cycleDay === 2) rest1Workers.push(worker);
    else if (cycleDay === 3) rest2Workers.push(worker);
  });

  // Calculate live shift phase right now
  const currentHours = currentTime.getHours() + currentTime.getMinutes() / 60;
  const isDayShiftActive = currentHours >= 8.0 && currentHours < 16.5;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Shift Cycle Rules Explained Visually */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-black text-white">نظام المناوبة الدائرية (48 ساعة راحة)</h2>
            </div>
            <p className="text-xs text-slate-400">
              دورة متكررة من 4 أيام لـ 76 عاملاً لضمان التغطية المستمرة 24/24 ساعة لـ 16 محطة رفع
            </p>
          </div>

          {/* Current Live Indicator */}
          <div className="bg-slate-950 p-2.5 px-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isDayShiftActive ? 'bg-amber-400' : 'bg-indigo-400'} animate-ping`} />
            <div className="text-right">
              <div className="text-[11px] text-slate-400">المناوبة النشطة حالياً:</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                {isDayShiftActive ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>مناوبة نهارية (08:00 - 16:30)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>مناوبة ليلية (16:30 - 08:00)</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Cycle Visual Workflow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          
          {/* Day 1 */}
          <div className="bg-slate-950/70 border border-blue-900/50 p-3.5 rounded-xl text-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500" />
            <div className="flex items-center justify-between text-blue-400 font-bold text-xs mb-1">
              <span className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>اليوم الأول</span>
              </span>
              <span className="bg-blue-950 px-2 py-0.5 rounded text-[10px]">المناوبة الأولى</span>
            </div>
            <div className="text-sm font-black text-white">08:00 صباحاً ← 16:30 مساءً</div>
            <div className="text-[11px] text-slate-400 mt-1">
              مناوبة نهارية تستمر 8.5 ساعات، ثم يرتاح حتى مساء اليوم الموالي.
            </div>
          </div>

          {/* Day 2 */}
          <div className="bg-slate-950/70 border border-purple-900/50 p-3.5 rounded-xl text-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500" />
            <div className="flex items-center justify-between text-purple-400 font-bold text-xs mb-1">
              <span className="flex items-center gap-1">
                <Moon className="w-4 h-4 text-purple-400" />
                <span>اليوم الموالي (اليوم 2)</span>
              </span>
              <span className="bg-purple-950 px-2 py-0.5 rounded text-[10px]">المناوبة الليلية</span>
            </div>
            <div className="text-sm font-black text-white">16:30 مساءً ← 08:00 صباحاً</div>
            <div className="text-[11px] text-slate-400 mt-1">
              مناوبة ليلية كاملة (15.5 ساعة) حتى صباح اليوم الثالث.
            </div>
          </div>

          {/* Day 3 */}
          <div className="bg-slate-950/70 border border-amber-900/50 p-3.5 rounded-xl text-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />
            <div className="flex items-center justify-between text-amber-400 font-bold text-xs mb-1">
              <span className="flex items-center gap-1">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>اليوم الثالث (راحة 1)</span>
              </span>
              <span className="bg-amber-950 px-2 py-0.5 rounded text-[10px]">راحة 24 ساعة</span>
            </div>
            <div className="text-sm font-black text-white">بداية راحة 48 ساعة</div>
            <div className="text-[11px] text-slate-400 mt-1">
              ينهي الليلية 08:00 صباحاً، متاح لتعويض الليل بعد أخذ قسط راحة.
            </div>
          </div>

          {/* Day 4 */}
          <div className="bg-slate-950/70 border border-emerald-900/50 p-3.5 rounded-xl text-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />
            <div className="flex items-center justify-between text-emerald-400 font-bold text-xs mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>اليوم الرابع (راحة 2)</span>
              </span>
              <span className="bg-emerald-950 px-2 py-0.5 rounded text-[10px]">راحة تامة</span>
            </div>
            <div className="text-sm font-black text-white">اليوم الثاني للراحة</div>
            <div className="text-[11px] text-slate-400 mt-1">
              راحة كاملة، المرشح المثالي للتعويض الذكي، ويعاود الدورة اليوم 5.
            </div>
          </div>

        </div>
      </div>

      {/* Date Navigation & Station Selection Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        
        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            <span>اليوم السابق</span>
          </button>

          <div className="px-4 py-1.5 bg-slate-950 rounded-lg border border-slate-700 text-center font-bold text-white text-xs">
            {selectedDate.toLocaleDateString('ar-DZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {isToday && <span className="mr-2 text-cyan-400">(اليوم)</span>}
          </div>

          <button
            onClick={() => changeDateByDays(1)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
          >
            <span>اليوم التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs text-cyan-400 hover:underline px-2"
            >
              العودة لليوم
            </button>
          )}
        </div>

        {/* Station Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedStationId}
            onChange={e => setSelectedStationId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل المحطات (16 محطة - {workers.length} عامل)</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Sections by Category for Selected Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Section 1: Day Shift Team */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">المناوبة النهارية (اليوم الأول)</h3>
                  <div className="text-[11px] text-amber-400 font-mono">08:00 صباحاً ← 16:30 مساءً</div>
                </div>
              </div>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-xs font-bold font-mono">
                {dayShiftWorkers.length} عمال
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {dayShiftWorkers.map(w => {
                const st = stations.find(s => s.id === w.stationId);
                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-lg border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white">{w.fullName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>محطة: {st?.name || 'غير محدد'}</span>
                        <span>•</span>
                        <span>السكن: {w.residence}</span>
                      </div>
                    </div>
                    <PhoneLink phone={w.phone} name={w.fullName} variant="button" />
                  </div>
                );
              })}
              {dayShiftWorkers.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">لا يوجد عمال في هذه المناوبة</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Night Shift Team */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">المناوبة الليلية (اليوم الموالي)</h3>
                  <div className="text-[11px] text-purple-400 font-mono">16:30 مساءً ← 08:00 صباحاً</div>
                </div>
              </div>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-xs font-bold font-mono">
                {nightShiftWorkers.length} عمال
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {nightShiftWorkers.map(w => {
                const st = stations.find(s => s.id === w.stationId);
                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-lg border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white">{w.fullName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>محطة: {st?.name || 'غير محدد'}</span>
                        <span>•</span>
                        <span>السكن: {w.residence}</span>
                      </div>
                    </div>
                    <PhoneLink phone={w.phone} name={w.fullName} variant="button" />
                  </div>
                );
              })}
              {nightShiftWorkers.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">لا يوجد عمال في هذه المناوبة</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Rest Day 1 (راحة اليوم الأول) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">راحة اليوم الأول (48 ساعة)</h3>
                  <div className="text-[11px] text-amber-400">أنهى الليلية صباحاً • مؤهل لتعويض الليل بعد قسط راحة</div>
                </div>
              </div>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-xs font-bold font-mono">
                {rest1Workers.length} عمال
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {rest1Workers.map(w => {
                const st = stations.find(s => s.id === w.stationId);
                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{w.fullName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {st?.name} • سكن: {w.residence}
                      </div>
                    </div>
                    <PhoneLink phone={w.phone} name={w.fullName} variant="compact" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Rest Day 2 (راحة اليوم الثاني - الجاهزية التامة للتعويض) */}
        <div className="bg-slate-900 border border-emerald-950/60 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-300 text-sm">راحة اليوم الثاني (راحة تامة)</h3>
                  <div className="text-[11px] text-emerald-400">المرشحون الأوفر حظاً للتعويض الذكي الفوري</div>
                </div>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded text-xs font-bold font-mono">
                {rest2Workers.length} عمال
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {rest2Workers.map(w => {
                const st = stations.find(s => s.id === w.stationId);
                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-emerald-900/40 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{w.fullName}</div>
                      <div className="text-[10px] text-emerald-400/90 mt-0.5">
                        جاهزية تامة • {st?.name} • سكن: {w.residence}
                      </div>
                    </div>
                    <PhoneLink phone={w.phone} name={w.fullName} variant="compact" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
