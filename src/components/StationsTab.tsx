import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Activity, 
  Droplets, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Clock,
  Gauge
} from 'lucide-react';
import { Station, Worker, StationStatus, RolePermissions } from '../types';
import { PhoneLink } from './PhoneLink';
import { storageService } from '../services/storageService';
import { isWorkerCurrentlyOnDuty, getWorkerShiftStatus } from '../services/shiftEngine';

interface StationsTabProps {
  stations: Station[];
  workers: Worker[];
  permissions?: RolePermissions;
  onSelectStationForMeters?: (stationId: string) => void;
}

export const StationsTab: React.FC<StationsTabProps> = ({
  stations,
  workers,
  permissions,
  onSelectStationForMeters
}) => {
  const canAdd = permissions ? permissions.canAddStation : false;
  const canEdit = permissions ? permissions.canEditStation : false;
  const canDelete = permissions ? permissions.canDeleteStation : false;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StationStatus>('all');
  
  // Modals state
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    status: 'جاهزة' as StationStatus,
    latitude: '',
    longitude: '',
    capacity: 3000,
    pumpsCount: 2,
    workersCount: 4,
    notes: '',
    commune: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      phone: '0344710' + (stations.length + 1),
      status: 'جاهزة',
      latitude: '36.814000',
      longitude: '5.750000',
      capacity: 3000,
      pumpsCount: 2,
      workersCount: 4,
      notes: 'تعمل بشكل جيد',
      commune: 'جيجل'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (station: Station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      phone: station.phone,
      status: station.status,
      latitude: station.latitude !== null ? String(station.latitude) : '',
      longitude: station.longitude !== null ? String(station.longitude) : '',
      capacity: station.capacity,
      pumpsCount: station.pumpsCount,
      workersCount: station.workersCount,
      notes: station.notes,
      commune: station.commune
    });
  };

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = formData.latitude ? parseFloat(formData.latitude) : null;
    const lng = formData.longitude ? parseFloat(formData.longitude) : null;

    if (editingStation) {
      // Update
      const updated: Station = {
        ...editingStation,
        name: formData.name,
        phone: formData.phone,
        status: formData.status,
        latitude: isNaN(lat as number) ? null : lat,
        longitude: isNaN(lng as number) ? null : lng,
        capacity: Number(formData.capacity) || 0,
        pumpsCount: Number(formData.pumpsCount) || 1,
        workersCount: Number(formData.workersCount) || 4,
        notes: formData.notes,
        commune: formData.commune
      };
      storageService.updateStation(updated);
      setEditingStation(null);
    } else {
      // Add
      const newStation: Station = {
        id: `st-${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        status: formData.status,
        latitude: isNaN(lat as number) ? null : lat,
        longitude: isNaN(lng as number) ? null : lng,
        capacity: Number(formData.capacity) || 0,
        pumpsCount: Number(formData.pumpsCount) || 1,
        workersCount: Number(formData.workersCount) || 4,
        notes: formData.notes,
        commune: formData.commune,
        assignedWorkerIds: []
      };
      storageService.addStation(newStation);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteStation = (stationId: string) => {
    storageService.deleteStation(stationId);
    setDeleteConfirmId(null);
  };

  // Filtered stations (Instant Smart Search by Name, Number 1-16, Phone)
  const filteredStations = stations.filter((s, index) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return statusFilter === 'all' || s.status === statusFilter;
    }
    const stNumberStr = String(index + 1);
    const stIdNum = s.id.replace(/\D/g, '');
    const cleanQ = q.replace(/\D/g, '');
    const matchesNumber = cleanQ !== '' && (stNumberStr === cleanQ || stIdNum === cleanQ || stIdNum === cleanQ.padStart(2, '0'));
    
    const matchesSearch = s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      matchesNumber ||
      (s.commune && s.commune.toLowerCase().includes(q));
      
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate live stats
  const totalStations = stations.length;
  const readyCount = stations.filter(s => s.status === 'جاهزة').length;
  const maintCount = stations.filter(s => s.status === 'صيانة').length;
  const stoppedCount = stations.filter(s => s.status === 'متوقفة').length;
  const totalCapacity = stations.reduce((acc, s) => acc + s.capacity, 0);
  const totalPumps = stations.reduce((acc, s) => acc + s.pumpsCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-right">
          <div className="text-xs text-slate-800 font-medium">إجمالي المحطات</div>
          <div className="text-2xl font-black text-white mt-1">{totalStations}</div>
          <div className="text-[11px] text-cyan-400 mt-0.5">محطات رفع مركزية</div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/40 p-3.5 rounded-xl text-right">
          <div className="text-xs text-slate-800 font-medium">محطات جاهزة</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{readyCount}</div>
          <div className="text-[11px] text-emerald-500 mt-0.5">تعمل بكفاءة كاملة</div>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 p-3.5 rounded-xl text-right">
          <div className="text-xs text-slate-800 font-medium">محطات في الصيانة</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{maintCount}</div>
          <div className="text-[11px] text-amber-500 mt-0.5">تدخلات دورية وطارئة</div>
        </div>

        <div className="bg-slate-900 border border-rose-900/40 p-3.5 rounded-xl text-right">
          <div className="text-xs text-slate-800 font-medium">محطات متوقفة</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{stoppedCount}</div>
          <div className="text-[11px] text-rose-500 mt-0.5">تحتاج تدخل عاجل</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-right">
          <div className="text-xs text-slate-400 font-medium">إجمالي التدفق</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{totalCapacity.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">متر مكعب / ساعة</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-right">
          <div className="text-xs text-slate-400 font-medium">إجمالي المضخات</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{totalPumps}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">مضخات غاطسة وجافة</div>
        </div>
      </div>

      {/* Control bar: search, status filter, and Add Station button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث فوري: اكتب اسم المحطة، رقمها (1-16)، أو رقم الهاتف..."
            className="w-full pl-9 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الكل ({stations.length})
          </button>
          <button
            onClick={() => setStatusFilter('جاهزة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'جاهزة'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            جاهزة ({readyCount})
          </button>
          <button
            onClick={() => setStatusFilter('صيانة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'صيانة'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            صيانة ({maintCount})
          </button>
          <button
            onClick={() => setStatusFilter('متوقفة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'متوقفة'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            متوقفة ({stoppedCount})
          </button>
        </div>

        {/* Add Station Button */}
        {canAdd && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-md shadow-cyan-900/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة محطة جديدة</span>
          </button>
        )}
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStations.map(station => {
          // Find workers assigned to this station
          const assignedWorkers = workers.filter(w => w.stationId === station.id);
          const activeWorkersNow = assignedWorkers.filter(w => isWorkerCurrentlyOnDuty(w));

          const statusBadge = 
            station.status === 'جاهزة' ? {
              bg: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
              icon: CheckCircle2,
              dot: 'bg-emerald-400'
            } : station.status === 'صيانة' ? {
              bg: 'bg-amber-950/70 border-amber-800 text-amber-300',
              icon: Wrench,
              dot: 'bg-amber-400'
            } : {
              bg: 'bg-rose-950/70 border-rose-800 text-rose-300',
              icon: AlertTriangle,
              dot: 'bg-rose-400'
            };

          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={station.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Station Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dot} animate-pulse`} />
                      <h3 className="font-black text-white text-base leading-snug">
                        {station.name}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{station.commune || 'جيجل'}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-bold ${statusBadge.bg}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{station.status}</span>
                  </div>
                </div>

                {/* Direct Phone Number - Clear & Clickable */}
                <div className="mt-3 flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-300 font-medium">رقم هاتف المحطة:</span>
                  <PhoneLink phone={station.phone} name={station.name} variant="button" />
                </div>

                {/* Station Metrics */}
                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>التدفق</span>
                    </div>
                    <div className="font-black text-cyan-300 text-sm mt-0.5 font-mono">
                      {station.capacity} <span className="text-[10px] font-normal">م³/سا</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Activity className="w-3 h-3 text-blue-400" />
                      <span>المضخات</span>
                    </div>
                    <div className="font-black text-blue-300 text-sm mt-0.5 font-mono">
                      {station.pumpsCount} مضخات
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>العمال</span>
                    </div>
                    <div className="font-black text-emerald-300 text-sm mt-0.5 font-mono">
                      {station.workersCount || assignedWorkers.length} عمال
                    </div>
                  </div>
                </div>

                {/* Geographic Coordinates with Direct Map Link */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>الإحداثيات الجغرافية:</span>
                    </span>
                    {station.latitude && station.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${station.latitude},${station.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <span>خرائط Google</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : canEdit ? (
                      <button
                        onClick={() => handleOpenEdit(station)}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        إضافة الإحداثيات الآن +
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">غير مسجلة</span>
                    )}
                  </div>

                  <div className="font-mono text-xs text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between" dir="ltr">
                    <span>
                      Lat: {station.latitude ? station.latitude.toFixed(6) : 'غير مسجل'}
                    </span>
                    <span>
                      Lng: {station.longitude ? station.longitude.toFixed(6) : 'غير مسجل'}
                    </span>
                  </div>
                </div>

                {/* On-Duty Workers Right Now */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>العمال المناوبون حالياً بالمحطة ({activeWorkersNow.length}):</span>
                    </span>
                    <span className="text-[11px] text-slate-500">نظام 48 ساعة</span>
                  </div>

                  {activeWorkersNow.length > 0 ? (
                    <div className="space-y-1">
                      {activeWorkersNow.map(w => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-1.5 bg-slate-800/70 rounded border border-slate-700/60 text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-bold text-slate-200">{w.fullName}</span>
                            <span className="text-[10px] text-slate-400">({w.residence})</span>
                          </div>
                          <PhoneLink phone={w.phone} name={w.fullName} variant="compact" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 bg-slate-800/40 p-2 rounded border border-slate-800 text-center">
                      المناوبون: {assignedWorkers.slice(0, 2).map(w => w.fullName).join('، ')} (مناوبة دورية)
                    </div>
                  )}
                </div>

                {/* Notes */}
                {station.notes && (
                  <div className="mt-3 p-2 bg-slate-950/40 rounded border border-slate-800 text-xs text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-300">ملاحظات:</span> {station.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit, Delete, Log Meters */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(station)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                      title="تعديل بيانات المحطة والإحداثيات"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirmId(station.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded-lg text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                      title="مسح المحطة (صلاحية الأدمن خباش فقط)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>مسح</span>
                    </button>
                  )}
                </div>

                {onSelectStationForMeters && (
                  <button
                    onClick={() => onSelectStationForMeters(station.id)}
                    className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>تسجيل العدادات</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-300">لم يتم العثور على محطات مطابقة للبحث</p>
          <p className="text-xs text-slate-500 mt-1">يرجى تعديل نص البحث أو تصفية الحالة.</p>
        </div>
      )}

      {/* Add / Edit Station Modal */}
      {(isAddModalOpen || editingStation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStation(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {editingStation ? `تعديل ${editingStation.name}` : 'إضافة محطة رفع جديدة'}
                </span>
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveStation} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المحطة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: محطة رقم أولاد 04 بوالنار"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم هاتف المحطة <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="034471001"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    حالة المحطة
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as StationStatus })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="جاهزة">جاهزة (تعمل بشكل جيد)</option>
                    <option value="صيانة">صيانة</option>
                    <option value="متوقفة">متوقفة</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>الإحداثيات الجغرافية (Latitude & Longitude)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      خط العرض (Latitude)
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="36.8196211"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      خط الطول (Longitude)
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="5.7146666"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    سعة التدفق (م³/سا)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    عدد المضخات
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.pumpsCount}
                    onChange={e => setFormData({ ...formData, pumpsCount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    عدد العمال
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={formData.workersCount}
                    onChange={e => setFormData({ ...formData, workersCount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  البلدية أو المنطقة
                </label>
                <input
                  type="text"
                  value={formData.commune}
                  onChange={e => setFormData({ ...formData, commune: e.target.value })}
                  placeholder="مثال: أولاد بوالنار، العوانة، برج بليدة..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الملاحظات والحالة التشغيلية
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات حول المضخات أو الصيانة أو انقطاع التيار..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStation(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md transition-all"
                >
                  حفظ البيانات
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
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>تأكيد مسح المحطة</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من مسح هذه المحطة نهائياً من النظام؟ يمكنك إضافة محطة جديدة أو تعديل بياناتها في أي وقت.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                تراجع
              </button>
              <button
                onClick={() => handleDeleteStation(deleteConfirmId)}
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
