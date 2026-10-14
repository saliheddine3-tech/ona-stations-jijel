import React, { useState } from 'react';
import { 
  Gauge, 
  Zap, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Printer, 
  Save, 
  AlertTriangle,
  Activity,
  Fuel,
  BatteryCharging
} from 'lucide-react';
import { MonthlyCounterRecord, Station, Worker, GeneratorReadingCells, ElectricMeterDigits } from '../types';
import { PhoneLink } from './PhoneLink';
import { storageService } from '../services/storageService';

interface CountersTabProps {
  counters: MonthlyCounterRecord[];
  stations: Station[];
  workers: Worker[];
  initialSelectedStationId?: string;
}

export interface ElectricMeterCell {
  label: string;
  value: string; // supports up to 9 digits
}

const DEFAULT_ELECTRIC_CELLS: ElectricMeterCell[] = [
  { label: 'الطور 1 (L1)', value: '048291045' },
  { label: 'الطور 2 (L2)', value: '039182740' },
  { label: 'الطور 3 (L3)', value: '051284930' },
  { label: 'الجهد (V)', value: '000000398' },
  { label: 'التردد (Hz)', value: '000000050' },
  { label: 'معامل القدرة', value: '000000095' },
  { label: 'الذروة (kWh)', value: '028491020' },
  { label: 'الطاقة الإجمالية', value: '074829150' },
];

