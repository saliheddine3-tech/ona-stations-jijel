import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Zap, 
  Cpu, 
  Save, 
  Calendar 
} from 'lucide-react';
import { Station, StationEquipmentHealth, MaintenanceHealth, UserSession } from '../types';
import { storageService } from '../services/storageService';

interface PreventiveMaintenanceSectionProps {
  stations: Station[];
  equipmentHealth: StationEquipmentHealth[];
  currentUser: UserSession;
}

export const PreventiveMaintenanceSection: React.FC<PreventiveMaintenanceSectionProps> = ({
  stations,
  equipmentHealth,
  currentUser
}) => {
  const [filterHealth, setFilterHealth] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStationId, setEditingStationId] = useState<string | null>(null);

  // Editing state
  const [editOverall, setEditOverall] = useState<MaintenanceHealth>('green');
  const [editPumps, setEditPumps] = useState<MaintenanceHealth>('green');
  const [editGen, setEditGen] = useState<MaintenanceHealth>('green');
  const [editElec, setEditElec] = useState<MaintenanceHealth>('green');
  const [editNotes, setEditNotes] = useState('');
  const [nextDate, setNextDate] = useState('');

  const canEdit = currentUser.role === 'مشرف' || currentUser.role === 'مدير_عام' || currentUser.role === 'عون_صيانة';

  // Stats calculation
  const total = equipmentHealth.length || 16;
  const greenCount = equipmentHealth.filter(e => e.overallHealth === 'green').length;
  const yellowCount = equipmentHealth.filter(e => e.overallHealth === 'yellow').length;
  const redCount = equipmentHealth.filter(e => e.overallHealth === 'red').length;

  const filteredItems = equipmentHealth.filter(item => {
    if (filterHealth !== 'all' && item.overallHealth !== filterHealth) return false;
    if (searchQuery && !item.stationName.includes(searchQuery)) return false;
    return true;
  });

  const handleStartEdit = (item: StationEquipmentHealth) => {
    if (!canEdit) return;
    setEditingStationId(item.stationId);
    setEditOverall(item.overallHealth);
    setEditPumps(item.pumpsHealth);
    setEditGen(item.generatorHealth);
    setEditElec(item.electricalHealth);
    setEditNotes(item.statusNotes);
    setNextDate(item.nextScheduledDate || new Date().toISOString().split('T')[0]);
  };

  const handleSaveHealth = (stationId: string) => {
    const existing = equipmentHealth.find(e => e.stationId === stationId);
    if (!existing) return;

    const updated: StationEquipmentHealth = {
      ...existing,
      overallHealth: editOverall,
      pumpsHealth: editPumps,
      generatorHealth: editGen,
      electricalHealth: editElec,
      statusNotes: editNotes.trim(),
      nextScheduledDate: nextDate,
      lastInspectionDate: new Date().toISOString().split('T')[0],
      technicianInCharge: currentUser.fullName
    };

    storageService.updateEquipmentHealth(updated);
    setEditingStationId(null);
  };

  const getHealthBadge = (health: MaintenanceHealth) => {
    switch (health) {
      case 'green':
        return {
          bg: 'bg-emerald-950/80 border-emerald-600 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'سليمة ومفحوصة (100%)',
          icon: CheckCircle2
        };
      case 'yellow':
        return {
          bg: 'bg-amber-950/80 border-amber-600 text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
          label: 'صيانة وقائية قادمة / ملاحظة',
          icon: AlertTriangle
        };
      case 'red':
      default:
        return {
          bg: 'bg-rose-950/80 border-rose-600 text-rose-300',
          dot: 'bg-rose-500 animate-ping',
          label: 'عاجلة / تدخل مطلوب فوراً',
          icon: ShieldAlert
        };
    }
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]">
      
      {/* Top Automated Alerts and Metric Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        
        {/* Total Stations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow">
          <div>
            <div className="text-xs text-slate-400">إجمالي محطات الرفع المشمولة</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{total} محطة</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Green Stations */}
        <button
          onClick={() => setFilterHealth(filterHealth === 'green' ? 'all' : 'green')}
          className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
            filterHealth === 'green' ? 'ring-2 ring-emerald-400 bg-emerald-950/40' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div>
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>جاهزية خضراء (ممتازة)</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono mt-0.5">{greenCount} محطة</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </button>

        {/* Yellow Stations */}
        <button
          onClick={() => setFilterHealth(filterHealth === 'yellow' ? 'all' : 'yellow')}
          className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
            filterHealth === 'yellow' ? 'ring-2 ring-amber-400 bg-amber-950/40' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div>
            <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>مؤشر أصفر (صيانة قريبة)</span>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">{yellowCount} محطة</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </button>

        {/* Red Urgent Stations */}
        <button
          onClick={() => setFilterHealth(filterHealth === 'red' ? 'all' : 'red')}
          className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
            filterHealth === 'red' ? 'ring-2 ring-rose-500 bg-rose-950/40' : 'bg-slate-900 border-rose-900/60'
          }`}
        >
          <div>
            <div className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>مؤشر أحمر (تدخل عاجل)</span>
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">{redCount} محطة</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-rose-500" />
        </button>

      </div>

      {/* Critical Alert Bar if Red stations exist */}
      {redCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-950 via-red-900/40 to-slate-900 border border-rose-600/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-900 border border-rose-500 flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                تنبيه آلي للصيانة: توجد {redCount} محطة بحاجة لتدخل كهروميكانيكي عاجل من عون الصيانة بياض عنتر!
              </div>
              <div className="text-[11px] text-rose-300 mt-0.5">
                {equipmentHealth.filter(e => e.overallHealth === 'red').map(e => e.stationName).join(' • ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => setFilterHealth('red')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow shrink-0"
          >
            عرض المحطات العاجلة فقط
          </button>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن محطة من المحطات الـ 16..."
            className="w-full pr-9 pl-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">التصفية:</span>
          <button
            onClick={() => setFilterHealth('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filterHealth === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400'}`}
          >
            الكل ({equipmentHealth.length})
          </button>
          <button
            onClick={() => setFilterHealth('red')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filterHealth === 'red' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-rose-400'}`}
          >
            أحمر ({redCount})
          </button>
          <button
            onClick={() => setFilterHealth('yellow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filterHealth === 'yellow' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-amber-400'}`}
          >
            أصفر ({yellowCount})
          </button>
          <button
            onClick={() => setFilterHealth('green')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filterHealth === 'green' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-emerald-400'}`}
          >
            أخضر ({greenCount})
          </button>
        </div>
      </div>

      {/* 16 Stations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const badge = getHealthBadge(item.overallHealth);
          const BadgeIcon = badge.icon;
          const isEditing = editingStationId === item.stationId;

          return (
            <div
              key={item.stationId}
              className={`bg-slate-900 border rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-all ${
                item.overallHealth === 'red'
                  ? 'border-rose-700/80 hover:border-rose-500'
                  : item.overallHealth === 'yellow'
                  ? 'border-amber-700/80 hover:border-amber-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                
                {/* Station Title & Status Badge */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <h3 className="font-black text-white text-base">{item.stationName}</h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>آخر فحص: {item.lastInspectionDate}</span>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${badge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Sub-equipment indicators */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  
                  {/* Pumps */}
                  <div className={`p-2 rounded-xl border ${
                    item.pumpsHealth === 'green' ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' :
                    item.pumpsHealth === 'yellow' ? 'bg-amber-950/30 border-amber-800 text-amber-300' :
                    'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}>
                    <div className="font-bold flex items-center justify-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>المضخات</span>
                    </div>
                    <div className="mt-0.5 font-semibold">
                      {item.pumpsHealth === 'green' ? 'سليمة' : item.pumpsHealth === 'yellow' ? 'ملاحظة' : 'عطل'}
                    </div>
                  </div>

                  {/* Generator */}
                  <div className={`p-2 rounded-xl border ${
                    item.generatorHealth === 'green' ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' :
                    item.generatorHealth === 'yellow' ? 'bg-amber-950/30 border-amber-800 text-amber-300' :
                    'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}>
                    <div className="font-bold flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>المولد</span>
                    </div>
                    <div className="mt-0.5 font-semibold">
                      {item.generatorHealth === 'green' ? 'جاهز' : item.generatorHealth === 'yellow' ? 'فلتر/زيت' : 'عطل/بطارية'}
                    </div>
                  </div>

                  {/* Electrical */}
                  <div className={`p-2 rounded-xl border ${
                    item.electricalHealth === 'green' ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' :
                    item.electricalHealth === 'yellow' ? 'bg-amber-950/30 border-amber-800 text-amber-300' :
                    'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}>
                    <div className="font-bold flex items-center justify-center gap-1">
                      <Cpu className="w-3 h-3" />
                      <span>الكهرباء</span>
                    </div>
                    <div className="mt-0.5 font-semibold">
                      {item.electricalHealth === 'green' ? 'ممتازة' : item.electricalHealth === 'yellow' ? 'تذبذب' : 'قاطع/مرحل'}
                    </div>
                  </div>

                </div>

                {/* Status Notes */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300">
                  <div className="text-[10px] text-slate-500 mb-0.5">ملاحظة التدخل والفحص الوقائي:</div>
                  <p className="leading-relaxed">{item.statusNotes || 'لا توجد ملاحظات استثنائية مسجلة.'}</p>
                </div>

                {/* Scheduled Next Inspection Date */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                  <span>الصيانة المبرمجة القادمة:</span>
                  <span className="text-cyan-400 font-bold">{item.nextScheduledDate || 'غير محدد'}</span>
                </div>

              </div>

              {/* Editing Form or Edit Trigger for Technician */}
              {isEditing ? (
                <div className="pt-3 border-t border-slate-800 space-y-3 bg-slate-950 p-3 rounded-2xl">
                  <div className="text-xs font-bold text-cyan-300">تحديث مؤشر الصيانة لهذه المحطة:</div>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">المؤشر العام للمحطة:</label>
                    <select
                      value={editOverall}
                      onChange={e => setEditOverall(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="green">🟢 أخضر (سليمة ومفحوصة 100%)</option>
                      <option value="yellow">🟡 أصفر (صيانة قريبة / ملاحظة خفيفة)</option>
                      <option value="red">🔴 أحمر (تدخل عاجل / عطل متوقف)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div>
                      <span className="text-slate-400 block mb-0.5">المضخات:</span>
                      <select
                        value={editPumps}
                        onChange={e => setEditPumps(e.target.value as any)}
                        className="w-full p-1 bg-slate-900 border border-slate-700 rounded text-white"
                      >
                        <option value="green">أخضر</option>
                        <option value="yellow">أصفر</option>
                        <option value="red">أحمر</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">المولد:</span>
                      <select
                        value={editGen}
                        onChange={e => setEditGen(e.target.value as any)}
                        className="w-full p-1 bg-slate-900 border border-slate-700 rounded text-white"
                      >
                        <option value="green">أخضر</option>
                        <option value="yellow">أصفر</option>
                        <option value="red">أحمر</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">الكهرباء:</span>
                      <select
                        value={editElec}
                        onChange={e => setEditElec(e.target.value as any)}
                        className="w-full p-1 bg-slate-900 border border-slate-700 rounded text-white"
                      >
                        <option value="green">أخضر</option>
                        <option value="yellow">أصفر</option>
                        <option value="red">أحمر</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">الملاحظة الفنية لعون الصيانة:</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveHealth(item.stationId)}
                      className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ التحديث</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStationId(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                canEdit && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>تحديث مؤشر الصيانة وتسجيل التدخل</span>
                  </button>
                )
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
