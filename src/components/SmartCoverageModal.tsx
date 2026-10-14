import React, { useState } from 'react';
import { Sparkles, Users, X, Check, CheckCircle2, ShieldCheck, MapPin, Clock, Phone, AlertCircle } from 'lucide-react';
import { Worker, Station, LeaveRecord, UserSession } from '../types';
import { getWorkerShiftStatus } from '../services/shiftEngine';
import { storageService } from '../services/storageService';

interface SmartCoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  stations: Station[];
  currentUser: UserSession;
  selectedLeave?: LeaveRecord;
  targetStationId?: string;
  onSelectSubstitute?: (substituteWorker: Worker) => void;
}

export interface ScoredSubstitute {
  worker: Worker;
  station: Station;
  isSurplusStation: boolean; // station has > 4 workers
  stationWorkerCount: number;
  isOnRest: boolean;
  shiftLabel: string;
  sameCommune: boolean;
  score: number;
  priorityLabel: string;
  badgeColor: 'emerald' | 'cyan' | 'blue' | 'amber';
  reasonDesc: string;
}

export const SmartCoverageModal: React.FC<SmartCoverageModalProps> = ({
  isOpen,
  onClose,
  workers,
  stations,
  currentUser,
  selectedLeave,
  targetStationId,
  onSelectSubstitute
}) => {
  const [chosenStationId, setChosenStationId] = useState<string>(
    targetStationId || selectedLeave?.workerId ? (workers.find(w => w.id === selectedLeave?.workerId)?.stationId || stations[0]?.id) : stations[0]?.id
  );
  const [filterSurplusOnly, setFilterSurplusOnly] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetStation = stations.find(s => s.id === chosenStationId) || stations[0];
  const absentWorkerId = selectedLeave?.workerId;

  // Run Smart Recommendation Algorithm
  const candidates: ScoredSubstitute[] = workers
    .filter(w => w.isActive && w.id !== absentWorkerId)
    .map(w => {
      const wStation = stations.find(s => s.id === w.stationId) || {
        id: 'st-0',
        name: 'غير محددة',
        workersCount: 4,
        commune: ''
      } as Station;

      // Count workers in that candidate's station
      const stationWorkersCount = workers.filter(wk => wk.stationId === w.stationId).length;
      const isSurplus = stationWorkersCount > 4;

      // Shift status
      const shift = getWorkerShiftStatus(w);
      const isOnRest = shift.type === 'راحة_1' || shift.type === 'راحة_2';

      // Same commune proximity
      const sameCommune = Boolean(targetStation?.commune && wStation.commune && targetStation.commune === wStation.commune);

      // Score calculation:
      // Priority 1: Surplus stations (> 4 workers) get massive boost (+100)
      // On rest day gets (+50)
      // Same commune gets (+20)
      let score = 0;
      let priorityLabel = 'عادي';
      let badgeColor: 'emerald' | 'cyan' | 'blue' | 'amber' = 'blue';
      let reasonDesc = '';

      if (isSurplus && isOnRest) {
        score += 150;
        priorityLabel = '⭐ أولوية 1: فائض بشري + راحة';
        badgeColor = 'emerald';
        reasonDesc = `فائض عمالة بمحطته (${stationWorkersCount} عمال) وهو في يوم راحة (${shift.label})، تغطيته لا تخل بالحد الأدنى.`;
      } else if (isSurplus) {
        score += 100;
        priorityLabel = '⭐ أولوية 1: فائض بشري';
        badgeColor = 'cyan';
        reasonDesc = `محطته الأصلية تضم (${stationWorkersCount} عمال) ويمكن انتدابه دون إرباك للمحطة.`;
      } else if (isOnRest && sameCommune) {
        score += 70;
        priorityLabel = 'أولوية 2: قرب جغرافي + راحة';
        badgeColor = 'amber';
        reasonDesc = `في يوم راحة ومقيم/يعمل بنفس البلدية (${targetStation.commune}).`;
      } else if (isOnRest) {
        score += 50;
        priorityLabel = 'أولوية 3: يوم راحة اعتيادي';
        badgeColor = 'blue';
        reasonDesc = `في يوم ${shift.label} ومستعد للتعويض.`;
      } else {
        score += 10;
        priorityLabel = 'بديل احتياطي';
        badgeColor = 'blue';
        reasonDesc = `قد يتطلب تعديل فوج المناوبة.`;
      }

      return {
        worker: w,
        station: wStation,
        isSurplusStation: isSurplus,
        stationWorkerCount: stationWorkersCount,
        isOnRest,
        shiftLabel: shift.label,
        sameCommune,
        score,
        priorityLabel,
        badgeColor,
        reasonDesc
      };
    })
    .sort((a, b) => b.score - a.score);

  const filteredCandidates = filterSurplusOnly
    ? candidates.filter(c => c.isSurplusStation)
    : candidates;

  const handleConfirmSubstitute = (candidate: ScoredSubstitute) => {
    if (onSelectSubstitute) {
      onSelectSubstitute(candidate.worker);
    }

    if (selectedLeave) {
      // Update leave record with substitute
      const updatedLeave: LeaveRecord = {
        ...selectedLeave,
        substituteWorkerId: candidate.worker.id,
        substituteWorkerName: candidate.worker.fullName,
        compensationNotes: `تم تعيينه بنظام التغطية الذكية: ${candidate.priorityLabel} (${candidate.station.name})`
      };
      storageService.updateLeave(updatedLeave);
    }

    setAssignedSuccess(candidate.worker.fullName);
    setTimeout(() => {
      setAssignedSuccess(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-right font-['Cairo',sans-serif]">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-600/70 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>قائمة التغطية الذكية للغيابات والعطل</span>
                <span className="text-[11px] px-2.5 py-0.5 bg-emerald-700 text-white rounded-full font-bold">
                  أولوية الفائض البشري (&gt; 4 عمال)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                خوارزمية ذكية لاقتراح البديل الأمثل تبدأ تلقائياً بمراقبين من محطات بها وفرة عمالة دون المساس بالحد الأدنى
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Leave Target Station Switcher */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-slate-300">المحطة المستهدفة للتغطية:</span>
            <select
              value={chosenStationId}
              onChange={e => setChosenStationId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.commune})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterSurplusOnly(!filterSurplusOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterSurplusOnly
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>إظهار الفائض البشري فقط (&gt;4 عمال)</span>
            </button>
          </div>
        </div>

        {assignedSuccess && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-center space-y-1">
            <div className="text-sm font-black text-white flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>تم تعيين {assignedSuccess} كبديل ذكي وتوثيقه في النظام!</span>
            </div>
          </div>
        )}

        {/* Candidate List Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="text-xs font-bold text-slate-400">
            ترتيب المرشحين الأنسب لتغطية المحطة ({filteredCandidates.length} مرشح متاح):
          </div>

          {filteredCandidates.map((c, index) => (
            <div
              key={c.worker.id}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                c.isSurplusStation
                  ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-500'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center justify-center font-mono font-bold">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-black text-sm text-white">{c.worker.fullName}</span>
                    <span className="text-xs text-slate-400 mr-2">({c.station.name})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                    c.badgeColor === 'emerald'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : c.badgeColor === 'cyan'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}>
                    {c.priorityLabel}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    معدل الأولوية: {c.score}
                  </span>
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {c.isSurplusStation && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    ✨ فائض بشري: {c.stationWorkerCount} مراقبين بالمحطة
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                  وضع المناوبة: <strong className={c.isOnRest ? 'text-amber-400' : 'text-slate-200'}>{c.shiftLabel}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                  السكن: {c.worker.residence}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono" dir="ltr">
                  📞 {c.worker.phone}
                </span>
              </div>

              {/* Justification & Assign Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-300 leading-snug">
                  💡 {c.reasonDesc}
                </p>

                <button
                  type="button"
                  onClick={() => handleConfirmSubstitute(c)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow shrink-0 flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>تعيين كبديل معتمد</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