export const CountersTab: React.FC<CountersTabProps> = ({
  counters,
  stations,
  workers,
  initialSelectedStationId
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(
    initialSelectedStationId || stations[0]?.id || 'st-01'
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Interactive 2 Rows x 8 Columns Real Electric Meter Panel State
  const [electricMeterCells, setElectricMeterCells] = useState<ElectricMeterCell[]>(() => {
    try {
      const saved = localStorage.getItem(`mm_electric_meter_${initialSelectedStationId || stations[0]?.id || 'st-01'}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_ELECTRIC_CELLS;
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync cells when switching station
  const handleStationChange = (stId: string) => {
    setSelectedStationId(stId);
    try {
      const saved = localStorage.getItem(`mm_electric_meter_${stId}`);
      if (saved) {
        setElectricMeterCells(JSON.parse(saved));
        return;
      }
    } catch {
      // ignore
    }
    setElectricMeterCells(DEFAULT_ELECTRIC_CELLS);
  };

  const handleUpdateCellLabel = (index: number, newLabel: string) => {
    setElectricMeterCells(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label: newLabel };
      return updated;
    });
  };

  const handleUpdateCellValue = (index: number, newValue: string) => {
    // Constrain to numbers and up to 9 digits
    const cleaned = newValue.replace(/[^0-9]/g, '').slice(0, 9);
    setElectricMeterCells(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: cleaned };
      return updated;
    });
  };

  const handleSaveElectricMeterToStorage = () => {
    try {
      localStorage.setItem(`mm_electric_meter_${selectedStationId}`, JSON.stringify(electricMeterCells));
      setSaveSuccessMsg(`تم حفظ وتخزين بيانات العداد الكهربائي (8×2) لمحطة ${selectedStation?.name || ''} بنجاح في LocalStorage!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MonthlyCounterRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for the 8x2 Grid & Pump Counters
  const [formStationId, setFormStationId] = useState<string>(selectedStationId);
  const [formMonth, setFormMonth] = useState<string>('2026-10');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formRecorderName, setFormRecorderName] = useState<string>(workers[0]?.fullName || '');
  const [formRecorderPhone, setFormRecorderPhone] = useState<string>(workers[0]?.phone || '0661234567');
  const [formNotes, setFormNotes] = useState<string>('');

  // Pump hour counters (6-8 digits)
  const [formPumps, setFormPumps] = useState<Array<{
    pumpNumber: number;
    currentHours: string;
    previousHours: string;
    operatingHours: number;
    status: 'تعمل' | 'صيانة' | 'متوقفة';
  }>>([
    { pumpNumber: 1, currentHours: '04829150', previousHours: '04828550', operatingHours: 600, status: 'تعمل' },
    { pumpNumber: 2, currentHours: '03918240', previousHours: '03917710', operatingHours: 530, status: 'تعمل' }
  ]);

  // Row 1: 8 horizontal cells for Generator parameters
  const [formGenerator, setFormGenerator] = useState<GeneratorReadingCells>({
    cell1: '001250',
    cell2: '85%',
    cell3: '4.2',
    cell4: '82°C',
    cell5: '26.4V',
    cell6: '50.0Hz',
    cell7: '400V',
    cell8: '42A'
  });

  // Row 2: 8 horizontal digits for Electricity Meter
  const [formElectricDigits, setFormElectricDigits] = useState<ElectricMeterDigits>({
    d1: '0',
    d2: '7',
    d3: '4',
    d4: '8',
    d5: '2',
    d6: '9',
    d7: '1',
    d8: '5',
    fullNumber: '07482915'
  });

  const selectedStation = stations.find(s => s.id === selectedStationId);
  const stationCounters = counters.filter(c => c.stationId === selectedStationId);

  // Open modal for new reading
  const handleOpenAdd = () => {
    const station = stations.find(s => s.id === selectedStationId) || stations[0];
    const pumpCount = station?.pumpsCount || 2;
    
    // Find last counter for this station to prefill previousHours
    const lastCounter = stationCounters[0];

    const initialPumps = Array.from({ length: pumpCount }, (_, i) => {
      const prev = lastCounter?.pumpCounters.find(p => p.pumpNumber === i + 1)?.currentHours || '04000000';
      return {
        pumpNumber: i + 1,
        currentHours: String(Number(prev) + Math.floor(400 + Math.random() * 200)).padStart(8, '0'),
        previousHours: prev,
        operatingHours: 450,
        status: 'تعمل' as const
      };
    });

    setFormStationId(station?.id || 'st-01');
    setFormMonth(new Date().toISOString().slice(0, 7));
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormRecorderName(workers[0]?.fullName || '');
    setFormRecorderPhone(workers[0]?.phone || '0661234567');
    setFormNotes('تسجيل شهري روتيني للمضخات وشبكة المولد والكهرباء');
    setFormPumps(initialPumps);
    
    setFormGenerator({
      cell1: '001420',
      cell2: '80%',
      cell3: '4.1',
      cell4: '83°C',
      cell5: '26.2V',
      cell6: '50.1Hz',
      cell7: '398V',
      cell8: '38A'
    });

    setFormElectricDigits({
      d1: '0',
      d2: '8',
      d3: '1',
      d4: '2',
      d5: '4',
      d6: '5',
      d7: '9',
      d8: '0',
      fullNumber: '08124590'
    });

    setEditingRecord(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (record: MonthlyCounterRecord) => {
    setEditingRecord(record);
    setFormStationId(record.stationId);
    setFormMonth(record.month);
    setFormDate(record.date);
    setFormRecorderName(record.recorderName);
    setFormRecorderPhone(record.recorderPhone);
    setFormNotes(record.notes || '');
    setFormPumps(record.pumpCounters.map(p => ({
      ...p,
      previousHours: p.previousHours || '00000000',
      operatingHours: p.operatingHours || 0
    })));
    setFormGenerator({ ...record.generatorData });
    setFormElectricDigits({ ...record.electricMeterDigits });
    setIsAddModalOpen(true);
  };

  const handleUpdateDigit = (digitKey: keyof ElectricMeterDigits, val: string) => {
    if (digitKey === 'fullNumber') return;
    const clean = val.slice(-1); // only single char
    const newDigits = { ...formElectricDigits, [digitKey]: clean };
    const full = `${newDigits.d1}${newDigits.d2}${newDigits.d3}${newDigits.d4}${newDigits.d5}${newDigits.d6}${newDigits.d7}${newDigits.d8}`;
    setFormElectricDigits({ ...newDigits, fullNumber: full });
  };

  const handleUpdatePumpHours = (index: number, newHours: string) => {
    const updated = [...formPumps];
    const prevNum = Number(updated[index].previousHours) || 0;
    const currNum = Number(newHours) || 0;
    const diff = currNum >= prevNum ? currNum - prevNum : 0;
    updated[index].currentHours = newHours;
    updated[index].operatingHours = diff;
    setFormPumps(updated);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();

    const recordData: MonthlyCounterRecord = {
      id: editingRecord ? editingRecord.id : `cnt-${Date.now()}`,
      stationId: formStationId,
      month: formMonth,
      date: formDate,
      recorderName: formRecorderName,
      recorderPhone: formRecorderPhone,
      pumpCounters: formPumps,
      generatorData: formGenerator,
      electricMeterDigits: formElectricDigits,
      notes: formNotes,
      createdAt: new Date().toISOString()
    };

    if (editingRecord) {
      storageService.updateCounterRecord(recordData);
    } else {
      storageService.addCounterRecord(recordData);
    }

    setIsAddModalOpen(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    storageService.deleteCounterRecord(id);
    setDeleteConfirmId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-black text-white">
              سجل العداد الساعي للمضخات وشبكة بيانات المولد والكهرباء (8×2)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            تسجيل العداد الساعي الشهري للمضخات (6 إلى 8 أرقام)، وجدول ذو صفين: 8 خانات علوية لبيانات المولد، و8 خانات سفلية لأرقام العداد الكهربائي.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة السجل</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل قراءة شهرية جديدة</span>
          </button>
        </div>
      </div>

      {/* Station Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-bold">المحطة المحددة:</span>
          <select
            value={selectedStationId}
            onChange={e => handleStationChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            {stations.map(st => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.pumpsCount} مضخات)
              </option>
            ))}
          </select>
        </div>

        {selectedStation && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">هاتف المحطة:</span>
            <PhoneLink phone={selectedStation.phone} name={selectedStation.name} variant="compact" />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2-ROW × 8-COLUMN REAL DIGITAL ELECTRICITY METER COMPONENT */}
      {/* ======================================================== */}
      <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow & Industrial header */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-500" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>لوحة العداد الكهربائي الرقمي (2 Rows × 8 Columns) — {selectedStation?.name || 'محطة الرفع'}</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              تصميم مطابق للعداد الكهربائي الحقيقي: السطر الأول لتسمية الخانات نصياً، والسطر الثاني لأرقام العداد الدقيقة (حتى 9 أرقام).
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveElectricMeterToStorage}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95 border border-cyan-400/30"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتخزين في LocalStorage</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-600/80 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* The 2-Row x 8-Column Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <table className="w-full min-w-[760px] border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
                <th className="p-2.5 text-center font-bold text-slate-300 w-28 bg-slate-950/90 border-l border-slate-800">
                  السطر / الخانة
                </th>
                {electricMeterCells.map((_, i) => (
                  <th key={i} className="p-2 text-center font-mono text-cyan-400 border-l border-slate-800 last:border-l-0">
                    الخانة {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Text Inputs for Words/Labels */}
              <tr className="border-b border-slate-800 bg-slate-950/70">
                <td className="p-2.5 font-bold text-amber-300 bg-slate-900/90 border-l border-slate-800 text-center">
                  <div className="text-[10px] text-amber-400/80 font-normal">السطر الأول (علوي)</div>
                  <span>تسمية الخانة (نص)</span>
                </td>
                {electricMeterCells.map((cell, idx) => (
                  <td key={idx} className="p-1.5 border-l border-slate-800 last:border-l-0">
                    <input
                      type="text"
                      value={cell.label}
                      onChange={e => handleUpdateCellLabel(idx, e.target.value)}
                      placeholder={`تسمية ${idx + 1}`}
                      className="w-full p-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg text-center text-xs text-amber-300 font-bold placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </td>
                ))}
              </tr>

              {/* Row 2: Number Inputs (Up to 9 Digits with Precision) */}
              <tr className="bg-slate-950">
                <td className="p-2.5 font-bold text-cyan-300 bg-slate-900/90 border-l border-slate-800 text-center">
                  <div className="text-[10px] text-cyan-400/80 font-normal">السطر الثاني (سفلي)</div>
                  <span>رقم العداد (حتى 9 أرقام)</span>
                </td>
                {electricMeterCells.map((cell, idx) => (
                  <td key={idx} className="p-1.5 border-l border-slate-800 last:border-l-0">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="999999999"
                        step="1"
                        value={cell.value}
                        onChange={e => handleUpdateCellValue(idx, e.target.value)}
                        placeholder="000000000"
                        className="w-full p-2 bg-slate-900/90 border border-cyan-700/60 focus:border-cyan-400 rounded-lg text-center text-sm font-mono font-black text-cyan-300 placeholder-slate-700 focus:outline-none transition-colors shadow-inner"
                      />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info & live summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">⚡ العداد نشط:</span>
            <span>يدعم أرقاماً طويلة تصل إلى 9 أرقام بدقة تامة لكل خلية.</span>
          </div>
          <div className="font-mono text-slate-500">
            LocalStorage Key: <span className="text-slate-300">mm_electric_meter_{selectedStationId}</span>
          </div>
        </div>
      </div>

      {/* Records Display for Selected Station */}
      <div className="space-y-4">
        {stationCounters.map(record => {
          return (
            <div
              key={record.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
            >
              {/* Record Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      قراءة شهر: <span className="font-mono text-cyan-400">{record.month}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      (تاريخ: {record.date})
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>المسجل: <strong>{record.recorderName}</strong></span>
                    <PhoneLink phone={record.recorderPhone} name={record.recorderName} variant="compact" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(record)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                    title="تعديل القراءة"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(record.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                    title="مسح القراءة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                </div>
              </div>

              {/* 1. Monthly Pump Hour Counters (6 to 8 digits) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>العداد الساعي للمضخات (أرقام من 6 إلى 8 خانات):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {record.pumpCounters.map(p => (
                    <div
                      key={p.pumpNumber}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">
                          المضخة رقم {p.pumpNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          p.status === 'تعمل'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      {/* 8-Digit Display */}
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-700/80 text-center">
                        <div className="text-[10px] text-slate-400 mb-0.5">القراءة الحالية (ساعات)</div>
                        <div className="text-lg font-black font-mono tracking-widest text-emerald-400" dir="ltr">
                          {p.currentHours}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>الساعات المنجزة هذا الشهر:</span>
                        <span className="font-bold text-white font-mono">
                          {p.operatingHours || 0} ساعة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. The 8x2 Grid: 8 Horizontal Generator Cells (Top) & 8 Horizontal Electricity Digits (Bottom) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>جدول القياسات المشترك (8 خانات علوية للمولد + 8 خانات سفلية للعداد الكهربائي):</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">شبكة 8×2 خانة</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="p-2 border-l border-slate-800 w-24">البيان</th>
                        <th className="p-2 border-l border-slate-800">الخانة 1</th>
                        <th className="p-2 border-l border-slate-800">الخانة 2</th>
                        <th className="p-2 border-l border-slate-800">الخانة 3</th>
                        <th className="p-2 border-l border-slate-800">الخانة 4</th>
                        <th className="p-2 border-l border-slate-800">الخانة 5</th>
                        <th className="p-2 border-l border-slate-800">الخانة 6</th>
                        <th className="p-2 border-l border-slate-800">الخانة 7</th>
                        <th className="p-2">الخانة 8</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Top Row: 8 Horizontal Generator Data Cells */}
                      <tr className="border-b border-slate-800 bg-slate-900/40">
                        <td className="p-2.5 font-bold text-amber-400 border-l border-slate-800 bg-slate-950/80">
                          بيانات المولد (أعلى)
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">ساعات المولد</div>
                          {record.generatorData.cell1}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">الوقود</div>
                          {record.generatorData.cell2}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">ضغط الزيت</div>
                          {record.generatorData.cell3}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">حرارة المحرك</div>
                          {record.generatorData.cell4}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">البطارية</div>
                          {record.generatorData.cell5}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">التردد</div>
                          {record.generatorData.cell6}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">الجهد</div>
                          {record.generatorData.cell7}
                        </td>
                        <td className="p-2 font-mono font-bold text-amber-300">
                          <div className="text-[10px] text-slate-500">التيار/الحمل</div>
                          {record.generatorData.cell8}
                        </td>
                      </tr>

                      {/* Bottom Row: 8 Horizontal Digits of the Electricity Meter */}
                      <tr className="bg-slate-950">
                        <td className="p-2.5 font-bold text-cyan-400 border-l border-slate-800 bg-slate-950/80">
                          أرقام العداد الكهربائي (أسفل)
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d1}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d2}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d3}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d4}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d5}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d6}
                        </td>
                        <td className="p-2 border-l border-slate-800 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d7}
                        </td>
                        <td className="p-2 font-mono font-bold text-cyan-300 text-base">
                          {record.electricMeterDigits.d8}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Electric Total Badge */}
                <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">القراءة الإجمالية للعداد الكهربائي (8 أرقام):</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm tracking-widest" dir="ltr">
                    {record.electricMeterDigits.fullNumber || `${record.electricMeterDigits.d1}${record.electricMeterDigits.d2}${record.electricMeterDigits.d3}${record.electricMeterDigits.d4}${record.electricMeterDigits.d5}${record.electricMeterDigits.d6}${record.electricMeterDigits.d7}${record.electricMeterDigits.d8}`} <span className="text-[11px] text-slate-400 font-normal">kWh</span>
                  </span>
                </div>
              </div>

              {record.notes && (
                <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-slate-300">ملاحظات:</strong> {record.notes}
                </div>
              )}
            </div>
          );
        })}

        {stationCounters.length === 0 && (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
            <Gauge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-300">لا توجد قراءات مسجلة لهذه المحطة حتى الآن</p>
            <p className="text-xs text-slate-500 mt-1">انقر على "تسجيل قراءة شهرية جديدة" لإدخال عدادات المضخات وشبكة 8×2.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Monthly Reading Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right max-h-[92vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {editingRecord ? 'تعديل تسجيل العدادات والمولد' : 'تسجيل العداد الساعي للمضخات وشبكة 8×2'}
                </span>
                <Gauge className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">المحطة</label>
                  <select
                    value={formStationId}
                    onChange={e => {
                      setFormStationId(e.target.value);
                      const st = stations.find(s => s.id === e.target.value);
                      if (st) {
                        const newPumps = Array.from({ length: st.pumpsCount }, (_, i) => ({
                          pumpNumber: i + 1,
                          currentHours: '04800000',
                          previousHours: '04799500',
                          operatingHours: 500,
                          status: 'تعمل' as const
                        }));
                        setFormPumps(newPumps);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الشهر</label>
                  <input
                    type="month"
                    value={formMonth}
                    onChange={e => setFormMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ المعاينة</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">اسم مسجل القراءة</label>
                  <input
                    type="text"
                    value={formRecorderName}
                    onChange={e => setFormRecorderName(e.target.value)}
                    placeholder="مثال: أحمد بوعزة / بياض عنتر"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الهاتف للاتصال</label>
                  <input
                    type="tel"
                    value={formRecorderPhone}
                    onChange={e => setFormRecorderPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Pump Hour Counters (6-8 Digits) */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-cyan-400 flex items-center justify-between">
                  <span>العداد الساعي للمضخات (أرقام من 6 إلى 8 أرقام):</span>
                  <span className="text-[10px] text-slate-500">حساب آلي لساعات التشغيل</span>
                </div>

                <div className="space-y-2">
                  {formPumps.map((pump, idx) => (
                    <div key={pump.pumpNumber} className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1 font-bold">
                          المضخة {pump.pumpNumber}
                        </label>
                        <select
                          value={pump.status}
                          onChange={e => {
                            const updated = [...formPumps];
                            updated[idx].status = e.target.value as any;
                            setFormPumps(updated);
                          }}
                          className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                        >
                          <option value="تعمل">تعمل</option>
                          <option value="صيانة">صيانة</option>
                          <option value="متوقفة">متوقفة</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          قراءة العداد الساعي (6-8 أرقام)
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          value={pump.currentHours}
                          onChange={e => handleUpdatePumpHours(idx, e.target.value)}
                          placeholder="مثال: 04829150"
                          className="w-full px-3 py-1 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-mono font-bold text-sm tracking-widest text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The 8x2 Grid Editor */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span>جدول القياسات 8×2:</span>
                  <span className="text-[10px] text-slate-400">8 خانات للمولد (أعلى) + 8 خانات للعداد الكهربائي (أسفل)</span>
                </div>

                {/* Row 1: 8 Cells Generator */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 block">
                    الخانات الثمانية الأفقية العلوية (بيانات المولد):
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">1. الساعات</span>
                      <input
                        type="text"
                        value={formGenerator.cell1}
                        onChange={e => setFormGenerator({ ...formGenerator, cell1: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">2. الوقود</span>
                      <input
                        type="text"
                        value={formGenerator.cell2}
                        onChange={e => setFormGenerator({ ...formGenerator, cell2: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">3. ضغط الزيت</span>
                      <input
                        type="text"
                        value={formGenerator.cell3}
                        onChange={e => setFormGenerator({ ...formGenerator, cell3: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">4. الحرارة</span>
                      <input
                        type="text"
                        value={formGenerator.cell4}
                        onChange={e => setFormGenerator({ ...formGenerator, cell4: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">5. البطارية</span>
                      <input
                        type="text"
                        value={formGenerator.cell5}
                        onChange={e => setFormGenerator({ ...formGenerator, cell5: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">6. التردد</span>
                      <input
                        type="text"
                        value={formGenerator.cell6}
                        onChange={e => setFormGenerator({ ...formGenerator, cell6: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">7. الجهد</span>
                      <input
                        type="text"
                        value={formGenerator.cell7}
                        onChange={e => setFormGenerator({ ...formGenerator, cell7: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block truncate">8. الحمل</span>
                      <input
                        type="text"
                        value={formGenerator.cell8}
                        onChange={e => setFormGenerator({ ...formGenerator, cell8: e.target.value })}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: 8 Digits of Electricity Meter */}
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-cyan-400 block">
                    الخانات الثمانية الأفقية السفلية (أرقام العداد الكهربائي - حوالي 8 أرقام):
                  </span>
                  <div className="grid grid-cols-8 gap-1.5" dir="ltr">
                    {(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'] as (keyof ElectricMeterDigits)[]).map((dk, i) => (
                      <div key={dk} className="text-center">
                        <span className="text-[9px] text-slate-500 block">رقم {i + 1}</span>
                        <input
                          type="text"
                          maxLength={1}
                          value={formElectricDigits[dk]}
                          onChange={e => handleUpdateDigit(dk, e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-cyan-800/80 rounded text-center text-cyan-300 font-mono font-black text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="ملاحظات حول أداء المضخات، مستوى الزيت، أو حالة الشبكة..."
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
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md"
                >
                  حفظ وتسجيل القراءات
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
              <span>تأكيد مسح سجل العداد</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من مسح هذه القراءة الشهرية نهائياً؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                تراجع
              </button>
              <button
                onClick={() => handleDeleteRecord(deleteConfirmId)}
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
